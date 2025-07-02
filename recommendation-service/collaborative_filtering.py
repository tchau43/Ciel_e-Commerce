import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import requests
import logging

logger = logging.getLogger(__name__)

class CollaborativeFiltering:
    def __init__(self, node_api_url, api_key, jwt_token):
        self.NODE_API_URL = node_api_url
        self.API_KEY = api_key
        self.JWT_TOKEN = jwt_token
        self.headers = {
            "Authorization": f"Bearer {jwt_token}",
            "x-api-key": api_key
        }

    def fetch_user_item_matrix(self, user_id):
        try:
            user_purchases = requests.get(
                f"{self.NODE_API_URL}/user/{user_id}/purchased-products",
                headers=self.headers,
                timeout=10
            )
            user_purchases.raise_for_status()
            user_data = user_purchases.json()

            category_ids = list(set(
                [str(item['categoryId']) for item in user_data
                if item.get('categoryId')]
            ))

            if not category_ids:
                return {}

            similar_products = requests.get(
                f"{self.NODE_API_URL}/productsByCategory",
                params={'category': ','.join(category_ids)},
                headers=self.headers,
                timeout=10
            )
            similar_products.raise_for_status()
            products_data = similar_products.json()

            matrix_data = {
                user_id: {str(item['productId']): 1 for item in user_data}
            }

            for product in products_data:
                pseudo_user_id = f"category_{product.get('category')}"
                if pseudo_user_id not in matrix_data:
                    matrix_data[pseudo_user_id] = {}
                matrix_data[pseudo_user_id][str(product['_id'])] = 1

            return matrix_data

        except Exception as e:
            logger.error(f"User-item matrix error: {str(e)}")
            return {}

    def create_similarity_matrix(self, data):
        try:
            user_ids = list(data.keys())
            if not user_ids:
                return None, [], {}
                
            items = set()
            for purchases in data.values():
                items.update(purchases.keys())
                
            matrix = np.zeros((len(user_ids), len(items)))
            item_index = {item: idx for idx, item in enumerate(items)}
            
            for u_idx, user_id in enumerate(user_ids):
                for item_id, count in data[user_id].items():
                    matrix[u_idx, item_index[item_id]] = count
                    
            return cosine_similarity(matrix), user_ids, item_index
        except Exception as e:
            logger.error(f"Matrix creation error: {str(e)}")
            return None, [], {}

    def recommend(self, user_id, k=5):
        try:
            data = self.fetch_user_item_matrix(user_id)
            if not data:
                return []
                
            sim_matrix, user_ids, item_index = self.create_similarity_matrix(data)
            if sim_matrix is None:
                return []
                
            try:
                user_idx = user_ids.index(user_id)
            except ValueError:
                return []
                
            similar_users = np.argsort(sim_matrix[user_idx])[::-1][1:k+1]
            recommendations = {}
            
            for sim_user_idx in similar_users:
                sim_user_id = user_ids[sim_user_idx]
                for item_id, count in data[sim_user_id].items():
                    if item_id not in data[user_id]:
                        recommendations[item_id] = recommendations.get(item_id, 0) + \
                            count * sim_matrix[user_idx, sim_user_idx]
                            
            return sorted(recommendations.items(), key=lambda x: x[1], reverse=True)[:k]
        except Exception as e:
            logger.error(f"Collaborative filtering error: {str(e)}")
            return []