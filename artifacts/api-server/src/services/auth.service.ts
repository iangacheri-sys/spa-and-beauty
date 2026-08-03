import { userRepository } from '../repositories/user.repository';
import { Role } from '@prisma/client';
import { prisma } from '../database/prisma';
import crypto from 'crypto';
import { passwordService } from './password.service';
import { otpService } from './otp.service';
import { sessionService } from './session.service';
import { tokenService } from './token.service';

export class AuthService {
  /**
   * Register a standard user
   */
  async register(data: { name: string; phone: string; password?: string; email?: string; role?: Role; spaId?: string; referralCode?: string }) {
    const existing = await userRepository.findByPhone(data.phone);
    if (existing) {
      throw new Error('Phone number already registered');
    }

    let referredById: string | undefined = undefined;
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: data.referralCode } });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    const newReferralCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const hashedPassword = data.password ? await passwordService.hash(data.password) : await passwordService.hash('defaultpass');

    // Create user in PENDING_VERIFICATION state (production flow)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'CUSTOMER',
        referralCode: newReferralCode,
        referredById: referredById,
        accountStatus: 'PENDING_VERIFICATION',
        isDemo: false,
      }
    });

    // Send OTP
    await otpService.sendOtp(user.phone);

    return { user, message: 'OTP sent. Please verify to continue.' };
  }

  /**
   * Register a Spa Partner
   */
  async registerSpaPartner(data: { 
    name: string; phone: string; password?: string; email?: string;
    spaName: string; address: string; county?: string;
  }) {
    const existing = await userRepository.findByPhone(data.phone);
    if (existing) {
      throw new Error('Phone number already registered');
    }

    const hashedPassword = data.password ? await passwordService.hash(data.password) : await passwordService.hash('defaultpass');

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          password: hashedPassword,
          role: 'SPA_OWNER',
          accountStatus: 'PENDING_VERIFICATION',
          isDemo: false,
        }
      });

      const spa = await tx.spa.create({
        data: {
          name: data.spaName,
          address: data.address,
          county: data.county,
          phone: data.phone,
          email: data.email,
          ownerId: user.id,
          approvalStatus: 'PENDING',
          isActive: true,
          verified: false,
        }
      });

      await tx.spaPolicy.create({
        data: {
          spaId: spa.id,
          depositType: 'none',
          depositPercent: 0,
          depositFixed: 0,
          depositMinBookingValue: 0,
          depositAppliesTo: 'all',
          freeCancellationHours: 24,
          lateCancelRetainPercent: 100,
          refundPolicy: 'full',
          rescheduleAllowed: true,
          rescheduleLimitHours: 12,
          noShowRetainPercent: 100,
        }
      });

      return { user, spa };
    });

    await otpService.sendOtp(result.user.phone);

    return { user: result.user, spa: result.spa, message: 'OTP sent. Please verify to continue.' };
  }

  /**
   * Dual Authentication Login (Demo vs Production)
   */
  async login(phone: string, password?: string, deviceInfo?: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ 
      where: { phone },
      include: { ownedSpas: true, staffSpas: true }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 1. Require password for all non-demo production users (fix: auth bypass)
    if (!user.isDemo && !password) {
      throw new Error('Invalid credentials');
    }

    // 2. Check if user is locked out
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new Error('Account temporarily locked due to multiple failed login attempts');
    }

    // 2a. Lockout window expired but counter was never cleared — reset it now
    //     (fix: after first lockout cycle, threshold dropped to 1 attempt)
    if (!user.isDemo && user.lockUntil && user.lockUntil <= new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockUntil: null }
      });
      user.failedLoginAttempts = 0;
      (user as any).lockUntil = null;
    }

    // 3. Verify Password (demo accounts: soft check, no lockout)
    if (password) {
      const isValid = await passwordService.verify(user.password, password);
      if (!isValid) {
        // Increment failed attempts for production users only
        if (!user.isDemo) {
          const attempts = user.failedLoginAttempts + 1;
          const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: attempts, lockUntil }
          });
        }
        throw new Error('Invalid credentials');
      }
    }

    // Reset failed attempts on successful password check (production only)
    if (!user.isDemo && user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockUntil: null }
      });
    }

    // 4. Demo vs Production Flow
    if (user.isDemo) {
      // Demo Flow: Bypass OTP, instant login, no restrictions
      return this.executeLoginSession(user, deviceInfo, ipAddress);
    } else {
      // Production Flow: Require OTP if not already verified
      if (user.accountStatus === 'PENDING_VERIFICATION') {
        await otpService.sendOtp(user.phone);
        return { requiresOtp: true, message: 'OTP sent. Please verify to login.' };
      }

      // If fully active, login
      if (user.accountStatus === 'ACTIVE') {
        return this.executeLoginSession(user, deviceInfo, ipAddress);
      } else {
        throw new Error(`Account status is ${user.accountStatus}`);
      }
    }
  }

  /**
   * Verify OTP and finalize login/registration
   */
  async verifyOtpAndLogin(phone: string, code: string, deviceInfo?: string, ipAddress?: string) {
    const isValid = await otpService.verifyOtp(phone, code);
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await prisma.user.findUnique({ 
      where: { phone },
      include: { ownedSpas: true, staffSpas: true }
    });

    if (!user) throw new Error('User not found');

    // Activate account if pending
    if (user.accountStatus === 'PENDING_VERIFICATION') {
      await prisma.user.update({
        where: { id: user.id },
        data: { accountStatus: 'ACTIVE', phoneVerified: true }
      });
      user.accountStatus = 'ACTIVE';
    }

    return this.executeLoginSession(user, deviceInfo, ipAddress);
  }

  /**
   * Generates tokens and creates a session for an authenticated user
   */
  private async executeLoginSession(user: any, deviceInfo?: string, ipAddress?: string) {
    let spaId;
    let spaSetupComplete = false;
    if (user.role === 'SPA_OWNER' && user.ownedSpas?.length > 0) {
      spaId = user.ownedSpas[0].id;
      spaSetupComplete = user.ownedSpas[0].setupComplete ?? false;
    } else if (user.staffSpas?.length > 0) {
      spaId = user.staffSpas[0].spaId;
      spaSetupComplete = true;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Create session in DB
    const session = await sessionService.createSession(user.id, deviceInfo, ipAddress);

    // Generate strict short-lived JWT access token
    const accessToken = tokenService.generateAccessToken({
      id: user.id,
      role: user.role,
      spaId,
      tokenVersion: user.tokenVersion,
      isDemo: user.isDemo,
    });

    // Explicit allowlist — internal security fields (failedLoginAttempts, lockUntil,
    // tokenVersion, authProvider, password) are never sent to clients.
    const safeUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      isDemo: user.isDemo,
      accountStatus: user.accountStatus,
      phoneVerified: user.phoneVerified,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
      spaId,
      spaSetupComplete,
      ownedSpas: user.ownedSpas,
      staffSpas: user.staffSpas,
    };

    return { 
      user: safeUser, 
      accessToken, 
      refreshToken: session.refreshToken 
    };
  }

  /**
   * Refresh the access token using a valid session
   */
  async refresh(refreshToken: string) {
    const session = await sessionService.getValidSession(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { ownedSpas: true, staffSpas: true }
    });

    if (!user) throw new Error('User not found');

    let spaId;
    if (user.role === 'SPA_OWNER' && user.ownedSpas?.length > 0) {
      spaId = user.ownedSpas[0].id;
    } else if (user.staffSpas?.length > 0) {
      spaId = user.staffSpas[0].spaId;
    }

    const accessToken = tokenService.generateAccessToken({
      id: user.id,
      role: user.role,
      spaId,
      tokenVersion: user.tokenVersion,
      isDemo: user.isDemo,
    });

    return { accessToken, refreshToken: session.refreshToken };
  }
}

export const authService = new AuthService();
