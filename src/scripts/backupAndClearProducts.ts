import * as fs from 'fs';
import * as path from 'path';
import { db } from '../config/firebase';

const PRODUCTS_COLLECTION = 'products';

async function run() {
  console.log('Fetching existing products...');
  const snapshot = await db.collection(PRODUCTS_COLLECTION).get();
  
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const backupPath = path.join(__dirname, '../../backup_off_products.json');
  fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
  console.log(`Backed up ${products.length} products to ${backupPath}`);
  
  console.log('Deleting existing products...');
  const batch = db.batch();
  let count = 0;
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Successfully deleted ${count} products.`);
  } else {
    console.log('No products to delete.');
  }
}

run()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
