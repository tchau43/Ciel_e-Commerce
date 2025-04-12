import os
import re
import time
from datetime import datetime, timezone
from urllib.parse import urljoin
import traceback # Import traceback for better error logging

import requests # requests imported but not used
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
    clean_delay = raw_delay.split('#')[0].strip()
    REQUEST_DELAY = int(clean_delay)
    if REQUEST_DELAY < 0: REQUEST_DELAY = 1 # Ensure non-negative delay
except ValueError:
    print(f"Warning: Invalid value for DELAY ('{raw_delay}'). Using default delay of 1 second.")
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
    # (Keep the existing clean_price function - it's good)
    if not price_str:
        return 0
    cleaned_str = re.sub(r'[^\d]', '', price_str)
    try:
        return float(cleaned_str) if cleaned_str else 0
    except ValueError:
        print(f"Warning: Could not convert price string '{price_str}' to float after cleaning. Input: '{cleaned_str}'. Returning 0.")
        return 0

def get_driver():
    # (Keep the existing get_driver function)
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

    # Remove trailing info like "| Chính hãng VN/A"
    base_part = full_name.split('|')[0].strip()

    # Try to extract storage (more robustly checking end and middle)
    storage = ""
    # Regex priority: TB at end, GB at end, TB internal, GB internal
    storage_patterns = [r'(\d+\s*TB)$', r'(\d+\s*GB)$', r'(\d+\s*TB)(?=\s)', r'(\d+\s*GB)(?=\s)']
    base_name = base_part
    for pattern in storage_patterns:
        storage_match = re.search(pattern, base_part, re.IGNORECASE)
        if storage_match:
            storage = storage_match.group(1).replace(" ", "")
            # Attempt to remove storage from base name if found at the end
            if pattern.endswith('$'):
                 base_name = base_part[:storage_match.start()].strip()
            # If found internally, might be harder to clean base_name reliably, leave as is for now
            break # Stop after first match

    # Basic brand guessing from base_name
    # Convert to lowercase for matching
    name_lower = base_name.lower()
    brand_guess = "Unknown"
    if name_lower.startswith("iphone"):
        brand_guess = "Apple"
    elif name_lower.startswith("ipad"):
        brand_guess = "Apple"
    elif name_lower.startswith("macbook"):
        brand_guess = "Apple"
    elif name_lower.startswith("samsung galaxy"):
        brand_guess = "Samsung"
    elif name_lower.startswith("xiaomi"):
        brand_guess = "Xiaomi"
    elif name_lower.startswith("oppo"):
        brand_guess = "OPPO"
    elif name_lower.startswith("realme"):
        brand_guess = "Realme"
    elif name_lower.startswith("vivo"):
        brand_guess = "Vivo"
    # Add more brands as needed...

    # Refine base_name: remove brand if it starts with it
    if brand_guess != "Unknown" and name_lower.startswith(brand_guess.lower()):
        base_name = base_name[len(brand_guess):].strip()

    # Further clean base_name (remove potential duplicates like "iPhone iPhone 15")
    parts = base_name.split()
    if len(parts) > 1 and parts[0].lower() == parts[1].lower():
         base_name = " ".join(parts[1:])


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
        # Wait for the main product list container area
        list_container_selector = "div.filter-sort__list-product"
        show_more_button_selector = "a.button.btn-show-more.button__show-more-product"

        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, list_container_selector))
        )
        print("Initial product list container found.")

        # --- Handle "Show More" button ---
        click_count = 0
        max_clicks = 50 # Safety limit to prevent infinite loops
        while click_count < max_clicks:
            try:
                # Scroll down slightly to ensure button is in view
                driver.execute_script("window.scrollBy(0, 300);")
                time.sleep(0.5) # Brief pause

                show_more_button = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, show_more_button_selector))
                )
                print(f"Found 'Show More' button. Attempting click {click_count + 1}...")
                # Use JavaScript click as it's often more reliable
                driver.execute_script("arguments[0].click();", show_more_button)
                click_count += 1
                # Wait for content to potentially load - adjust sleep time as needed
                print("Waiting for more products to load...")
                time.sleep(3) # Pause after click for content loading

            except (TimeoutException, NoSuchElementException):
                print("'Show More' button not found or not clickable anymore.")
                break # Exit loop if button disappears or isn't found quickly
            except ElementClickInterceptedException:
                 print("Warn: 'Show More' click intercepted. Trying again after scroll...")
                 driver.execute_script("window.scrollBy(0, 500);") # Scroll more if intercepted
                 time.sleep(1)
            except StaleElementReferenceException:
                 print("Warn: 'Show More' button became stale. Re-locating...")
                 time.sleep(1) # Wait briefly before retry
            except Exception as e:
                 print(f"Unexpected error clicking 'Show More': {e}")
                 break # Exit loop on other errors

        if click_count == max_clicks:
             print(f"Warning: Reached maximum 'Show More' clicks ({max_clicks}).")

        print("Finished clicking 'Show More'. Parsing full page...")
        # --- Parse Fully Loaded Page ---
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        product_list_container = soup.select_one(list_container_selector)

        if not product_list_container:
            print(f"Error: Could not find container '{list_container_selector}' after loading.")
            return []

        # Select product items *within* the target container
        product_items = product_list_container.select('.product-info-container.product-item')
        print(f"Found {len(product_items)} product items in '{list_container_selector}'.")

        for item in product_items:
            # Skip items that might be nested within a hot sale box INSIDE the main list (if any)
            if item.find_parent('div', class_='boxHotSale'):
                continue

            link_tag = item.select_one('.product-info a.product__link')
            name_tag = item.select_one('.product__name h3')
            price_tag = item.select_one('.product__price--show') # Get the final price shown

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
    """Groups products by base name and creates variant lists."""
    print("\n--- Consolidating Products ---")
    consolidated = {}

    for item in initial_product_list:
        base_info = get_base_product_info(item['full_name'])
        base_name = base_info['base_name']
        storage = base_info['storage']
        brand = base_info['brand_guess'] # Use the guessed brand

        # Use base_name AND brand as a compound key to differentiate same names from different brands
        compound_key = (base_name, brand)

        # Clean the price
        price = clean_price(item['price_str'])

        if compound_key not in consolidated:
            consolidated[compound_key] = {
                "base_name": base_name,
                "brand_name": brand, # Store determined brand
                "category_name": "Mobile", # General category for this page
                "variants": [],
                "representative_url": item['url'] # Store one URL to fetch details later
            }

        # Add variant info (avoid duplicates based on storage and price)
        variant_exists = any(
            v['types'] == storage and v['price'] == price
            for v in consolidated[compound_key]['variants']
        )
        if not variant_exists and storage: # Only add if storage was found
            consolidated[compound_key]['variants'].append({
                "types": storage,
                "price": price,
                "url": item['url'] # Store URL per variant
            })
        elif not storage:
             print(f"  Warn: No storage extracted for '{item['full_name']}', skipping variant add.")

        # Update brand if a more specific one is found later (simple approach: keep first guess)
        # Or implement logic to choose the "best" brand guess if multiple items yield different guesses

    # Convert dictionary back to a list
    result_list = list(consolidated.values())
    print(f"Consolidated into {len(result_list)} base products.")
    return result_list

