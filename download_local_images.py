import os
import json
import time
import urllib.request
import urllib.error
from ddgs import DDGS

# List of 88 products
products = [
    "Amul Toned Milk, 500ml", "Amul Butter, 100g", "Amul Cheese Slices, 10pc", "Curd (Dahi), 400g", "Paneer, 200g", "Amul Ghee, 500ml", "Mother Dairy Lassi, 200ml", "Amul Mozzarella Cheese, 200g",
    "Onion, 1kg", "Tomato, 1kg", "Potato, 1kg", "Banana, 1 dozen", "Spinach (Palak), bunch", "Apple, 1kg", "Coriander leaves, bunch", "Green Chilli, 100g", "Garlic, 100g", "Ginger, 100g", "Capsicum, 250g", "Lemon, 6pc", "Mango (Alphonso), 1kg", "Cucumber, 500g", "Carrot, 500g", "Cauliflower, 1pc",
    "Britannia Bread, 400g", "Pav, 6pc", "Whole Wheat Bread, 400g", "Rusk, 200g", "Parle-G Biscuits, 250g", "Lay's Chips, 52g", "Kurkure, 90g", "Haldiram's Bhujia, 200g", "Britannia Good Day Cookies, 150g", "Haldiram's Aloo Bhujia, 150g", "Maggi Noodles, 280g (4pc)", "Top Ramen Masala, 240g (4pc)", "Chips Ahoy Cookies, 100g",
    "Tata Tea Gold, 250g", "Nescafe Classic Coffee, 50g", "Real Fruit Juice, 1L", "Bisleri Water, 1L", "Coca-Cola, 750ml", "Paperboat Aamras, 250ml", "Horlicks, 500g", "Boost Energy Drink, 500g", "Red Bull, 250ml",
    "Chicken Breast, 500g", "Chicken Curry Cut, 1kg", "Eggs, 12pc tray", "Rohu Fish, 500g", "Mutton, 500g", "Prawn, 250g",
    "McCain Frozen Fries, 425g", "Frozen Peas, 500g", "Amul Ice Cream, 500ml", "Frozen Paratha, 5pc",
    "Tata Sampann Toor Dal, 1kg", "India Gate Basmati Rice, 1kg", "Aashirvaad Atta, 5kg", "Moong Dal, 500g", "Rajma (Kidney Beans), 500g", "Chana Dal, 500g", "Poha (Flattened Rice), 500g", "Sooji (Semolina), 500g", "Besan (Gram Flour), 500g", "Oats, 500g",
    "Kissan Tomato Ketchup, 500g", "MDH Garam Masala, 100g", "Fortune Sunflower Oil, 1L", "Tata Salt, 1kg", "Everest Turmeric Powder, 100g", "Everest Red Chilli Powder, 100g", "MDH Chole Masala, 100g", "Catch Cumin Seeds, 100g", "Parachute Coconut Oil, 500ml", "Heinz Mayonnaise, 300g", "Maggi Masala, 50g", "Ching's Secret Soy Sauce, 200g",
    "Vim Dishwash Bar", "Surf Excel Detergent, 1kg", "Harpic Toilet Cleaner, 500ml", "Colgate Toothpaste, 200g", "Dettol Handwash, 250ml", "Ariel Detergent Pods, 8pc",
    "Canned Sweet Corn, 400g", "Dabur Honey, 500g", "MTR Dal Makhani, 300g", "MTR Palak Paneer, 300g"
]

output_dir = os.path.join("frontend", "public", "images", "products")
os.makedirs(output_dir, exist_ok=True)

mapping = {}
ddgs = DDGS()

def download_image(url, filename):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response, open(filename, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

for product in products:
    slug = product.replace(' ', '-').replace(',', '').replace('(', '').replace(')', '').replace("'", '').lower()
    filename = slug + ".jpg"
    filepath = os.path.join(output_dir, filename)
    local_url = f"/images/products/{filename}"
    
    if os.path.exists(filepath):
        print(f"Skipping {product}, already exists.")
        mapping[product] = local_url
        continue
        
    print(f"Searching for: {product}")
    try:
        # Search for exact bigbasket style grocery images
        results = ddgs.images(f"{product} product india grocery", max_results=3)
        downloaded = False
        for res in results:
            img_url = res.get('image')
            if img_url:
                if download_image(img_url, filepath):
                    print(f"Successfully downloaded {product}")
                    mapping[product] = local_url
                    downloaded = True
                    break
        if not downloaded:
            print(f"Could not download any image for {product}")
    except Exception as e:
        print(f"Search failed for {product}: {e}")
    time.sleep(1)

with open('src/scripts/localImagesMap.json', 'w') as f:
    json.dump(mapping, f, indent=2)

print("Done generating localImagesMap.json")
