import * as bcrypt from 'bcrypt';

export abstract class UtilHash {
  private static DEFAULT_SALT_ROUNDS = 12;

  static async hash(plainText: string, saltRounds?: number): Promise<string> {
    const rounds = saltRounds ?? this.DEFAULT_SALT_ROUNDS;
    return bcrypt.hash(plainText, rounds);
  }

  static async compare(plainText: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedText);
  }
}
