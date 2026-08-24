import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import json
import time
import re

products = [
    "Amul Toned Milk", "Amul Butter 100g", "Amul Cheese Slices", "Mother Dairy Lassi", "Amul Mozzarella Cheese",
    "Onion 1kg", "Tomato 1kg", "Potato 1kg", "Banana 1 dozen", "Palak bunch", "Apple 1kg",
    "Coriander leaves", "Green Chilli 100g", "Garlic 100g", "Ginger 100g", "Capsicum 250g", "Lemon 6pc",
    "Alphonso Mango", "Cucumber 500g", "Carrot 500g", "Cauliflower 1pc",
    "Britannia Bread 400g", "Pav bread", "Whole Wheat Bread 400g", "Rusk 200g",
    "Parle-G Biscuits", "Lay's Chips 52g", "Kurkure 90g", "Haldiram's Bhujia 200g",
    "Britannia Good Day Cookies", "Haldiram's Aloo Bhujia 150g", "Maggi Noodles 280g",
    "Top Ramen Masala", "Chips Ahoy Cookies",
    "Tata Tea Gold", "Nescafe Classic Coffee 50g", "Real Fruit Juice 1L", "Bisleri Water 1L",
    "Coca-Cola 750ml", "Paperboat Aamras 250ml", "Horlicks 500g", "Boost Energy Drink 500g", "Red Bull 250ml",
    "Raw Chicken Breast", "Raw Chicken Curry Cut", "Eggs tray", "Rohu Fish", "Raw Mutton", "Raw Prawn",
    "McCain Frozen Fries 425g", "Frozen Peas 500g", "Amul Ice Cream 500ml", "Frozen Paratha",
    "Tata Sampann Toor Dal", "India Gate Basmati Rice", "Aashirvaad Atta 5kg", "Moong Dal",
    "Rajma Kidney Beans", "Chana Dal", "Poha Flattened Rice", "Sooji Semolina",
    "Besan Gram Flour", "Oats",
    "Kissan Tomato Ketchup", "MDH Garam Masala", "Fortune Sunflower Oil", "Tata Salt",
    "Everest Turmeric Powder", "Everest Red Chilli Powder",
    "MDH Chole Masala", "Catch Cumin Seeds", "Parachute Coconut Oil", "Heinz Mayonnaise",
    "Maggi Masala", "Ching's Secret Soy Sauce",
    "Vim Dishwash Bar", "Surf Excel Detergent", "Harpic Toilet Cleaner", "Colgate Toothpaste",
    "Dettol Handwash", "Ariel Detergent Pods",
    "Canned Sweet Corn", "Dabur Honey 500g", "MTR Dal Makhani", "MTR Palak Paneer"
]

results = {}

for product in products:
    print(f"Searching for {product}...")
    try:
        url = "https://images.search.yahoo.com/search/images?p=" + urllib.parse.quote(product + " product india")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read()
        soup = BeautifulSoup(html, 'html.parser')
        img_tags = soup.find_all('img', attrs={'data-src': True})
        if img_tags:
            results[product] = img_tags[0]['data-src']
            print("Found:", img_tags[0]['data-src'])
        else:
            print("Not found")
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(0.5)

with open("scraped_images.json", "w") as f:
    json.dump(results, f, indent=2)

print("Done!")
