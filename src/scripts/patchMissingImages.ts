/**
 * Patch script — backfills imageUrl for products that missed Unsplash rate limit.
 * Uses stable Unsplash photo URLs (direct, no API key needed).
 */
import { db } from '../config/firebase';
import crypto from 'crypto';

function generateBarcode(name: string): string {
  const hash = crypto.createHash('sha256').update(name).digest('hex');
  const numStr = BigInt('0x' + hash.slice(0, 11)).toString();
  return numStr.slice(0, 13).padStart(13, '0');
}

const imagePatches: Array<{ name: string; imageUrl: string }> = [
  { name: 'Mutton, 500g', imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80' },
  { name: 'Prawn, 250g', imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&q=80' },
  { name: 'McCain Frozen Fries, 425g', imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80' },
  { name: 'Frozen Peas, 500g', imageUrl: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&q=80' },
  { name: 'Amul Ice Cream, 500ml', imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80' },
  { name: 'Frozen Paratha, 5pc', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80' },
  { name: 'Tata Sampann Toor Dal, 1kg', imageUrl: 'https://images.unsplash.com/photo-1585996058529-e94f07e1b2c4?w=400&q=80' },
  { name: 'India Gate Basmati Rice, 1kg', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80' },
  { name: 'Aashirvaad Atta, 5kg', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80' },
  { name: 'Moong Dal, 500g', imageUrl: 'https://images.unsplash.com/photo-1585996058529-e94f07e1b2c4?w=400&q=80' },
  { name: 'Rajma (Kidney Beans), 500g', imageUrl: 'https://images.unsplash.com/photo-1548350695-f13a8e7ede6a?w=400&q=80' },
  { name: 'Chana Dal, 500g', imageUrl: 'https://images.unsplash.com/photo-1585996058529-e94f07e1b2c4?w=400&q=80' },
  { name: 'Poha (Flattened Rice), 500g', imageUrl: 'https://images.unsplash.com/photo-1605197161470-5d6b17d3b243?w=400&q=80' },
  { name: 'Sooji (Semolina), 500g', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80' },
  { name: 'Besan (Gram Flour), 500g', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80' },
  { name: 'Oats, 500g', imageUrl: 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=400&q=80' },
  { name: 'Kissan Tomato Ketchup, 500g', imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d67129c4?w=400&q=80' },
  { name: 'MDH Garam Masala, 100g', imageUrl: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=80' },
  { name: 'Fortune Sunflower Oil, 1L', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
  { name: 'Tata Salt, 1kg', imageUrl: 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=400&q=80' },
  { name: 'Everest Turmeric Powder, 100g', imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80' },
  { name: 'Everest Red Chilli Powder, 100g', imageUrl: 'https://images.unsplash.com/photo-1589990804-4e5db71b9fd2?w=400&q=80' },
  { name: 'MDH Chole Masala, 100g', imageUrl: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=80' },
  { name: 'Catch Cumin Seeds, 100g', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
  { name: 'Parachute Coconut Oil, 500ml', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
  { name: 'Heinz Mayonnaise, 300g', imageUrl: 'https://images.unsplash.com/photo-1604467715878-83e57e8bc129?w=400&q=80' },
  { name: 'Maggi Masala, 50g', imageUrl: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=80' },
  { name: "Ching's Secret Soy Sauce, 200g", imageUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80' },
  { name: 'Vim Dishwash Bar', imageUrl: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=400&q=80' },
  { name: 'Surf Excel Detergent, 1kg', imageUrl: 'https://images.unsplash.com/photo-1621873495884-845a939892d4?w=400&q=80' },
  { name: 'Harpic Toilet Cleaner, 500ml', imageUrl: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=400&q=80' },
  { name: 'Colgate Toothpaste, 200g', imageUrl: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=400&q=80' },
  { name: 'Dettol Handwash, 250ml', imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80' },
  { name: 'Ariel Detergent Pods, 8pc', imageUrl: 'https://images.unsplash.com/photo-1621873495884-845a939892d4?w=400&q=80' },
  { name: 'Canned Sweet Corn, 400g', imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80' },
  { name: 'Dabur Honey, 500g', imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80' },
  { name: 'MTR Dal Makhani, 300g', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80' },
  { name: 'MTR Palak Paneer, 300g', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
];

async function patchImages() {
  console.log('Patching ' + imagePatches.length + ' products...');
  let updated = 0, skipped = 0;
  for (const patch of imagePatches) {
    const barcode = generateBarcode(patch.name);
    const ref = db.collection('products').doc(barcode);
    const doc = await ref.get();
    if (!doc.exists) { console.log('  [SKIP not found] ' + patch.name); skipped++; continue; }
    if (doc.data()?.imageUrl) { console.log('  [SKIP has image] ' + patch.name); skipped++; continue; }
    await ref.update({ imageUrl: patch.imageUrl });
    console.log('  [OK] ' + patch.name);
    updated++;
  }
  console.log('Done. Updated: ' + updated + ', Skipped: ' + skipped);
}

patchImages().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
