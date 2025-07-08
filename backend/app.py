from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
model_path = 'model.pkl'
if os.path.exists(model_path):
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
else:
    model = None
    print("Warning: model.pkl not found. Please train the model first.")

@app.route('/')
def home():
    return jsonify({"message": "Forest Fire Prediction API is Running!", "status": "success"})

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Please train the model first."}), 500
    
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate all required fields
        required_fields = ['FFMC', 'DMC', 'DC', 'ISI', 'temp', 'RH', 'wind', 'rain', 'month', 'day']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        input_features = [
            float(data['FFMC']), float(data['DMC']), float(data['DC']), float(data['ISI']),
            float(data['temp']), float(data['RH']), float(data['wind']), float(data['rain']),
            int(data['month']), int(data['day'])
        ]
        
        input_array = np.array(input_features).reshape(1, -1)
        probability = float(model.predict_proba(input_array)[0][1])
        is_fire = bool(probability >= 0.5)

        # Risk level logic:
        if probability >= 0.75:
            risk_level = "High"
        elif probability >= 0.4:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return jsonify({
            "fire_risk": is_fire,
            "risk_score": round(probability, 2),
            "risk_level": risk_level,
            "status": "success"
        })
    
    except ValueError as e:
        return jsonify({"error": f"Invalid data type: {str(e)}"}), 400
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
