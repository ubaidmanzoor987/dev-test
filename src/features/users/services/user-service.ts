import { db } from "@/lib/db";
import { type User } from "@prisma/client";

/**
 * Service for interacting with application users
 */
export const userService = {
  /**
   * Fetches application user by ID
   * @param userId ID to fetch
   * @returns {User | null} User object if found, null otherwise
   */
  fetchUserById: async (userId: string): Promise<User | null> => {
    return db.user.findUnique({
      where: { id: userId },
    });
  },

  /**
   * Checks if a user exists in the application
   * @param userId Id to check
   * @returns {boolean} True if user exists, false otherwise
   */
  userExists: async (userId: string): Promise<boolean> => {
    return db.user
      .findUnique({
        where: { id: userId },
        select: { id: true },
      })
      .then((user) => user !== null);
  },
};
