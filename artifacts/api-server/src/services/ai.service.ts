import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../config/env';
import { prisma } from '../database/prisma';

export class AiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }
  }

  // ─── Customer Concierge (Mobile) ────────────────────────────────────────────

  async getConciergeResponse(userId: string, spaId: string, message: string) {
    if (!this.ai) {
      return "AI Concierge is currently unavailable. Please configure the GEMINI_API_KEY.";
    }

    const systemPrompt = await this.buildConciergeSystemPrompt(userId, spaId);

    // Define tools the AI can call
    const tools = [
      {
        functionDeclarations: [
          {
            name: 'checkAvailability',
            description: 'Check available booking time slots for a specific service and date. Call this when the user asks about availability or wants to book.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                serviceId: { type: Type.STRING, description: 'The ID of the service to check availability for' },
                serviceName: { type: Type.STRING, description: 'The human-readable name of the service' },
                date: { type: Type.STRING, description: 'The date to check in YYYY-MM-DD format' },
              },
              required: ['serviceId', 'date'],
            },
          },
          {
            name: 'createBooking',
            description: 'Create a confirmed booking for the customer. Only call this after the customer has confirmed they want to book a specific service, date, time, and therapist.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                serviceId: { type: Type.STRING, description: 'The ID of the service' },
                therapistId: { type: Type.STRING, description: 'The ID of the therapist' },
                date: { type: Type.STRING, description: 'The date in YYYY-MM-DD format' },
                timeSlot: { type: Type.STRING, description: 'The time in HH:MM format' },
                notes: { type: Type.STRING, description: 'Optional customer notes' },
              },
              required: ['serviceId', 'therapistId', 'date', 'timeSlot'],
            },
          },
        ],
      },
    ];

    const contents: any[] = [
      { role: 'user', parts: [{ text: message }] }
    ];

    // Agentic loop: keep calling AI until it gives a final text response
    let iterations = 0;
    while (iterations < 5) {
      iterations++;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
        contents,
        tools,
      });

      const candidate = response.candidates?.[0];
      if (!candidate) break;

      const parts = candidate.content?.parts || [];
      const textParts = parts.filter((p: any) => p.text);
      const funcCalls = parts.filter((p: any) => p.functionCall);

      // If no function calls, return the text response
      if (funcCalls.length === 0) {
        return textParts.map((p: any) => p.text).join('') || "I'm not sure how to help with that.";
      }

      // Add assistant's turn to history
      contents.push({ role: 'model', parts });

      // Execute function calls and add results
      const toolResultParts: any[] = [];
      for (const funcCallPart of funcCalls) {
        const { name, args } = funcCallPart.functionCall;
        let result: any;

        try {
          if (name === 'checkAvailability') {
            result = await this.executeCheckAvailability(spaId, args.serviceId, args.date);
          } else if (name === 'createBooking') {
            result = await this.executeCreateBooking(userId, spaId, args);
          } else {
            result = { error: 'Unknown function' };
          }
        } catch (e: any) {
          result = { error: e.message };
        }

        toolResultParts.push({
          functionResponse: {
            name,
            response: result,
          },
        });
      }

      contents.push({ role: 'user', parts: toolResultParts });
    }

    return "I'm sorry, I ran into an issue processing your request.";
  }

  async getConciergeStream(userId: string, spaId: string, message: string) {
    if (!this.ai) {
      throw new Error("AI Concierge is currently unavailable.");
    }

    // For streaming, we do a single non-agentic call for speed
    const systemPrompt = await this.buildConciergeSystemPrompt(userId, spaId);

    return this.ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      contents: [
        { role: 'user', parts: [{ text: message }] }
      ]
    });
  }

  // ─── Admin Advisor (Dashboard) ──────────────────────────────────────────────

  async getAdminResponse(spaId: string, message: string): Promise<string> {
    if (!this.ai) {
      return "AI Advisor is currently unavailable. Please configure the GEMINI_API_KEY.";
    }

    const [analyticsSnapshot, crmContext] = await Promise.all([
      this.buildAnalyticsSnapshot(spaId),
      this.buildCrmRetentionContext(spaId),
    ]);
    const spa = await prisma.spa.findUnique({ where: { id: spaId }, include: { services: { take: 10 } } });

    const systemPrompt = `
You are "Bea AI", a smart business advisor for spa owners on the Beauty-Booker platform.
You have access to real-time business data for ${spa?.name || 'this spa'}.

## Current Business Snapshot:
${analyticsSnapshot}

## CRM Retention Intelligence:
${crmContext}

## Your Role:
- Answer questions about business performance using the data above
- Suggest actionable improvements (e.g., promote slow services, adjust pricing)
- When asked about "at-risk" or "inactive" clients, use the CRM data above
- Suggest personalized retention campaigns like: "Send Jane Doe a 15% off WhatsApp message, she spent KES 12,000 and hasn't booked in 65 days"
- Be concise, data-driven and professional
- If the data doesn't have what you need, say so honestly

Do NOT make up data or numbers that aren't in the snapshots above.
    `.trim();

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });

    return response.text || "I couldn't generate a response. Please try again.";
  }

  // ─── Marketing Generator ─────────────────────────────────────────────────────

  async generateMarketingCampaign(spaId: string, prompt: string): Promise<{
    title: string;
    caption: string;
    hashtags: string;
    cta: string;
    platforms: string[];
  }> {
    if (!this.ai) {
      throw new Error("AI is currently unavailable. Please configure the GEMINI_API_KEY.");
    }

    const spa = await prisma.spa.findUnique({
      where: { id: spaId },
      include: { services: { take: 10 }, products: { take: 5 } }
    });

    const systemPrompt = `
You are a social media marketing expert for ${spa?.name || 'a spa'}.
Generate a marketing campaign post based on the owner's prompt.

Spa Services: ${spa?.services.map(s => s.name).join(', ') || 'Various beauty treatments'}
Spa Products: ${spa?.products.map(p => p.name).join(', ') || 'Various beauty products'}

Return ONLY valid JSON in this exact format, nothing else:
{
  "title": "Short campaign title",
  "caption": "Engaging social media caption (150-200 chars). Use emojis.",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",
  "cta": "book_now|view_offer|shop_products|register_class",
  "platforms": ["instagram", "facebook", "whatsapp"]
}

Choose the most appropriate CTA from the options. Choose platforms best suited to the campaign type.
    `.trim();

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || '{}';
    // Strip markdown code blocks if present
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  }

  // ─── Tool Execution ──────────────────────────────────────────────────────────

  private async executeCheckAvailability(spaId: string, serviceId: string, date: string) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return { error: 'Service not found' };

    const therapists = await prisma.therapist.findMany({
      where: { spaId, isActive: true }
    });

    const existingBookings = await prisma.booking.findMany({
      where: {
        spaId,
        date,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
      },
      include: { service: true }
    });

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getUTCDay();

    // Fetch schedules and time off
    const schedules = await prisma.therapistSchedule.findMany({
      where: { therapistId: { in: therapists.map(t => t.id) }, dayOfWeek }
    });

    const timeOffList = await prisma.timeOff.findMany({
      where: {
        OR: [{ therapistId: null }, { therapistId: { in: therapists.map(t => t.id) } }],
        startDate: { lte: date },
        endDate: { gte: date },
        spaId
      }
    });

    const timeToMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const availableSlots: { time: string; therapistId: string; therapistName: string }[] = [];

    for (const therapist of therapists) {
      // Is therapist on time off?
      const onTimeOff = timeOffList.some(to => to.therapistId === null || to.therapistId === therapist.id);
      if (onTimeOff) continue;

      // Get schedule
      const schedule = schedules.find(s => s.therapistId === therapist.id);
      if (!schedule || !schedule.isWorking) continue;

      const shiftStartMins = timeToMins(schedule.startTime);
      const shiftEndMins = timeToMins(schedule.endTime);

      const therapistBookings = existingBookings.filter(b => b.therapistId === therapist.id);

      // Generate slots every 30 mins within shift
      for (let m = shiftStartMins; m <= shiftEndMins - (service.duration || 60); m += 30) {
        const hh = Math.floor(m / 60).toString().padStart(2, '0');
        const mm = (m % 60).toString().padStart(2, '0');
        const slot = `${hh}:${mm}`;

        const reqStart = m;
        const reqEnd = m + (service.duration || 60);

        let conflict = false;
        for (const b of therapistBookings) {
          const bStart = timeToMins(b.timeSlot);
          const bEnd = bStart + (b.service?.duration || 60);
          if (reqStart < bEnd && reqEnd > bStart) {
            conflict = true;
            break;
          }
        }

        if (!conflict) {
          availableSlots.push({ time: slot, therapistId: therapist.id, therapistName: therapist.name });
        }
      }
    }

    return {
      service: service.name,
      date,
      duration: service.duration,
      availableSlots: availableSlots.slice(0, 8), // Return up to 8 options
      hasAvailability: availableSlots.length > 0,
    };
  }

  private async executeCreateBooking(userId: string, spaId: string, args: any) {
    const { serviceId, therapistId, date, timeSlot, notes } = args;

    // Check the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: 'User not found' };

    // Check service exists and get price
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return { error: 'Service not found' };

    // Check for conflicts
    const existingBookings = await prisma.booking.findMany({
      where: { therapistId, date, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
      include: { service: true }
    });

    const timeToMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const reqStart = timeToMins(timeSlot);
    const reqEnd = reqStart + (service.duration || 60);

    for (const b of existingBookings) {
      const bStart = timeToMins(b.timeSlot);
      const bEnd = bStart + (b.service?.duration || 60);
      if (reqStart < bEnd && reqEnd > bStart) {
        return { error: `That time slot conflicts with another booking. Please choose a different time.` };
      }
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        spaId,
        serviceId,
        therapistId,
        date,
        timeSlot,
        notes: notes || null,
        status: 'UPCOMING',
        totalPrice: service.price,
        depositPaid: 0,
      },
      include: { service: true, therapist: true }
    });

    return {
      success: true,
      bookingId: booking.id,
      service: booking.service?.name,
      therapist: booking.therapist?.name,
      date: booking.date,
      time: booking.timeSlot,
      total: booking.totalPrice,
      message: `Booking confirmed! Your appointment for ${booking.service?.name} with ${booking.therapist?.name} on ${booking.date} at ${booking.timeSlot} is confirmed.`
    };
  }

  // ─── Context Builders ────────────────────────────────────────────────────────

  private async buildConciergeSystemPrompt(userId: string, spaId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookings: {
          where: { spaId },
          orderBy: { date: 'desc' },
          take: 3,
          include: { service: true }
        }
      }
    });

    const spa = await prisma.spa.findUnique({
      where: { id: spaId },
      include: {
        services: { where: { isActive: true }, take: 20 },
        therapists: { where: { isActive: true }, take: 10 },
        products: { take: 10 },
      }
    });

    const today = new Date().toISOString().split('T')[0];

    return `
You are Bea, the AI Concierge for ${spa?.name || 'our spa'}.
You are talking to ${user?.name || 'a customer'} (user ID: ${userId}).
Today's date is ${today}.

## Spa Services (ID | Name | Price | Duration):
${spa?.services.map(s => `${s.id} | ${s.name} | KES ${s.price} | ${s.duration} mins`).join('\n') || 'No services listed'}

## Available Therapists (ID | Name):
${spa?.therapists.map(t => `${t.id} | ${t.name}`).join('\n') || 'No therapists listed'}

## Customer's Past Bookings:
${user?.bookings.map(b => `${b.service?.name} on ${b.date} at ${b.timeSlot}`).join('\n') || 'No previous bookings'}

## Your Capabilities:
1. You can CHECK AVAILABILITY - Call checkAvailability(serviceId, date) to see open slots
2. You can CREATE BOOKINGS - Call createBooking() ONLY after customer confirms all details
3. You can ANSWER QUESTIONS about services, prices, products, and policies
4. You can PERSONALIZE recommendations based on the customer's booking history

## Important Rules:
- Always confirm booking details with the customer BEFORE calling createBooking
- When suggesting services, reference the customer's past bookings for personalization
- If the customer asks "do you have availability" - use checkAvailability before answering
- Be warm, professional and concise
- Prices are in Kenyan Shillings (KES)
    `.trim();
  }

  private async buildCrmRetentionContext(spaId: string): Promise<string> {
    const today = new Date();

    const bookings = await prisma.booking.findMany({
      where: { spaId },
      include: { user: true, service: true },
      orderBy: { date: 'desc' }
    });

    const clientMap: Record<string, { user: any; totalSpend: number; completedCount: number; lastBookingDate: string | null }> = {};

    for (const b of bookings) {
      if (!clientMap[b.userId]) {
        clientMap[b.userId] = { user: b.user, totalSpend: 0, completedCount: 0, lastBookingDate: null };
      }
      if (b.status === 'COMPLETED') {
        clientMap[b.userId].totalSpend += b.totalPrice ?? b.service?.price ?? 0;
        clientMap[b.userId].completedCount++;
        if (!clientMap[b.userId].lastBookingDate || b.date > clientMap[b.userId].lastBookingDate!) {
          clientMap[b.userId].lastBookingDate = b.date;
        }
      }
    }

    const atRisk = Object.values(clientMap)
      .filter(c => c.completedCount > 0)
      .map(c => {
        const lastDate = c.lastBookingDate ? new Date(c.lastBookingDate) : null;
        const daysSinceLast = lastDate
          ? Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          : 9999;
        const riskLevel = daysSinceLast >= 90 ? 'HIGH' : daysSinceLast >= 45 ? 'MEDIUM' : 'LOW';
        return { name: c.user.name, phone: c.user.phone, clv: c.totalSpend, daysSinceLast, riskLevel };
      })
      .filter(c => c.daysSinceLast >= 30)
      .sort((a, b) => b.clv - a.clv)
      .slice(0, 15);

    if (atRisk.length === 0) {
      return '✅ No at-risk clients detected. All clients have booked recently.';
    }

    const highRisk = atRisk.filter(c => c.riskLevel === 'HIGH');
    const mediumRisk = atRisk.filter(c => c.riskLevel === 'MEDIUM');

    return `
**At-Risk Clients (inactive 30+ days, sorted by Customer Lifetime Value):**
- Total at-risk: ${atRisk.length} clients
- HIGH risk (90+ days inactive): ${highRisk.length} clients
- MEDIUM risk (45-89 days inactive): ${mediumRisk.length} clients

**Top At-Risk Clients to Re-engage:**
${atRisk.slice(0, 10).map((c, i) => `${i + 1}. ${c.name} | CLV: KES ${c.clv.toLocaleString()} | Inactive: ${c.daysSinceLast} days | Risk: ${c.riskLevel} | Phone: ${c.phone}`).join('\n')}

**Recommended action:** Contact high-CLV clients with a personalized offer (e.g., 10-15% discount) via WhatsApp.
    `.trim();
  }

  private async buildAnalyticsSnapshot(spaId: string): Promise<string> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const [bookings, recentBookings, products, therapists, services] = await Promise.all([
      prisma.booking.findMany({
        where: { spaId, status: 'COMPLETED', date: { gte: thirtyDaysAgo, lte: today } },
        include: { service: true }
      }),
      prisma.booking.findMany({
        where: { spaId, date: { gte: today } },
        include: { service: true },
        take: 10
      }),
      prisma.product.findMany({ where: { spaId } }),
      prisma.therapist.findMany({ where: { spaId } }),
      prisma.service.findMany({ where: { spaId } }),
    ]);

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);

    // Top services by bookings
    const serviceCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const b of bookings) {
      const name = b.service?.name || 'Unknown';
      if (!serviceCounts[name]) serviceCounts[name] = { name, count: 0, revenue: 0 };
      serviceCounts[name].count++;
      serviceCounts[name].revenue += b.service?.price || 0;
    }
    const topServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    // Low stock products
    const lowStock = products.filter(p => p.stock <= 5);

    return `
**Last 30 Days Summary:**
- Total Revenue: KES ${totalRevenue.toLocaleString()}
- Completed Bookings: ${bookings.length}
- Active Staff: ${therapists.filter(t => t.isActive).length} / ${therapists.length}
- Total Services Offered: ${services.filter(s => s.isActive).length}
- Upcoming Bookings (today onwards): ${recentBookings.length}

**Top 5 Services by Bookings:**
${topServices.map((s, i) => `${i + 1}. ${s.name} - ${s.count} bookings - KES ${s.revenue.toLocaleString()}`).join('\n') || 'No completed bookings yet'}

**Inventory Alerts:**
${lowStock.length > 0 ? lowStock.map(p => `⚠️ ${p.name}: Only ${p.stock} units left`).join('\n') : '✅ All products are well-stocked'}

**Business Health:**
- Average bookings per day: ${(bookings.length / 30).toFixed(1)}
- Est. weekly revenue: KES ${(totalRevenue / 4).toLocaleString()}
    `.trim();
  }
}

export const aiService = new AiService();
