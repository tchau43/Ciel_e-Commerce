from flask import Flask, request, jsonify
from recommendation_engine import HybridRecommender
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)

@app.route('/recommendations', methods=['GET'])
def recommendations():
    user_id = request.args.get('userId')
    auth_header = request.headers.get('Authorization')
    
    if not user_id:
        return jsonify({"error": "userId parameter is required"}), 400
        
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization header with Bearer token is required"}), 401
        
    jwt_token = auth_header.split(' ')[1]
    
    try:
        recommender = HybridRecommender(jwt_token)
        recs = recommender.hybrid_recommendations(user_id)
        return jsonify(recs)
    except Exception as e:
        app.logger.error(f"API Error: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)