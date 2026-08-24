const categoryMap: Record<string, string> = {
  // Dairy
  'milk': 'dairy',
  'cheese': 'dairy',
  'butter': 'dairy',
  'yogurt': 'dairy',
  'cream': 'dairy',
  'eggs': 'dairy',

  // Produce
  'apple': 'produce',
  'apples': 'produce',
  'banana': 'produce',
  'bananas': 'produce',
  'orange': 'produce',
  'oranges': 'produce',
  'lettuce': 'produce',
  'tomato': 'produce',
  'tomatoes': 'produce',
  'onion': 'produce',
  'onions': 'produce',
  'garlic': 'produce',
  'carrot': 'produce',
  'carrots': 'produce',
  'potato': 'produce',
  'potatoes': 'produce',

  // Snacks
  'chips': 'snacks',
  'cookies': 'snacks',
  'crackers': 'snacks',
  'popcorn': 'snacks',
  'chocolate': 'snacks',
  'candy': 'snacks',

  // Beverages
  'water': 'beverages',
  'soda': 'beverages',
  'juice': 'beverages',
  'coffee': 'beverages',
  'tea': 'beverages',
  'beer': 'beverages',
  'wine': 'beverages',

  // Bakery
  'bread': 'bakery',
  'bagel': 'bakery',
  'bagels': 'bakery',
  'muffin': 'bakery',
  'croissant': 'bakery',

  // Meat
  'chicken': 'meat',
  'beef': 'meat',
  'pork': 'meat',
  'bacon': 'meat',
  'sausage': 'meat',
  'fish': 'meat',
  'salmon': 'meat',

  // Household
  'paper towels': 'household',
  'toilet paper': 'household',
  'trash bags': 'household',
  'soap': 'household',
  'detergent': 'household',
  'sponge': 'household'
};

export const categorizeItem = (itemName: string): string => {
  const normalized = itemName.toLowerCase().trim();
  
  // Exact match first
  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }

  // Handle plural/singular basic variations
  if (normalized.endsWith('s') && categoryMap[normalized.slice(0, -1)]) {
    return categoryMap[normalized.slice(0, -1)];
  }

  return 'other';
};
