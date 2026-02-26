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
