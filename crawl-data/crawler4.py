import os
import re
import time
from datetime import datetime, timezone
from urllib.parse import urljoin
import traceback # Import traceback for better error logging

# import requests # requests imported but not used
from bs4 import BeautifulSoup
from pymongo import MongoClient

# Selenium imports
from selenium import webdriver
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException, StaleElementReferenceException

# Webdriver Manager import
from webdriver_manager.microsoft import EdgeChromiumDriverManager

from dotenv import load_dotenv

load_dotenv()

# --- Environment Variable Loading & Validation ---
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION", "products") # Default to 'products'
raw_delay = os.getenv("DELAY", "1")

try:
    # Clean potential comments from DELAY value
    clean_delay = raw_delay.split('#')[0].strip()
    REQUEST_DELAY = int(clean_delay)
    if REQUEST_DELAY < 0: REQUEST_DELAY = 1 # Ensure non-negative delay
except ValueError:
    print(f"Warning: Invalid value for DELAY ('{raw_delay}'). Using default delay of 1 second.")
    REQUEST_DELAY = 1
except Exception as e:
     print(f"Error processing DELAY variable: {e}. Using default delay of 1 second.")
     REQUEST_DELAY = 1


if not MONGO_URI or not DB_NAME:
    print("Error: MONGO_URI or DB_NAME not found in environment variables.")
    exit()

# --- MongoDB Setup ---
try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    client.admin.command('ping')
    print(f"Successfully connected to MongoDB. DB: '{DB_NAME}', Collection: '{COLLECTION_NAME}'")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    exit()


# --- Utility Functions ---
def clean_price(price_str):
    """Convert VND price string (e.g., '34.990.000₫') to numeric value"""
    if not price_str:
        return 0
    cleaned_str = re.sub(r'[^\d]', '', price_str)
    try:
        return float(cleaned_str) if cleaned_str else 0
    except ValueError:
        print(f"Warning: Could not convert price string '{price_str}' to float after cleaning. Input: '{cleaned_str}'. Returning 0.")
        return 0

def get_driver():
    """Initialize Microsoft Edge browser with Selenium"""
    options = EdgeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 Edg/100.0.1185.39")
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    try:
        service = EdgeService(executable_path=EdgeChromiumDriverManager().install())
        driver = webdriver.Edge(service=service, options=options)
        driver.set_page_load_timeout(60) # Add page load timeout
        return driver
    except Exception as e:
        print(f"Error initializing WebDriver: {e}")
        return None

