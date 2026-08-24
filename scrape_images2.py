import urllib.request
import urllib.parse
import re
import json
import time

products = [
    "Amul Toned Milk 500ml", "Amul Butter 100g", "Amul Cheese Slices 10pc", "Mother Dairy Lassi", "Amul Mozzarella Cheese",
    "Onion 1kg", "Tomato 1kg", "Potato 1kg", "Banana 1 dozen", "Apple 1kg",
    "Coriander leaves", "Green Chilli 100g", "Garlic 100g", "Ginger 100g", "Capsicum 250g", "Lemon 6pc",
    "Alphonso Mango", "Cucumber 500g", "Carrot 500g", "Cauliflower 1pc",
    "Britannia Bread 400g", "Pav bread", "Whole Wheat Bread 400g", "Rusk 200g",
    "Parle-G Biscuits 250g", "Lay's Chips 52g", "Kurkure 90g", "Haldiram's Bhujia 200g",
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
    "Everest Turmeric Powder", "Everest Red Chilli Powder"
]

results = {}

for product in products:
    print(f"Searching for {product}...")
    try:
        url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(product + " product india")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # DuckDuckGo HTML version might not have images directly, let's use Bing
    except Exception as e:
        print(f"Error DDG: {e}")
        
    try:
        url = "https://www.bing.com/images/search?q=" + urllib.parse.quote(product + " grocery bigbasket")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        match = re.search(r'murl&quot;:&quot;(.*?)&quot;', html)
        if match:
            results[product] = match.group(1)
            print("Found:", match.group(1))
        else:
            print("Not found in Bing")
    except Exception as e:
        print(f"Error Bing: {e}")
    
    time.sleep(1)

with open("scraped_images2.json", "w") as f:
    json.dump(results, f, indent=2)

print("Done!")
