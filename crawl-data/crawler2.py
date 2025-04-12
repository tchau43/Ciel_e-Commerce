import os
import re
import time
from datetime import datetime, timezone
from urllib.parse import urljoin # Import urljoin for robustness

import requests # requests is imported but not used directly, consider removing if not needed elsewhere
from bs4 import BeautifulSoup
from pymongo import MongoClient

# Selenium imports for Edge
from selenium import webdriver
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException # Import specific exception

# Webdriver Manager import for Edge
from webdriver_manager.microsoft import EdgeChromiumDriverManager

from dotenv import load_dotenv

load_dotenv()

# --- Environment Variable Loading ---
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION", "products") # Default to 'products' if not set
raw_delay = os.getenv("DELAY", "1")
# Split at '#' and strip spaces to get the numeric portion
clean_delay = raw_delay.split('#')[0].strip()
REQUEST_DELAY = int(clean_delay)
# --- Basic Checks ---
if not MONGO_URI:
    print("Error: MONGO_URI not found in environment variables.")
    exit()
if not DB_NAME:
    print("Error: DB_NAME not found in environment variables.")
    exit()

# MongoDB Setup
try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    # Test connection
    client.admin.command('ping')
    print(f"Successfully connected to MongoDB. DB: '{DB_NAME}', Collection: '{COLLECTION_NAME}'")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    exit()


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
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 Edg/100.0.1185.39") # Slightly updated UA
    options.add_argument("--headless") # Run headless
    options.add_argument("--disable-gpu") # Often needed for headless
    options.add_experimental_option('excludeSwitches', ['enable-logging']) # Suppress DevTools messages

    # Disable image loading to speed up page load (optional)
    # prefs = {"profile.managed_default_content_settings.images": 2}
    # options.add_experimental_option("prefs", prefs)

    try:
        service = EdgeService(executable_path=EdgeChromiumDriverManager().install())
        driver = webdriver.Edge(service=service, options=options)
        return driver
    except Exception as e:
        print(f"Error initializing WebDriver: {e}")
        return None

# --- NEW FUNCTION ---
def get_product_urls_from_category1(category_url, max_urls=20):
    """Scrapes a category page to get individual product URLs."""
    print(f"Attempting to get product URLs from: {category_url}")
    driver = get_driver()
    if not driver:
        return []

    product_urls = []
    try:
        driver.get(category_url)
        # Wait for the product list container to be present
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-list-filter"))
            # Adjust selector if needed for stability
        )
        # Optional: Add a small delay or scroll down if products load dynamically
        # time.sleep(3)
        # driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        # time.sleep(3)

        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # Find product links based on the HTML structure provided
        # Selector: finds <a> tags with class 'product__link' inside divs with class 'product-info'
        link_elements = soup.select('.product-info a.product__link')

        print(f"Found {len(link_elements)} potential product links on the page.")

        for link_tag in link_elements:
            if len(product_urls) >= max_urls:
                print(f"Reached maximum URL limit ({max_urls}).")
                break # Stop collecting once limit is reached

            href = link_tag.get('href')
            if href:
                # Ensure URL is absolute (using urljoin as a safeguard)
                absolute_url = urljoin(category_url, href)
                if absolute_url not in product_urls: # Avoid duplicates
                    product_urls.append(absolute_url)

        print(f"Extracted {len(product_urls)} unique product URLs.")
        return product_urls

    except TimeoutException:
        print(f"Timeout waiting for category page elements to load: {category_url}")
        return []
    except Exception as e:
        print(f"Error scraping category page {category_url}: {e}")
        import traceback
        traceback.print_exc()
        return []
    finally:
        if driver:
            driver.quit()

