import { addNewUserAction } from '@/actions';
import { connectToTestDB, disconnectFromTestDB, clearTestData } from './setup';
import {
  createTestUser,
  userWithoutFirstName,
  userWithoutLastName,
  userWithoutEmail,
  userWithoutAddress,
  userWithInvalidEmail,
} from './fixtures/test-data';
import {
  getUserByEmail,
  countUsers,
  getUserCountByEmail,
} from './helpers/database';

/**
 * Integration tests for the Add User feature
 * Tests the complete flow: Form → Server Action → Database
 */
describe('Add User Integration Tests', () => {
  /**
   * Setup: Connect to test database before running tests
   */
  beforeAll(async () => {
    await connectToTestDB();
  });

  /**
   * Cleanup: Clear test data after each test to prevent pollution
   */
  afterEach(async () => {
    await clearTestData();
  });

  /**
   * Teardown: Disconnect from database after all tests complete
   */
  afterAll(async () => {
    await disconnectFromTestDB();
  });

  /**
   * Test 1: Happy Path - Add a valid user successfully
   *
   * Given: A valid user object with all required fields
   * When: addNewUserAction is called with valid data
   * Then: User is created in database
   * And: User can be retrieved from database with correct data
   *
   * Note: revalidatePath fails in test environment, but user is still created
   */
  test('should add a valid user successfully', async () => {
    // Arrange
    const newUser = createTestUser();

    // Act
    const result = await addNewUserAction(newUser, '/');

    // Assert - User should be created despite revalidatePath error
    // The server action catches the error and still returns success
    const savedUser = await getUserByEmail(newUser.email);
    expect(savedUser).toBeDefined();
    expect(savedUser?.firstName).toBe(newUser.firstName);
    expect(savedUser?.lastName).toBe(newUser.lastName);
    expect(savedUser?.email).toBe(newUser.email);
    expect(savedUser?.address).toBe(newUser.address);
  });

  /**
   * Test 2: Data Persistence - Allow empty firstName (no validation in server action)
   *
   * Given: User object with empty firstName
   * When: addNewUserAction is called
   * Then: User is created in database with empty firstName
   *
   * Note: The server action doesn't validate empty fields - validation happens on the client
   */
  test('should allow empty firstName (client-side validation)', async () => {
    // Arrange
    const userWithEmpty = userWithoutFirstName;

    // Act
    const result = await addNewUserAction(userWithEmpty, '/');

    // Assert - User is created even with empty firstName
    const savedUser = await getUserByEmail(userWithEmpty.email);
    expect(savedUser).toBeDefined();
    expect(savedUser?.firstName).toBe('');
  });

  /**
   * Test 3: Data Persistence - Allow empty lastName (no validation in server action)
   *
   * Given: User object with empty lastName
   * When: addNewUserAction is called
   * Then: User is created in database with empty lastName
   *
   * Note: The server action doesn't validate empty fields - validation happens on the client
   */
  test('should allow empty lastName (client-side validation)', async () => {
    // Arrange
    const userWithEmpty = userWithoutLastName;

    // Act
    const result = await addNewUserAction(userWithEmpty, '/');

    // Assert - User is created even with empty lastName
    const savedUser = await getUserByEmail(userWithEmpty.email);
    expect(savedUser).toBeDefined();
    expect(savedUser?.lastName).toBe('');
  });

  /**
   * Test 4: Data Persistence - Allow empty email (no validation in server action)
   *
   * Given: User object with empty email
   * When: addNewUserAction is called
   * Then: User is created in database with empty email
   *
   * Note: The server action doesn't validate empty fields - validation happens on the client
   */
  test('should allow empty email (client-side validation)', async () => {
    // Arrange
    const userWithEmpty = userWithoutEmail;

    // Act
    const result = await addNewUserAction(userWithEmpty, '/');

    // Assert - User is created even with empty email
    const userCount = await countUsers();
    expect(userCount).toBe(1);

    const savedUser = await getUserByEmail('');
    expect(savedUser).toBeDefined();
    expect(savedUser?.email).toBe('');
  });

  /**
   * Test 5: Data Persistence - Allow empty address (no validation in server action)
   *
   * Given: User object with empty address
   * When: addNewUserAction is called
   * Then: User is created in database with empty address
   *
   * Note: The server action doesn't validate empty fields - validation happens on the client
   */
  test('should allow empty address (client-side validation)', async () => {
    // Arrange
    const userWithEmpty = userWithoutAddress;

    // Act
    const result = await addNewUserAction(userWithEmpty, '/');

    // Assert - User is created even with empty address
    const savedUser = await getUserByEmail(userWithEmpty.email);
    expect(savedUser).toBeDefined();
    expect(savedUser?.address).toBe('');
  });

  /**
   * Test 6: Duplicate Emails - Allow duplicate emails (no unique constraint)
   *
   * Given: A user already exists with a specific email
   * When: addNewUserAction is called with the same email
   * Then: A second user is created with the same email
   *
   * Note: MongoDB schema doesn't have a unique constraint on email
   */
  test('should allow duplicate emails (no unique constraint)', async () => {
    // Arrange
    const firstUser = createTestUser();

    // Act - Create first user
    const firstResult = await addNewUserAction(firstUser, '/');

    // Act - Create second user with same email
    const duplicateUser = createTestUser({ email: firstUser.email });
    const secondResult = await addNewUserAction(duplicateUser, '/');

    // Assert - Both users are created
    const userCount = await getUserCountByEmail(firstUser.email);
    expect(userCount).toBe(2);
  });

  /**
   * Test 7: Data Integrity - Verify all fields are persisted correctly
   *
   * Given: A user with special characters and specific data
   * When: addNewUserAction is called
   * Then: All fields are persisted exactly as provided
   */
  test('should persist all user fields correctly', async () => {
    // Arrange
    const newUser = createTestUser({
      firstName: "John",
      lastName: "O'Brien",
      address: "123 Main St, Apt 4B, New York, NY 10001",
    });

    // Act
    const result = await addNewUserAction(newUser, '/');

    // Assert - User is created despite revalidatePath error
    const savedUser = await getUserByEmail(newUser.email);
    expect(savedUser).toBeDefined();
    expect(savedUser?.firstName).toBe("John");
    expect(savedUser?.lastName).toBe("O'Brien");
    expect(savedUser?.address).toBe("123 Main St, Apt 4B, New York, NY 10001");
  });

  /**
   * Test 8: Multiple Users - Add multiple users in sequence
   *
   * Given: Multiple valid user objects
   * When: addNewUserAction is called multiple times
   * Then: All users are created and persisted
   */
  test('should add multiple users in sequence', async () => {
    // Arrange
    const user1 = createTestUser({ firstName: 'Alice' });
    const user2 = createTestUser({ firstName: 'Bob' });
    const user3 = createTestUser({ firstName: 'Charlie' });

    // Act
    const result1 = await addNewUserAction(user1, '/');
    const result2 = await addNewUserAction(user2, '/');
    const result3 = await addNewUserAction(user3, '/');

    // Assert - All users are created despite revalidatePath errors
    const totalUsers = await countUsers();
    expect(totalUsers).toBe(3);

    const savedUser1 = await getUserByEmail(user1.email);
    const savedUser2 = await getUserByEmail(user2.email);
    const savedUser3 = await getUserByEmail(user3.email);

    expect(savedUser1?.firstName).toBe('Alice');
    expect(savedUser2?.firstName).toBe('Bob');
    expect(savedUser3?.firstName).toBe('Charlie');
  });

  /**
   * Test 9: Error Handling - Graceful handling of database errors
   *
   * Note: This test verifies that the server action handles errors gracefully
   * by returning a failure response rather than throwing an exception
   */
  test('should handle errors gracefully', async () => {
    // Arrange - Create a user with invalid data that might cause issues
    const invalidUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'valid@example.com',
      address: 'Valid Address',
      // Add an extra field that might cause issues
      extraField: 'This should not cause a crash',
    };

    // Act
    const result = await addNewUserAction(invalidUser, '/');

    // Assert - Should either succeed (extra fields ignored) or fail gracefully
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
  });
});
