import { Router, Request, Response, NextFunction } from 'express';
import { getOrFetchProducts } from '../services/productCache';

const router = Router();

// GET /products/search?q=<query>
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Missing required query parameter: q' });
    }

    const result = await getOrFetchProducts(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
