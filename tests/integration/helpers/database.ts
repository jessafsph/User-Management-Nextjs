import User from '@/models/user';

/**
 * Retrieve a user from the database by email
 * @param email - The email to search for
 * @returns The user document or null if not found
 */
export async function getUserByEmail(email: string) {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.error(`Error retrieving user by email ${email}:`, error);
    throw error;
  }
}

/**
 * Count total number of users in the database
 * @returns The count of user documents
 */
export async function countUsers() {
  try {
    return await User.countDocuments({});
  } catch (error) {
    console.error('Error counting users:', error);
    throw error;
  }
}

/**
 * Count users with a specific email
 * @param email - The email to search for
 * @returns The count of users with that email
 */
export async function getUserCountByEmail(email: string) {
  try {
    return await User.countDocuments({ email });
  } catch (error) {
    console.error(`Error counting users with email ${email}:`, error);
    throw error;
  }
}

/**
 * Retrieve all users from the database
 * @returns Array of all user documents
 */
export async function getAllUsers() {
  try {
    return await User.find({});
  } catch (error) {
    console.error('Error retrieving all users:', error);
    throw error;
  }
}

/**
 * Delete a user by email
 * @param email - The email of the user to delete
 * @returns The deleted user document or null if not found
 */
export async function deleteUserByEmail(email: string) {
  try {
    return await User.findOneAndDelete({ email });
  } catch (error) {
    console.error(`Error deleting user with email ${email}:`, error);
    throw error;
  }
}
