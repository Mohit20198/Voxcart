import { db } from '../config/firebase';
import { PurchaseHistory, ShoppingListItem } from '../models/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export interface Recommendation {
  itemName: string;
  reason: string;
  confidence: number;
}

export const getFrequencyRecommendations = async (userId: string): Promise<Recommendation[]> => {
  const snapshot = await db.collection('purchaseHistory')
    .where('userId', '==', userId)
    .get();

  const history = snapshot.docs.map(doc => doc.data() as PurchaseHistory);
  
  // Sort in memory to avoid composite index requirement
  history.sort((a, b) => {
    const timeA = (a.purchasedAt as FirebaseFirestore.Timestamp).toMillis ? (a.purchasedAt as FirebaseFirestore.Timestamp).toMillis() : (a.purchasedAt as unknown as Date).getTime();
    const timeB = (b.purchasedAt as FirebaseFirestore.Timestamp).toMillis ? (b.purchasedAt as FirebaseFirestore.Timestamp).toMillis() : (b.purchasedAt as unknown as Date).getTime();
    return timeB - timeA;
  });
  
  // Group by item
  const itemDates: Record<string, number[]> = {};
  for (const record of history) {
    const time = (record.purchasedAt as FirebaseFirestore.Timestamp).toMillis ? (record.purchasedAt as FirebaseFirestore.Timestamp).toMillis() : (record.purchasedAt as unknown as Date).getTime();
    if (!itemDates[record.itemName]) {
      itemDates[record.itemName] = [];
    }
    itemDates[record.itemName].push(time);
  }

  const recommendations: Recommendation[] = [];
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  for (const [itemName, dates] of Object.entries(itemDates)) {
    // Only consider items bought at least 3 times
    if (dates.length < 3) continue;

    // Dates are sorted descending because of the query order
    let totalInterval = 0;
    for (let i = 0; i < dates.length - 1; i++) {
      totalInterval += (dates[i] - dates[i + 1]);
    }
    const avgIntervalMs = totalInterval / (dates.length - 1);
    const avgIntervalDays = avgIntervalMs / ONE_DAY;

    const timeSinceLastPurchaseMs = now - dates[0];
    const timeSinceLastPurchaseDays = timeSinceLastPurchaseMs / ONE_DAY;

    // If time elapsed is >= 80% of average interval, recommend it
    if (timeSinceLastPurchaseMs >= avgIntervalMs * 0.8) {
      // Calculate a confidence score (higher is better, cap at 1)
      let confidence = timeSinceLastPurchaseMs / avgIntervalMs;
      if (confidence > 1) confidence = 1;
      
      recommendations.push({
        itemName,
        reason: `You usually buy this every ${Math.round(avgIntervalDays)} days, last bought ${Math.round(timeSinceLastPurchaseDays)} days ago`,
        confidence
      });
    }
  }

  return recommendations;
};

export const getCoOccurrenceRecommendations = async (userId: string, currentListItems: string[]): Promise<Recommendation[]> => {
  // Fetch all history across all users
  const snapshot = await db.collection('purchaseHistory').get();
  const history = snapshot.docs.map(doc => doc.data() as PurchaseHistory);

  // Group by user and date string (YYYY-MM-DD) to form "sessions"
  const sessions: Record<string, Set<string>> = {};
  
  for (const record of history) {
    let dateObj: Date;
    if ((record.purchasedAt as FirebaseFirestore.Timestamp).toDate) {
      dateObj = (record.purchasedAt as FirebaseFirestore.Timestamp).toDate();
    } else {
      dateObj = new Date(record.purchasedAt as unknown as string);
    }
    
    const dateStr = dateObj.toISOString().split('T')[0];
    const sessionKey = `${record.userId}_${dateStr}`;
    
    if (!sessions[sessionKey]) {
      sessions[sessionKey] = new Set<string>();
    }
    sessions[sessionKey].add(record.itemName.toLowerCase());
  }

  // Count co-occurrences for each item currently on the active list
  const coOccurrenceCounts: Record<string, number> = {};
  const activeItemsSet = new Set(currentListItems.map(i => i.toLowerCase()));

  for (const items of Object.values(sessions)) {
    // Does this session contain any item on the user's active list?
    let hasActiveItem = false;
    for (const item of items) {
      if (activeItemsSet.has(item)) {
        hasActiveItem = true;
        break;
      }
    }

    if (hasActiveItem) {
      // Tally all other items in this session
      for (const item of items) {
        if (!activeItemsSet.has(item)) {
          coOccurrenceCounts[item] = (coOccurrenceCounts[item] || 0) + 1;
        }
      }
    }
  }

  const recommendations: Recommendation[] = [];
  
  // Create recommendations for items that co-occurred at least once
  for (const [itemName, count] of Object.entries(coOccurrenceCounts)) {
    // Normalize confidence slightly based on arbitrary threshold since dataset is small
    let confidence = count / 5;
    if (confidence > 1) confidence = 1;
    
    recommendations.push({
      itemName,
      reason: `Often bought with items currently on your list`,
      confidence: confidence * 0.9 // Slightly lower weight than frequency recs
    });
  }

  return recommendations;
};

