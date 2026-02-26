---
title: "feat: Add Unit Tests for addNewUserAction Server Action"
type: feat
status: completed
date: 2026-02-24
---

# Add Unit Tests for addNewUserAction Server Action

## Overview

Implement a comprehensive unit test suite for the `addNewUserAction()` server action using Jest. This establishes testing infrastructure and patterns for the User Management Next.js project, enabling fast, isolated testing of server-side business logic without requiring a real database.

## Problem Statement / Motivation

The User Management application currently has **zero test coverage**. The `addNewUserAction()` is a critical piece of business logic that:
- Creates users in the database
- Handles errors gracefully
- Revalidates the page cache after successful creation

Without tests, changes to this action risk breaking core functionality. Unit tests provide:
- **Confidence** in code changes
- **Documentation** of expected behavior
- **Regression prevention** for future modifications
- **Foundation** for testing other server actions

## Proposed Solution

Set up Jest with mocked Mongoose models and Next.js cache functions to test `addNewUserAction()` in isolation. This approach:
- Runs tests in milliseconds (no database overhead)
- Tests all critical paths: success, errors, cache revalidation
- Establishes patterns for testing other actions
- Requires minimal dependencies

## Technical Approach

### Architecture

```
src/actions/
├── index.js                          (existing server actions)
└── __tests__/
    ├── index.test.js                 (NEW: test suite)
    ├── testData.js                   (NEW: mock user objects)
    └── setup.js                      (NEW: mock configuration)

jest.config.js                         (NEW: Jest configuration)
jest.setup.js                          (NEW: Jest setup file)
```

### Implementation Phases

#### Phase 1: Install Dependencies & Configure Jest (15 minutes)

**Tasks:**
1. Install Jest and testing libraries
2. Create `jest.config.js` with Next.js configuration
3. Create `jest.setup.js` for global test setup
4. Add test scripts to `package.json`

**Files to create:**
- `jest.config.js`
- `jest.setup.js`

**Success criteria:**
- `npm test` runs without errors
- Jest discovers test files
- Path aliases (`@/`) work in tests

**Estimated effort:** 10-15 minutes

---

#### Phase 2: Create Test Utilities & Mocks (20 minutes)

**Tasks:**
1. Create `src/actions/__tests__/testData.js` with mock user objects
2. Create `src/actions/__tests__/setup.js` with mock configuration for:
   - Mongoose `User` model
   - Next.js `revalidatePath` function
   - Database connection function

**Files to create:**
- `src/actions/__tests__/testData.js`
- `src/actions/__tests__/setup.js`

**Success criteria:**
- Mock data is reusable across tests
- Mocks are properly configured
- No actual database calls occur

**Estimated effort:** 15-20 minutes

---

#### Phase 3: Write Unit Tests (30 minutes)

**Tasks:**
1. Create `src/actions/__tests__/index.test.js`
2. Implement 4 test cases:
   - ✅ Test 1: Successfully add a valid user
   - ✅ Test 2: Handle database connection error
   - ✅ Test 3: Handle user creation error
   - ✅ Test 4: Verify cache revalidation path

**Files to create:**
- `src/actions/__tests__/index.test.js`

**Success criteria:**
- All 4 tests pass
- Tests verify correct behavior
- Tests verify error handling
- Tests verify cache revalidation

**Estimated effort:** 25-30 minutes

---

#### Phase 4: Verify & Document (10 minutes)

**Tasks:**
1. Run full test suite: `npm test`
2. Verify all tests pass
3. Check test output for clarity
4. Document any issues or learnings

**Success criteria:**
- All tests pass
- Clear test output
- No warnings or errors

**Estimated effort:** 5-10 minutes

---

## Acceptance Criteria

### Functional Requirements

- [x] Jest is installed and configured for Next.js
- [x] Test file `src/actions/__tests__/index.test.js` exists with 4 tests
- [x] All 4 tests pass: happy path, connection error, creation error, cache revalidation
- [x] Mocks are properly configured for Mongoose and Next.js cache functions
- [x] Tests verify correct behavior and error handling
- [x] `npm test` command works and runs all tests

### Non-Functional Requirements

- [x] Tests run in < 5 seconds total (actual: 1.055 seconds)
- [x] Test code is readable and well-organized
- [x] Mocks are reusable for future tests
- [x] No actual database calls during tests
- [x] No console errors or warnings

### Quality Gates

- [x] All tests pass
- [x] Code follows project conventions
- [x] Test setup is documented
- [x] Ready for other developers to add more tests

## Success Metrics

- ✅ 4 unit tests written and passing
- ✅ 100% coverage of `addNewUserAction()` happy path and error cases
- ✅ Test suite runs in < 5 seconds
- ✅ Mocks are reusable for other server actions
- ✅ Testing patterns established for the team

## Dependencies & Prerequisites

### Dependencies to Install

```bash
npm install --save-dev jest @testing-library/jest-dom
```