# --- NEW FUNCTION ---
def get_product_urls_from_category(category_url, max_urls=20):
    """Scrapes a category page to get individual product URLs,
       attempting to exclude 'hot sale' boxes."""
    print(f"Attempting to get product URLs from: {category_url}")
    driver = get_driver()
    if not driver:
        return []

    product_urls = []
    try:
        driver.get(category_url)
        # Wait for the main product filter/list container area to be present
        main_container_selector = ".product-list-filter" # Assuming this holds the main list
        print(f"Waiting for main container: '{main_container_selector}'")
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, main_container_selector))
        )
        # Give a brief moment for JS rendering within the container (optional)
        time.sleep(2)

        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # --- Find the main product list container ---
        main_list_container = soup.select_one(main_container_selector)

        link_elements = [] # Initialize empty list
        if main_list_container:
            print("Main container found. Searching for product links within it...")
            # --- Select product links ONLY within the main container ---
            # This selector finds <a> tags with class 'product__link'
            # that are descendants of a div with class 'product-info',
            # which itself is a descendant of the main_list_container
            link_elements = main_list_container.select('.product-info a.product__link')

            # --- Optional Refinement: Explicitly exclude boxHotSale if needed ---
            # If the above still includes hot sale items (meaning boxHotSale is *inside* product-list-filter),
            # uncomment the following lines to filter them out:
            # print(f"Initial links found: {len(link_elements)}")
            # link_elements = [link for link in link_elements if not link.find_parent('div', class_='boxHotSale')]
            # print(f"Links after excluding boxHotSale parents: {len(link_elements)}")
            # --- End Optional Refinement ---

        else:
            print(f"Warning: Main container '{main_container_selector}' not found after wait.")


        print(f"Found {len(link_elements)} potential product links in the targeted area.")

        for link_tag in link_elements:
            if len(product_urls) >= max_urls:
                print(f"Reached maximum URL limit ({max_urls}).")
                break # Stop collecting once limit is reached

            href = link_tag.get('href')
            if href:
                absolute_url = urljoin(category_url, href)
                if absolute_url not in product_urls:
                    product_urls.append(absolute_url)

        print(f"Extracted {len(product_urls)} unique product URLs.")
        return product_urls

    except TimeoutException:
        print(f"Timeout waiting for category page elements to load: {category_url}")
        return []
    except Exception as e:
        print(f"Error scraping category page {category_url}: {e}")
        import traceback
        traceback.print_exc()
        return []
    finally:
        if driver:
            driver.quit()

def extract_product_data1(url):
    """Scrapes CellphoneS product page and formats data for productSchema"""
    print(f"  Extracting data from: {url}")
    driver = get_driver()
    if not driver:
        return {} # Return empty if driver fails

    try:
        driver.get(url)
        # Increased wait time slightly for potentially slower product pages
        WebDriverWait(driver, 45).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".box-product-name h1"))
        )
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # --- Extract Raw Data ---
        product_name = "Unknown Product"
        name_element = soup.select_one('.box-product-name h1')
        if name_element:
            product_name = name_element.text.strip()

        storage = ""
        storage_match = re.search(r'(\d+\s*GB|\d+\s*TB)', product_name, re.IGNORECASE)
        if storage_match:
            storage = storage_match.group(1).replace(" ", "")

        brand_name = "Apple"
        category_name = "Smartphone"

        main_images = [a["href"] for a in soup.select('.gallery-top .swiper-slide:not(#v2Gallery) a.spotlight') if a.has_attr("href")]

        base_price = 0
        price_element = soup.select_one('.box-product-name .price .tpt---price') or soup.select_one('.tpt---price')
        if price_element:
             base_price = clean_price(price_element.text)

        specifications = [item.get_text(strip=True) for item in soup.select('.ksp-content ul li, #cpsContentSEO li')]

        # --- Process Variants (Updated) ---
        target_variants = []
        variant_items = soup.select('.list-variants .item-variant')
        print(f"    Found {len(variant_items)} variant elements.") # Debug print
        for item in variant_items:
            variant_storage = storage # Default to overall storage
            # Check if variant text itself contains storage override (example selector)
            variant_name_element = item.select_one('.item-variant-name')
            if variant_name_element:
                 variant_text = variant_name_element.text
                 variant_storage_match = re.search(r'(\d+\s*GB|\d+\s*TB)', variant_text, re.IGNORECASE)
                 if variant_storage_match:
                      variant_storage = variant_storage_match.group(1).replace(" ", "")
                      # print(f"      Found variant specific storage: {variant_storage}") # Debug

            variant_price = clean_price(item.select_one('.item-variant-price').text)

            # No longer extracting variant images
            # img_tag = item.select_one('img')
            # variant_images = [img_tag["src"]] if img_tag and img_tag.has_attr("src") else []

            # Create variant according to productSchema (without images)
            target_variants.append({
                "types": variant_storage, # Use storage as 'types'
                "price": variant_price
                # No 'images' field here anymore
            })
            # print(f"      Processed variant - types: {variant_storage}, price: {variant_price}") # Debug

        # --- Assemble Final Data Structure for productSchema ---
        data = {
            "name": product_name,
            "base_price": base_price,
            "description": specifications,
            "category_name": category_name,
            "tags": [],
            "brand_name": brand_name,
            "variants": target_variants, # Use the updated variants list
            "images": main_images, # Keep main product images
            "popularity": 0,
            "url": url,
        }
        print(f"  Successfully extracted data for: {product_name}")
        return data

    except TimeoutException:
        print(f"  Timeout waiting for elements on product page: {url}")
        return {}
    except Exception as e:
        print(f"  Error during scraping {url}: {str(e)}")
        import traceback
        traceback.print_exc() # Print full traceback for debugging product page errors
        return {}
    finally:
        if driver:
             driver.quit()

