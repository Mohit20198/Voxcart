import { db } from '../config/firebase';
import crypto from 'crypto';

function generateBarcode(name: string): string {
  const hash = crypto.createHash('sha256').update(name).digest('hex');
  const numStr = BigInt('0x' + hash.slice(0, 11)).toString();
  return numStr.slice(0, 13).padStart(13, '0');
}

// Every product -> specific permanent Unsplash photo URL (no expiring params)
const PERMANENT_IMAGES: Record<string, string> = {
  // DAIRY
  'Amul Toned Milk, 500ml':         'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  'Amul Butter, 100g':              'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
  'Amul Cheese Slices, 10pc':       'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80',
  'Curd (Dahi), 400g':              'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  'Paneer, 200g':                   'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
  'Amul Ghee, 500ml':               'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  'Mother Dairy Lassi, 200ml':      'https://images.unsplash.com/photo-1553361371-9b09c5b24e91?w=400&q=80',
  'Amul Mozzarella Cheese, 200g':   'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=400&q=80',

  // PRODUCE
  'Onion, 1kg':                     'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&q=80',
  'Tomato, 1kg':                    'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400&q=80',
  'Potato, 1kg':                    'https://images.unsplash.com/photo-1518977676405-d4b8e4ffe7b3?w=400&q=80',
  'Banana, 1 dozen':                'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
  'Spinach (Palak), bunch':         'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  'Apple, 1kg':                     'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
  'Coriander leaves, bunch':        'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80',
  'Green Chilli, 100g':             'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=400&q=80',
  'Garlic, 100g':                   'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&q=80',
  'Ginger, 100g':                   'https://images.unsplash.com/photo-1573551089778-46a7abc39d9f?w=400&q=80',
  'Capsicum, 250g':                 'https://images.unsplash.com/photo-1563246788-5b5bb1477e9e?w=400&q=80',
  'Lemon, 6pc':                     'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&q=80',
  'Mango (Alphonso), 1kg':          'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80',
  'Cucumber, 500g':                 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?w=400&q=80',
  'Carrot, 500g':                   'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80',
  'Cauliflower, 1pc':               'https://images.unsplash.com/photo-1568584711075-5d326e41b91c?w=400&q=80',

  // BAKERY
  'Britannia Bread, 400g':          'https://images.unsplash.com/photo-1598373182200-6d93b5e6b985?w=400&q=80',
  'Pav, 6pc':                       'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'Whole Wheat Bread, 400g':        'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80',
  'Rusk, 200g':                     'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',

  // SNACKS
  'Parle-G Biscuits, 250g':         'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  "Lay's Chips, 52g":               'https://images.unsplash.com/photo-1566478989014-d1a21eb7af57?w=400&q=80',
  'Kurkure, 90g':                   'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=400&q=80',
  "Haldiram's Bhujia, 200g":        'https://images.unsplash.com/photo-1599061767264-4ed87d536c5e?w=400&q=80',
  'Britannia Good Day Cookies, 150g':'https://images.unsplash.com/photo-1499636027994-c44e0e7b47d4?w=400&q=80',
  "Haldiram's Aloo Bhujia, 150g":   'https://images.unsplash.com/photo-1599061767264-4ed87d536c5e?w=400&q=80',
  'Maggi Noodles, 280g (4pc)':      'https://images.unsplash.com/photo-1569718040-5a5e4de9e6e9?w=400&q=80',
  'Top Ramen Masala, 240g (4pc)':   'https://images.unsplash.com/photo-1569718040-5a5e4de9e6e9?w=400&q=80',
  'Chips Ahoy Cookies, 100g':       'https://images.unsplash.com/photo-1499636027994-c44e0e7b47d4?w=400&q=80',

  // BEVERAGES
  'Tata Tea Gold, 250g':            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  'Nescafe Classic Coffee, 50g':    'https://images.unsplash.com/photo-1559496417-e2f75e3c00cf?w=400&q=80',
  'Real Fruit Juice, 1L':           'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&q=80',
  'Bisleri Water, 1L':              'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80',
  'Coca-Cola, 750ml':               'https://images.unsplash.com/photo-1581636625402-29c6ab6c9e1d?w=400&q=80',
  'Paperboat Aamras, 250ml':        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  'Horlicks, 500g':                 'https://images.unsplash.com/photo-1572490122132-bb5e697c2c5e?w=400&q=80',
  'Boost Energy Drink, 500g':       'https://images.unsplash.com/photo-1572490122132-bb5e697c2c5e?w=400&q=80',
  'Red Bull, 250ml':                'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',

  // MEAT & EGGS
  'Chicken Breast, 500g':           'https://images.unsplash.com/photo-1604503468163-852b93c26b26?w=400&q=80',
  'Chicken Curry Cut, 1kg':         'https://images.unsplash.com/photo-1599942774949-6c8e01f01e7c?w=400&q=80',
  'Eggs, 12pc tray':                'https://images.unsplash.com/photo-1569288052389-7db59cfd16ee?w=400&q=80',
  'Rohu Fish, 500g':                'https://images.unsplash.com/photo-1518789831826-84e81e0e5e5e?w=400&q=80',
  'Mutton, 500g':                   'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
  'Prawn, 250g':                    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&q=80',

  // FROZEN
  'McCain Frozen Fries, 425g':      'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80',
  'Frozen Peas, 500g':              'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&q=80',
  'Amul Ice Cream, 500ml':          'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80',
  'Frozen Paratha, 5pc':            'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80',

  // GRAINS & PULSES
  'Tata Sampann Toor Dal, 1kg':     'https://images.unsplash.com/photo-1585996058529-e94f07e1b2c4?w=400&q=80',
  'India Gate Basmati Rice, 1kg':   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  'Aashirvaad Atta, 5kg':           'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  'Moong Dal, 500g':                'https://images.unsplash.com/photo-1585996058529-e94f07e1b2c4?w=400&q=80',
  'Rajma (Kidney Beans), 500g':     'https://images.unsplash.com/photo-1548350695-f13a8e7ede6a?w=400&q=80',
  'Chana Dal, 500g':                'https://images.unsplash.com/photo-1585996058529-e94f07e1b2c4?w=400&q=80',
  'Poha (Flattened Rice), 500g':    'https://images.unsplash.com/photo-1605197161470-5d6b17d3b243?w=400&q=80',
  'Sooji (Semolina), 500g':         'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  'Besan (Gram Flour), 500g':       'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  'Oats, 500g':                     'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=400&q=80',

  // CONDIMENTS & SPICES
  'Kissan Tomato Ketchup, 500g':    'https://images.unsplash.com/photo-1627308595171-d1b5d67129c4?w=400&q=80',
  'MDH Garam Masala, 100g':         'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=80',
  'Fortune Sunflower Oil, 1L':      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  'Tata Salt, 1kg':                 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=400&q=80',
  'Everest Turmeric Powder, 100g':  'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80',
  'Everest Red Chilli Powder, 100g':'https://images.unsplash.com/photo-1589990804-4e5db71b9fd2?w=400&q=80',
  'MDH Chole Masala, 100g':         'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=80',
  'Catch Cumin Seeds, 100g':        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  'Parachute Coconut Oil, 500ml':   'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  'Heinz Mayonnaise, 300g':         'https://images.unsplash.com/photo-1604467715878-83e57e8bc129?w=400&q=80',
  'Maggi Masala, 50g':              'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=80',
  "Ching's Secret Soy Sauce, 200g": 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80',

  // HOUSEHOLD
  'Vim Dishwash Bar':               'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=400&q=80',
  'Surf Excel Detergent, 1kg':      'https://images.unsplash.com/photo-1621873495884-845a939892d4?w=400&q=80',
  'Harpic Toilet Cleaner, 500ml':   'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=400&q=80',
  'Colgate Toothpaste, 200g':       'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=400&q=80',
  'Dettol Handwash, 250ml':         'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80',
  'Ariel Detergent Pods, 8pc':      'https://images.unsplash.com/photo-1621873495884-845a939892d4?w=400&q=80',

  // CANNED
  'Canned Sweet Corn, 400g':        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',
  'Dabur Honey, 500g':              'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
  'MTR Dal Makhani, 300g':          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80',
  'MTR Palak Paneer, 300g':         'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
};

async function fixAllImages() {
  const names = Object.keys(PERMANENT_IMAGES);
  console.log(`Updating ${names.length} products with permanent images...`);
  let ok = 0, missing = 0;
  for (const name of names) {
    const barcode = generateBarcode(name);
    const ref = db.collection('products').doc(barcode);
    const doc = await ref.get();
    if (!doc.exists) { console.log(`  [NOT FOUND] ${name}`); missing++; continue; }
    await ref.update({ imageUrl: PERMANENT_IMAGES[name] });
    console.log(`  [OK] ${name}`);
    ok++;
  }
  console.log(`\nDone. Updated: ${ok}, Not found: ${missing}`);
}

fixAllImages().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
