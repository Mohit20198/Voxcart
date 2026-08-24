import { db } from '../config/firebase';
import { ShoppingListItem } from '../models/types';
import { FieldValue, QueryDocumentSnapshot } from 'firebase-admin/firestore';

const LIST_COLLECTION = 'shoppingListItems';

export const getActiveListItems = async (userId: string): Promise<ShoppingListItem[]> => {
  const snapshot = await db.collection(LIST_COLLECTION)
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .get();

  return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
    id: doc.id,
    ...doc.data()
  })) as ShoppingListItem[];
};

export const addListItem = async (item: Omit<ShoppingListItem, 'id' | 'status' | 'addedAt' | 'category'> & { category?: string }): Promise<ShoppingListItem> => {
  let price = null;
  let imageUrl = null;
  let productId = undefined;

  // Simple substring lookup against cached products
  const normalizedName = item.itemName.toLowerCase().trim();
  const productsSnapshot = await db.collection('products').get();
  const cachedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  
  const matchedProduct = cachedProducts.find(p => p.name.toLowerCase().includes(normalizedName));

  if (matchedProduct) {
    price = matchedProduct.price ?? null;
    imageUrl = matchedProduct.imageUrl ?? null;
    productId = matchedProduct.id;
  }

  const newItem: any = {
    ...item,
    category: item.category || 'General', // Default for now if not provided
    price,
    imageUrl,
    status: 'active',
    addedAt: FieldValue.serverTimestamp()
  };

  if (productId) {
    newItem.productId = productId;
  }

  const docRef = await db.collection(LIST_COLLECTION).add(newItem);
  
  return {
    id: docRef.id,
    ...newItem,
    addedAt: new Date()
  } as ShoppingListItem;
};

export const updateItemQuantity = async (itemId: string, quantity: number): Promise<void> => {
  await db.collection(LIST_COLLECTION).doc(itemId).update({
    quantity
  });
};

export const removeListItem = async (itemId: string): Promise<void> => {
  // We mark it as removed instead of hard deleting to keep history
  await db.collection(LIST_COLLECTION).doc(itemId).update({
    status: 'removed'
  });
};

export const findActiveItemByName = async (userId: string, itemName: string): Promise<ShoppingListItem | null> => {
  // Fetch all active items and filter in memory since Firestore doesn't support 
  // case-insensitive equality natively without an explicit lowercase field
  const activeItems = await getActiveListItems(userId);
  const normalizedName = itemName.toLowerCase().trim();
  
  // Sort by addedAt descending to find the most recent one
  const matchedItems = activeItems.filter(item => 
    item.itemName.toLowerCase().trim() === normalizedName
  ).sort((a, b) => {
    const timeA = (a.addedAt as FirebaseFirestore.Timestamp).toMillis ? (a.addedAt as FirebaseFirestore.Timestamp).toMillis() : (a.addedAt as Date).getTime();
    const timeB = (b.addedAt as FirebaseFirestore.Timestamp).toMillis ? (b.addedAt as FirebaseFirestore.Timestamp).toMillis() : (b.addedAt as Date).getTime();
    return timeB - timeA;
  });

  return matchedItems.length > 0 ? matchedItems[0] : null;
};
