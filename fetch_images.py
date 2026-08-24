import json
import time
from duckduckgo_search import DDGS

products = [
    "Amul Toned Milk, 500ml", "Amul Butter, 100g", "Amul Cheese Slices, 10pc", "Curd (Dahi), 400g", "Paneer, 200g",
    "Amul Ghee, 500ml", "Mother Dairy Lassi, 200ml", "Amul Mozzarella Cheese, 200g",
    "Onion, 1kg", "Tomato, 1kg", "Potato, 1kg", "Banana, 1 dozen", "Spinach (Palak), bunch", "Apple, 1kg",
    "Coriander leaves, bunch", "Green Chilli, 100g", "Garlic, 100g", "Ginger, 100g", "Capsicum, 250g", "Lemon, 6pc",
    "Mango (Alphonso), 1kg", "Cucumber, 500g", "Carrot, 500g", "Cauliflower, 1pc",
    "Britannia Bread, 400g", "Pav, 6pc", "Whole Wheat Bread, 400g", "Rusk, 200g",
    "Parle-G Biscuits, 250g", "Lay's Chips, 52g", "Kurkure, 90g", "Haldiram's Bhujia, 200g",
    "Britannia Good Day Cookies, 150g", "Haldiram's Aloo Bhujia, 150g", "Maggi Noodles, 280g (4pc)",
    "Top Ramen Masala, 240g (4pc)", "Chips Ahoy Cookies, 100g",
    "Tata Tea Gold, 250g", "Nescafe Classic Coffee, 50g", "Real Fruit Juice, 1L", "Bisleri Water, 1L",
    "Coca-Cola, 750ml", "Paperboat Aamras, 250ml", "Horlicks, 500g", "Boost Energy Drink, 500g", "Red Bull, 250ml",
    "Chicken Breast, 500g", "Chicken Curry Cut, 1kg", "Eggs, 12pc tray", "Rohu Fish, 500g", "Mutton, 500g", "Prawn, 250g",
    "McCain Frozen Fries, 425g", "Frozen Peas, 500g", "Amul Ice Cream, 500ml", "Frozen Paratha, 5pc",
    "Tata Sampann Toor Dal, 1kg", "India Gate Basmati Rice, 1kg", "Aashirvaad Atta, 5kg", "Moong Dal, 500g",
    "Rajma (Kidney Beans), 500g", "Chana Dal, 500g", "Poha (Flattened Rice), 500g", "Sooji (Semolina), 500g",
    "Besan (Gram Flour), 500g", "Oats, 500g",
    "Kissan Tomato Ketchup, 500g", "MDH Garam Masala, 100g", "Fortune Sunflower Oil, 1L", "Tata Salt, 1kg",
    "Everest Turmeric Powder, 100g", "Everest Red Chilli Powder, 100g"
]

results = {}

with DDGS() as ddgs:
    for product in products:
        print(f"Searching for {product}...")
        try:
            # Add 'bigbasket' or 'amazon india' to query to get better product shots
            query = f"{product} product bigbasket OR amazon"
            res = list(ddgs.images(query, max_results=2))
            if res:
                results[product] = res[0]['image']
            else:
                print(f"No results for {product}")
        except Exception as e:
            print(f"Error for {product}: {e}")
        time.sleep(1) # Be nice to DDG

with open("exact_images.json", "w") as f:
    json.dump(results, f, indent=2)

print("Done. Saved to exact_images.json")
