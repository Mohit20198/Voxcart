import { Router, Request, Response, NextFunction } from 'express';
import { parseCommand } from '../services/fastPathParser';
import { categorizeItem } from '../services/categorize';
import * as listService from '../services/listService';
import { runAgent } from '../services/agent';

const router = Router();

router.post('/command', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, transcript } = req.body;

    if (!userId || !transcript || typeof transcript !== 'string' || transcript.trim() === '') {
      return res.status(400).json({ error: 'Missing or invalid fields: userId, transcript' });
    }

    const parsedCommand = parseCommand(transcript);

    if (!parsedCommand) {
      // Fast-path couldn't handle it, fallback to LLM agent
      const agentResult = await runAgent(userId, transcript);
      return res.json({ 
        status: 'matched',
        handledBy: 'agent',
        ...agentResult,
        transcript
      });
    }

    const { action, itemName, quantity, unit } = parsedCommand;

    // Handle remove & modify
    if (action === 'remove' || action === 'modify') {
      const existingItem = await listService.findActiveItemByName(userId, itemName);

      if (!existingItem) {
        return res.json({
          status: 'matched',
          handledBy: 'fastpath',
          action,
          error: 'Item not found in list',
          transcript
        });
      }

      if (action === 'remove') {
        await listService.removeListItem(existingItem.id!);
        return res.json({
          status: 'matched',
          handledBy: 'fastpath',
          action,
          item: { ...existingItem, status: 'removed' },
          transcript
        });
      }

      if (action === 'modify') {
        const newQuantity = quantity || 1;
        await listService.updateItemQuantity(existingItem.id!, newQuantity);
        return res.json({
          status: 'matched',
          handledBy: 'fastpath',
          action,
          item: { ...existingItem, quantity: newQuantity },
          transcript
        });
      }
    }

    if (action === 'add') {
       const category = categorizeItem(itemName);
       const newItem = await listService.addListItem({
         userId,
         itemName,
         quantity: quantity || 1,
         unit: unit || '',
         category
       });
       return res.json({
         status: 'matched',
         handledBy: 'fastpath',
         action,
         item: newItem,
         transcript
       });
    }

  } catch (error) {
    next(error);
  }
});

export default router;
