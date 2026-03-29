from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Initialize models on startup
from init_models import init_models
init_models()

# 1. Load the ML Pipeline and the Pet ID Map (after init_models generates them)
pipeline = joblib.load('pet_society.pkl')
pet_ids_map = joblib.load('pet-ids.pkl')


def get_db_connection():
    # Use environment variables for Render deployment
    db_host = os.getenv('DB_HOST')
    
    if db_host:
        # Production (Render) - using Aiven cloud database
        return mysql.connector.connect(
            host=db_host,
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            port=int(os.getenv('DB_PORT', 3306)),
            ssl_disabled=False
        )
    else:
        # Local development
        return mysql.connector.connect(
            host="localhost",
            port=3307,
            user="root",
            password="Aaronpagente212005",
            database="pet_society"
        )


@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json

        # Order must match: Energy, Independence, Kids, Space (only 4 features)
        user_features = [
            float(data.get('energy', 5)),
            float(data.get('independence', 5)),
            float(data.get('kids', 5)),
            float(data.get('space', 5))
        ]

        # Debug 1: See what the user sent
        print(f"--- QUIZ INPUT: {user_features} ---")

        scaled_input = pipeline.named_steps['Scaler'].transform([user_features])

        # Get distances along with indices
        distances, indices = pipeline.named_steps['model'].kneighbors(
            scaled_input,
            n_neighbors=3
        )

        # Debug 2: See the Distances
        # Lower distance = Closer match. 0.0 is a perfect 1:1 match.
        print(f"--- MATCH DISTANCES: {distances[0]} ---")
        print(f"--- MATCH INDICES: {indices[0]} ---")

        recommended_ids = [int(pet_ids_map[i]) for i in indices[0]]

        # 4. Find the 3 Nearest Neighbors
        # NearestNeighbors expects a 2D array, so we use [user_features]
        # distances is how far they are, indices is the position in our original dataframe
        distances, indices = pipeline.named_steps['model'].kneighbors(
            pipeline.named_steps['Scaler'].transform([user_features]),
            n_neighbors=3
        )

        # 5. Convert indices to actual Pet IDs from our database
        recommended_ids = [int(pet_ids_map[i]) for i in indices[0]]

        # 6. Fetch full pet details from MySQL for the matched IDs
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Using IN (%s, %s, %s) to get all 3 pets in one query
        format_strings = ','.join(['%s'] * len(recommended_ids))
        query = f"SELECT id, name, species, age, description, image_url FROM pets WHERE id IN ({format_strings})"

        cursor.execute(query, tuple(recommended_ids))
        pets = cursor.fetchall()

        cursor.close()
        db.close()

        return jsonify({
            "status": "success",
            "matches": pets
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)