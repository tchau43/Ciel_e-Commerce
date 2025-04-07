import os
import re
import time
from datetime import datetime, timezone
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

load_dotenv()

# MongoDB Setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
collection = db[os.getenv("COLLECTION")]

def clean_price(price_str):
    """Convert VND price string to numeric value"""
    return float(re.sub(r'[^\d.]', '', price_str)) if price_str else 0

def get_driver():
    """Initialize Chrome browser with Selenium 4 syntax"""
    options = webdriver.ChromeOptions()
    # Headless mode is disabled for debugging; enable it later if needed
    # options.add_argument("--headless=new")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    # Add a user-agent to mimic a real browser
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    service = Service(executable_path=ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)

def extract_product_data(url):
    """Main scraping function for CellphoneS.vn product pages"""
    driver = get_driver()
    try:
        driver.get(url)
        
        # Handle potential overlays (e.g., ads or anti-bot modals)
        try:
            close_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, ".close, .btn-close, [aria-label='close']"))  # Common close button selectors
            )
            close_button.click()
            print("Closed overlay")
            time.sleep(1)  # Brief pause to let the page settle
        except:
            print("No overlay found or unable to close")

        # Wait for the product name or a specific product container
        # Adjust this selector after inspecting the page
        element = WebDriverWait(driver, 30).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".block-product-info h1"))  # Example selector
        )
        
        # Extract data
        data = {}
        
        # Extract product name
        name_element = element
        data["name"] = name_element.text.strip() if name_element else "Unknown Product"
        
        # Extract product ID (inspect the page for the correct attribute or element)
        try:
            product_id_element = driver.find_element(By.CSS_SELECTOR, "[data-product-id], .product-id")  # Adjust this
            data["product_id"] = product_id_element.get_attribute("data-product-id") or product_id_element.text or "unknown-id"
        except:
            data["product_id"] = "unknown-id"
        
        # Extract variants (e.g., color/storage options)
        try:
            variant_elements = driver.find_elements(By.CSS_SELECTOR, ".product-variant-item, .variant-option")  # Adjust this
            data["variants"] = [variant.text.strip() for variant in variant_elements if variant.text.strip()]
        except:
            data["variants"] = []
        
        return data
    except Exception as e:
        print(f"Error during scraping: {str(e)}")
        print("Page source for debugging:")
        print(driver.page_source[:2000])  # Limit output
        driver.save_screenshot("debug_screenshot.png")
        print("Screenshot saved as debug_screenshot.png")
        return {}
    finally:
        driver.quit()

def save_to_mongodb(data):
    """Upsert product data with timestamp"""
    if not data or "product_id" not in data:
        print("Missing product_id in data")
        return
    
    data["createdAt"] = datetime.now(timezone.utc)
    data["updatedAt"] = datetime.now(timezone.utc)
    
    collection.update_one(
        {"product_id": data["product_id"]},
        {"$set": data},
        upsert=True
    )

if __name__ == "__main__":
    product_url = "https://cellphones.com.vn/iphone-16-pro-max.html"
    
    try:
        product_data = extract_product_data(product_url)
        if product_data and "product_id" in product_data:
            save_to_mongodb(product_data)
            print(f"Successfully saved: {product_data['name']}")
            print(f"Found {len(product_data['variants'])} variants")
        else:
            print("Failed to extract product data or missing product_id")
    except Exception as e:
        print(f"Error scraping {product_url}: {str(e)}")