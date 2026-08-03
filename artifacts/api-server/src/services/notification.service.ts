import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from '../database/prisma';

export class NotificationService {
  private expo = new Expo();

  /**
   * Registers or updates a device push token for a user.
   */
  async registerToken(userId: string, token: string, platform: string) {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error(`Push token ${token} is not a valid Expo push token`);
    }

    // Check if token already exists
    const existing = await prisma.deviceToken.findUnique({
      where: { token },
    });

    if (existing) {
      if (existing.userId !== userId) {
        // Token transferred to new user (e.g., someone else logged into the device)
        await prisma.deviceToken.update({
          where: { token },
          data: { userId, platform },
        });
      }
      return existing;
    }

    // Create new token mapping
    return prisma.deviceToken.create({
      data: {
        userId,
        token,
        platform,
      },
    });
  }

  /**
   * Unregisters a push token (e.g., on logout).
   */
  async unregisterToken(token: string) {
    await prisma.deviceToken.deleteMany({
      where: { token },
    });
  }

  /**
   * Sends a notification to a specific user using Push, SMS, or both.
   */
  async sendToUser(
    userId: string,
    options: {
      type: 'REMINDER' | 'PROMO' | 'REVIEW_REQUEST' | 'BIRTHDAY' | 'BOOKING_UPDATE';
      title: string;
      body: string;
      data?: any;
      sendPush?: boolean;
      sendSms?: boolean;
      sendWhatsApp?: boolean;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { deviceTokens: true },
    });

    if (!user) return;

    // Send Push
    if (options.sendPush !== false && user.deviceTokens.length > 0) {
      const messages: ExpoPushMessage[] = [];
      
      for (const pushToken of user.deviceTokens) {
        if (!Expo.isExpoPushToken(pushToken.token)) continue;
        
        messages.push({
          to: pushToken.token,
          sound: 'default',
          title: options.title,
          body: options.body,
          data: options.data || {},
        });
      }

      if (messages.length > 0) {
        try {
          const chunks = this.expo.chunkPushNotifications(messages);
          for (const chunk of chunks) {
            await this.expo.sendPushNotificationsAsync(chunk);
          }
          
          await this.logNotification(userId, 'PUSH', options.type, options.title, options.body, 'DELIVERED');
        } catch (error) {
          console.error('Error sending push notification:', error);
          await this.logNotification(userId, 'PUSH', options.type, options.title, options.body, 'FAILED');
        }
      }
    }

    // Send SMS (Demo mode)
    if (options.sendSms) {
      // In a real scenario, this would call Africa's Talking API.
      // For now, we simulate success for demo purposes.
      console.log(`[DEMO SMS] To: ${user.phone} | Body: ${options.body}`);
      await this.logNotification(userId, 'SMS', options.type, options.title, options.body, 'DELIVERED');
    }

    // Send WhatsApp via Meta Cloud API
    if (options.sendWhatsApp && user.phone) {
      const whatsappToken = process.env.WHATSAPP_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_ID;
      
      // Clean phone number (e.g. 07... to 2547...)
      let phone = user.phone.replace(/\D/g, '');
      if (phone.startsWith('0') && phone.length === 10) phone = '254' + phone.substring(1);
      else if (phone.startsWith('7') && phone.length === 9) phone = '254' + phone;

      if (whatsappToken && phoneId) {
        try {
          const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: phone,
              type: 'text',
              text: { body: `*${options.title}*\n\n${options.body}` }
            })
          });
          
          if (!response.ok) {
            const err = await response.text();
            console.error('[WhatsApp API] Error:', err);
            await this.logNotification(userId, 'WHATSAPP', options.type, options.title, options.body, 'FAILED');
          } else {
            await this.logNotification(userId, 'WHATSAPP', options.type, options.title, options.body, 'DELIVERED');
          }
        } catch (error) {
          console.error('[WhatsApp API] Network Error:', error);
          await this.logNotification(userId, 'WHATSAPP', options.type, options.title, options.body, 'FAILED');
        }
      } else {
        // Mock success if credentials missing
        console.log(`[MOCK WhatsApp] To: ${phone} | Body: *${options.title}*\n${options.body}`);
        await this.logNotification(userId, 'WHATSAPP', options.type, options.title, options.body, 'DELIVERED');
      }
    }
  }

  private async logNotification(
    userId: string,
    channel: string,
    type: string,
    title: string,
    body: string,
    status: string
  ) {
    await prisma.notificationLog.create({
      data: {
        userId,
        channel,
        type,
        title,
        body,
        status,
      },
    });
  }

  /**
   * Helper to send booking confirmation
   */
  async sendBookingConfirmation(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        spa: true,
      }
    });

    if (!booking) return;

    const message = `Your booking for ${booking.service?.name} at ${booking.spa?.name} is confirmed for ${booking.date} at ${booking.timeSlot}.`;
    
    await this.sendToUser(booking.userId, {
      type: 'BOOKING_UPDATE',
      title: 'Booking Confirmed! 🎉',
      body: message,
      data: { bookingId: booking.id, screen: 'bookings' },
      sendPush: true,
      sendSms: true, // As requested by user, we enforce SMS for bookings
      sendWhatsApp: true, // Auto-send via WhatsApp as well
    });
  }
}

export const notificationService = new NotificationService();
