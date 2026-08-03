import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';

export class AiController {
  // ─── Customer Concierge (Mobile App) ───────────────────────────────────────
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, spaId } = req.body;
      const userId = req.user?.id;
      
      if (!message || !spaId || !userId) {
        return res.status(400).json({ error: 'message, spaId, and authenticated user are required' });
      }

      // If stream flag is true, use SSE
      if (req.query.stream === 'true') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
          const stream = await aiService.getConciergeStream(userId, spaId, message);
          for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
          res.write('data: [DONE]\n\n');
          res.end();
        } catch (e: any) {
          if (e.status === 429) {
            res.write(`data: ${JSON.stringify({ error: 'Rate limit reached. Please try again later.' })}\n\n`);
          } else {
            res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
          }
          res.end();
        }
      } else {
        // Non-streaming: uses full function-calling agentic loop
        const reply = await aiService.getConciergeResponse(userId, spaId, message);
        res.json({ reply });
      }
    } catch (err: any) {
      if (err.status === 429) {
        return res.status(429).json({ error: 'Quota exceeded. Please try again later or upgrade your plan.' });
      }
      next(err);
    }
  }

  // ─── Admin Business Advisor (Dashboard) ────────────────────────────────────
  async adminChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      const spaId = req.user?.spaId;

      if (!message) {
        return res.status(400).json({ error: 'message is required' });
      }
      if (!spaId) {
        return res.status(403).json({ error: 'No spa associated with your account' });
      }

      const reply = await aiService.getAdminResponse(spaId, message);
      res.json({ reply });
    } catch (err: any) {
      if (err.status === 429) {
        return res.status(429).json({ error: 'Quota exceeded. Please try again later or upgrade your plan.' });
      }
      next(err);
    }
  }

  // ─── Marketing Campaign Generator ─────────────────────────────────────────
  async generateMarketing(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt } = req.body;
      const spaId = req.user?.spaId;

      if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
      }
      if (!spaId) {
        return res.status(403).json({ error: 'No spa associated with your account' });
      }

      const campaign = await aiService.generateMarketingCampaign(spaId, prompt);
      res.json(campaign);
    } catch (err: any) {
      if (err.message?.includes('JSON')) {
        return res.status(500).json({ error: 'AI returned an invalid response. Please try again.' });
      }
      next(err);
    }
  }
}

export const aiController = new AiController();
