import os
import pandas as pd
import mysql.connector
import joblib
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

def init_models():
    """Generate ML models if they don't exist"""
    if os.path.exists('pet_society.pkl') and os.path.exists('pet-ids.pkl'):
        print("✅ Models already exist, skipping generation")
        return
    
    print("🔄 Generating ML models...")
    
    # Connect to database
    db_host = os.getenv('DB_HOST', 'localhost')
    
    if db_host != 'localhost':
        db = mysql.connector.connect(
            host=db_host,
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            port=int(os.getenv('DB_PORT', 3306)),
            ssl_disabled=False
        )
    else:
        db = mysql.connector.connect(
            host="localhost",
            port=3307,
            user="root",
            password="Aaronpagente212005",
            database="pet_society"
        )
    
    # Fetch pet data (only 4 features available in cloud DB)
    query = "SELECT id, energy_score, independence_score, kid_friendly_score, space_needed_score FROM pets"
    df = pd.read_sql(query, db)
    db.close()
    
    # Train model with 4 features
    x = df[['energy_score', 'independence_score', 'kid_friendly_score', 'space_needed_score']]
    
    pipeline = Pipeline([
        ('Scaler', StandardScaler()),
        ("model", NearestNeighbors(metric='euclidean')),
    ])
    
    pipeline.fit(x)
    
    # Save models
    joblib.dump(pipeline, 'pet_society.pkl')
    joblib.dump(df['id'].values, 'pet-ids.pkl')
    
    print("✅ Models generated successfully!")

if __name__ == "__main__":
    init_models()
