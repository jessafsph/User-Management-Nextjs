# Integration Tests

This directory contains integration tests for the User Management application. Integration tests validate the complete flow from user actions through server-side operations to database persistence.

## Overview

Integration tests in this project:
- ✅ Connect to a real MongoDB Atlas test database
- ✅ Test the complete flow: Form → Server Action → Database
- ✅ Verify data persistence and integrity
- ✅ Test error handling and edge cases
- ✅ Clean up test data after each test

## Test Files

### `add-user.test.ts`
Tests for the "Add User" feature with 9 test cases:

1. **Happy Path** - Add a valid user successfully
2. **Empty firstName** - Allow empty firstName (client-side validation)
3. **Empty lastName** - Allow empty lastName (client-side validation)
4. **Empty email** - Allow empty email (client-side validation)
5. **Empty address** - Allow empty address (client-side validation)
6. **Duplicate emails** - Allow duplicate emails (no unique constraint)
7. **Data integrity** - Persist all fields correctly
8. **Multiple users** - Add multiple users in sequence
9. **Error handling** - Handle errors gracefully

## Setup

### Prerequisites

1. **MongoDB Atlas Test Database**
   - Create a separate MongoDB Atlas project for testing
   - This keeps test data isolated from production

2. **Environment Configuration**
   - Add `MONGO_URI_TEST` to `.env.test`:
   ```bash
   MONGO_URI_TEST=mongodb+srv://username:password@test-cluster.mongodb.net/test-db?retryWrites=true&w=majority
   ```

### Installation

No additional setup needed! The integration tests use:
- Jest (already configured)
- Mongoose (already installed)
- Next.js (already configured)

## Running Tests

### Run all integration tests
```bash
npm run test:integration
```

### Run integration tests in watch mode
```bash
npm run test:integration:watch
```

### Run a specific test file
```bash
npm test -- tests/integration/add-user.test.ts
```

### Run a specific test case
```bash
npm test -- tests/integration/add-user.test.ts -t "should add a valid user"
```

### Run with coverage
```bash
npm test -- tests/integration --coverage
```

## Test Structure

Each test follows the **Arrange-Act-Assert (AAA)** pattern:

```typescript
test('should add a valid user successfully', async () => {
  // Arrange - Set up test data
  const newUser = createTestUser();

  // Act - Perform the action
  const result = await addNewUserAction(newUser, '/');

  // Assert - Verify the results
  const savedUser = await getUserByEmail(newUser.email);
  expect(savedUser).toBeDefined();
});
```

## Test Utilities

### Setup (`setup.ts`)
- `connectToTestDB()` - Connect to test MongoDB
- `disconnectFromTestDB()` - Disconnect from test MongoDB
- `clearTestData()` - Delete all test data

### Fixtures (`fixtures/test-data.ts`)
- `createTestUser(overrides)` - Generate unique test user
- Pre-built test data objects for various scenarios

### Helpers (`helpers/database.ts`)
- `getUserByEmail(email)` - Retrieve user by email
- `countUsers()` - Count total users
- `getUserCountByEmail(email)` - Count users with specific email
- `getAllUsers()` - Get all users
- `deleteUserByEmail(email)` - Delete user by email

## Important Notes

### Test Database Isolation
- Tests use a **separate MongoDB Atlas project** from production
- Test data is **cleaned up after each test** to prevent pollution
- Each test user has a unique email (timestamp + random ID)

### Validation
- The server action doesn't validate empty fields
- Validation happens on the **client-side** (React component)
- Integration tests verify that the server action accepts data as-is

### revalidatePath Errors
- Tests may show "static generation store missing" errors from `revalidatePath`
- This is expected in test environment (no Next.js static generation context)
- Users are still created successfully despite these errors

## Adding New Integration Tests

1. **Create test data** in `fixtures/test-data.ts`:
```typescript
export const myTestUser = createTestUser({ /* overrides */ });
```

2. **Write test** in `add-user.test.ts`:
```typescript
test('should do something', async () => {
  // Arrange
  const user = createTestUser();

  // Act
  const result = await addNewUserAction(user, '/');

  // Assert
  expect(result.success).toBe(true);
});
```

3. **Run tests** to verify:
```bash
npm run test:integration
```

## Debugging Tests

### View detailed output
```bash
npm test -- tests/integration/add-user.test.ts --verbose
```

### Run single test
```bash
npm test -- tests/integration/add-user.test.ts -t "test name"
```

### Check database state
Add logging in your test:
```typescript
const allUsers = await getAllUsers();
console.log('Users in database:', allUsers);
```

### Inspect test data
```typescript
const user = createTestUser();
console.log('Test user:', user);
```

## Performance

- **Execution time**: ~5 seconds for all 9 tests
- **Target**: < 10 seconds
- **Database**: Real MongoDB Atlas (slightly slower than in-memory, but production-like)

## Troubleshooting

### Tests fail with "MONGO_URI_TEST not configured"
- Add `MONGO_URI_TEST` to `.env.test`
- Verify the connection string is correct

### Tests timeout
- Check MongoDB Atlas network access (IP whitelist)
- Verify test database is accessible
- Increase timeout if network is slow

### Test data not cleaned up
- Check `clearTestData()` is called in `afterEach`
- Verify database connection is working
- Check MongoDB permissions

### revalidatePath errors
- These are expected in test environment
- Users are still created successfully
- Not a test failure

## CI/CD Integration

To run integration tests in CI/CD:

```yaml
# Example GitHub Actions
- name: Run integration tests
  run: npm run test:integration
  env:
    MONGO_URI_TEST: ${{ secrets.MONGO_URI_TEST }}
```

## Future Improvements

- [ ] Add integration tests for `editUserAction`
- [ ] Add integration tests for `deleteUserAction`
- [ ] Add integration tests for `fetchUsersAction`
- [ ] Add performance benchmarks
- [ ] Add test data seeding utilities
- [ ] Add test reporting dashboard

## References

- [Jest Documentation](https://jestjs.io/)
- [MongoDB Testing Best Practices](https://docs.mongodb.com/manual/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Mongoose Documentation](https://mongoosejs.com/)
