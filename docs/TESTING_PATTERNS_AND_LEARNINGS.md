# Testing Patterns & Learnings - User Management Next.js

**Date:** February 24, 2026
**Status:** Documented from brainstorms and completed unit test implementation

---

## Executive Summary

This document consolidates testing patterns, decisions, and learnings from the User Management Next.js project. It covers:
- **Unit Testing** with Jest (completed)
- **E2E Testing** with Playwright (planned)
- **Integration Testing** with MongoDB (planned)
- **Key Decisions** and rationale
- **Gotchas** and solutions discovered

---

## Part 1: Unit Testing with Jest (✅ Completed)

### Overview

Unit tests for `addNewUserAction()` server action using Jest with mocked Mongoose models and Next.js cache functions.

**Status:** ✅ Completed - 4 tests passing in < 1.1 seconds

### Key Decisions & Rationale

#### 1. **Jest as Test Runner**
- ✅ Industry standard for Next.js projects
- ✅ Built-in mocking with `jest.mock()`
- ✅ No additional configuration needed
- ✅ Works with CommonJS and ESM
- ✅ Excellent Next.js integration via `next/jest`

#### 2. **Mock Mongoose Models**
- Mock `User.create()` to return test data
- Mock `connectToDB()` to avoid actual connections
- Use `jest.spyOn()` to verify function calls
- **Gotcha:** Ensure mocks are configured BEFORE importing the action

#### 3. **Mock Next.js Cache Functions**
- Mock `revalidatePath()` to verify it's called with correct path
- Verify it's called after successful user creation
- Verify it's NOT called on errors
- **Gotcha:** `next/cache` must be mocked in setup.js before tests run

#### 4. **Test File Location**
- Place tests in `src/actions/__tests__/index.test.js`
- Follows Next.js convention of colocating tests with source
- Easy to find and maintain

#### 5. **Test Data Strategy**
- Create a `testData.js` file with reusable mock user objects
- Use consistent test data across all tests
- Makes tests more readable and maintainable

### Test Coverage

**4 Test Cases Implemented:**

1. **Happy Path** - Successfully add a valid user
   - Verifies `User.create()` is called with correct data
   - Verifies `revalidatePath()` is called
   - Verifies success response

2. **Error Handling - Connection Error**
   - Simulates database connection failure
   - Verifies error is caught gracefully
   - Verifies `revalidatePath()` is NOT called
   - Verifies error response

3. **Error Handling - Creation Error**
   - Simulates user creation failure (e.g., duplicate email)
   - Verifies error is caught gracefully
   - Verifies `revalidatePath()` is NOT called
   - Verifies error response

4. **Cache Revalidation**
   - Verifies correct path is revalidated
   - Verifies revalidation doesn't happen on errors

### Performance

- **Execution Time:** < 1.1 seconds for all 4 tests
- **No Database Overhead:** All tests use mocks
- **Fast Feedback:** Suitable for local development and CI/CD

### Configuration Files

#### jest.config.js
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

