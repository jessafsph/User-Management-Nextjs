# Testing Quick Reference Guide

**Quick lookup for testing patterns, commands, and solutions.**

---

## 🚀 Quick Start

### Run Tests
```bash
npm test                    # Run all unit tests
npm run test:watch         # Watch mode (re-run on file changes)
npm run test:coverage      # Generate coverage report
```

### Add a New Test
1. Create file: `src/actions/__tests__/index.test.js`
2. Import setup: `import './setup'`
3. Import action: `import { addNewUserAction } from '../index'`
4. Write test using pattern below

---

## 📝 Test Template

```javascript
import { addNewUserAction } from '../index'
import User from '@/models/user'
import { revalidatePath } from 'next/cache'
import { validUserData, mockCreatedUser } from './testData'
import './setup'

describe('addNewUserAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully add a user', async () => {
    // Arrange
    User.create.mockResolvedValue(mockCreatedUser)

    // Act
    const result = await addNewUserAction(validUserData, '/')

    // Assert
    expect(User.create).toHaveBeenCalledWith(validUserData)
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(result.success).toBe(true)
  })

  it('should handle errors gracefully', async () => {
    // Arrange
    User.create.mockRejectedValue(new Error('DB Error'))

    // Act
    const result = await addNewUserAction(validUserData, '/')

    // Assert
    expect(result.success).toBe(false)
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
```

---

## 🔧 Common Patterns

### Mock a Function
```javascript
jest.mock('@/models/user', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}))
```

### Mock Success Response
```javascript
User.create.mockResolvedValue({ _id: '123', firstName: 'John' })
```

### Mock Error Response
```javascript
User.create.mockRejectedValue(new Error('Database error'))
```

### Verify Function Was Called
```javascript
expect(User.create).toHaveBeenCalledWith(validUserData)
expect(revalidatePath).toHaveBeenCalledWith('/')
```

### Verify Function Was NOT Called
```javascript
expect(revalidatePath).not.toHaveBeenCalled()
```

### Clear Mocks Between Tests
```javascript
beforeEach(() => {
  jest.clearAllMocks()
})
```

---

## ⚠️ Common Gotchas & Solutions

| Problem | Solution |
|---------|----------|
| "Cannot find module '@/...'" | Check `moduleNameMapper` in `jest.config.js` |
| "User.create is not a function" | Mock BEFORE importing the action |
| Test hangs/times out | Ensure mocks return Promises (use `mockResolvedValue`) |
| Mock state leaks between tests | Call `jest.clearAllMocks()` in `beforeEach()` |
| "revalidatePath is not a function" | Ensure `next/cache` is mocked in `setup.js` |
| Test doesn't await async function | Use `async/await` in test: `const result = await action()` |

---

## 📂 File Structure

```
src/actions/
├── index.js                          (Server actions)
└── __tests__/
    ├── index.test.js                 (Tests)
    ├── testData.js                   (Mock data)
    └── setup.js                      (Mock configuration)

jest.config.js                         (Jest configuration)
jest.setup.js                          (Jest setup)
```

---

## 🧪 Test Organization

### Describe Blocks (Group Related Tests)
```javascript
describe('addNewUserAction', () => {
  describe('Happy Path', () => {
    it('should add user', async () => { /* ... */ })
  })

  describe('Error Handling', () => {
    it('should handle errors', async () => { /* ... */ })
  })

  describe('Cache Revalidation', () => {
    it('should revalidate path', async () => { /* ... */ })
  })
})
```

### Test Naming Convention
```javascript
// ✅ GOOD - Describes what should happen
it('should successfully add a valid user')
it('should handle database connection errors')
it('should revalidate the correct path')

// ❌ BAD - Too vague
it('works')
it('test 1')
it('addNewUserAction')
```

---

## 🎯 Assertion Patterns

### Test Success Response
```javascript
expect(result).toEqual({
  success: true,
  message: 'User added successfully',
})
```

### Test Error Response
```javascript
expect(result).toEqual({
  success: false,
  message: 'Some error occured! Please try again',
})
```

### Test Function Calls
```javascript
expect(User.create).toHaveBeenCalledWith(validUserData)
expect(User.create).toHaveBeenCalledTimes(1)
expect(revalidatePath).toHaveBeenCalledWith('/')
```

### Test Function NOT Called
```javascript
expect(revalidatePath).not.toHaveBeenCalled()
```

---

## 🔍 Debugging Tests

### Run Single Test
```bash
npm test -- --testNamePattern="should add user"
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

### Generate Coverage Report
```bash
npm run test:coverage
```

---

## 📊 Test Data

### Valid User Data
```javascript
{
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  address: '123 Main St',
}
```

### Mock Created User
```javascript
{
  _id: '507f1f77bcf86cd799439011',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  address: '123 Main St',
}
```

---

## 🚦 Test Checklist

Before committing tests:

- [ ] All tests pass: `npm test`
- [ ] Tests run in < 5 seconds
- [ ] No console errors or warnings
- [ ] Mocks are properly configured
- [ ] Test names are descriptive
- [ ] Tests verify behavior, not implementation
- [ ] Error cases are tested
- [ ] Mock state is cleared between tests
- [ ] Path aliases work (`@/`)
- [ ] Tests are isolated (no dependencies between tests)

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing/jest)
- [Jest Mocking Guide](https://jestjs.io/docs/manual-mocks)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🤝 Contributing Tests

When adding new tests:

1. **Follow the template** above
2. **Use descriptive names** for test cases
3. **Group related tests** with `describe` blocks
4. **Clear mocks** in `beforeEach()`
5. **Test behavior**, not implementation
6. **Test error cases** as well as happy path
7. **Keep tests fast** (< 100ms per test)
8. **Keep tests isolated** (no dependencies between tests)

---

## 🆘 Need Help?

See `TESTING_PATTERNS_AND_LEARNINGS.md` for:
- Detailed explanations of patterns
- Gotchas and solutions
- Architecture decisions
- Future testing roadmap
