from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import requests
import logging
import numpy as np

logger = logging.getLogger(__name__)

class ContentBasedRecommender:
    def __init__(self, node_api_url, api_key, jwt_token):
        self.NODE_API_URL = node_api_url
        self.API_KEY = api_key
        self.JWT_TOKEN = jwt_token
        self.headers = {
            "Authorization": f"Bearer {jwt_token}",
            "x-api-key": api_key
        }
        self.tfidf = TfidfVectorizer(stop_words='english')
        self.cosine_sim = None
        self.products = []
        self.product_ids = []

    def fetch_products(self):
        try:
            response = requests.get(
                f"{self.NODE_API_URL}/products",
                headers=self.headers,
                timeout=5
            )
            response.raise_for_status()
            self.products = response.json()
            self.product_ids = [str(p['_id']) for p in self.products]
            return self.products
        except Exception as e:
            logger.error(f"Product fetch error: {str(e)}")
            return []

    def prepare_similarity_matrix(self):
        try:
            products = self.fetch_products()
            if not products:
                return None
                
            descriptions = [
                f"{p.get('name', '')} {p.get('description', '')} {p.get('category', {}).get('name', '')}"
                for p in products
            ]
            
            tfidf_matrix = self.tfidf.fit_transform(descriptions)
            self.cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
            return self.cosine_sim
        except Exception as e:
            logger.error(f"Similarity matrix error: {str(e)}")
            return None

    def recommend(self, product_id, k=5):
        try:
            if self.cosine_sim is None:
                if not self.prepare_similarity_matrix():
                    return []
            
            product_id = str(product_id)
            try:
                idx = self.product_ids.index(product_id)
            except ValueError:
                logger.warning(f"Product {product_id} not found")
                return []
            
            # Get similarity scores for the product
            sim_scores = list(enumerate(self.cosine_sim[idx]))
            # Sort products by similarity score
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            # Get top k most similar products (excluding itself)
            sim_scores = [s for s in sim_scores if s[0] != idx][:k]
            
            # Get product indices and return product data
            product_indices = [i[0] for i in sim_scores]
            recommended_products = [self.products[i] for i in product_indices]
            
            return recommended_products

        except Exception as e:
            logger.error(f"Content-based error: {str(e)}")
            return []