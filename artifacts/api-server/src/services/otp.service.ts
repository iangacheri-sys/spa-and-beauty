import { prisma } from '../database/prisma';
import crypto from 'crypto';

export class OtpService {
  /**
   * Generates a cryptographically secure random 6-digit OTP.
   * Uses crypto.randomInt (CSPRNG) — NOT Math.random().
   */
  private generateCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Creates an OTP for the given phone number and mocks sending an SMS
   */
  async sendOtp(phone: string): Promise<void> {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing OTPs for this phone
    await prisma.otpCode.updateMany({
      where: { phone, used: false },
      data: { used: true },
    });

    // Create new OTP
    await prisma.otpCode.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    // MOCK: Abstract notification dispatch
    await this.dispatchSms(phone, `Your Beauty-Booker verification code is ${code}. It expires in 10 minutes.`);
  }

  /**
   * Verifies an OTP code for a specific phone number
   */
  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otp = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      return false;
    }

    // Mark as used
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return true;
  }

  /**
   * Mocks an external HTTP call to an SMS provider (e.g. Twilio, Africa's Talking)
   */
  private async dispatchSms(phone: string, message: string): Promise<void> {
    console.log(`\n[SMS MOCK] -> Dispatching to ${phone}:`);
    console.log(`[SMS MOCK] -> "${message}"\n`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const otpService = new OtpService();
