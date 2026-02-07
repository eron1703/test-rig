// Test Template (TypeScript + Vitest)
// Use this as a starting point for new test files

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ============================================================================
// IMPORTS
// ============================================================================

// Import the component under test
import { UserService } from '@/services/user-service';

// Import dependencies (for mocking or real usage)
import { UserRepository } from '@/services/user-service/repository';
import { UserValidator } from '@/services/user-service/validator';

// Import test utilities
import { UserFactory } from '@tests/factories/user.factory';
import { mockAuthService } from '@tests/mocks/auth-service.mock';

// ============================================================================
// TEST SUITE
// ============================================================================

describe('UserService', () => {
  // -------------------------------------------------------------------------
  // Setup & Teardown
  // -------------------------------------------------------------------------

  let userService: UserService;
  let userRepository: UserRepository;
  let userValidator: UserValidator;

  beforeEach(() => {
    // Create fresh instances before each test
    userRepository = new UserRepository();
    userValidator = new UserValidator();
    userService = new UserService(userRepository, userValidator);

    // Clear any mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test if needed
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // HAPPY PATH TESTS
  // -------------------------------------------------------------------------

  describe('createUser', () => {
    it('should create user when valid data provided', async () => {
      // Arrange
      const userData = UserFactory.build({ email: 'test@example.com' });
      const mockSavedUser = { ...userData, id: '123' };

      vi.spyOn(userRepository, 'create').mockResolvedValue(mockSavedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(mockSavedUser);
      expect(userRepository.create).toHaveBeenCalledWith(userData);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should hash password before saving', async () => {
      // Arrange
      const userData = UserFactory.build({ password: 'plaintext123' });
      vi.spyOn(userRepository, 'create').mockResolvedValue({} as any);

      // Act
      await userService.createUser(userData);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.not.stringMatching('plaintext123'),
        })
      );
    });
  });

  describe('getUser', () => {
    it('should return user when found by id', async () => {
      // Arrange
      const userId = '123';
      const mockUser = UserFactory.build({ id: userId });
      vi.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUser(userId);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      vi.spyOn(userRepository, 'findById').mockResolvedValue(null);

      // Act
      const result = await userService.getUser('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // ERROR CASES
  // -------------------------------------------------------------------------

  describe('createUser - error handling', () => {
    it('should throw error when email is invalid', async () => {
      // Arrange
      const userData = UserFactory.build({ email: 'invalid-email' });

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        'Invalid email format'
      );
    });

    it('should throw error when email already exists', async () => {
      // Arrange
      const userData = UserFactory.build({ email: 'existing@example.com' });
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({} as any);

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        'Email already registered'
      );
    });

    it('should throw error when password is too weak', async () => {
      // Arrange
      const userData = UserFactory.build({ password: '123' });

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        'Password too weak'
      );
    });
  });

  // -------------------------------------------------------------------------
  // EDGE CASES
  // -------------------------------------------------------------------------

  describe('edge cases', () => {
    it('should handle email with unicode characters', async () => {
      // Arrange
      const userData = UserFactory.build({ email: 'tëst@example.com' });
      vi.spyOn(userRepository, 'create').mockResolvedValue({} as any);

      // Act & Assert
      await expect(userService.createUser(userData)).resolves.not.toThrow();
    });

    it('should trim whitespace from email', async () => {
      // Arrange
      const userData = UserFactory.build({ email: '  test@example.com  ' });
      vi.spyOn(userRepository, 'create').mockResolvedValue({} as any);

      // Act
      await userService.createUser(userData);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // BOUNDARY CONDITIONS
  // -------------------------------------------------------------------------

  describe('boundary conditions', () => {
    it('should reject email longer than 255 characters', async () => {
      // Arrange
      const longEmail = 'a'.repeat(256) + '@example.com';
      const userData = UserFactory.build({ email: longEmail });

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        'Email too long'
      );
    });

    it('should accept email exactly 255 characters', async () => {
      // Arrange
      const maxEmail = 'a'.repeat(243) + '@example.com'; // 255 chars total
      const userData = UserFactory.build({ email: maxEmail });
      vi.spyOn(userRepository, 'create').mockResolvedValue({} as any);

      // Act & Assert
      await expect(userService.createUser(userData)).resolves.not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // INTEGRATION WITH DEPENDENCIES
  // -------------------------------------------------------------------------

  describe('dependency integration', () => {
    it('should call validator before repository', async () => {
      // Arrange
      const userData = UserFactory.build();
      const callOrder: string[] = [];

      vi.spyOn(userValidator, 'validate').mockImplementation(() => {
        callOrder.push('validator');
      });
      vi.spyOn(userRepository, 'create').mockImplementation(async () => {
        callOrder.push('repository');
        return {} as any;
      });

      // Act
      await userService.createUser(userData);

      // Assert
      expect(callOrder).toEqual(['validator', 'repository']);
    });
  });

  // -------------------------------------------------------------------------
  // SNAPSHOT TESTS (Optional)
  // -------------------------------------------------------------------------

  describe('snapshots', () => {
    it('should match user creation response snapshot', async () => {
      // Arrange
      const userData = UserFactory.build();
      const mockSavedUser = { ...userData, id: '123', createdAt: new Date() };
      vi.spyOn(userRepository, 'create').mockResolvedValue(mockSavedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toMatchSnapshot();
    });
  });
});

// ============================================================================
// HELPER FUNCTIONS (if needed)
// ============================================================================

function setupMockRepository() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}