export const getSeasonalRecommendations = async (): Promise<Recommendation[]> => {
  const month = new Date().getMonth(); // 0-11
  let season = 'this season';
  let seasonalKeywords = ['juice', 'ice cream', 'curd']; // summer defaults
  
  if (month >= 2 && month <= 5) {
    season = 'summer';
    seasonalKeywords = ['mango', 'juice', 'cold', 'curd'];
  } else if (month >= 6 && month <= 8) {
    season = 'monsoon';
    seasonalKeywords = ['tea', 'coffee', 'biscuits', 'snack', 'bhujia', 'namkeen'];
  } else {
    season = 'winter';
    seasonalKeywords = ['coffee', 'soup', 'ghee', 'spinach', 'apple'];
  }

  // Fetch products and find ones matching seasonal keywords to make it dynamic
  const productsSnapshot = await db.collection('products').get();
  const allProducts = productsSnapshot.docs.map(doc => doc.data());
  
  const matches = allProducts.filter(p => {
    const name = (p.name || '').toLowerCase();
    return seasonalKeywords.some(kw => name.includes(kw));
  });

  // Shuffle and pick 2
  const randomProducts = matches.sort(() => 0.5 - Math.random()).slice(0, 2);
  
  if (randomProducts.length === 0) {
     // Fallback if no keywords matched
     return allProducts.sort(() => 0.5 - Math.random()).slice(0, 2).map(p => ({
        itemName: p.name,
        reason: `Great choice for ${season}`,
        confidence: 0.75
     }));
  }

  return randomProducts.map(p => ({
    itemName: p.name,
    reason: `Perfect for the ${season}`,
    confidence: 0.85
  }));
};

export const getCombinedRecommendations = async (userId: string, currentListItems: string[]): Promise<Recommendation[]> => {
  const freqRecs = await getFrequencyRecommendations(userId);
  const coOccurRecs = await getCoOccurrenceRecommendations(userId, currentListItems);
  const seasonalRecs = await getSeasonalRecommendations();
  
  const activeItemNames = currentListItems.map(i => i.toLowerCase());
  const mergedMap = new Map<string, Recommendation>();

  for (const rec of freqRecs) {
    if (!activeItemNames.includes(rec.itemName.toLowerCase())) {
      mergedMap.set(rec.itemName.toLowerCase(), rec);
    }
  }

  for (const rec of coOccurRecs) {
    if (!activeItemNames.includes(rec.itemName.toLowerCase())) {
      if (!mergedMap.has(rec.itemName.toLowerCase())) {
        mergedMap.set(rec.itemName.toLowerCase(), rec);
      } else {
        const existing = mergedMap.get(rec.itemName.toLowerCase())!;
        existing.confidence = Math.min(1, existing.confidence + rec.confidence);
        existing.reason = existing.reason + ' AND ' + rec.reason;
      }
    }
  }

  for (const rec of seasonalRecs) {
    if (!activeItemNames.includes(rec.itemName.toLowerCase())) {
      if (!mergedMap.has(rec.itemName.toLowerCase())) {
        mergedMap.set(rec.itemName.toLowerCase(), rec);
      } else {
        const existing = mergedMap.get(rec.itemName.toLowerCase())!;
        existing.confidence = Math.min(1, existing.confidence + rec.confidence);
        // Prefer seasonal reason but append existing reason
        existing.reason = rec.reason + ' (Also ' + existing.reason + ')';
      }
    }
  }

  return Array.from(mergedMap.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
};
