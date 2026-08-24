import { Router, Request, Response, NextFunction } from 'express';
import { matchProduct } from '../services/mlService';

const router = Router();

// GET /test/match?query=<text>&candidates=<comma-separated>
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.query as string;
    const candidatesStr = req.query.candidates as string;

    if (!query || !candidatesStr) {
      return res.status(400).json({ error: 'Missing required query parameters: query, candidates' });
    }

    const candidates = candidatesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const result = await matchProduct(query, candidates);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
