// Test Data Factory Template
// Use this to generate realistic test data programmatically

import { faker } from '@faker-js/faker';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface User {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age?: number;
  role?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  id?: string;
  userId: string;
  products: Product[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: Date;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

// ============================================================================
// BASE FACTORY CLASS
// ============================================================================

class Factory<T> {
  private defaultAttributes: Partial<T> = {};
  private builder: () => T;

  constructor(builder: () => T) {
    this.builder = builder;
  }

  /**
   * Build a single instance with optional overrides
   */
  build(overrides: Partial<T> = {}): T {
    return {
      ...this.builder(),
      ...this.defaultAttributes,
      ...overrides,
    };
  }

  /**
   * Build multiple instances
   */
  buildList(count: number, overrides: Partial<T> = {}): T[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }

  /**
   * Set default attributes for this factory
   */
  withDefaults(defaults: Partial<T>): this {
    this.defaultAttributes = { ...this.defaultAttributes, ...defaults };
    return this;
  }
}

// ============================================================================
// USER FACTORY
// ============================================================================

export const UserFactory = new Factory<User>(() => ({
  id: faker.string.uuid(),
  email: faker.internet.email().toLowerCase(),
  password: faker.internet.password({ length: 12, memorable: false }),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  age: faker.number.int({ min: 18, max: 80 }),
  role: faker.helpers.arrayElement(['user', 'admin', 'moderator']),
  isActive: faker.datatype.boolean({ probability: 0.9 }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}));

// ============================================================================
// SPECIALIZED USER FACTORIES
// ============================================================================

export const AdminUserFactory = UserFactory.withDefaults({
  role: 'admin',
  isActive: true,
});

export const InactiveUserFactory = UserFactory.withDefaults({
  isActive: false,
});

// ============================================================================
// PRODUCT FACTORY
// ============================================================================

export const ProductFactory = new Factory<Product>(() => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
  stock: faker.number.int({ min: 0, max: 100 }),
  category: faker.commerce.department(),
}));

// ============================================================================
// ORDER FACTORY
// ============================================================================

export const OrderFactory = new Factory<Order>(() => {
  const products = ProductFactory.buildList(
    faker.number.int({ min: 1, max: 5 })
  );
  const total = products.reduce((sum, p) => sum + p.price, 0);

  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    products,
    total,
    status: faker.helpers.arrayElement([
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ]),
    createdAt: faker.date.past(),
  };
});

// ============================================================================
// CUSTOM FACTORIES WITH RELATIONSHIPS
// ============================================================================

/**
 * Create a user with orders
 */
export function createUserWithOrders(orderCount: number = 3) {
  const user = UserFactory.build();
  const orders = OrderFactory.buildList(orderCount, { userId: user.id! });
  return { user, orders };
}

/**
 * Create a complete order scenario
 */
export function createOrderScenario() {
  const user = UserFactory.build();
  const products = ProductFactory.buildList(3);
  const order = OrderFactory.build({
    userId: user.id!,
    products,
    total: products.reduce((sum, p) => sum + p.price, 0),
  });
  return { user, products, order };
}

// ============================================================================
// SEQUENCE GENERATORS
// ============================================================================

class Sequence {
  private counter = 0;

  next(): number {
    return ++this.counter;
  }

  reset(): void {
    this.counter = 0;
  }
}

export const sequences = {
  userId: new Sequence(),
  orderId: new Sequence(),
  productId: new Sequence(),
};

// ============================================================================
// TRAIT-BASED FACTORIES
// ============================================================================

export const Traits = {
  user: {
    /**
     * User with invalid email
     */
    invalidEmail: (overrides: Partial<User> = {}): User =>
      UserFactory.build({
        email: 'invalid-email-format',
        ...overrides,
      }),

    /**
     * User with weak password
     */
    weakPassword: (overrides: Partial<User> = {}): User =>
      UserFactory.build({
        password: '123',
        ...overrides,
      }),

    /**
     * User with very long email (boundary test)
     */
    longEmail: (overrides: Partial<User> = {}): User =>
      UserFactory.build({
        email: 'a'.repeat(240) + '@example.com',
        ...overrides,
      }),

    /**
     * User with special characters in name
     */
    specialCharsName: (overrides: Partial<User> = {}): User =>
      UserFactory.build({
        firstName: "O'Brien",
        lastName: 'Müller-Schmidt',
        ...overrides,
      }),

    /**
     * Newly created user
     */
    newUser: (overrides: Partial<User> = {}): User =>
      UserFactory.build({
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
      }),
  },

  order: {
    /**
     * Empty order
     */
    empty: (overrides: Partial<Order> = {}): Order =>
      OrderFactory.build({
        products: [],
        total: 0,
        ...overrides,
      }),

    /**
     * Large order
     */
    large: (overrides: Partial<Order> = {}): Order => {
      const products = ProductFactory.buildList(20);
      return OrderFactory.build({
        products,
        total: products.reduce((sum, p) => sum + p.price, 0),
        ...overrides,
      });
    },

    /**
     * Cancelled order
     */
    cancelled: (overrides: Partial<Order> = {}): Order =>
      OrderFactory.build({
        status: 'cancelled',
        ...overrides,
      }),
  },

  product: {
    /**
     * Out of stock product
     */
    outOfStock: (overrides: Partial<Product> = {}): Product =>
      ProductFactory.build({
        stock: 0,
        ...overrides,
      }),

    /**
     * Expensive product
     */
    expensive: (overrides: Partial<Product> = {}): Product =>
      ProductFactory.build({
        price: parseFloat(faker.commerce.price({ min: 1000, max: 5000 })),
        ...overrides,
      }),
  },
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Basic usage
const user = UserFactory.build();
const users = UserFactory.buildList(10);

// With overrides
const specificUser = UserFactory.build({
  email: 'test@example.com',
  role: 'admin'
});

// Specialized factories
const admin = AdminUserFactory.build();
const inactiveUser = InactiveUserFactory.build();

// Traits for edge cases
const invalidUser = Traits.user.invalidEmail();
const userWithWeakPassword = Traits.user.weakPassword();

// Complex scenarios
const { user, orders } = createUserWithOrders(5);
const { user, products, order } = createOrderScenario();

// Sequences (useful for unique identifiers)
const userId1 = sequences.userId.next(); // 1
const userId2 = sequences.userId.next(); // 2
sequences.userId.reset();

// Custom factory
const customUser = UserFactory.build({
  email: 'custom@example.com',
  firstName: 'John',
  age: 30,
});
*/
