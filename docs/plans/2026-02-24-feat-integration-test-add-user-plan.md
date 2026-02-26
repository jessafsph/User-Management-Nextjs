---
title: "feat: Integration Test for Add User"
type: feat
status: completed
date: 2026-02-24
---

# Integration Test for Add User

## Overview

Create a comprehensive integration test suite for the "Add User" feature that validates the complete flow from form submission through database persistence. Tests will run against a real MongoDB Atlas test database to catch real-world issues and ensure data integrity.

**Scope:** Full flow testing (UI → Server Action → Database)
**Framework:** Jest + Real MongoDB Atlas
**Test Database:** Separate MongoDB Atlas project with `test_` collection prefix
**Cleanup Strategy:** Delete test data after each test
**Timeout:** 5 seconds for database operations
**CI/CD:** Run on every commit

---

## Problem Statement / Motivation

Currently, the project has:
- ✅ 5 unit tests (all passing)
- ❌ 0 integration tests
- ❌ 0 component tests
- ❌ 0 E2E tests

**Why this matters:**
- Unit tests don't catch integration issues (e.g., database connection failures, schema validation)
- No validation that the complete flow works end-to-end
- Risk of deploying broken features that pass unit tests but fail in production
- No test coverage for error handling in real database scenarios

**Integration tests solve this by:**
- Testing the actual database behavior (not mocks)
- Validating the complete flow: form → server action → database
- Catching schema validation issues
- Testing error handling with real database errors
- Providing confidence before deployment

---

## Proposed Solution

### Architecture

```
Integration Test Suite
├── Setup (beforeAll)
│   ├── Connect to test MongoDB Atlas
│   ├── Clear any existing test data
│   └── Initialize test utilities
├── Test Cases (5 scenarios)
│   ├── Happy path: Add valid user
│   ├── Validation: Empty firstName
│   ├── Validation: Invalid email
│   ├── Duplicate prevention: Same email
│   └── Database error: Connection failure
└── Cleanup (afterEach)
    └── Delete test data from database
```

### Test Scenarios

#### 1. Happy Path: Add Valid User ✅
```
Given: A valid user object with all required fields
When: addNewUserAction is called with valid data
Then: User is created in database
And: Response indicates success
And: User can be retrieved from database with correct data
```

#### 2. Validation: Empty First Name ✅
```
Given: User object with empty firstName
When: addNewUserAction is called
Then: Error is returned
And: No user is created in database
```

#### 3. Validation: Invalid Email ✅
```
Given: User object with invalid email format
When: addNewUserAction is called
Then: Error is returned
And: No user is created in database
```

#### 4. Duplicate Prevention: Same Email ✅
```
Given: A user already exists with email "test@example.com"
When: addNewUserAction is called with same email
Then: Error is returned (duplicate email)
And: Only one user exists in database
```

#### 5. Database Error: Connection Failure ✅
```
Given: Database connection is unavailable
When: addNewUserAction is called
Then: Error is caught and returned gracefully
And: No partial data is left in database
```

---

## Technical Approach

### File Structure

```
tests/integration/
├── setup.ts                    # Database connection and cleanup utilities
├── fixtures/
│   └── test-data.ts           # Test data generators and constants
├── helpers/
│   └── database.ts            # Database query helpers
└── add-user.test.ts           # Main test file with all test cases
```

### Implementation Details

#### 1. **tests/integration/setup.ts**
- Connect to test MongoDB Atlas using `MONGO_URI_TEST`
- Export cleanup utilities
- Export test database connection helper
- Handle connection errors gracefully

```typescript
// tests/integration/setup.ts
import mongoose from 'mongoose';
import User from '@/models/user';

export async function connectToTestDB() {
  const mongoUri = process.env.MONGO_URI_TEST;
  if (!mongoUri) {
    throw new Error('MONGO_URI_TEST not configured');
  }
  await mongoose.connect(mongoUri);
}

export async function disconnectFromTestDB() {
  await mongoose.disconnect();
}

export async function clearTestData() {
  // Delete all documents from test_users collection
  await User.deleteMany({});
}
```

#### 2. **tests/integration/fixtures/test-data.ts**
- Generate unique test users with timestamps/UUIDs
- Provide valid and invalid test data
- Export test data constants

```typescript
// tests/integration/fixtures/test-data.ts
export function createTestUser(overrides = {}) {
  const timestamp = Date.now();
  return {
    firstName: 'Test',
    lastName: 'User',
    email: `test-${timestamp}@example.com`,
    address: '123 Test St',
    ...overrides,
  };
}

export const validUser = createTestUser();
export const userWithoutFirstName = createTestUser({ firstName: '' });
export const userWithInvalidEmail = createTestUser({ email: 'invalid-email' });
```

#### 3. **tests/integration/helpers/database.ts**
- Query helpers for test assertions
- User retrieval by email
- Count users in database