def get_base_product_info(full_name):
    """Parses full product name to guess base name, storage, and brand."""
    if not full_name:
        return {'base_name': 'Unknown', 'storage': '', 'brand_guess': 'Unknown'}

    base_part = full_name.split('|')[0].strip()
    storage = ""
    base_name = base_part

    # Regex priority: Specific patterns first, then general GB/TB at end or middle
    storage_patterns = [
        r'(\d+\s*TB)$', r'(\d+\s*GB)$',
        r'(\d+\s*TB)(?=\s+\d|\s+%)', r'(\d+\s*GB)(?=\s+\d|\s+%)', # Avoid matching GB/TB in model numbers like 'A15 Bionic'
        r'(\d+\s*TB)', r'(\d+\s*GB)' # General internal match last
    ]

    for pattern in storage_patterns:
        storage_match = re.search(pattern, base_part, re.IGNORECASE)
        if storage_match:
            storage = storage_match.group(1).replace(" ", "")
            # Attempt to remove storage from base name ONLY if found at the end
            if pattern.endswith('$'):
                 # Be careful not to remove parts of the actual name
                 if base_part.endswith(storage_match.group(0)): # Check if it's really at the end
                    base_name = base_part[:storage_match.start()].strip()
            break # Stop after first (most specific) match

    name_lower = base_name.lower()
    brand_guess = "Unknown"

    # More specific brand checks first
    if name_lower.startswith("iphone"): brand_guess = "Apple"
    elif name_lower.startswith("ipad"): brand_guess = "Apple"
    elif name_lower.startswith("macbook"): brand_guess = "Apple"
    elif name_lower.startswith("apple watch"): brand_guess = "Apple"
    elif name_lower.startswith("samsung galaxy"): brand_guess = "Samsung"
    elif name_lower.startswith("xiaomi"): brand_guess = "Xiaomi"
    elif name_lower.startswith("oppo"): brand_guess = "OPPO"
    elif name_lower.startswith("realme"): brand_guess = "Realme"
    elif name_lower.startswith("vivo"): brand_guess = "Vivo"
    elif name_lower.startswith("nokia"): brand_guess = "Nokia"
    elif name_lower.startswith("asus"): brand_guess = "ASUS"
    elif name_lower.startswith("google pixel"): brand_guess = "Google"
    elif "samsung" in name_lower: brand_guess = "Samsung"
    if "macbook" in name_lower or "mac book" in name_lower:brand_guess = "Apple"
    elif "surface" in name_lower or "surface book" in name_lower or "surface laptop" in name_lower:brand_guess = "Microsoft"
    elif "acer" in name_lower:brand_guess = "Acer"
    elif "asus" in name_lower:brand_guess = "ASUS"
    elif "dell" in name_lower:brand_guess = "Dell"
    elif "hp " in name_lower or name_lower.startswith("hp") or "hewlett packard" in name_lower:brand_guess = "HP"
    elif "lenovo" in name_lower or "thinkpad" in name_lower or "ideapad" in name_lower:brand_guess = "Lenovo"
    elif "msi" in name_lower: brand_guess = "MSI"
    elif "razer" in name_lower or "blade" in name_lower:brand_guess = "Razer"
    elif "huawei" in name_lower or "matebook" in name_lower:brand_guess = "Huawei"
    elif "lg" in name_lower:brand_guess = "LG"
    elif "toshiba" in name_lower or "dynabook" in name_lower:brand_guess = "Toshiba"
    elif "samsung" in name_lower:brand_guess = "Samsung"
    elif "pixelbook" in name_lower or "chromebook" in name_lower:brand_guess = "Google"

    # Refine base_name: remove brand if it starts with it (case-insensitive)
    if brand_guess != "Unknown" and name_lower.startswith(brand_guess.lower()):
        # Find the actual length of the matched brand prefix in the original case string
        prefix_len = 0
        if base_name.lower().startswith(brand_guess.lower()):
             # Simple case: starts directly
             prefix_len = len(brand_guess)
        else:
             # Handle cases like "Samsung Galaxy S23" vs brand "Samsung"
             match = re.match(re.escape(brand_guess), base_name, re.IGNORECASE)
             if match:
                  prefix_len = len(match.group(0))

        if prefix_len > 0:
             base_name = base_name[prefix_len:].strip()


    # Further clean base_name (remove potential duplicates like "iPhone iPhone 15")
    parts = base_name.split()
    if len(parts) > 1 and parts[0].lower() == parts[1].lower():
         base_name = " ".join(parts[1:])

    # Ensure base_name is not empty after cleaning
    if not base_name:
        base_name = base_part # Fallback if cleaning removed everything

    return {'base_name': base_name.strip(), 'storage': storage, 'brand_guess': brand_guess}

# --- Step 1: Scrape Category Page ---
def scrape_category_page(category_url):
    """Loads category page, clicks 'Show More', extracts initial product data."""
    print(f"Attempting to scrape category page: {category_url}")
    driver = get_driver()
    if not driver:
        return []

    initial_product_list = []
    try:
        driver.get(category_url)
        list_container_selector = "div.filter-sort__list-product"
        show_more_button_selector = "a.button.btn-show-more.button__show-more-product"

        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, list_container_selector))
        )
        print("Initial product list container found.")

        click_count = 0
        max_clicks = 1 # Safety limit
        while click_count < max_clicks:
            try:
                driver.execute_script("window.scrollBy(0, 300);")
                time.sleep(0.5)
                show_more_button = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, show_more_button_selector))
                )
                print(f"Found 'Show More' button. Attempting click {click_count + 1}...")
                driver.execute_script("arguments[0].click();", show_more_button)
                click_count += 1
                print("Waiting for more products to load...")
                time.sleep(3) # Adjust as needed

            except (TimeoutException, NoSuchElementException):
                print("'Show More' button not found or not clickable anymore.")
                break
            except ElementClickInterceptedException:
                 print("Warn: 'Show More' click intercepted. Trying again after scroll...")
                 driver.execute_script("window.scrollBy(0, 500);")
                 time.sleep(1)
            except StaleElementReferenceException:
                 print("Warn: 'Show More' button became stale. Re-locating...")
                 time.sleep(1)
            except Exception as e:
                 print(f"Unexpected error clicking 'Show More': {e}")
                 traceback.print_exc() # Log unexpected errors during click loop
                 break

        if click_count == max_clicks:
             print(f"Warning: Reached maximum 'Show More' clicks ({max_clicks}).")

        print("Finished clicking 'Show More'. Parsing full page...")
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        product_list_container = soup.select_one(list_container_selector)

        if not product_list_container:
            print(f"Error: Could not find container '{list_container_selector}' after loading.")
            return []

        product_items = product_list_container.select('.product-info-container.product-item')
        print(f"Found {len(product_items)} product items in '{list_container_selector}'.")

        for item in product_items:
            if item.find_parent('div', class_='boxHotSale'): # Skip hot sale items
                continue

            link_tag = item.select_one('.product-info a.product__link')
            name_tag = item.select_one('.product__name h3')
            price_tag = item.select_one('.product__price--show')

            if link_tag and name_tag and price_tag:
                href = link_tag.get('href')
                full_name = name_tag.text.strip()
                price_str = price_tag.text.strip()

                if href and full_name and price_str:
                    absolute_url = urljoin(category_url, href)
                    initial_product_list.append({
                        'full_name': full_name,
                        'url': absolute_url,
                        'price_str': price_str
                    })

        print(f"Extracted initial data for {len(initial_product_list)} products.")
        return initial_product_list

    except TimeoutException:
        print(f"Timeout waiting for initial category page elements: {category_url}")
        return []
    except Exception as e:
        print(f"Error scraping category page {category_url}: {e}")
        traceback.print_exc()
        return []
    finally:
        if driver:
            driver.quit()

