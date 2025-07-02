import logging
from collaborative_filtering import CollaborativeFiltering
from content_based import ContentBasedRecommender
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class HybridRecommender:
    def __init__(self, jwt_token=None):
        self.NODE_API_URL = "http://localhost:8081/v1"
        self.API_KEY = "XohvCe34tnpVulX9Xx2kNjsyNbeGWuOL"
        self.JWT_TOKEN = jwt_token
        
        self.headers = {
            "x-api-key": self.API_KEY,
            "Content-Type": "application/json"
        }
        
        if jwt_token:
            self.headers["Authorization"] = f"Bearer {jwt_token}"
        
        self.cf = CollaborativeFiltering(
            self.NODE_API_URL, 
            self.API_KEY, 
            jwt_token
        )
        self.cb = ContentBasedRecommender(
            self.NODE_API_URL,
            self.API_KEY,
            jwt_token
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
                for item_id, score in cf_recs:
                    all_recs[item_id] = score * 1.5  
            
            for product in cb_recs:
                if isinstance(product, dict):
                    product_id = product.get('_id')
                    if product_id:
                        
                        current_score = all_recs.get(product_id, 0)
                        all_recs[product_id] = current_score + 1.0
            
            if not all_recs:
                return self.get_fallback_recommendations(top_n)

            sorted_recs = sorted(
                all_recs.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:top_n]
            
            product_ids = [item[0] for item in sorted_recs]
            recommendations = self.get_product_details(product_ids)
            
            purchased_ids = set(str(item['productId']) for item in purchased)
            filtered_recommendations = [
                product for product in recommendations
                if str(product.get('_id')) not in purchased_ids
            ]
            return filtered_recommendations[:top_n]
            
        except Exception as e:
            logger.error(f"Hybrid recommendation failed: {str(e)}", exc_info=True)
            return self.get_fallback_recommendations(top_n)

    def get_fallback_recommendations(self, top_n):
        try:
            response = requests.get(
                f"{self.NODE_API_URL}/products",
                params={
                    'sort': 'popularity',
                    'order': 'desc',
                    'limit': top_n
                },
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