import { Router, Request, Response, NextFunction } from 'express';


import * as listService from '../services/listService';
import { runAgent } from '../services/agent';

const router = Router();

router.post('/command', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, transcript } = req.body;

    if (!userId || !transcript || typeof transcript !== 'string' || transcript.trim() === '') {
      return res.status(400).json({ error: 'Missing or invalid fields: userId, transcript' });
    }

    // Fallback to LLM agent for all requests for accuracy
    const agentResult = await runAgent(userId, transcript);
    return res.json({ 
      status: 'matched',
      handledBy: 'agent',
      ...agentResult,
      transcript
    });

  } catch (error) {
    next(error);
  }
});

export default router;
