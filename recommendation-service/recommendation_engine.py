import logging
from collaborative_filtering import CollaborativeFiltering
from content_based import ContentBasedRecommender
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class HybridRecommender:
    def __init__(self):
        self.NODE_API_URL = "http://localhost:8080/v1"
        self.API_KEY = "XohvCe34tnpVulX9Xx2kNjsyNbeGWuOL"
        self.JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRjaGF1MjgwMjFAZ21haWwuY29tIiwibmFtZSI6ImNoYXV1dXV1dTEyMyIsImlhdCI6MTc0MzUxNjQxNSwiZXhwIjoxNzQzNjAyODE1fQ.CVfOA9VbXlmcSeV9o52iw7JuHUK5gF2xgkJy211dLFI"
        
        self.headers = {
            "Authorization": f"Bearer {self.JWT_TOKEN}",
            "x-api-key": self.API_KEY,
            "Content-Type": "application/json"
        }
        
        self.cf = CollaborativeFiltering(
            self.NODE_API_URL, 
            self.API_KEY, 
            self.JWT_TOKEN
        )
        self.cb = ContentBasedRecommender(
            self.NODE_API_URL,
            self.API_KEY,
            self.JWT_TOKEN
        )

    def get_purchased_products(self, user_id):
        try:
            response = requests.get(
                f"{self.NODE_API_URL}/user/{user_id}/purchased-products",
                headers=self.headers,
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching purchases: {str(e)}")
            return []

    def hybrid_recommendations(self, user_id, top_n=5):
        try:
            logger.info(f"Processing recommendations for user: {user_id}")
            
            purchased = self.get_purchased_products(user_id)
            cf_recs = []
            cb_recs = []

            if purchased:
                cf_recs = self.cf.recommend(user_id, top_n) or []
                try:
                    last_purchased = purchased[-1]['productId']
                    cb_recs = self.cb.recommend(last_purchased, top_n) or []
                except (IndexError, KeyError) as e:
                    logger.warning(f"Last purchase error: {str(e)}")

            all_recs = {}
            if cf_recs:
                all_recs = {item[0]: item[1] for item in cf_recs if item}
                
            for product in cb_recs:
                if isinstance(product, dict):
                    product_id = product.get('_id')
                    if product_id:
                        all_recs[product_id] = all_recs.get(product_id, 0) + 1

            if not all_recs:
                return self.get_fallback_recommendations(top_n)

            sorted_recs = sorted(
                all_recs.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:top_n]
            
            product_ids = [item[0] for item in sorted_recs if item]
            return self.get_product_details(product_ids)
            
        except Exception as e:
            logger.error(f"Hybrid recommendation failed: {str(e)}", exc_info=True)
            return self.get_fallback_recommendations(top_n)

    def get_fallback_recommendations(self, top_n):
        try:
            response = requests.get(
                f"{self.NODE_API_URL}/products?sort=-popularity&limit={top_n}",
                headers=self.headers,
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Fallback failed: {str(e)}")
            return []

    def get_product_details(self, product_ids):
        try:
            if not product_ids:
                return []
                
            response = requests.post(
                f"{self.NODE_API_URL}/products/batch",
                json={"ids": product_ids},
                headers=self.headers,
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Product details error: {str(e)}")
            return []