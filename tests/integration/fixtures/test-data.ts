/**
 * Test data generators and fixtures for integration tests
 * All test users are generated with unique identifiers to prevent collisions
 */

/**
 * Create a unique test user with optional overrides
 * Uses timestamp to ensure email uniqueness across test runs
 */
export function createTestUser(overrides = {}) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);

  return {
    firstName: 'Test',
    lastName: 'User',
    email: `test-${timestamp}-${randomId}@example.com`,
    address: '123 Test Street, Test City, TC 12345',
    ...overrides,
  };
}

/**
 * Valid user with all required fields
 */
export const validUser = createTestUser();

/**
 * User with empty firstName (invalid)
 */
export const userWithoutFirstName = createTestUser({ firstName: '' });

/**
 * User with empty lastName (invalid)
 */
export const userWithoutLastName = createTestUser({ lastName: '' });

/**
 * User with empty email (invalid)
 */
export const userWithoutEmail = createTestUser({ email: '' });

/**
 * User with empty address (invalid)
 */
export const userWithoutAddress = createTestUser({ address: '' });

/**
 * User with invalid email format (invalid)
 */
export const userWithInvalidEmail = createTestUser({ email: 'not-an-email' });

/**
 * User with special characters in name
 */
export const userWithSpecialCharacters = createTestUser({
  firstName: "O'Brien",
  lastName: "D'Angelo",
  address: "123 O'Reilly St, San Francisco, CA 94105",
});
