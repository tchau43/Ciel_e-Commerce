# recommendation_engine.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:8080/v1")
NODE_API_URL = "http://localhost:8080/v1"
API_KEY = "XohvCe34tnpVulX9Xx2kNjsyNbeGWuOL"  # Add if you implement API security
# API_KEY = os.getenv("API_KEY")  # Add if you implement API security
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRjaGF1MjgwMjFAZ21haWwuY29tIiwibmFtZSI6ImNoYXV1dXV1dTEyMyIsImlhdCI6MTc0MzMyNTI2MSwiZXhwIjoxNzQzNDExNjYxfQ.NYCNPtq7vLH5xL9LZ8EbkZelbjHO9etx7Cww2bdXt14"
def generate_recommendations(user_id):
    print("user_id", user_id)
    try:
        headers = {
            "Authorization": f"Bearer {JWT_TOKEN}",
            "x-api-key": API_KEY
        }
        
        # Get purchases
        purchased_response = requests.get(
            f"{NODE_API_URL}/user/{user_id}/purchased-products",
            headers=headers
        )
        
        if purchased_response.status_code != 200:
            print("purchased_response.status_code", purchased_response.status_code)
            return []

        purchased_data = purchased_response.json()
        print("purchased_data", purchased_data)
        
        # Fallback for new users
        if not purchased_data:
            products_response = requests.get(
                f"{NODE_API_URL}/products",
                headers=headers
            )
            return products_response.json()[:5]

        # Get categories
        category_ids = list(set(
            [str(item['categoryId']) for item in purchased_data  # Ensure string
            if item.get('categoryId')
        ]))

        # Get category products
        products_response = requests.get(
            f"{NODE_API_URL}/productsByCategory",
            params={'category': ','.join(category_ids)},
            headers=headers
        )
        
        if products_response.status_code != 200:
            return []

        # Filter recommendations
        purchased_ids = [str(item['productId']) for item in purchased_data]
        recommendations = [
            product for product in products_response.json()
            if str(product['_id']) not in purchased_ids
        ]

        return recommendations[:5]

    except Exception as e:
        print(f"Error: {str(e)}")
        return []