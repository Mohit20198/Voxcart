import { Router, Request, Response, NextFunction } from 'express';
import * as listService from '../services/listService';

const router = Router();

// GET /list/:userId — get active list items
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string;
    const items = await listService.getActiveListItems(userId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// POST /list — add an item directly
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, itemName, quantity, unit } = req.body;
    
    if (!userId || !itemName || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields: userId, itemName, quantity' });
    }

    const item = await listService.addListItem({ 
      userId: userId as string, 
      itemName: itemName as string, 
      quantity: Number(quantity), 
      unit: (unit as string) || '' 
    });
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
});

// PATCH /list/:itemId — modify quantity
router.patch('/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.itemId as string;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Missing required field: quantity' });
    }

    await listService.updateItemQuantity(itemId, Number(quantity));
    res.json({ success: true, message: 'Quantity updated' });
  } catch (error) {
    next(error);
  }
});

// DELETE /list/:itemId — remove an item
router.delete('/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.itemId as string;
    await listService.removeListItem(itemId);
    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    next(error);
  }
});

export default router;