# --- Step 3: Extract Detail Data (Simplified) ---
def extract_detail_data(url):
    """Scrapes product detail page mainly for description and images."""
    print(f"    Fetching details from: {url}")
    driver = get_driver()
    if not driver:
        return {"description": [], "images": []} # Return empty structure

    try:
        driver.get(url)
        # Wait for essential elements like title or description area
        WebDriverWait(driver, 45).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".box-product-name h1, .ksp-content, #cpsContentSEO"))
        )
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # Description from specifications section
        description = [item.get_text(strip=True) for item in soup.select('.ksp-content ul li, #cpsContentSEO li')]

        # Main product images
        images = [a["href"] for a in soup.select('.gallery-top .swiper-slide:not(#v2Gallery) a.spotlight') if a.has_attr("href")]

        # Optionally re-verify brand here if needed from detail page elements

        return {"description": description, "images": images}

    except TimeoutException:
        print(f"    Timeout waiting for elements on detail page: {url}")
        return {"description": [], "images": []}
    except Exception as e:
        print(f"    Error during detail scraping {url}: {str(e)}")
        # traceback.print_exc() # Enable for deep debugging
        return {"description": [], "images": []}
    finally:
        if driver:
             driver.quit()

# --- Step 4: Save to MongoDB ---
def save_consolidated_product(data):
    """Upserts the consolidated product data based on representative URL."""
    if not data or "representative_url" not in data:
        print("  Missing representative_url in data, skipping save.")
        return False

    target_url = data["representative_url"] # Use this as the unique ID for upsert

    # Final structure matching productSchema
    final_doc = {
        "name": data["base_name"],
        "base_price": data['variants'][0]['price'] if data['variants'] else 0, # Use price of first variant as base? Or needs logic
        "description": data.get("description", []), # Get from merged data
        "category_name": data["category_name"], # Will need conversion to ObjectId later
        "tags": data.get("tags", []),
        "brand_name": data["brand_name"], # Will need conversion to ObjectId later
        "variants": data["variants"],
        "images": data.get("images", []), # Get from merged data
        "popularity": data.get("popularity", 0),
        "url": target_url, # Store the representative URL
    }

    update_doc = {"$set": final_doc}

    try:
        result = collection.update_one(
            {"url": target_url}, # Use representative URL to find the document
            update_doc,
            upsert=True
        )
        if result.upserted_id:
            print(f"  Inserted new base product: {data['base_name']} ({data['brand_name']})")
        elif result.modified_count > 0: # Only report if actually modified
            print(f"  Updated existing base product: {data['base_name']} ({data['brand_name']})")
        elif result.matched_count > 0:
            print(f"  Data for base product {data['base_name']} ({data['brand_name']}) already up-to-date.")
        return True
    except Exception as e:
        print(f"  Error saving to MongoDB for base product {data['base_name']} (URL {target_url}): {e}")
        return False


