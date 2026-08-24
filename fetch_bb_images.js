
const fs = require('fs');

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

const results = {};

async function fetchFromBlinkit() {
    for (const product of products) {
        console.log(`Searching Blinkit for ${product}...`);
        try {
            // Blinkit public search API (no auth required usually, or just scrape html)
            // Let's use Bigbasket autocomplete API which is very open
            const res = await fetch(`https://www.bigbasket.com/custompage/getsearchdata/?nc=Y&q=${encodeURIComponent(product)}`);
            const data = await res.json();
            if (data && data.json_data && data.json_data.suggestion && data.json_data.suggestion.length > 0) {
                const item = data.json_data.suggestion[0];
                if (item.p_img_url) {
                    results[product] = item.p_img_url;
                    console.log(`Found: ${item.p_img_url}`);
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
    fs.writeFileSync('bb_images.json', JSON.stringify(results, null, 2));
    console.log("Done.");
}

fetchFromBlinkit();
