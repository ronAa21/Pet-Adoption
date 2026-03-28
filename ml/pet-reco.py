import pandas as pd
import mysql.connector
import joblib
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

db = mysql.connector.connect(
    host="localhost",
    port="3307",
    user="root",
    password="Aaronpagente212005",
    database="pet_society"
)

query = "select id, energy_score, independence_score, kid_friendly_score, space_needed_score, shedding_score FROM pets"
df = pd.read_sql(query, db)

x = df[['energy_score', 'independence_score', 'kid_friendly_score', 'space_needed_score', 'shedding_score']]

pipeline = Pipeline([
    ('Scaler', StandardScaler()),
    ("model", NearestNeighbors(metric='euclidean')),
])

pipeline.fit(x)

joblib.dump(pipeline, 'pet_society.pkl')
joblib.dump(df['id'].values, 'pet-ids.pkl')

print("Pet Recommender logic is mapped and saved, Boss!")