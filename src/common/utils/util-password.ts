import * as bcrypt from 'bcrypt';

/**
 * Utility for password encryption.
 * Centralizes all hashing logic to facilitate algorithm changes.
 */
export class UtilPassword {
  private static readonly DEFAULT_SALT_ROUNDS = 12;

  /**
   * Hashes a password with bcrypt.
   * @param password - The plain text password
   * @param saltRounds - Number of rounds for salt (default: 12)
   * @returns The hashed password
   */
  static async hash(password: string, saltRounds?: number): Promise<string> {
    const rounds = saltRounds ?? this.DEFAULT_SALT_ROUNDS;
    return await bcrypt.hash(password, rounds);
  }

  /**
   * Compares a plain text password with a hash.
   * @param password - The plain text password
   * @param hashedPassword - The hashed password
   * @returns true if passwords match
   */
  static async compare(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
