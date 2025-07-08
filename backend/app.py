from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# Load the trained model
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/')
def home():
    return "Forest Fire Prediction API is Running!"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    try:
        input_features = [
            data['FFMC'], data['DMC'], data['DC'], data['ISI'],
            data['temp'], data['RH'], data['wind'], data['rain'],
            data['month'], data['day']
        ]
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400

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
        "risk_level": risk_level
    })

if __name__ == '__main__':
    app.run(debug=True)
