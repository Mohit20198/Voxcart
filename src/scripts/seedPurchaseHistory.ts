import { db } from '../config/firebase';
import { PurchaseHistory } from '../models/types';
import { Timestamp } from 'firebase-admin/firestore';

const users = ['user123', 'user456', 'user789'];
const DAYS_HISTORY = 60;

const seed = async () => {
  console.log('Starting purchase history seed...');
  let recordsAdded = 0;

  const now = new Date();
  
  // Clear existing to avoid duplicates in testing
  const existing = await db.collection('purchaseHistory').get();
  const batch = db.batch();
  existing.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log('Cleared existing purchase history.');

  for (const userId of users) {
    // Generate dates going backwards, start from 5 days ago so things are "due" for a purchase
    for (let i = 5; i < DAYS_HISTORY + 5; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      const itemsToBuy: { itemName: string, category: string }[] = [];

      // User 123 patterns
      if (userId === 'user123') {
        if (i % 7 === 0) itemsToBuy.push({ itemName: 'milk', category: 'dairy' });
        if (i % 5 === 0) itemsToBuy.push({ itemName: 'bread', category: 'bakery' });
        if (i % 10 === 0) itemsToBuy.push({ itemName: 'eggs', category: 'dairy' });
        if (i % 14 === 0) itemsToBuy.push({ itemName: 'coffee', category: 'beverages' });
      }

      // User 456 patterns
      if (userId === 'user456') {
        if (i % 4 === 0) itemsToBuy.push({ itemName: 'apples', category: 'produce' });
        if (i % 8 === 0) itemsToBuy.push({ itemName: 'yogurt', category: 'dairy' });
      }

      // Co-occurrence pattern (all users sometimes buy pasta)
      // Say every 12 days they buy pasta, and 70% of the time they also buy pasta sauce
      if (i % 12 === 0) {
        itemsToBuy.push({ itemName: 'pasta', category: 'pantry' });
        if (Math.random() < 0.7) {
          itemsToBuy.push({ itemName: 'pasta sauce', category: 'pantry' });
        }
      }

      // Insert the daily cart
      for (const item of itemsToBuy) {
        const record: Omit<PurchaseHistory, 'id'> = {
          userId,
          itemName: item.itemName,
          category: item.category,
          purchasedAt: Timestamp.fromDate(date)
        };
        await db.collection('purchaseHistory').add(record);
        recordsAdded++;
      }
    }
  }

  console.log(`Seed complete! Added ${recordsAdded} synthetic purchase records.`);
};

seed().catch(console.error);
