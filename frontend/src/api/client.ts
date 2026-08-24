const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface BackendListItem {
  id: string;
  userId: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: string;
  price?: number | null;
  imageUrl?: string | null;
  productId?: string;
  addedAt: any;
  status: string;
}

export interface BackendProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
  price: number;
  source: string;
}

export const apiClient = {
  async getListItems(userId: string): Promise<BackendListItem[]> {
    const res = await fetch(`${API_BASE_URL}/list/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch list items');
    const data = await res.json();
    return data.items || [];
  },

  async addListItem(userId: string, itemName: string, quantity: number, unit: string = '', category?: string, price?: number, imageUrl?: string): Promise<BackendListItem> {
    const res = await fetch(`${API_BASE_URL}/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, itemName, quantity, unit, category, price, imageUrl })
    });
    if (!res.ok) throw new Error('Failed to add list item');
    const data = await res.json();
    return data.item;
  },

  async updateListItemQuantity(itemId: string, quantity: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/list/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    if (!res.ok) throw new Error('Failed to update list item quantity');
  },

  async removeListItem(itemId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/list/${itemId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove list item');
  },

  async searchProducts(query: string): Promise<BackendProduct[]> {
    const res = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search products');
    const data = await res.json();
    return data.products || [];
  },

  async postVoiceCommand(userId: string, transcript: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, transcript })
    });
    if (!res.ok) throw new Error('Failed to post voice command');
    return await res.json();
  },

  async getRecommendations(userId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/recommendations/${userId}`);
    if (!res.ok) throw new Error('Failed to get recommendations');
    const data = await res.json();
    return data.recommendations || [];
  },

  async getSubstitutes(itemName: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/substitutes/${encodeURIComponent(itemName)}`);
    if (!res.ok) throw new Error('Failed to get substitutes');
    const data = await res.json();
    return data.substitutes || [];
  },

  async getSeasonalRecommendations(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/recommendations/seasonal`);
    if (!res.ok) throw new Error('Failed to get seasonal recommendations');
    const data = await res.json();
    return data.recommendations || [];
  }
};