def extract_product_data(url):
    """Scrapes CellphoneS product page and formats data for productSchema,
       extracting storage variants from the 'list-linked' section."""
    print(f"  Extracting data from: {url}")
    driver = get_driver()
    if not driver:
        return {}

    try:
        driver.get(url)
        WebDriverWait(driver, 45).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".box-product-name h1")) # Wait for product title
        )
        # Also wait for the linked storage options section to likely be present
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.list-linked"))
        )

        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # --- Extract Raw Data ---
        product_name_full = "Unknown Product" # Keep the full name including default storage
        name_element = soup.select_one('.box-product-name h1')
        if name_element:
            product_name_full = name_element.text.strip()
            # Extract base name without storage/specifics for potential use (optional)
            # product_name_base = product_name_full.split('|')[0].strip()

        # Brand/Category are still hardcoded based on the category page context
        brand_name = "Samsung"
        category_name = "Smartphone"

        main_images = [a["href"] for a in soup.select('.gallery-top .swiper-slide:not(#v2Gallery) a.spotlight') if a.has_attr("href")]

        # Base price shown prominently on the page (often matches the 'active' variant)
        base_price = 0
        price_element = soup.select_one('.box-product-name .price .tpt---price') or soup.select_one('.tpt---price')
        if price_element:
             base_price = clean_price(price_element.text)

        # Description from specifications section
        specifications = [item.get_text(strip=True) for item in soup.select('.ksp-content ul li, #cpsContentSEO li')]

        # --- Process Variants (FROM list-linked) ---
        target_variants = []
        # Select the 'a' tags within the 'div.list-linked' container
        storage_variant_links = soup.select('div.list-linked a.item-linked')
        print(f"    Found {len(storage_variant_links)} storage variant links in 'list-linked'.")

        for link_tag in storage_variant_links:
            storage_element = link_tag.select_one('strong')
            price_element = link_tag.select_one('span')

            if storage_element and price_element:
                variant_storage = storage_element.text.strip()
                # Simple cleanup for storage format (e.g., remove extra spaces)
                variant_storage = re.sub(r'\s+', '', variant_storage)

                variant_price = clean_price(price_element.text)

                if variant_storage and variant_price > 0: # Basic validation
                    target_variants.append({
                        "types": variant_storage, # Storage size (e.g., "256GB", "1TB")
                        "price": variant_price
                        # No images field
                    })
                    # print(f"      Processed storage variant - types: {variant_storage}, price: {variant_price}") # Debug
            else:
                print(f"      Warning: Could not find storage or price element within a link in 'list-linked'. Link: {link_tag.prettify()}")


        # --- Assemble Final Data Structure for productSchema ---
        data = {
            "name": product_name_full, # Use the full name from H1
            "base_price": base_price, # Price prominently displayed
            "description": specifications,
            "category_name": category_name,
            "tags": [],
            "brand_name": brand_name,
            "variants": target_variants, # Use storage variants from list-linked
            "images": main_images,
            "popularity": 0,
            "url": url, # The URL of the specific page scraped (e.g., the 256GB version)
        }
        print(f"  Successfully extracted data for: {product_name_full}")
        return data

    except TimeoutException:
        print(f"  Timeout waiting for elements on product page: {url}")
        return {}
    except Exception as e:
        print(f"  Error during scraping {url}: {str(e)}")
        import traceback
        traceback.print_exc()
        return {}
    finally:
        if driver:
             driver.quit()

