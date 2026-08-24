const google = require('googlethis');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const products = [
    "Amul Toned Milk", "Amul Butter", "Amul Cheese Slices", "Mother Dairy Lassi", "Amul Mozzarella Cheese",
    "Onion 1kg", "Tomato 1kg", "Potato 1kg", "Banana 1 dozen", "Palak bunch", "Apple 1kg",
    "Coriander leaves", "Green Chilli", "Garlic", "Ginger", "Capsicum", "Lemon",
    "Alphonso Mango", "Cucumber", "Carrot", "Cauliflower",
    "Britannia Bread", "Pav bread", "Whole Wheat Bread", "Rusk",
    "Parle-G Biscuits", "Lay's Chips", "Kurkure", "Haldiram's Bhujia",
    "Britannia Good Day Cookies", "Haldiram's Aloo Bhujia", "Maggi Noodles",
    "Top Ramen Masala", "Chips Ahoy Cookies",
    "Tata Tea Gold", "Nescafe Classic Coffee", "Real Fruit Juice", "Bisleri Water",
    "Coca-Cola", "Paperboat Aamras", "Horlicks", "Boost Energy Drink", "Red Bull",
    "Chicken Breast", "Chicken Curry Cut", "Eggs", "Rohu Fish", "Mutton", "Prawn",
    "McCain Frozen Fries", "Frozen Peas", "Amul Ice Cream", "Frozen Paratha",
    "Tata Sampann Toor Dal", "India Gate Basmati Rice", "Aashirvaad Atta", "Moong Dal",
    "Rajma", "Chana Dal", "Poha", "Sooji",
    "Besan", "Oats",
    "Kissan Tomato Ketchup", "MDH Garam Masala", "Fortune Sunflower Oil", "Tata Salt",
    "Everest Turmeric Powder", "Everest Red Chilli Powder",
    "MDH Chole Masala", "Catch Cumin Seeds", "Parachute Coconut Oil", "Heinz Mayonnaise",
    "Maggi Masala", "Ching's Secret Soy Sauce",
    "Vim Dishwash Bar", "Surf Excel Detergent", "Harpic Toilet Cleaner", "Colgate Toothpaste",
    "Dettol Handwash", "Ariel Detergent Pods",
    "Canned Sweet Corn", "Dabur Honey", "MTR Dal Makhani", "MTR Palak Paneer"
];

const outputDir = path.join(__dirname, 'frontend', 'public', 'images', 'products');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });
            } else {
                resolve(false);
            }
        }).on('error', () => resolve(false));
    });
}

async function fetchGoogleImages() {
    const mapping = {};
    for (const product of products) {
        const slug = product.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const filename = `${slug}.jpg`;
        const filepath = path.join(outputDir, filename);
        const localUrl = `/images/products/${filename}`;
        
        if (fs.existsSync(filepath)) {
            console.log(`Skipping ${product}, already exists.`);
            mapping[product] = localUrl;
            continue;
        }

        console.log(`Searching for: ${product}`);
        try {
            const images = await google.image(`${product} india product`, { safe: false });
            let downloaded = false;
            
            for (let i = 0; i < Math.min(5, images.length); i++) {
                const img = images[i];
                if (img.url && (img.url.endsWith('.jpg') || img.url.endsWith('.png') || img.url.endsWith('.jpeg'))) {
                    const success = await downloadImage(img.url, filepath);
                    if (success) {
                        console.log(`Downloaded ${product}`);
                        mapping[product] = localUrl;
                        downloaded = true;
                        break;
                    }
                }
            }
            if (!downloaded) {
                console.log(`Failed to download ${product}`);
            }
        } catch (e) {
            console.error(`Error searching ${product}:`, e.message);
        }
        // Small delay to prevent rate limit
        await new Promise(r => setTimeout(r, 1000));
    }
    
    fs.writeFileSync(path.join(__dirname, 'src', 'scripts', 'localImagesMap.json'), JSON.stringify(mapping, null, 2));
    console.log("Done.");
}

fetchGoogleImages();
