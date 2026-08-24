import { db } from '../config/firebase';
import crypto from 'crypto';

function generateBarcode(name: string): string {
  const hash = crypto.createHash('sha256').update(name).digest('hex');
  const numStr = BigInt('0x' + hash.slice(0, 11)).toString();
  return numStr.slice(0, 13).padStart(13, '0');
}

const SPECIFIC_FIXES: Record<string, string> = {
  'Rohu Fish, 500g': 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=400&q=80',
  'Ginger, 100g': 'https://images.unsplash.com/photo-1596910547037-846b1980329f?w=400&q=80',
  'Maggi Masala, 50g': 'https://images.openfoodfacts.org/images/products/000/008/908/0153/front_en.8.400.jpg',
  'Kissan Tomato Ketchup, 500g': 'https://image.pollinations.ai/prompt/glass%20bottle%20of%20tomato%20ketchup%20white%20background?width=400&height=400&nologo=true&seed=42'
};

async function fixSpecificImages() {
  const names = Object.keys(SPECIFIC_FIXES);
  console.log(`Fixing ${names.length} specific broken/incorrect images...`);
  
  for (const name of names) {
    const barcode = generateBarcode(name);
    const ref = db.collection('products').doc(barcode);
    const doc = await ref.get();
    
    if (!doc.exists) { 
      console.log(`  [NOT FOUND] ${name}`); 
      continue; 
    }
    
    await ref.update({ imageUrl: SPECIFIC_FIXES[name] });
    console.log(`  [OK] ${name} -> updated to correct image`);
  }
  console.log('\nDone.');
}

fixSpecificImages().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