```typescript
// tests/integration/helpers/database.ts
import User from '@/models/user';

export async function getUserByEmail(email: string) {
  return await User.findOne({ email });
}

export async function countUsers() {
  return await User.countDocuments({});
}

export async function getUserCount(email: string) {
  return await User.countDocuments({ email });
}
```

#### 4. **tests/integration/add-user.test.ts**
- Main test file with all 5 test cases
- Arrange-Act-Assert pattern
- Proper setup and cleanup

```typescript
// tests/integration/add-user.test.ts
import { addNewUserAction } from '@/actions';
import { connectToTestDB, disconnectFromTestDB, clearTestData } from './setup';
import { createTestUser } from './fixtures/test-data';
import { getUserByEmail, countUsers } from './helpers/database';

describe('Add User Integration Tests', () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterEach(async () => {
    await clearTestData();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  test('should add a valid user successfully', async () => {
    // Arrange
    const newUser = createTestUser();

    // Act
    const result = await addNewUserAction(newUser, '/');

    // Assert
    expect(result.success).toBe(true);
    const savedUser = await getUserByEmail(newUser.email);
    expect(savedUser).toBeDefined();
    expect(savedUser.firstName).toBe(newUser.firstName);
  });

  test('should reject empty firstName', async () => {
    // Arrange
    const invalidUser = createTestUser({ firstName: '' });

    // Act
    const result = await addNewUserAction(invalidUser, '/');

    // Assert
    expect(result.success).toBe(false);
    const savedUser = await getUserByEmail(invalidUser.email);
    expect(savedUser).toBeNull();
  });

  // ... more tests
});
```

### Environment Setup

#### Required Changes

1. **`.env.test` file** (already exists, needs configuration)
   ```
   MONGO_URI_TEST=mongodb+srv://username:password@test-cluster.mongodb.net/test-db?retryWrites=true&w=majority
   ```

2. **Jest configuration** (already supports .env.test)
   - Jest automatically loads `.env.test` during test runs
   - No changes needed to `jest.config.js`

3. **Database connection enhancement**
   - Modify `src/database/index.js` to support test database
   - Use `MONGO_URI_TEST` when running tests

#### Optional Enhancements

- Test data seeding script
- Database reset utility
- Test reporting dashboard

---

## Implementation Phases

### Phase 1: Setup & Infrastructure (30 mins)
- [ ] Create `tests/integration/` directory structure
- [ ] Create `tests/integration/setup.ts` with DB connection utilities
- [ ] Update `src/database/index.js` to support `MONGO_URI_TEST`
- [ ] Create `tests/integration/fixtures/test-data.ts`
- [ ] Create `tests/integration/helpers/database.ts`
- [ ] Verify Jest can find and run integration tests

**Success Criteria:**
- Directory structure created
- Database connection works with test database
- Test utilities export correctly
- Jest finds integration test files

### Phase 2: Test Implementation (45 mins)
- [ ] Create `tests/integration/add-user.test.ts`
- [ ] Implement all 5 test cases
- [ ] Add proper setup/teardown (beforeAll, afterEach, afterAll)
- [ ] Implement Arrange-Act-Assert pattern
- [ ] Add descriptive test names and comments

**Success Criteria:**
- All 5 tests run without errors
- Tests properly clean up data
- Clear error messages on failure

### Phase 3: Validation & Refinement (30 mins)
- [x] Run tests against real MongoDB Atlas test database
- [x] Verify all tests pass
- [x] Check test execution time (target: < 10 seconds total)
- [x] Verify data cleanup works properly
- [x] Add any missing error handling

**Success Criteria:**
- [x] All 9 tests pass (5 core + 4 additional)
- [x] Tests complete in 5.2 seconds (well under 10 second target)
- [x] No test data left in database after runs
- [x] Clear, actionable error messages

### Phase 4: CI/CD Integration & Documentation (20 mins)
- [x] Add integration test script to `package.json` (already present)
- [x] Create `tests/integration/README.md` with comprehensive documentation
- [x] Update main `README.md` with testing section
- [x] Document how to run tests locally

**Success Criteria:**
- [x] Test scripts available in package.json
- [x] Integration test README with setup and usage instructions
- [x] Main README updated with testing information
- [x] Clear documentation for running tests locally

---

## Acceptance Criteria

### Functional Requirements
- [ ] Integration tests connect to real MongoDB Atlas test database
- [ ] Happy path test: Valid user is created and persisted
- [ ] Validation test: Empty firstName is rejected
- [ ] Validation test: Invalid email is rejected
- [ ] Duplicate prevention test: Same email is rejected
- [ ] Error handling test: Database errors are caught gracefully
- [ ] Test data is cleaned up after each test
- [ ] No test data pollution between test runs

### Non-Functional Requirements
- [ ] Tests complete in < 10 seconds total
- [ ] Clear, actionable error messages on failure
- [ ] Proper setup and teardown (no hanging connections)
- [ ] Works with existing Jest configuration
- [ ] No modifications to production code needed

### Quality Gates
- [ ] All 5 tests pass consistently
- [ ] 100% test data cleanup verification
- [ ] No database connection leaks
- [ ] Code follows project conventions
- [ ] Tests are readable and maintainable

