# Full Corrected Script - April 10, 2025

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
        # Only print warning if needed for debug, otherwise return 0 silently
        # print(f"Warning: Could not convert price string '{price_str}' to float after cleaning. Input: '{cleaned_str}'. Returning 0.")
        return 0

def get_driver():
    """Initialize Microsoft Edge browser with Selenium"""
    options = EdgeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    # Using a more recent-looking user agent string
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0")
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    # Suppress verbose console logs from WebDriver/Browser
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.add_argument('--log-level=3') # Further attempt to silence logs

    try:
        # Check if running in a container or environment where paths might be different
        # You might need to explicitly provide paths if DriverManager fails
        service = EdgeService(executable_path=EdgeChromiumDriverManager().install(), log_output=os.devnull) # Attempt to silence service logs
        driver = webdriver.Edge(service=service, options=options)
        driver.set_page_load_timeout(60) # Add page load timeout
        return driver
    except Exception as e:
        print(f"Error initializing WebDriver: {e}")
        print("Ensure Edge browser is installed and WebDriver can be downloaded/accessed.")
        return None

def guess_brand_from_name(product_name):
    """Simple brand guessing based on substrings in the product name."""
    if not product_name: return "UNKNOWN"
    name_lower = product_name.lower()
    if "iphone" in name_lower: return "APPLE"
    if "ipad" in name_lower: return "APPLE"
    if "macbook" in name_lower: return "APPLE"
    if "apple watch" in name_lower: return "APPLE"
    if "rog phone" in name_lower: return "ASUS"
    if "asus" in name_lower: return "ASUS"
    if "samsung galaxy" in name_lower: return "SAMSUNG"
    if "google pixel" in name_lower: return "GOOGLE"
    if "xiaomi" in name_lower: return "XIAOMI"
    if "oppo" in name_lower: return "OPPO"
    if "realme" in name_lower: return "REALME"
    if "vivo" in name_lower: return "VIVO"
    if "nokia" in name_lower: return "NOKIA"
    if "acer" in name_lower: return "ACER"
    if "dell" in name_lower: return "DELL"
    if "hp " in name_lower or name_lower.startswith("hp"): return "HP"
    if "lenovo" in name_lower: return "LENOVO"
    if "msi" in name_lower: return "MSI"
    if "zte" in name_lower: return "ZTE"
    if "microsoft surface" in name_lower or "surface" in name_lower: return "MICROSOFT"
    if "huawei" in name_lower: return "HUAWEI"
    if "samsung" in name_lower: return "SAMSUNG"
    return "UNKNOWN"

# --- Step 1: Scrape Category Page for URLs ---
def scrape_category_urls(category_url):
    """Loads category page, clicks 'Show More', extracts unique product URLs."""
    print(f"Attempting to scrape category page for URLs: {category_url}")
    driver = get_driver()
    if not driver: return []

    unique_product_urls = set()
    try:
        driver.get(category_url)
        list_container_selector = "div.filter-sort__list-product"
        show_more_button_selector = "a.button.btn-show-more.button__show-more-product"

        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, list_container_selector))
        )
        print("Initial product list container found.")

        click_count = 0
        max_clicks = 12 # Safety limit for show more clicks
        while click_count < max_clicks:
            try:
                # Scroll down slightly first
                driver.execute_script("window.scrollBy(0, 400);")
                time.sleep(0.5) # Allow scroll to settle

                show_more_button = WebDriverWait(driver, 7).until( # Increased wait slightly
                    EC.element_to_be_clickable((By.CSS_SELECTOR, show_more_button_selector))
                )
                print(f"Found 'Show More' button. Attempting click {click_count + 1}...")
                # Try JS click first, fallback to selenium click
                try:
                    driver.execute_script("arguments[0].click();", show_more_button)
                except Exception as js_e:
                    print(f"    JS click failed ({js_e}), trying Selenium click...")
                    show_more_button.click()

                click_count += 1
                print("Waiting for more products to load...")
                # Increase sleep time slightly, maybe check product count change later
                time.sleep(4)

            except (TimeoutException, NoSuchElementException):
                print("'Show More' button not found or not clickable anymore.")
                break # Expected exit condition
            except ElementClickInterceptedException:
                 print("Warn: 'Show More' click intercepted. Trying more scroll/wait...")
                 driver.execute_script("window.scrollBy(0, 600);") # Scroll further
                 time.sleep(1.5)
            except StaleElementReferenceException:
                 print("Warn: 'Show More' button became stale. Will re-locate on next loop iteration...")
                 time.sleep(1) # Wait briefly before retry
            except Exception as e:
                 print(f"Unexpected error clicking 'Show More': {e}")
                 traceback.print_exc()
                 break # Exit loop on other errors

        if click_count == max_clicks:
             print(f"Warning: Reached maximum 'Show More' clicks ({max_clicks}). May not have all products.")

        print("Finished clicking 'Show More'. Parsing page for URLs...")
        # Allow final JS rendering
        time.sleep(3)
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        product_list_container = soup.select_one(list_container_selector)

        if not product_list_container:
            print(f"Error: Could not find container '{list_container_selector}' after loading.")
            return []

        # Find links *within* the target container
        product_items = product_list_container.select('.product-info-container.product-item')
        print(f"Found {len(product_items)} product items in '{list_container_selector}'. Extracting URLs...")

        for item in product_items:
            # Skip potential nested sale boxes (should be redundant if main container is correct)
            if item.find_parent('div', class_='boxHotSale'): continue

            link_tag = item.select_one('.product-info a.product__link')
            if link_tag and link_tag.has_attr('href'):
                href = link_tag['href']
                # Basic filtering for non-product links
                if '/compare/' in href or '/khuyen-mai/' in href or href == '#' or not href.strip(): continue
                absolute_url = urljoin(category_url, href)
                unique_product_urls.add(absolute_url)

        url_list = list(unique_product_urls)
        print(f"Extracted {len(url_list)} unique product URLs.")
        return url_list

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


