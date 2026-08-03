import * as argon2 from 'argon2';
import bcrypt from 'bcryptjs';

export class PasswordService {
  /**
   * Hashes a password using Argon2id
   */
  async hash(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  /**
   * Verifies a password against a hash.
   * Supports both Argon2 and legacy Bcrypt hashes (starts with $2).
   */
  async verify(hash: string, plaintext: string): Promise<boolean> {
    try {
      if (hash.startsWith('$2')) {
        // Legacy bcrypt hash
        return bcrypt.compare(plaintext, hash);
      }
      
      // Argon2 hash
      return argon2.verify(hash, plaintext);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }
}

export const passwordService = new PasswordService();