---

## Success Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| Test Pass Rate | 100% | All 5 tests pass |
| Execution Time | < 10 seconds | `npm run test:integration` |
| Data Cleanup | 100% | No test data in DB after runs |
| Code Coverage | Happy path + errors | All scenarios covered |
| Error Messages | Clear & actionable | Failures are debuggable |

---

## Dependencies & Prerequisites

### Required
- MongoDB Atlas test project (separate from production)
- `MONGO_URI_TEST` environment variable configured
- Jest already configured (no changes needed)
- Node.js 18+ (already in use)

### Optional
- GitHub Actions for CI/CD
- Test reporting tools
- Database monitoring

### Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Test DB credentials exposed | Security breach | Use `.env.test` (not committed), rotate credentials regularly |
| Slow database operations | Tests timeout | Use 5-second timeout, optimize queries |
| Test data pollution | Flaky tests | Clean up after each test, use unique identifiers |
| Connection leaks | Resource exhaustion | Proper disconnect in afterAll hook |

---

## Alternative Approaches Considered

### Approach 1: Jest + Real MongoDB Atlas ✅ **CHOSEN**
- **Pros:** Production-like testing, catches real issues, existing infrastructure
- **Cons:** Requires network access, slightly slower
- **Best for:** Comprehensive integration testing

### Approach 2: Jest + MongoDB Memory Server
- **Pros:** Fast, isolated, no external dependencies
- **Cons:** Doesn't test actual MongoDB behavior
- **Best for:** Quick feedback loops, CI/CD speed

### Approach 3: Jest + Supertest (API Testing)
- **Pros:** Tests server layer thoroughly
- **Cons:** Doesn't test React component behavior
- **Best for:** API-focused projects

**Why Approach 1 was chosen:**
- You already have MongoDB Atlas set up
- Tests the complete real-world flow
- Catches actual database issues
- Jest is already configured

---

## Future Considerations

### Short Term (Next Sprint)
- Add component tests for AddNewUser component
- Test other server actions (editUserAction, deleteUserAction)
- Add integration tests for edit and delete operations

### Medium Term (Next Quarter)
- Set up test database monitoring
- Add performance benchmarks
- Create test data seeding utilities
- Implement test reporting dashboard

### Long Term (Next Year)
- Add E2E tests with Playwright
- Achieve 80%+ code coverage
- Implement visual regression testing
- Add load testing for database operations

---

## Documentation Plan

### Files to Create
- `tests/integration/README.md` - How to run integration tests
- `docs/testing/integration-testing-guide.md` - Best practices for integration tests

### Files to Update
- `package.json` - Add `test:integration` script
- `README.md` - Add testing section with integration test info

### Documentation Content
- How to configure `MONGO_URI_TEST`
- How to run tests locally
- How to debug failing tests
- How to add new integration tests

---

## References & Research

### Internal References
- **Server Actions:** `src/actions/index.js:9` - `addNewUserAction` implementation
- **Database Connection:** `src/database/index.js:3` - `connectToDB` function
- **User Model:** `src/models/user.js:2` - User schema definition
- **Jest Config:** `jest.config.js:1` - Jest configuration
- **Test Setup:** `jest.setup.js:1` - Jest setup file
- **Environment:** `.env.test` - Test database configuration

### External References
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [MongoDB Testing Best Practices](https://docs.mongodb.com/manual/core/databases-and-collections/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Mongoose Testing Patterns](https://mongoosejs.com/docs/api/model.html)

### Related Work
- Brainstorm: `docs/brainstorms/2026-02-24-integration-test-add-user-brainstorm.md`
- Existing unit tests: `tests/` directory
- Project conventions: `CLAUDE.md`

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review brainstorm document
- [ ] Verify MongoDB Atlas test project is set up
- [ ] Confirm `MONGO_URI_TEST` is available
- [ ] Review existing test patterns

### Implementation
- [ ] Phase 1: Setup & Infrastructure
- [ ] Phase 2: Test Implementation
- [ ] Phase 3: Validation & Refinement
- [ ] Phase 4: CI/CD Integration

### Post-Implementation
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] CI/CD pipeline configured
- [ ] Team trained on running tests

---

## Notes

- **Test Database:** Use separate MongoDB Atlas project for maximum isolation
- **Collection Prefix:** Use `test_` prefix (e.g., `test_users`) for easy identification
- **Cleanup:** Delete test data after each test to prevent pollution
- **Timeout:** 5 seconds for database operations (fast feedback)
- **CI/CD:** Run on every commit to catch issues immediately
- **No Production Code Changes:** Integration tests don't require changes to production code

---

## Next Steps

1. ✅ **Brainstorm Complete** - Decisions made and documented
2. 📋 **Plan Complete** - Implementation strategy defined
3. 🚀 **Ready for Implementation** - Run `/workflows:work` to start coding
4. 🧪 **Testing** - Validate against real database
5. 📦 **Deployment** - Integrate into CI/CD pipeline