# --- Step 2 & 3: Extract Product Data (Skip if No Variants) ---
def extract_product_data(url):
    """Scrapes product detail page for all info, including variants from 'list-linked'.
       Returns None if no valid variants are found."""
    print(f"  Extracting data from: {url}")
    driver = get_driver()
    if not driver: return None

    product_data = {}
    try:
        driver.get(url)
        WebDriverWait(driver, 45).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".box-product-name h1"))
        )
        time.sleep(3) # Delay for dynamic content
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # --- Extract Base Info ---
        name = "Unknown Product"
        name_element = soup.select_one('.box-product-name h1')
        if name_element: name = name_element.text.strip()

        base_price = 0
        price_element = soup.select_one('.box-product-name .price .tpt---price') or soup.select_one('.tpt---price')
        if price_element: base_price = clean_price(price_element.text)

        description = [item.get_text(strip=True) for item in soup.select('.ksp-content ul li, #cpsContentSEO li')]
        images = [a["href"] for a in soup.select('.gallery-top .swiper-slide:not(#v2Gallery) a.spotlight') if a.has_attr("href")]

        # --- Dynamic Brand Extraction ---
        brand_name = guess_brand_from_name(name)

        # --- Extract Variants EXPLICITLY from 'div.list-linked' ---
        variants = [] # Initialize empty list
        list_linked_div = soup.select_one('div.list-linked')
        if list_linked_div:
            print(f"    Found 'div.list-linked'. Processing variant links...")
            variant_links = list_linked_div.select('a.item-linked')
            print(f"      Found {len(variant_links)} variant links in 'list-linked'.")

            for link_tag in variant_links:
                strong_tags = link_tag.find_all('strong')
                price_tag = link_tag.select_one('span')

                if strong_tags and price_tag:
                    variant_type = " ".join(s.text.strip() for s in strong_tags if s.text).strip()
                    variant_type = re.sub(r'\s+', ' ', variant_type)
                    variant_price = clean_price(price_tag.text)

                    if variant_type: # Only need variant_type to be non-empty
                         variants.append({
                             "types": variant_type,
                             "price": variant_price
                         })
                # else: # Debug missing tags
                    # link_href = link_tag.get('href', 'N/A')
                    # print(f"        Warn: Skipping item in list-linked. Missing strong or span? Link href: {link_href}")

            if not variants: # Check after loop if list is still empty
                 print(f"    Warn: Found 'div.list-linked' but extracted 0 valid variants from its items.")
                 # *** DO NOT CREATE FALLBACK VARIANT HERE ***

        else:
             # If 'div.list-linked' is entirely missing
             print(f"    Warn: 'div.list-linked' not found on page: {url}.")
             # *** DO NOT CREATE FALLBACK VARIANT HERE ***


        # --- FINAL CHECK: If NO variants were found, skip this product ---
        if not variants:
            print(f"  No valid variants extracted for URL: {url}. Skipping product.")
            return None # <<< Return None to signal skipping

        # --- Assemble Final Data Structure (only if variants were found) ---
        category_name = "LAPTOP" # Assign category (make dynamic if needed)
        # ... (determine category based on URL/name if necessary) ...

        product_data = {
            "name": name,
            "base_price": base_price,
            "description": description,
            "category_name": category_name,
            "tags": [],
            "brand_name": brand_name,
            "variants": variants, # Use the non-empty variants list
            "images": images,
            "popularity": 0,
            "url": url,
        }
        print(f"  Successfully extracted data (including variants) for: {name}")
        return product_data # <<< Return the full data dictionary

    except TimeoutException:
        print(f"  Timeout waiting for elements on product page: {url}")
        return None # Return None on timeout
    except Exception as e:
        print(f"  Error during scraping {url}: {str(e)}")
        traceback.print_exc()
        return None # Return None on other errors
    finally:
        if driver:
             driver.quit()


