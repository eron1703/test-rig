// Integration Test Template (TypeScript + Vitest + Testcontainers)
// Tests component interactions with real external dependencies

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Client } from 'pg';

// ============================================================================
// IMPORTS
// ============================================================================

import { UserService } from '@/services/user-service';
import { UserRepository } from '@/services/user-service/repository';
import { DatabaseConnection } from '@/database';
import { UserFactory } from '@tests/factories/user.factory';

// ============================================================================
// INTEGRATION TEST SUITE
// ============================================================================

describe('UserService Integration Tests', () => {
  // -------------------------------------------------------------------------
  // Testcontainers Setup
  // -------------------------------------------------------------------------

  let postgresContainer: StartedTestContainer;
  let redisContainer: StartedTestContainer;
  let dbConnection: DatabaseConnection;
  let userService: UserService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    // Start PostgreSQL container
    postgresContainer = await new GenericContainer('postgres:16-alpine')
      .withEnvironment({
        POSTGRES_USER: 'test',
        POSTGRES_PASSWORD: 'test',
        POSTGRES_DB: 'testdb',
      })
      .withExposedPorts(5432)
      .start();

    // Start Redis container
    redisContainer = await new GenericContainer('redis:7-alpine')
      .withExposedPorts(6379)
      .start();

    // Get connection details
    const postgresHost = postgresContainer.getHost();
    const postgresPort = postgresContainer.getMappedPort(5432);
    const redisHost = redisContainer.getHost();
    const redisPort = redisContainer.getMappedPort(6379);

    // Connect to database
    dbConnection = new DatabaseConnection({
      postgres: {
        host: postgresHost,
        port: postgresPort,
        database: 'testdb',
        user: 'test',
        password: 'test',
      },
      redis: {
        host: redisHost,
        port: redisPort,
      },
    });

    await dbConnection.connect();

    // Run migrations
    await dbConnection.runMigrations();

    // Initialize services with real database
    userRepository = new UserRepository(dbConnection);
    userService = new UserService(userRepository);
  }, 60000); // 60s timeout for container startup

  afterAll(async () => {
    // Clean up
    await dbConnection?.disconnect();
    await postgresContainer?.stop();
    await redisContainer?.stop();
  }, 30000);

  beforeEach(async () => {
    // Clear data before each test
    await dbConnection.query('TRUNCATE TABLE users CASCADE');
    await dbConnection.redisClient.flushall();
  });

  // -------------------------------------------------------------------------
  // INTEGRATION TESTS
  // -------------------------------------------------------------------------

  describe('User Creation Flow', () => {
    it('should create user in database and cache', async () => {
      // Arrange
      const userData = UserFactory.build({
        email: 'integration@example.com',
        password: 'SecurePass123!',
      });

      // Act
      const createdUser = await userService.createUser(userData);

      // Assert - Check database
      const dbUser = await dbConnection.query(
        'SELECT * FROM users WHERE id = $1',
        [createdUser.id]
      );
      expect(dbUser.rows).toHaveLength(1);
      expect(dbUser.rows[0].email).toBe('integration@example.com');

      // Assert - Check cache
      const cachedUser = await dbConnection.redisClient.get(
        `user:${createdUser.id}`
      );
      expect(cachedUser).toBeTruthy();
      expect(JSON.parse(cachedUser!).email).toBe('integration@example.com');
    });

    it('should enforce unique email constraint', async () => {
      // Arrange
      const userData = UserFactory.build({ email: 'duplicate@example.com' });
      await userService.createUser(userData);

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        'Email already registered'
      );
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      const userData = UserFactory.build();

      // Mock error in profile creation (after user creation)
      const originalCreateProfile = userService.createProfile;
      userService.createProfile = async () => {
        throw new Error('Profile creation failed');
      };

      // Act
      await expect(userService.createUser(userData)).rejects.toThrow();

      // Assert - User should NOT exist in database
      const dbUser = await dbConnection.query(
        'SELECT * FROM users WHERE email = $1',
        [userData.email]
      );
      expect(dbUser.rows).toHaveLength(0);

      // Restore
      userService.createProfile = originalCreateProfile;
    });
  });

  describe('User Query Operations', () => {
    beforeEach(async () => {
      // Seed test data
      const users = UserFactory.buildList(10);
      for (const user of users) {
        await userService.createUser(user);
      }
    });

    it('should find user by email from database', async () => {
      // Arrange
      const testEmail = 'query@example.com';
      await userService.createUser(
        UserFactory.build({ email: testEmail })
      );

      // Act
      const user = await userService.findUserByEmail(testEmail);

      // Assert
      expect(user).toBeTruthy();
      expect(user?.email).toBe(testEmail);
    });

    it('should return cached user on second query', async () => {
      // Arrange
      const testUser = await userService.createUser(UserFactory.build());

      // Clear cache to ensure first query hits DB
      await dbConnection.redisClient.del(`user:${testUser.id}`);

      // Act - First query (should hit database)
      const startTime1 = Date.now();
      await userService.getUser(testUser.id);
      const dbQueryTime = Date.now() - startTime1;

      // Act - Second query (should hit cache)
      const startTime2 = Date.now();
      await userService.getUser(testUser.id);
      const cacheQueryTime = Date.now() - startTime2;

      // Assert - Cache should be significantly faster
      expect(cacheQueryTime).toBeLessThan(dbQueryTime);
    });

    it('should handle complex queries with joins', async () => {
      // Arrange - Create user with related data
      const user = await userService.createUser(UserFactory.build());
      await userService.addUserRole(user.id, 'admin');
      await userService.addUserRole(user.id, 'editor');

      // Act
      const userWithRoles = await userService.getUserWithRoles(user.id);

      // Assert
      expect(userWithRoles.roles).toHaveLength(2);
      expect(userWithRoles.roles).toContain('admin');
      expect(userWithRoles.roles).toContain('editor');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent user creations', async () => {
      // Arrange
      const userDataList = UserFactory.buildList(10);

      // Act - Create users concurrently
      const results = await Promise.allSettled(
        userDataList.map(data => userService.createUser(data))
      );

      // Assert
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful).toHaveLength(10);

      // Verify all users in database
      const dbUsers = await dbConnection.query('SELECT * FROM users');
      expect(dbUsers.rows).toHaveLength(10);
    });

    it('should maintain data consistency under concurrent updates', async () => {
      // Arrange
      const user = await userService.createUser(UserFactory.build());

      // Act - Concurrent updates to same user
      await Promise.all([
        userService.updateUser(user.id, { firstName: 'John' }),
        userService.updateUser(user.id, { lastName: 'Doe' }),
        userService.updateUser(user.id, { age: 30 }),
      ]);

      // Assert - All updates should be applied
      const updatedUser = await userService.getUser(user.id);
      expect(updatedUser?.firstName).toBe('John');
      expect(updatedUser?.lastName).toBe('Doe');
      expect(updatedUser?.age).toBe(30);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from database connection loss', async () => {
      // This test would require more sophisticated setup
      // to simulate connection loss and recovery
    });
  });

  // -------------------------------------------------------------------------
  // PERFORMANCE TESTS (Optional)
  // -------------------------------------------------------------------------

  describe('Performance', () => {
    it('should create 1000 users in under 10 seconds', async () => {
      // Arrange
      const users = UserFactory.buildList(1000);

      // Act
      const startTime = Date.now();
      await Promise.all(users.map(u => userService.createUser(u)));
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(10000);
    });
  });
});
