import { Router, Request, Response, NextFunction } from 'express';
import { substitutesMap } from '../services/substitutes';
import { db } from '../config/firebase';

const router = Router();

router.get('/:itemName', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemName = String(req.params.itemName).toLowerCase();

    // Find if the item has substitutes in the map
    const match = Object.keys(substitutesMap).find(k => itemName.includes(k) || k.includes(itemName));
    
    if (!match) {
      return res.json({ substitutes: [] });
    }

    const substituteNames = substitutesMap[match];
    
    // Enrich with actual product data
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const enrichedSubstitutes = substituteNames.map((name) => {
       const found = products.find(p => (p as any).name.toLowerCase().includes(name));
       return found;
    }).filter(Boolean); // Only return matched items from DB

    return res.json({ substitutes: enrichedSubstitutes });
  } catch (error) {
    next(error);
  }
});

export default router;