# --- Step 4: Save Product Data ---
def save_product_data(data):
    """Formats and upserts product data based on URL."""
    if not data or "url" not in data:
        print("  Missing URL or data, skipping save.")
        return False
    target_url = data["url"]
    doc_to_save = {
        "name": data.get("name", "Unknown Product"),
        "base_price": data.get("base_price", 0),
        "description": data.get("description", []),
        "category_name": data.get("category_name", "Unknown"), # Needs conversion later
        "tags": data.get("tags", []),
        "brand_name": data.get("brand_name", "Unknown"), # Needs conversion later
        "variants": data.get("variants", []),
        "images": data.get("images", []),
        "popularity": data.get("popularity", 0),
        "url": target_url,
    }
    update_doc = {"$set": doc_to_save}
    try:
        result = collection.update_one({"url": target_url}, update_doc, upsert=True)
        if result.upserted_id: print(f"  Inserted: {doc_to_save['name']} ({doc_to_save['brand_name']})")
        elif result.modified_count > 0: print(f"  Updated: {doc_to_save['name']} ({doc_to_save['brand_name']})")
        return True
    except Exception as e:
        print(f"  Error saving to MongoDB for {doc_to_save.get('name', 'Unknown')} (URL {target_url}): {e}")
        return False

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    # Choose the category page to scrape
    # category_page_url = "https://cellphones.com.vn/mobile.html"
    category_page_url = "https://cellphones.com.vn/laptop.html" # Example for testing other categories

    # Optional: Limit the number of unique URLs processed after category scrape
    max_products_to_process = 100 # Set to a number (e.g., 5, 10, 20) to limit, or None for all

    start_time = time.time()
    print(f"\n--- Starting Scraper for Category: {category_page_url} ---")

    # Step 1: Get unique product URLs
    product_urls = scrape_category_urls(category_page_url)

    processed_count = 0
    failed_count = 0
    urls_to_process = product_urls

    # Apply limit if set
    if max_products_to_process is not None and max_products_to_process > 0:
        urls_to_process = product_urls[:max_products_to_process]
        print(f"\n--- Processing {len(urls_to_process)} URLs (Limit Applied: {max_products_to_process}) ---")
    else:
        print(f"\n--- Processing {len(urls_to_process)} URLs ---")

    # Main processing loop
    for i, url in enumerate(urls_to_process):
        print(f"\n[{i+1}/{len(urls_to_process)}] Processing URL: {url}")
        try:
            # Step 2 & 3: Extract data including variants from list-linked
            product_data = extract_product_data(url)

            if product_data:
                # Step 4: Save the extracted data
                if save_product_data(product_data):
                    processed_count += 1
                else:
                    failed_count += 1
            else:
                print(f"  Failed to extract data for URL: {url}")
                failed_count += 1 # Count extraction failures

            # Add delay between processing product pages
            print(f"  Waiting for {REQUEST_DELAY} second(s)...")
            time.sleep(REQUEST_DELAY)

        except KeyboardInterrupt:
             print("\nCtrl+C detected. Stopping scraper...")
             break # Exit loop immediately
        except Exception as e:
            # Catch unexpected errors in the main loop
            print(f"  Unhandled error processing URL {url}: {e}")
            traceback.print_exc()
            failed_count += 1
            # Optional delay even after error?
            # print(f"  Waiting for {REQUEST_DELAY} second(s) after error...")
            # time.sleep(REQUEST_DELAY)
    else: # Only executes if the loop completes without a 'break'
        print("\nFinished processing all designated URLs.")

    # Final Summary
    end_time = time.time()
    print("\n--- Scraper Finished ---")
    print(f"Total Unique URLs Found: {len(product_urls)}")
    if max_products_to_process is not None:
         print(f"Attempted to Process (Limit Applied): {len(urls_to_process)}")
    print(f"Successfully Processed/Saved: {processed_count}")
    print(f"Failed Processing/Saving: {failed_count}")
    print(f"Total Time: {end_time - start_time:.2f} seconds")