#### jest.setup.js
```javascript
// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module '@/...'" | Verify `moduleNameMapper` in `jest.config.js` maps `@/` to `src/` |
| "User.create is not a function" | Ensure `jest.mock()` is called before importing the action |
| Tests timeout or hang | Verify mocks return promises (use `mockResolvedValue` or `mockRejectedValue`) |
| "revalidatePath is not a function" | Ensure `next/cache` is mocked in setup.js |
| Mock state leaks between tests | Call `jest.clearAllMocks()` in `beforeEach()` |

### npm Scripts

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

---

## Part 2: E2E Testing with Playwright (📋 Planned)

### Overview

Comprehensive E2E test suite for the User Management app using Playwright. Tests the complete "add user" flow: opening the app → filling the form → submitting → verifying the user appears in the database and UI.

**Status:** 📋 Planned (brainstorm complete, ready for implementation)

### Why Playwright Over Alternatives

**Evaluated Approaches:**
1. **Playwright-First (Chosen)** - Real browser testing + Jest API tests
2. Jest-Only - Faster but less realistic
3. Hybrid - Balanced but more complex

**Playwright was chosen because:**
- Your app is small (just user CRUD)—E2E tests are manageable
- Playwright is the industry standard for Next.js
- Real browser testing catches bugs Jest can't (timing, layout, form validation)
- Provides the highest confidence in actual user experience
- Better Next.js integration than Cypress
- Faster and more reliable than Cypress

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| **E2E Framework** | Playwright (not Cypress) - better Next.js integration, faster, more reliable |
| **Test Database** | MongoDB Atlas test cluster - isolated, production-like, no local setup |
| **Test Structure** | E2E tests in `tests/e2e/` using Playwright; API integration tests in `__tests__/` using Jest |
| **Environment** | Separate test database connection string in `.env.test` |
| **Starting Point** | Focus on "add user" flow first (happy path + error cases) |
| **Browser Coverage** | Start with Chrome, can expand to Firefox/Safari later |
| **Test Data** | Use fixtures for consistent test data (firstName, lastName, email, address) |

### Resolved Questions

1. **CI/CD Integration:** Skip for now—focus on local testing first. Can add GitHub Actions later.
2. **Test Database Cleanup:** Clear all users before each test. Simple, ensures isolation.
3. **Performance Baseline:** Target < 30 seconds total execution time. Optimize for fast feedback.
4. **Headless Mode:** Support both headless (default) and headed mode. Developers can use `npm run test:e2e:headed` for debugging.
5. **Screenshots/Videos:** Capture both on failure. Helps with debugging without slowing down passing tests.

### Planned Test Structure

```
tests/
├── e2e/
│   ├── add-user.spec.js          (E2E tests for add user flow)
│   ├── fixtures/
│   │   └── testData.js           (Test data and fixtures)
│   └── helpers/
│       └── db.js                 (Database cleanup utilities)
├── fixtures/
│   └── users.json                (Test user data)
└── playwright.config.js           (Playwright configuration)
```

### Planned Test Cases

1. **Happy Path** - Add user successfully
   - Open app
   - Fill form with valid data
   - Submit form
   - Verify user appears in UI
   - Verify user exists in database

2. **Validation Errors**
   - Try to submit empty form
   - Verify error messages appear
   - Verify user is not created

3. **Duplicate Email**
   - Create user with email
   - Try to create another user with same email
   - Verify error message
   - Verify only one user exists

4. **Edit User**
   - Create user
   - Click edit button
   - Modify user data
   - Verify changes in UI and database

5. **Delete User**
   - Create user
   - Click delete button
   - Verify user is removed from UI
   - Verify user is removed from database

### Performance Target

- **Total Execution Time:** < 30 seconds for all E2E tests
- **Per Test:** < 5 seconds average
- **Headless Mode:** Default for CI/CD
- **Headed Mode:** Available for debugging

### Environment Setup

```bash
# .env.test
MONGO_URI=mongodb+srv://test-user:test-password@test-cluster.mongodb.net/user-management-test
```

---

## Part 3: Integration Testing with MongoDB (📋 Planned)

### Overview

API integration tests using Jest with a real MongoDB test database. Tests server actions with actual database operations (no mocks).

### Key Decisions

1. **Test Database:** MongoDB Atlas test cluster (isolated, production-like)
2. **Test Isolation:** Clear database before each test
3. **Connection:** Use `MONGO_URI` from `.env.test`
4. **Scope:** Test server actions with real database operations

### Planned Test Cases

1. **addNewUserAction** - Create user in real database
2. **editUserAction** - Update user in real database
3. **deleteUserAction** - Delete user from real database
4. **fetchUsersAction** - Fetch users from real database

---

## Part 4: Component Testing (📋 Planned)

### Overview

Unit tests for React components using React Testing Library.

### Planned Components to Test

1. **AddNewUser** - Dialog form component
   - Form rendering
   - Input handling
   - Validation
   - Submit button behavior

2. **SingleUserCard** - User display card
   - User data rendering
   - Edit button behavior
   - Delete button behavior

3. **UserContext** - React Context
   - State management
   - Context provider

---

## Testing Patterns & Best Practices

### Pattern 1: Mock Setup Order

**Gotcha:** Mocks must be configured BEFORE importing the module being tested.

```javascript
// ✅ CORRECT
jest.mock('@/models/user')
jest.mock('next/cache')
import { addNewUserAction } from '../index'

// ❌ WRONG
import { addNewUserAction } from '../index'
jest.mock('@/models/user')  // Too late!
```

### Pattern 2: Async/Await in Tests

**Gotcha:** All tests must be async since server actions are async.

```javascript
// ✅ CORRECT
it('should add user', async () => {
  const result = await addNewUserAction(data)
  expect(result.success).toBe(true)
})

// ❌ WRONG
it('should add user', () => {
  const result = addNewUserAction(data)  // Returns Promise!
  expect(result.success).toBe(true)
})
```

### Pattern 3: Mock Clearing

**Gotcha:** Mock state leaks between tests if not cleared.

```javascript
// ✅ CORRECT
beforeEach(() => {
  jest.clearAllMocks()
})

// ❌ WRONG - Mock state from previous test affects next test
describe('tests', () => {
  it('test 1', () => { /* ... */ })
  it('test 2', () => { /* ... */ })  // May see mock calls from test 1
})
```

### Pattern 4: Test Data Reusability

**Best Practice:** Create a `testData.js` file with reusable mock objects.

```javascript
// ✅ CORRECT - Reusable test data
export const validUserData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  address: '123 Main St',
}

// ❌ WRONG - Duplicated test data in each test
it('test 1', () => {
  const data = { firstName: 'John', /* ... */ }
})
it('test 2', () => {
  const data = { firstName: 'John', /* ... */ }  // Duplicated!
})
```

### Pattern 5: Verify Behavior, Not Implementation

**Best Practice:** Test what the function does, not how it does it.

```javascript
// ✅ CORRECT - Tests behavior
expect(result).toEqual({
  success: true,
  message: 'User added successfully',
})