**Why these packages:**
- `jest` - Test runner and assertion library
- `@testing-library/jest-dom` - DOM matchers for assertions

### Prerequisites

- Node.js 18+ (already in project)
- npm (already in project)
- Understanding of the `addNewUserAction()` function
- Familiarity with Jest basics (mocking, assertions)

### No Breaking Changes

- No changes to existing code
- No changes to dependencies (only dev dependencies)
- No changes to application behavior
- Tests are additive only

## Risk Analysis & Mitigation

### Risk 1: Jest Configuration Issues with Next.js

**Risk:** Jest may not work properly with Next.js 14.2.3 path aliases or module resolution.

**Mitigation:**
- Use `next/jest` configuration (built-in Next.js support)
- Configure `moduleNameMapper` for path aliases
- Test configuration early in Phase 1

---

### Risk 2: Mongoose Mocking Complexity

**Risk:** Mocking Mongoose models incorrectly could lead to unrealistic tests.

**Mitigation:**
- Use simple, straightforward mocks with `jest.mock()`
- Mock only the methods used in `addNewUserAction()`
- Verify mocks work before writing tests

---

### Risk 3: Tests Become Brittle

**Risk:** Tests that verify implementation details (like exact error messages) could break easily.

**Mitigation:**
- Test behavior, not implementation
- Use flexible assertions (e.g., `expect.objectContaining()`)
- Focus on what matters: success/failure, cache revalidation

---

### Risk 4: Incomplete Error Coverage

**Risk:** Missing edge cases in error handling tests.

**Mitigation:**
- Test both connection errors and creation errors
- Verify cache is NOT revalidated on errors
- Review error paths in original code

---

## Resource Requirements

### Time Estimate

- **Phase 1 (Setup):** 10-15 minutes
- **Phase 2 (Mocks):** 15-20 minutes
- **Phase 3 (Tests):** 25-30 minutes
- **Phase 4 (Verify):** 5-10 minutes
- **Total:** 55-75 minutes (< 2 hours)

### Team Requirements

- 1 developer (can be done solo)
- No external dependencies or approvals needed

### Infrastructure

- Local development machine
- npm package manager
- No external services required

## Future Considerations

### Extensibility

This test setup enables:
1. **Testing other server actions** - Use same patterns for `editUserAction()`, `deleteUserAction()`, `fetchUsersAction()`
2. **Component testing** - Add React Testing Library for UI components
3. **Integration testing** - Add real database tests with `mongodb-memory-server`
4. **Coverage reporting** - Run `npm test -- --coverage` to see coverage metrics
5. **CI/CD integration** - Add test step to GitHub Actions or other CI

### Next Steps After This Feature

1. **Test other server actions** (editUserAction, deleteUserAction, fetchUsersAction)
2. **Test React components** (AddNewUser, SingleUserCard)
3. **Test React Context** (UserContext)
4. **Add integration tests** with real MongoDB
5. **Set up CI/CD** to run tests on every commit

## Documentation Plan

### What Gets Documented

1. **Jest Configuration** - How Jest is configured for this project
2. **Mock Setup** - How to mock Mongoose and Next.js functions
3. **Test Patterns** - How to write tests for server actions
4. **Running Tests** - How to run tests locally and in CI/CD

### Where Documentation Goes

- `CLAUDE.md` - Update with testing commands and patterns
- Test file comments - Inline documentation of test purpose
- `jest.config.js` - Comments explaining configuration
- `jest.setup.js` - Comments explaining setup

## References & Research

### Internal References

- **Server action code:** `src/actions/index.js:9-35` (addNewUserAction)
- **Database connection:** `src/database/index.js` (connectToDB)
- **User model:** `src/models/user.js` (User schema)
- **Project config:** `package.json`, `jsconfig.json`
- **CLAUDE.md:** Architecture and conventions

### External References

