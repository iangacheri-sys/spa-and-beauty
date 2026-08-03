import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sessionService } from '../services/session.service';
import { otpService } from '../services/otp.service';

export class AuthController {
  private getDeviceInfo(req: Request) {
    return req.headers['user-agent'] || 'Unknown Device';
  }

  private getIpAddress(req: Request) {
    return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP') as string;
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, password, email, role, spaId, referralCode } = req.body;
      
      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
      }

      const result = await authService.register({ name, phone, password, email, role, spaId, referralCode });
      res.status(201).json(result);
    } catch (err: any) {
      if (err.message === 'Phone number already registered') {
        return res.status(409).json({ error: err.message });
      }
      next(err);
    }
  }

  async registerPartner(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const result = await authService.registerSpaPartner(data);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.message === 'Phone number already registered') {
        return res.status(409).json({ error: err.message });
      }
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, password } = req.body;
      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      
      const deviceInfo = this.getDeviceInfo(req);
      const ipAddress = this.getIpAddress(req);

      const result = await authService.login(phone, password, deviceInfo, ipAddress);
      res.json(result);
    } catch (err: any) {
      if (err.message.includes('locked') || err.message === 'Invalid credentials') {
        return res.status(401).json({ error: err.message });
      }
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ error: 'Phone and code are required' });
      }

      const deviceInfo = this.getDeviceInfo(req);
      const ipAddress = this.getIpAddress(req);

      const result = await authService.verifyOtpAndLogin(phone, code, deviceInfo, ipAddress);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'Invalid or expired OTP') {
        return res.status(401).json({ error: err.message });
      }
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }
      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (err: any) {
      if (err.message.includes('Invalid refresh token') || err.message.includes('revoked') || err.message.includes('expired')) {
        return res.status(401).json({ error: err.message });
      }
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await sessionService.revokeSession(refreshToken);
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      await sessionService.revokeAllUserSessions(userId);
      res.json({ success: true, message: 'Logged out from all devices' });
    } catch (err) {
      next(err);
    }
  }

  async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const sessions = await sessionService.getUserSessions(userId);
      res.json(sessions);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
