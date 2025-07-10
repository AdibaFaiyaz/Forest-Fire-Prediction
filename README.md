## 📛 Forest Fire Prediction App

A mobile application that predicts forest fire risk based on environmental parameters, using a machine learning model hosted in a Flask backend. Users can input weather data manually or select a location using a draggable map pin to assess fire risk in forested areas.

---

### 🚀 Features

* 🔍 **Fire Risk Prediction** using ML (Random Forest)
* 🧾 **User Input Form** for temperature, humidity, wind, rain, and fire indices
* 🗺️ **Interactive Map** with pin to select any location
* 🌲 **Forest Area Detection** to check if the location is a forest
* 🔥 Real-time risk level display (Low / Medium / High)
* 🧠 **Fire Safety Recommendations** based on prediction
* 🗂️ **Firestore Integration** for saving input + prediction data with timestamp
* 📱 **React Native Frontend** built with Expo

---

### 🏗️ Tech Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| Backend        | Python, Flask, Scikit-learn |
| Frontend       | React Native (Expo)         |
| ML Model       | Random Forest Classifier    |
| Database       | Firebase Firestore          |
| Map            | react-native-maps           |


---

### 📦 Folder Structure

```
Forest-Fire-Prediction/
├── backend/
│   ├── app.py
│   ├── model.pkl
│   └── ...
├── frontend/
│   ├── App.tsx
│   ├── screens/
│   ├── components/
│   └── firebase.js
└── README.md
```

---

### 📲 How to Run

#### 🔧 Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### 📱 Frontend (React Native)

```bash
cd frontend
npx expo start
```

Make sure your phone and server are on the same Wi-Fi for local requests.