# --- Step 2: Consolidate Products ---
def consolidate_products(initial_product_list):
    """Groups products by base name and brand, creates variant lists."""
    print("\n--- Consolidating Products ---")
    consolidated = {}

    for item in initial_product_list:
        base_info = get_base_product_info(item['full_name'])
        base_name = base_info['base_name']
        storage = base_info['storage']
        brand = base_info['brand_guess']

        if not base_name or base_name == "Unknown":
             print(f"  Warn: Could not determine base name for '{item['full_name']}', skipping.")
             continue

        compound_key = (base_name, brand)
        price = clean_price(item['price_str'])

        if compound_key not in consolidated:
            consolidated[compound_key] = {
                "base_name": base_name,
                "brand_name": brand,
                "category_name": "Mobile", # Assuming 'Mobile' category
                "category_name": "Laptop", # Assuming 'Mobile' category
                "variants": [],
                "representative_url": item['url'] # First URL encountered for this base product
            }
            # Assign brand from the first item, subsequent items for the same key won't overwrite
            # If brand guessing needs improvement, logic could be added here

        # Add variant info (only if storage is identified)
        if storage:
            variant_exists = any(
                v['types'] == storage # Simple check by storage type
                for v in consolidated[compound_key]['variants']
            )
            if not variant_exists:
                consolidated[compound_key]['variants'].append({
                    "types": storage,
                    "price": price,
                    "url": item['url'] # Store URL per variant
                })
            # else: # Handle cases where same storage appears twice (maybe different colors?) - currently ignored
                 # print(f"  Info: Duplicate storage '{storage}' found for '{base_name} ({brand})'. Keeping first price/URL.")
        else:
             print(f"  Warn: No storage extracted for '{item['full_name']}', cannot add as variant.")

    result_list = list(consolidated.values())
    # Sort variants by price or storage? (Optional)
    for product in result_list:
        product['variants'].sort(key=lambda v: v.get('price', 0)) # Sort by price ascending

    print(f"Consolidated into {len(result_list)} base products.")
    return result_list

# --- Step 3: Extract Detail Data ---
def extract_detail_data(url):
    """Scrapes product detail page mainly for description and images."""
    print(f"    Fetching details from: {url}")
    driver = get_driver()
    if not driver:
        return {"description": [], "images": []}

    details = {"description": [], "images": []}
    try:
        driver.get(url)
        WebDriverWait(driver, 45).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".box-product-name h1, .ksp-content, #cpsContentSEO"))
        )
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        details["description"] = [item.get_text(strip=True) for item in soup.select('.ksp-content ul li, #cpsContentSEO li')]
        details["images"] = [a["href"] for a in soup.select('.gallery-top .swiper-slide:not(#v2Gallery) a.spotlight') if a.has_attr("href")]

    except TimeoutException:
        print(f"    Timeout waiting for elements on detail page: {url}")
    except Exception as e:
        print(f"    Error during detail scraping {url}: {str(e)}")
        # traceback.print_exc() # Enable for deep debugging
    finally:
        if driver:
             driver.quit()
        return details # Return gathered details even if some parts failed

