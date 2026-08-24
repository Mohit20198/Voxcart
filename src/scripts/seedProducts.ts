import { db } from '../config/firebase';
import { Product } from '../models/types';
import crypto from 'crypto';

const PRODUCTS_COLLECTION = 'products';

interface CuratedItem {
  category: string;
  name: string;
  genericTerm: string;
  price: number;
}

const curatedCatalog: CuratedItem[] = [
  // Dairy & Alternatives
  { category: 'dairy', name: 'Amul Toned Milk, 500ml', genericTerm: 'milk carton', price: 27 },
  { category: 'dairy', name: 'Amul Butter, 100g', genericTerm: 'butter', price: 56 },
  { category: 'dairy', name: 'Amul Cheese Slices, 10pc', genericTerm: 'cheese slices', price: 125 },
  { category: 'dairy', name: 'Curd (Dahi), 400g', genericTerm: 'yogurt bowl', price: 45 },
  { category: 'dairy', name: 'Paneer, 200g', genericTerm: 'cottage cheese block', price: 90 },
  { category: 'dairy', name: 'Amul Ghee, 500ml', genericTerm: 'clarified butter jar', price: 310 },
  { category: 'dairy', name: 'Mother Dairy Lassi, 200ml', genericTerm: 'lassi drink bottle', price: 20 },
  { category: 'dairy', name: 'Amul Mozzarella Cheese, 200g', genericTerm: 'mozzarella cheese', price: 145 },

  // Produce
  { category: 'produce', name: 'Onion, 1kg', genericTerm: 'red onions', price: 35 },
  { category: 'produce', name: 'Tomato, 1kg', genericTerm: 'fresh tomatoes', price: 40 },
  { category: 'produce', name: 'Potato, 1kg', genericTerm: 'potatoes', price: 28 },
  { category: 'produce', name: 'Banana, 1 dozen', genericTerm: 'yellow bananas', price: 60 },
  { category: 'produce', name: 'Spinach (Palak), bunch', genericTerm: 'fresh spinach', price: 20 },
  { category: 'produce', name: 'Apple, 1kg', genericTerm: 'red apples', price: 150 },
  { category: 'produce', name: 'Coriander leaves, bunch', genericTerm: 'fresh cilantro', price: 10 },
  { category: 'produce', name: 'Green Chilli, 100g', genericTerm: 'green chili peppers', price: 15 },
  { category: 'produce', name: 'Garlic, 100g', genericTerm: 'fresh garlic bulbs', price: 25 },
  { category: 'produce', name: 'Ginger, 100g', genericTerm: 'fresh ginger root', price: 20 },
  { category: 'produce', name: 'Capsicum, 250g', genericTerm: 'bell pepper', price: 40 },
  { category: 'produce', name: 'Lemon, 6pc', genericTerm: 'yellow lemons', price: 30 },
  { category: 'produce', name: 'Mango (Alphonso), 1kg', genericTerm: 'alphonso mango', price: 200 },
  { category: 'produce', name: 'Cucumber, 500g', genericTerm: 'fresh cucumber', price: 25 },
  { category: 'produce', name: 'Carrot, 500g', genericTerm: 'fresh carrots', price: 30 },
  { category: 'produce', name: 'Cauliflower, 1pc', genericTerm: 'fresh cauliflower', price: 40 },

  // Bakery
  { category: 'bakery', name: 'Britannia Bread, 400g', genericTerm: 'sliced white bread', price: 45 },
  { category: 'bakery', name: 'Pav, 6pc', genericTerm: 'dinner rolls', price: 30 },
  { category: 'bakery', name: 'Whole Wheat Bread, 400g', genericTerm: 'whole wheat bread loaf', price: 55 },
  { category: 'bakery', name: 'Rusk, 200g', genericTerm: 'rusk toast biscuits', price: 40 },

  // Snacks
  { category: 'snacks', name: 'Parle-G Biscuits, 250g', genericTerm: 'glucose biscuits', price: 30 },
  { category: 'snacks', name: "Lay's Chips, 52g", genericTerm: 'potato chips bag', price: 20 },
  { category: 'snacks', name: 'Kurkure, 90g', genericTerm: 'spicy corn puff snack', price: 20 },
  { category: 'snacks', name: "Haldiram's Bhujia, 200g", genericTerm: 'sev bhujia namkeen', price: 55 },
  { category: 'snacks', name: 'Britannia Good Day Cookies, 150g', genericTerm: 'butter cookies', price: 35 },
  { category: 'snacks', name: "Haldiram's Aloo Bhujia, 150g", genericTerm: 'potato namkeen snack', price: 40 },
  { category: 'snacks', name: 'Maggi Noodles, 280g (4pc)', genericTerm: 'instant noodles pack', price: 68 },
  { category: 'snacks', name: 'Top Ramen Masala, 240g (4pc)', genericTerm: 'instant masala noodles', price: 60 },
  { category: 'snacks', name: 'Chips Ahoy Cookies, 100g', genericTerm: 'chocolate chip cookies', price: 55 },

  // Beverages
  { category: 'beverages', name: 'Tata Tea Gold, 250g', genericTerm: 'loose leaf tea tin', price: 135 },
  { category: 'beverages', name: 'Nescafe Classic Coffee, 50g', genericTerm: 'instant coffee jar', price: 165 },
  { category: 'beverages', name: 'Real Fruit Juice, 1L', genericTerm: 'fruit juice carton', price: 110 },
  { category: 'beverages', name: 'Bisleri Water, 1L', genericTerm: 'mineral water bottle', price: 20 },
  { category: 'beverages', name: 'Coca-Cola, 750ml', genericTerm: 'cola bottle', price: 40 },
  { category: 'beverages', name: 'Paperboat Aamras, 250ml', genericTerm: 'mango juice drink', price: 35 },
  { category: 'beverages', name: 'Horlicks, 500g', genericTerm: 'malt health drink powder', price: 285 },
  { category: 'beverages', name: 'Boost Energy Drink, 500g', genericTerm: 'chocolate malt drink powder', price: 280 },
  { category: 'beverages', name: 'Red Bull, 250ml', genericTerm: 'energy drink can', price: 125 },

  // Meat & Eggs
  { category: 'meat', name: 'Chicken Breast, 500g', genericTerm: 'raw chicken breast', price: 180 },
  { category: 'meat', name: 'Chicken Curry Cut, 1kg', genericTerm: 'raw chicken pieces', price: 220 },
  { category: 'meat', name: 'Eggs, 12pc tray', genericTerm: 'egg carton dozen', price: 84 },
  { category: 'meat', name: 'Rohu Fish, 500g', genericTerm: 'fresh fish market', price: 200 },
  { category: 'meat', name: 'Mutton, 500g', genericTerm: 'raw mutton meat', price: 380 },
  { category: 'meat', name: 'Prawn, 250g', genericTerm: 'fresh prawns shrimp', price: 220 },

  // Frozen
  { category: 'frozen', name: 'McCain Frozen Fries, 425g', genericTerm: 'frozen french fries bag', price: 150 },
  { category: 'frozen', name: 'Frozen Peas, 500g', genericTerm: 'frozen green peas packet', price: 60 },
  { category: 'frozen', name: 'Amul Ice Cream, 500ml', genericTerm: 'ice cream tub', price: 150 },
  { category: 'frozen', name: 'Frozen Paratha, 5pc', genericTerm: 'frozen indian flatbread', price: 95 },

  // Grains & Pulses
  { category: 'grains', name: 'Tata Sampann Toor Dal, 1kg', genericTerm: 'yellow toor lentils', price: 140 },
  { category: 'grains', name: 'India Gate Basmati Rice, 1kg', genericTerm: 'basmati rice bag', price: 110 },
  { category: 'grains', name: 'Aashirvaad Atta, 5kg', genericTerm: 'whole wheat flour bag', price: 255 },
  { category: 'grains', name: 'Moong Dal, 500g', genericTerm: 'green moong lentils', price: 75 },
  { category: 'grains', name: 'Rajma (Kidney Beans), 500g', genericTerm: 'red kidney beans', price: 90 },
  { category: 'grains', name: 'Chana Dal, 500g', genericTerm: 'split chickpeas dal', price: 70 },
  { category: 'grains', name: 'Poha (Flattened Rice), 500g', genericTerm: 'flattened rice poha', price: 55 },
  { category: 'grains', name: 'Sooji (Semolina), 500g', genericTerm: 'semolina flour', price: 45 },
  { category: 'grains', name: 'Besan (Gram Flour), 500g', genericTerm: 'chickpea flour', price: 65 },
  { category: 'grains', name: 'Oats, 500g', genericTerm: 'rolled oats porridge', price: 95 },

  // Condiments & Spices
  { category: 'condiments', name: 'Kissan Tomato Ketchup, 500g', genericTerm: 'tomato ketchup bottle', price: 120 },
  { category: 'condiments', name: 'MDH Garam Masala, 100g', genericTerm: 'indian garam masala spice', price: 65 },
  { category: 'condiments', name: 'Fortune Sunflower Oil, 1L', genericTerm: 'sunflower cooking oil bottle', price: 150 },
  { category: 'condiments', name: 'Tata Salt, 1kg', genericTerm: 'table salt pack', price: 28 },
  { category: 'condiments', name: 'Everest Turmeric Powder, 100g', genericTerm: 'turmeric powder spice', price: 45 },
  { category: 'condiments', name: 'Everest Red Chilli Powder, 100g', genericTerm: 'red chili powder spice', price: 50 },
  { category: 'condiments', name: 'MDH Chole Masala, 100g', genericTerm: 'chole masala spice blend', price: 55 },
  { category: 'condiments', name: 'Catch Cumin Seeds, 100g', genericTerm: 'cumin seeds jeera', price: 40 },
  { category: 'condiments', name: 'Parachute Coconut Oil, 500ml', genericTerm: 'coconut oil bottle', price: 200 },
  { category: 'condiments', name: 'Heinz Mayonnaise, 300g', genericTerm: 'mayonnaise jar', price: 140 },
  { category: 'condiments', name: 'Maggi Masala, 50g', genericTerm: 'instant masala seasoning', price: 20 },
  { category: 'condiments', name: 'Ching\'s Secret Soy Sauce, 200g', genericTerm: 'soy sauce bottle', price: 55 },

  // Household
  { category: 'household', name: 'Vim Dishwash Bar', genericTerm: 'dish washing soap bar', price: 20 },
  { category: 'household', name: 'Surf Excel Detergent, 1kg', genericTerm: 'laundry detergent powder box', price: 135 },
  { category: 'household', name: 'Harpic Toilet Cleaner, 500ml', genericTerm: 'toilet cleaner bottle', price: 99 },
  { category: 'household', name: 'Colgate Toothpaste, 200g', genericTerm: 'toothpaste tube', price: 95 },
  { category: 'household', name: 'Dettol Handwash, 250ml', genericTerm: 'hand wash soap pump', price: 99 },
  { category: 'household', name: 'Ariel Detergent Pods, 8pc', genericTerm: 'laundry detergent pods', price: 175 },

  // Canned
  { category: 'canned', name: 'Canned Sweet Corn, 400g', genericTerm: 'canned sweet corn', price: 95 },
  { category: 'canned', name: 'Dabur Honey, 500g', genericTerm: 'honey jar', price: 265 },
  { category: 'canned', name: 'MTR Dal Makhani, 300g', genericTerm: 'ready to eat dal makhani', price: 75 },
  { category: 'canned', name: 'MTR Palak Paneer, 300g', genericTerm: 'ready to eat palak paneer', price: 85 },
];

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!UNSPLASH_KEY) {
  console.error("Missing UNSPLASH_ACCESS_KEY in .env");
  process.exit(1);
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchUnsplashImage(query: string): Promise<string | null> {
  try {
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        console.warn(`Unsplash rate limit hit or forbidden. Status: ${res.status}`);
      } else {
        console.warn(`Unsplash API error for query "${query}": ${res.status} ${res.statusText}`);
      }
      return null;
    }
    const data: any = await res.json();
    return data.urls?.regular || null;
  } catch (err) {
    console.error(`Fetch error for Unsplash query "${query}":`, err);
    return null;
  }
}

