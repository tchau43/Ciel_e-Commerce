from flask import Flask, request, jsonify
from recommendation_engine import HybridRecommender
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
recommender = HybridRecommender()

@app.route('/recommendations', methods=['GET'])
def recommendations():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "userId parameter is required"}), 400

    try:
        recs = recommender.hybrid_recommendations(user_id)
        return jsonify(recs)
    except Exception as e:
        app.logger.error(f"API Error: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)