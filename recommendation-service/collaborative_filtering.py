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

    def fetch_user_item_matrix(self):
        try:
            response = requests.get(
                f"{self.NODE_API_URL}/admin/users/purchases",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"User-item matrix error: {str(e)}")
            return {}

    def create_similarity_matrix(self, data):
        try:
            # print("------------data.keys()", data.keys())
            user_ids = list(data.keys())
            if not user_ids:
                return None, [], {}
                
            items = set()
            for purchases in data.values():
                # print("------------purchases", purchases)
                items.update(purchases.keys())
                
            matrix = np.zeros((len(user_ids), len(items)))
            # print("------------matrix", matrix)
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
            data = self.fetch_user_item_matrix()
            # print("------------data", data)
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