function generateBarcode(name: string): string {
  // Generate a deterministic 13-digit dummy barcode based on the item name
  const hash = crypto.createHash('sha256').update(name).digest('hex');
  const numStr = BigInt('0x' + hash.slice(0, 11)).toString();
  return numStr.slice(0, 13).padStart(13, '0');
}

async function seedCuratedProducts() {
  console.log('Starting curated catalog seed...');
  let successCount = 0;

  for (const item of curatedCatalog) {
    console.log(`Seeding ${item.name} (searching Unsplash for "${item.genericTerm}")...`);
    
    let imageUrl = await fetchUnsplashImage(item.genericTerm);
    
    // Unsplash requires 50 requests/hour free tier. 
    // We add a 1.2s delay to not hit immediate burst limits, though the hourly limit might be consumed.
    await delay(1200);

    const barcode = generateBarcode(item.name);

    const newProduct: Omit<Product, 'id'> = {
      name: item.name,
      brand: 'VoxCart Curated', // Generic brand
      category: item.category,
      price: item.price, // Exact curated realistic INR estimate
      source: 'curated',
      cachedAt: new Date().toISOString()
    };
    if (imageUrl) {
      newProduct.imageUrl = imageUrl;
    }

    try {
      await db.collection(PRODUCTS_COLLECTION).doc(barcode).set(newProduct);
      successCount++;
    } catch (err) {
      console.error(`Error saving product ${item.name}:`, err);
    }
  }

  console.log('\n--- Seeding Complete ---');
  console.log(`Total curated items inserted: ${successCount}/${curatedCatalog.length}`);
  console.log('Note: Prices are realistic estimates for the Indian market, not live pricing.');
  console.log('Images are generic representative stock photos via Unsplash, not exact product photography.');
}

seedCuratedProducts()
  .then(() => {
    console.log('Exiting seed script.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error during seeding:', err);
    process.exit(1);
  });
