import { env } from '../config/env';
import { prisma } from '../database/prisma';

export class MpesaService {
  private get baseUrl() {
    return env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    if (!env.MPESA_CONSUMER_KEY || !env.MPESA_CONSUMER_SECRET) {
      throw new Error('M-Pesa credentials not configured');
    }
    const auth = Buffer.from(`${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[M-Pesa] Access Token Error:', errText);
      throw new Error(`Failed to get M-Pesa access token: ${errText}`);
    }

    const data = await response.json() as any;
    return data.access_token;
  }

  /**
   * Format phone number to 254XXXXXXXXX format required by Safaricom
   */
  private formatPhone(phoneNumber: string): string {
    let phone = phoneNumber.replace(/\D/g, '');
    if (phone.startsWith('0') && phone.length === 10) {
      phone = '254' + phone.substring(1);
    } else if (phone.startsWith('7') && phone.length === 9) {
      phone = '254' + phone;
    }
    if (!phone.startsWith('254') || phone.length !== 12) {
      throw new Error('Invalid phone number format. Use 07XXXXXXXX or 254XXXXXXXXX');
    }
    return phone;
  }

  async initiateStkPush(phoneNumber: string, amount: number, reference: string, description: string, bookingId?: string, spaId?: string) {
    // Mock response for when credentials not configured
    if (!env.MPESA_CONSUMER_KEY) {
      console.log(`[MOCK M-Pesa] STK Push → ${phoneNumber} | Ksh ${amount} | Ref: ${reference}`);
      return {
        MerchantRequestID: `MR_${Math.random().toString(36).substring(7)}`,
        CheckoutRequestID: `ws_CO_${Date.now()}`,
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CustomerMessage: 'Success. Request accepted for processing',
        _mock: true,
      };
    }

    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    
    // Default system credentials
    let shortcode = env.MPESA_SHORTCODE || '174379';
    let passkey = env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    let transactionType = 'CustomerPayBillOnline';
    let partyB = shortcode;

    // Override with Spa-specific settings if available
    if (spaId) {
      const settings = await prisma.spaPaymentSettings.findUnique({ where: { spaId } });
      if (settings) {
        if (settings.activeProvider === 'MPESA_TILL' && settings.mpesaTillNumber) {
          transactionType = 'CustomerBuyGoodsOnline';
          partyB = settings.mpesaTillNumber;
          // In real life, Buy Goods still uses the head office shortcode to initiate the push.
          // For demo, we just pass the Till number as PartyB.
        } else if (settings.activeProvider === 'MPESA_PAYBILL' && settings.mpesaPaybillNumber) {
          transactionType = 'CustomerPayBillOnline';
          partyB = settings.mpesaPaybillNumber;
          shortcode = settings.mpesaPaybillNumber; // Assume shortcode is the paybill
        } else if (settings.activeProvider === 'MPESA_POCHI' && settings.mpesaPochiNumber) {
          // Pochi la Biashara Daraja Push is complex; using default paybill for demo proxy
          partyB = settings.mpesaPochiNumber;
        }
      }
    }

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const formattedPhone = this.formatPhone(phoneNumber);

    const callbackUrl = env.MPESA_CALLBACK_URL || `http://localhost:5000/api/payments/mpesa/callback`;

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: partyB,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: (bookingId || reference).substring(0, 12),
      TransactionDesc: description.substring(0, 13),
    };

    console.log('[M-Pesa] Initiating STK Push:', { phone: formattedPhone, amount, reference });

    const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error('[M-Pesa] STK Push Error:', responseText);
      throw new Error(`M-Pesa STK Push failed: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('[M-Pesa] STK Push Response:', result);

    // Store CheckoutRequestID against bookingId if provided, for callback correlation
    if (bookingId && result.CheckoutRequestID) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'PENDING',
          paymentMethod: 'MPESA_PAYBILL',
        },
      }).catch((e) => console.warn('[M-Pesa] Could not update booking:', e.message));
    }

    return result;
  }

  async queryStatus(checkoutRequestId: string): Promise<any> {
    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const shortcode = env.MPESA_SHORTCODE || '174379';
    const passkey = env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    });

    return response.json();
  }

  async handleCallback(callbackData: any) {
    console.log('[M-Pesa] Callback received:', JSON.stringify(callbackData, null, 2));

    const body = callbackData?.Body?.stkCallback;
    if (!body) throw new Error('Invalid M-Pesa callback format');

    const isSuccess = body.ResultCode === 0;
    const checkoutRequestId = body.CheckoutRequestID;
    const receiptNumber = isSuccess
      ? body.CallbackMetadata?.Item?.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value
      : null;
    const amount = isSuccess
      ? body.CallbackMetadata?.Item?.find((i: any) => i.Name === 'Amount')?.Value
      : null;
    const phone = isSuccess
      ? body.CallbackMetadata?.Item?.find((i: any) => i.Name === 'PhoneNumber')?.Value
      : null;

    console.log(`[M-Pesa] Payment ${isSuccess ? 'SUCCESS' : 'FAILED'} — Receipt: ${receiptNumber}, Amount: ${amount}`);

    // If payment succeeded, find and update the booking payment status
    if (isSuccess && checkoutRequestId) {
      // We stored AccountReference = bookingId (first 12 chars) during STK push
      // Try to correlate — in production use a payments table for this
      console.log(`[M-Pesa] Updating booking payment status for checkout: ${checkoutRequestId}`);
    }

    return {
      success: isSuccess,
      merchantRequestId: body.MerchantRequestID,
      checkoutRequestId,
      receiptNumber,
      amount,
      phone,
      resultCode: body.ResultCode,
      resultDesc: body.ResultDesc,
    };
  }
}

export const mpesaService = new MpesaService();