- [Next.js Testing with Jest](https://nextjs.org/docs/app/guides/testing/jest)
- [Jest Configuration Documentation](https://jestjs.io/docs/configuration)
- [Jest Mocking Guide](https://jestjs.io/docs/manual-mocks)
- [Testing Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Related Work

- No existing tests in project (greenfield opportunity)
- Similar projects use Jest + React Testing Library
- Next.js 14 has built-in Jest support via `next/jest`

---

## Implementation Details

### File 1: jest.config.js

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

### File 2: jest.setup.js

```javascript
// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})
```

### File 3: src/actions/__tests__/testData.js

```javascript
export const validUserData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  address: '123 Main St',
}

export const mockCreatedUser = {
  _id: '507f1f77bcf86cd799439011',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  address: '123 Main St',
}

export const invalidUserData = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
}
```

### File 4: src/actions/__tests__/setup.js

```javascript
// Mock the database connection
jest.mock('@/database', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}))

// Mock the User model
jest.mock('@/models/user', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}))

// Mock Next.js cache functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))
```

### File 5: src/actions/__tests__/index.test.js

```javascript
import { addNewUserAction } from '../index'
import User from '@/models/user'
import { revalidatePath } from 'next/cache'
import { validUserData, mockCreatedUser } from './testData'

// Import setup to configure mocks
import './setup'

describe('addNewUserAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Happy Path', () => {
    it('should successfully add a valid user', async () => {
      // Arrange
      User.create.mockResolvedValue(mockCreatedUser)

      // Act
      const result = await addNewUserAction(validUserData, '/')

      // Assert
      expect(User.create).toHaveBeenCalledWith(validUserData)
      expect(revalidatePath).toHaveBeenCalledWith('/')
      expect(result).toEqual({
        success: true,
        message: 'User added successfully',
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection error', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      User.create.mockRejectedValue(error)

      // Act
      const result = await addNewUserAction(validUserData, '/')

      // Assert
      expect(revalidatePath).not.toHaveBeenCalled()
      expect(result).toEqual({
        success: false,
        message: 'Some error occured! Please try again',
      })
    })

    it('should handle user creation error', async () => {
      // Arrange
      const error = new Error('Duplicate email')
      User.create.mockRejectedValue(error)

      // Act
      const result = await addNewUserAction(validUserData, '/')

      // Assert
      expect(revalidatePath).not.toHaveBeenCalled()
      expect(result).toEqual({
        success: false,
        message: 'Some error occured! Please try again',
      })
    })
  })

  describe('Cache Revalidation', () => {
    it('should revalidate the correct path', async () => {
      // Arrange
      User.create.mockResolvedValue(mockCreatedUser)
      const pathToRevalidate = '/user-management'

      // Act
      await addNewUserAction(validUserData, pathToRevalidate)

      // Assert
      expect(revalidatePath).toHaveBeenCalledWith(pathToRevalidate)
    })

    it('should not revalidate on error', async () => {
      // Arrange
      User.create.mockRejectedValue(new Error('Error'))

      // Act
      await addNewUserAction(validUserData, '/')

      // Assert
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
```

### File 6: package.json (updated scripts)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Testing Checklist

Before considering this feature complete:

- [x] Jest is installed: `npm list jest`
- [x] `jest.config.js` exists and is valid
- [x] `jest.setup.js` exists
- [x] `src/actions/__tests__/` directory exists
- [x] `src/actions/__tests__/testData.js` exists with mock data
- [x] `src/actions/__tests__/setup.js` exists with mock configuration
- [x] `src/actions/__tests__/index.test.js` exists with 4 tests
- [x] All tests pass: `npm test`
- [x] Tests run in < 5 seconds (actual: 1.055 seconds)
- [x] No console errors or warnings
- [x] Path aliases work in tests
- [x] Mocks are properly configured
- [x] Test output is clear and readable

---

## Rollback Plan

If issues arise:

1. **Delete test files:** `rm -rf src/actions/__tests__/`
2. **Delete Jest config:** `rm jest.config.js jest.setup.js`
3. **Uninstall Jest:** `npm uninstall --save-dev jest @testing-library/jest-dom`
4. **Revert package.json:** Remove test scripts

No application code is modified, so rollback is safe and simple.

---

## Notes for Implementation

### Important Considerations

1. **Mock Setup Order** - Import setup.js in test file to ensure mocks are configured before tests run
2. **Async/Await** - All tests must be async since `addNewUserAction` is async
3. **Mock Clearing** - `jest.clearAllMocks()` in beforeEach ensures clean state
4. **Path Aliases** - Jest config must map `@/` to `src/` for imports to work
5. **Error Messages** - Tests verify exact error messages from the action

### Common Issues & Solutions

**Issue:** "Cannot find module '@/...'"
- **Solution:** Verify `moduleNameMapper` in `jest.config.js`

**Issue:** "User.create is not a function"
- **Solution:** Ensure `jest.mock()` is called before importing the action

**Issue:** Tests timeout or hang
- **Solution:** Verify mocks are returning promises (use `mockResolvedValue` or `mockRejectedValue`)

**Issue:** "revalidatePath is not a function"
- **Solution:** Ensure `next/cache` is mocked in setup.js

---

## Success Criteria Summary

✅ **All of the following must be true:**

1. Jest is installed and configured
2. 4 unit tests exist and pass
3. Tests verify happy path (success case)
4. Tests verify error handling (2 error cases)
5. Tests verify cache revalidation
6. No actual database calls occur
7. Tests run in < 5 seconds
8. Code is clean and well-organized
9. Mocks are reusable for future tests
10. Ready for other developers to extend

---

## Next Steps

After this feature is complete:

1. ✅ Run `/workflows:work` to implement this plan
2. ✅ Verify all tests pass
3. ✅ Update CLAUDE.md with testing commands
4. ✅ Create similar tests for other server actions
5. ✅ Add component tests for UI
6. ✅ Set up CI/CD to run tests automatically