// ❌ WRONG - Tests implementation details
expect(User.create).toHaveBeenCalledWith(
  expect.objectContaining({ firstName: 'John' })
)
expect(revalidatePath).toHaveBeenCalledWith('/')
// (These are OK to verify, but focus on the result)
```

### Pattern 6: Error Handling

**Best Practice:** Test both success and error paths.

```javascript
// ✅ CORRECT - Tests both paths
describe('Error Handling', () => {
  it('should handle errors gracefully', async () => {
    User.create.mockRejectedValue(new Error('DB Error'))
    const result = await addNewUserAction(data)
    expect(result.success).toBe(false)
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
```

---

## Extensibility & Future Work

### Phase 1: Unit Tests (✅ Completed)
- ✅ Jest configuration
- ✅ `addNewUserAction()` tests
- ✅ Test utilities and mocks

### Phase 2: E2E Tests (📋 Planned)
- [ ] Playwright configuration
- [ ] Add user E2E tests
- [ ] Edit user E2E tests
- [ ] Delete user E2E tests

### Phase 3: Integration Tests (📋 Planned)
- [ ] MongoDB test database setup
- [ ] Server action integration tests
- [ ] Database operation validation

### Phase 4: Component Tests (📋 Planned)
- [ ] React Testing Library setup
- [ ] AddNewUser component tests
- [ ] SingleUserCard component tests
- [ ] UserContext tests

### Phase 5: CI/CD Integration (📋 Planned)
- [ ] GitHub Actions workflow
- [ ] Run tests on every commit
- [ ] Coverage reporting
- [ ] Test result artifacts

---

## Key Learnings & Gotchas

### Gotcha 1: Path Aliases in Jest

**Problem:** Jest doesn't automatically resolve `@/` path aliases.

**Solution:** Configure `moduleNameMapper` in `jest.config.js`:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### Gotcha 2: Mock Import Order

**Problem:** Mocks must be configured before the module is imported.

**Solution:** Always mock at the top of the test file, before imports:
```javascript
jest.mock('@/models/user')
jest.mock('next/cache')
import { addNewUserAction } from '../index'
```

### Gotcha 3: Async Server Actions

**Problem:** Server actions return Promises, but tests might not await them.

**Solution:** Always use `async/await` in tests:
```javascript
it('should work', async () => {
  const result = await addNewUserAction(data)
  expect(result).toBeDefined()
})
```

### Gotcha 4: Mock State Leakage

**Problem:** Mock state from one test affects the next test.

**Solution:** Clear mocks in `beforeEach()`:
```javascript
beforeEach(() => {
  jest.clearAllMocks()
})
```

### Gotcha 5: Playwright Test Database

**Problem:** Tests might interfere with each other if database isn't cleaned.

**Solution:** Clear database before each test:
```javascript
beforeEach(async () => {
  await db.clearAllUsers()
})
```

### Gotcha 6: Playwright Headless Mode

**Problem:** Headless mode is faster but harder to debug.

**Solution:** Support both modes:
```bash
npm run test:e2e              # Headless (fast)
npm run test:e2e:headed       # Headed (debug)
```

### Gotcha 7: Test Data Isolation

**Problem:** Test data might conflict if not properly isolated.

**Solution:** Use unique test data (timestamps, UUIDs):
```javascript
const testEmail = `test-${Date.now()}@example.com`
```

---

## Commands Reference

### Unit Tests (Jest)
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### E2E Tests (Playwright) - Planned
```bash
npm run test:e2e           # Run E2E tests (headless)
npm run test:e2e:headed    # Run E2E tests (headed)
npm run test:e2e:debug     # Debug mode
```

### Integration Tests - Planned
```bash
npm run test:integration   # Run integration tests
```

---

## Documentation References

### Internal References
- **Server action code:** `src/actions/index.js`
- **Database connection:** `src/database/index.js`
- **User model:** `src/models/user.js`
- **Project config:** `package.json`, `jsconfig.json`
- **Architecture:** `CLAUDE.md`

### External References
- [Next.js Testing with Jest](https://nextjs.org/docs/app/guides/testing/jest)
- [Jest Configuration Documentation](https://jestjs.io/docs/configuration)
- [Jest Mocking Guide](https://jestjs.io/docs/manual-mocks)
- [Testing Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)

---

## Summary

This document captures the testing strategy, patterns, and learnings for the User Management Next.js project:

✅ **Unit Testing:** Jest with mocked dependencies (completed)
📋 **E2E Testing:** Playwright with real browser (planned)
📋 **Integration Testing:** Jest with real MongoDB (planned)
📋 **Component Testing:** React Testing Library (planned)
📋 **CI/CD Integration:** GitHub Actions (planned)

All patterns, gotchas, and best practices are documented for future developers to follow.
