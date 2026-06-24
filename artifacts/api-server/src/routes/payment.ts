import { Router } from "express";

const router = Router();

const MPESA_BASE =
  process.env["MPESA_ENV"] === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

async function getMpesaToken(): Promise<string> {
  const consumerKey = process.env["MPESA_CONSUMER_KEY"];
  const consumerSecret = process.env["MPESA_CONSUMER_SECRET"];
  if (!consumerKey || !consumerSecret) throw new Error("M-Pesa credentials not configured");
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const res = await fetch(`${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`M-Pesa OAuth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

router.post("/payments/mpesa/stkpush", async (req, res) => {
  const { phone, amount, description } = req.body as {
    phone: string;
    amount: number;
    description: string;
  };

  if (!process.env["MPESA_CONSUMER_KEY"]) {
    await new Promise((r) => setTimeout(r, 1800));
    res.json({
      success: true,
      demo: true,
      checkoutRequestId: `demo_${Date.now()}`,
      customerMessage: "Demo mode: payment simulated. No real charge made.",
    });
    return;
  }

  try {
    const token = await getMpesaToken();
    const shortcode = process.env["MPESA_SHORTCODE"]!;
    const passkey = process.env["MPESA_PASSKEY"]!;
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
    const callbackUrl = `https://${process.env["REPLIT_DEV_DOMAIN"]}/api/payments/mpesa/callback`;
    const normalizedPhone = phone.replace(/^0/, "254").replace(/\s/g, "");

    const stkRes = await fetch(`${MPESA_BASE}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.ceil(amount),
        PartyA: normalizedPhone,
        PartyB: shortcode,
        PhoneNumber: normalizedPhone,
        CallBackURL: callbackUrl,
        AccountReference: "NairobiSpaHub",
        TransactionDesc: description,
      }),
    });

    const data = (await stkRes.json()) as {
      CheckoutRequestID: string;
      CustomerMessage: string;
      ResponseCode: string;
      ResponseDescription: string;
    };

    if (data.ResponseCode !== "0") {
      res.status(400).json({ success: false, error: data.ResponseDescription });
      return;
    }

    res.json({
      success: true,
      checkoutRequestId: data.CheckoutRequestID,
      customerMessage: data.CustomerMessage,
    });
  } catch (err) {
    req.log.error({ err }, "M-Pesa STK push failed");
    res.status(500).json({ success: false, error: "Payment initiation failed. Please try again." });
  }
});

router.post("/payments/mpesa/callback", (req, res) => {
  req.log.info({ body: req.body }, "M-Pesa callback received");
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

router.post("/payments/card/charge", async (req, res) => {
  const { amount, description } = req.body as {
    amount: number;
    description: string;
  };

  if (!process.env["STRIPE_SECRET_KEY"]) {
    await new Promise((r) => setTimeout(r, 2200));
    res.json({
      success: true,
      demo: true,
      transactionId: `demo_card_${Date.now()}`,
      message: "Demo mode: card payment simulated. No real charge made.",
    });
    return;
  }

  try {
    const stripeKey = process.env["STRIPE_SECRET_KEY"]!;
    const body = new URLSearchParams({
      amount: String(Math.ceil(amount * 100)),
      currency: "kes",
      description,
      "payment_method_types[]": "card",
    });

    const piRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const pi = (await piRes.json()) as {
      id: string;
      client_secret: string;
      error?: { message: string };
    };

    if (!piRes.ok) {
      res.status(400).json({ success: false, error: pi.error?.message ?? "Card payment failed" });
      return;
    }

    res.json({
      success: true,
      transactionId: pi.id,
      clientSecret: pi.client_secret,
    });
  } catch (err) {
    req.log.error({ err }, "Card charge failed");
    res.status(500).json({ success: false, error: "Card payment failed. Please try again." });
  }
});

export default router;
