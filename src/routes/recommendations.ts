import { Router, Request, Response, NextFunction } from 'express';
import { getCombinedRecommendations, getSeasonalRecommendations } from '../services/recommendationEngine';
import * as listService from '../services/listService';
import { db } from '../config/firebase';

const router = Router();

router.get('/seasonal', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seasonalRecs = await getSeasonalRecommendations();
    
    const enrichedRecs = await Promise.all(seasonalRecs.map(async (rec) => {
       const snapshot = await db.collection('products')
         .where('name', '==', rec.itemName)
         .limit(1)
         .get();
         
       if (!snapshot.empty) {
         const productData = snapshot.docs[0].data();
         return {
           ...rec,
           price: productData.price,
           imageUrl: productData.imageUrl,
           category: productData.category,
           productId: snapshot.docs[0].id
         };
       }
       return rec;
    }));

    return res.json({ recommendations: enrichedRecs });
  } catch (error) {
    next(error);
  }
});

router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const activeItems = await listService.getActiveListItems(userId);
    const activeItemNames = activeItems.map(i => i.itemName);

    const recommendations = await getCombinedRecommendations(userId, activeItemNames);

    // Enrich with actual product data
    const enrichedRecs = await Promise.all(recommendations.map(async (rec) => {
       // Search local products collection for the itemName
       const snapshot = await db.collection('products')
         .where('name', '==', rec.itemName)
         .limit(1)
         .get();
         
       if (!snapshot.empty) {
         const productData = snapshot.docs[0].data();
         return {
           ...rec,
           price: productData.price,
           imageUrl: productData.imageUrl,
           category: productData.category,
           productId: snapshot.docs[0].id
         };
       }
       
       return rec;
    }));

    return res.json({ recommendations: enrichedRecs });
  } catch (error) {
    next(error);
  }
});

export default router;
