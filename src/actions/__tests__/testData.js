// Mock user data for testing
export const validUserData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  address: '123 Main St',
}

// Mock created user with MongoDB _id
export const mockCreatedUser = {
  _id: '507f1f77bcf86cd799439011',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  address: '123 Main St',
}

// Invalid user data for validation tests
export const invalidUserData = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
}
