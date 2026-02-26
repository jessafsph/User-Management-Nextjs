import mongoose from 'mongoose';
import User from '@/models/user';

/**
 * Connect to the test MongoDB Atlas database
 * Uses MONGO_URI_TEST environment variable
 */
export async function connectToTestDB() {
  const mongoUri = process.env.MONGO_URI_TEST;
  if (!mongoUri) {
    throw new Error(
      'MONGO_URI_TEST environment variable is not configured. Please set it in .env.test'
    );
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to test MongoDB Atlas');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
}

/**
 * Disconnect from the test MongoDB Atlas database
 */
export async function disconnectFromTestDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from test MongoDB Atlas');
  } catch (error) {
    console.error('❌ Failed to disconnect from test database:', error);
    throw error;
  }
}

/**
 * Clear all test data from the database
 * Deletes all documents from the User collection
 */
export async function clearTestData() {
  try {
    const result = await User.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} test documents`);
  } catch (error) {
    console.error('❌ Failed to clear test data:', error);
    throw error;
  }
}