# --- MAIN EXECUTION ---
if __name__ == "__main__":
    category_page_url = "https://cellphones.com.vn/mobile.html"
    # max_products_to_scrape = 20 # This limit is now applied during category scrape

    start_time = time.time()
    print(f"\n--- Starting Scraper ---")

    # Step 1: Scrape category page for initial product list
    initial_list = scrape_category_page(category_page_url)

    processed_count = 0
    failed_count = 0

    if initial_list:
        # Step 2: Consolidate products by base name/brand
        consolidated_list = consolidate_products(initial_list)

        print(f"\n--- Processing {len(consolidated_list)} Base Products ---")
        for i, base_product in enumerate(consolidated_list):
            print(f"\n[{i+1}/{len(consolidated_list)}] Processing Base Product: {base_product['base_name']} ({base_product['brand_name']})")
            rep_url = base_product['representative_url']

            try:
                # Step 3: Fetch additional details (description, images)
                details = extract_detail_data(rep_url)

                # Merge details into the base product data
                base_product['description'] = details.get('description', [])
                base_product['images'] = details.get('images', [])
                # Add other fields required by schema with defaults
                base_product['tags'] = []
                base_product['popularity'] = 0

                # Step 4: Save the final consolidated product data
                if save_consolidated_product(base_product):
                    processed_count += 1
                else:
                    failed_count += 1

                # Add delay between processing base products
                print(f"  Waiting for {REQUEST_DELAY} second(s)...")
                time.sleep(REQUEST_DELAY)

            except Exception as e:
                print(f"  Unhandled error processing base product {base_product['base_name']} (URL {rep_url}): {e}")
                traceback.print_exc()
                failed_count += 1
                # time.sleep(REQUEST_DELAY) # Optional delay on error

    else:
        print("No initial products extracted from category page. Exiting.")

    end_time = time.time()
    print("\n--- Scraper Finished ---")
    # Note: Counts are now per base product processed
    print(f"Total Base Products Found: {len(consolidated_list) if 'consolidated_list' in locals() else 0}")
    print(f"Successfully Processed/Saved: {processed_count}")
    print(f"Failed Processing/Saving: {failed_count}")
    print(f"Total Time: {end_time - start_time:.2f} seconds")