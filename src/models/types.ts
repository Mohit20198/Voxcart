import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  id: string;
  name: string;
  preferences: {
    dietary: string[];
    priceSensitivity: string; // e.g., 'low', 'medium', 'high'
  };
}

export interface ShoppingListItem {
  id?: string;
  userId: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: string;
  price?: number | null;
  imageUrl?: string | null;
  productId?: string;
  addedAt: Timestamp | Date;
  status: "active" | "purchased" | "removed";
}

export interface PurchaseHistory {
  id?: string;
  userId: string;
  itemName: string;
  category: string;
  purchasedAt: Timestamp | Date;
}

export interface Product {
  id: string; // barcode as doc id
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
  price: number;
  source: "openfoodfacts" | "curated";
  cachedAt: string; // ISO string
}
