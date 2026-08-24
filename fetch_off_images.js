const fs = require('fs');

const products = [
    "Amul Toned Milk", "Amul Butter", "Amul Cheese Slices", "Mother Dairy Lassi", "Amul Mozzarella Cheese",
    "Britannia Bread", "Parle-G Biscuits", "Lay's Chips", "Kurkure", "Haldiram's Bhujia",
    "Britannia Good Day Cookies", "Haldiram's Aloo Bhujia", "Maggi Noodles",
    "Top Ramen", "Chips Ahoy",
    "Tata Tea Gold", "Nescafe Classic Coffee", "Real Fruit Juice", "Bisleri Water",
    "Coca-Cola", "Paperboat Aamras", "Horlicks", "Boost Energy Drink", "Red Bull",
    "McCain Fries", "Amul Ice Cream", "Tata Sampann Toor Dal", "India Gate Basmati Rice", "Aashirvaad Atta",
    "Kissan Tomato Ketchup", "MDH Garam Masala", "Fortune Sunflower Oil", "Tata Salt",
    "Everest Turmeric", "Everest Red Chilli", "MDH Chole Masala", "Catch Cumin", "Parachute Coconut Oil", "Heinz Mayonnaise",
    "Maggi Masala", "Ching's Secret Soy Sauce",
    "Vim Dishwash Bar", "Surf Excel Detergent", "Harpic Toilet Cleaner", "Colgate Toothpaste",
    "Dettol Handwash", "Ariel Detergent Pods",
    "Dabur Honey", "MTR Dal Makhani", "MTR Palak Paneer"
];

const results = {};

async function fetchImages() {
    for (const product of products) {
        console.log(`Searching OFF for ${product}...`);
        try {
            const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(product)}&search_simple=1&action=process&json=1`, {
                headers: {
                    'User-Agent': 'VoxcartDemo/1.0 (mohit@example.com)'
                }
            });
            const data = await res.json();
            if (data.products && data.products.length > 0) {
                // Try to find a product that has an image
                const p = data.products.find(p => p.image_front_url || p.image_url);
                if (p) {
                    const img = p.image_front_url || p.image_url;
                    results[product] = img;
                    console.log(`Found: ${img}`);
                } else {
                    console.log(`No image for ${product}`);
                }
            } else {
                console.log(`No results for ${product}`);
            }
        } catch (e) {
            console.error(`Error for ${product}:`, e.message);
        }
        await new Promise(r => setTimeout(r, 500));
    }
    fs.writeFileSync('off_images.json', JSON.stringify(results, null, 2));
    console.log("Done.");
}

fetchImages();