# --- Step 4: Save to MongoDB ---
def save_consolidated_product(data):
    """Formats and upserts the consolidated product data based on representative URL."""
    if not data or "representative_url" not in data:
        print("  Missing representative_url in data, skipping save.")
        return False

    target_url = data["representative_url"]

    # Determine base price (e.g., price of the first variant after sorting)
    base_product_price = data['variants'][0]['price'] if data.get('variants') else 0

    # Final structure matching productSchema
    final_doc = {
        "name": data["base_name"], # Cleaned base name
        "base_price": base_product_price,
        "description": data.get("description", []),
        "category_name": data.get("category_name", "Mobile"), # Prepare for ObjectId conversion
        "tags": data.get("tags", []),
        "brand_name": data.get("brand_name", "Unknown"), # Prepare for ObjectId conversion
        "variants": data.get("variants", []), # List of {types, price, url}
        "images": data.get("images", []),
        "popularity": data.get("popularity", 0),
        "url": target_url, # Representative URL
    }

    # Remove fields not in the target schema before saving
    # (category and brand will be replaced by ObjectIds later)
    # productIndex is also not handled here
    schema_keys = ["name", "base_price", "description", "category_name", "tags",
                   "brand_name", "variants", "images", "popularity", "url"]
    # Filter data going into $set to only include expected keys (optional, good practice)
    # filtered_data_to_set = {k: final_doc[k] for k in schema_keys if k in final_doc}
    # update_doc = {"$set": filtered_data_to_set}
    update_doc = {"$set": final_doc} # Simpler: set the whole doc as constructed

    try:
        result = collection.update_one(
            {"url": target_url}, # Use representative URL as the unique identifier
            update_doc,
            upsert=True
        )
        if result.upserted_id:
            print(f"  Inserted new base product: {data['base_name']} ({data['brand_name']})")
        elif result.modified_count > 0:
            print(f"  Updated existing base product: {data['base_name']} ({data['brand_name']})")
        # else: # No need to print if matched but not modified
            # print(f"  Data for base product {data['base_name']} ({data['brand_name']}) already up-to-date.")
        return True
    except Exception as e:
        print(f"  Error saving to MongoDB for base product {data['base_name']} (URL {target_url}): {e}")
        return False


# --- MAIN EXECUTION ---
if __name__ == "__main__":
    category_page_url = "https://cellphones.com.vn/laptop.html"
    # category_page_url = "https://cellphones.com.vn/mobile.html"
    # Limit processing after consolidation (optional)
    max_base_products_to_process = 1 # Set to a number like 20 to limit, None for all

    start_time = time.time()
    print(f"\n--- Starting Scraper ---")

    # Step 1: Scrape category page for initial product list
    initial_list = scrape_category_page(category_page_url)

    processed_count = 0
    failed_count = 0
    consolidated_list = [] # Ensure defined scope

    if initial_list:
        # Step 2: Consolidate products by base name/brand
        consolidated_list = consolidate_products(initial_list)

        # Apply limit if set
        products_to_process = consolidated_list
        total_to_process = len(consolidated_list)
        if max_base_products_to_process is not None and max_base_products_to_process > 0:
             products_to_process = consolidated_list[:max_base_products_to_process]
             total_to_process = len(products_to_process)
             print(f"\n--- Processing {total_to_process} Base Products (Limit Applied: {max_base_products_to_process}) ---")
        else:
             print(f"\n--- Processing {total_to_process} Base Products ---")


        for i, base_product in enumerate(products_to_process):
            print(f"\n[{i+1}/{total_to_process}] Processing Base Product: {base_product['base_name']} ({base_product['brand_name']})")
            rep_url = base_product['representative_url']

            try:
                # Step 3: Fetch additional details (description, images)
                details = extract_detail_data(rep_url)

                # Merge details into the base product data
                base_product['description'] = details.get('description', [])
                base_product['images'] = details.get('images', [])
                base_product['tags'] = [] # Add default tags
                base_product['popularity'] = 0 # Add default popularity

                # Step 4: Save the final consolidated product data
                if save_consolidated_product(base_product):
                    processed_count += 1
                else:
                    failed_count += 1

                # Add delay between processing base products
                print(f"  Waiting for {REQUEST_DELAY} second(s)...")
                time.sleep(REQUEST_DELAY)

            except KeyboardInterrupt:
                 print("\nCtrl+C detected. Stopping scraper...")
                 break # Allow stopping mid-run
            except Exception as e:
                print(f"  Unhandled error processing base product {base_product['base_name']} (URL {rep_url}): {e}")
                traceback.print_exc()
                failed_count += 1
                # Optional delay on error
                # print(f"  Waiting for {REQUEST_DELAY} second(s) after error...")
                # time.sleep(REQUEST_DELAY)

    else:
        print("No initial products extracted from category page. Exiting.")

    end_time = time.time()
    print("\n--- Scraper Finished ---")
    print(f"Total Base Products Found (Consolidated): {len(consolidated_list)}")
    if max_base_products_to_process is not None:
         print(f"Attempted to Process (Limit Applied): {total_to_process if 'total_to_process' in locals() else 0}")
    print(f"Successfully Processed/Saved: {processed_count}")
    print(f"Failed Processing/Saving: {failed_count}")
    print(f"Total Time: {end_time - start_time:.2f} seconds")