// Mock the database connection
jest.mock('@/database', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}))

// Mock the User model with proper jest.fn() methods
jest.mock('@/models/user', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}))

// Mock Next.js cache functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

import { addNewUserAction } from '../index'
import User from '@/models/user'
import { revalidatePath } from 'next/cache'
import { validUserData, mockCreatedUser } from './testData'

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