def save_to_mongodb(data):
    """Upsert product data based on URL"""
    if not data or "url" not in data:
        print("  Missing URL in data, skipping save.")
        return False # Indicate failure

    target_url = data["url"]
    update_doc = {"$set": data}

    try:
        # print(f"  Attempting to save/update product with URL: {target_url}") # Verbose
        result = collection.update_one(
            {"url": target_url},
            update_doc,
            upsert=True
        )
        # Less verbose success message
        if result.upserted_id:
            print(f"  Inserted new document for URL: {target_url}")
        elif result.matched_count > 0:
            # Only print if modified? result.modified_count > 0
            print(f"  Updated existing document for URL: {target_url}")
        else:
             print(f"  No document inserted or updated for URL: {target_url}") # Should not happen
        return True # Indicate success
    except Exception as e:
        print(f"  Error saving to MongoDB for URL {target_url}: {e}")
        return False # Indicate failure


# --- MAIN EXECUTION ---
if __name__ == "__main__":
    # category_page_url = "https://cellphones.com.vn/mobile/apple.html"
    category_page_url = "https://cellphones.com.vn/mobile/samsung.html"
    max_products_to_scrape = 20 # Limit as requested

    start_time = time.time()
    print(f"\n--- Starting Scraper ---")

    # Step 1: Get Product URLs from Category Page
    product_urls = get_product_urls_from_category(category_page_url, max_products_to_scrape)

    successful_scrapes = 0
    failed_scrapes = 0

    # Step 2: Process Each Product URL
    if product_urls:
        print(f"\n--- Processing {len(product_urls)} Product URLs ---")
        for i, url in enumerate(product_urls):
            print(f"\n[{i+1}/{len(product_urls)}] Processing URL: {url}")
            try:
                product_data = extract_product_data(url)
                if product_data:
                    if save_to_mongodb(product_data):
                        successful_scrapes += 1
                    else:
                        failed_scrapes += 1 # Count save failures
                else:
                    failed_scrapes += 1 # Count extraction failures

                # Add delay between requests
                print(f"  Waiting for {REQUEST_DELAY} second(s)...")
                time.sleep(REQUEST_DELAY)

            except Exception as e:
                print(f"  Unhandled error processing URL {url}: {e}")
                failed_scrapes += 1
                import traceback
                traceback.print_exc()
                # Optionally add delay even after failure
                # time.sleep(REQUEST_DELAY)

    else:
        print("No product URLs found or extracted. Exiting.")

    end_time = time.time()
    print("\n--- Scraper Finished ---")
    print(f"Total URLs Processed: {len(product_urls)}")
    print(f"Successful Scrapes/Saves: {successful_scrapes}")
    print(f"Failed Scrapes/Saves: {failed_scrapes}")
    print(f"Total Time: {end_time - start_time:.2f} seconds")