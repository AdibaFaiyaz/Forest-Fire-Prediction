import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
import os

# Load the dataset
df = pd.read_csv('data/forestfires.csv')

# Create binary target: 1 = fire happened, 0 = no fire
df['fire'] = (df['area'] > 0).astype(int)

# Encode month and day (convert text to numbers)
df['month'] = LabelEncoder().fit_transform(df['month'])
df['day'] = LabelEncoder().fit_transform(df['day'])

# Select features and target
features = ['FFMC', 'DMC', 'DC', 'ISI', 'temp', 'RH', 'wind', 'rain', 'month', 'day']
X = df[features]
y = df['fire']

# Split the data (train 80%, test 20%)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save the trained model
model_path = 'model.pkl'
with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print("Model trained and saved as model.pkl")
