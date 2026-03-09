# 🎓 Student Placement Prediction System

A full-stack MERN application with Machine Learning integration that predicts student placement probability.

## 🏗 Project Structure

```
placement-prediction/
├── frontend/          # React.js app
├── backend/           # Node.js + Express API
└── ml-model/          # Python Flask ML API
```

## ⚙️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js, Recharts, React Router    |
| Backend     | Node.js, Express.js, MongoDB        |
| ML Service  | Python, Flask, Scikit-learn         |
| Database    | MongoDB                             |
| Auth        | JWT (JSON Web Tokens)               |

---

## 🚀 Setup & Running

### 1. ML Model (Python Flask API)

```bash
cd ml-model
pip install -r requirements.txt

# Train the models first (generates .pkl files)
python train_model.py

# Start the Flask API
python app.py
# Runs on http://localhost:5001
```

### 2. Backend (Node.js)

```bash
cd backend
npm install

# Make sure MongoDB is running locally OR update .env with your MongoDB URI
# Edit .env file with your settings

npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend (React)

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## 🔑 Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/placement_db
JWT_SECRET=your_super_secret_key
ML_API_URL=http://localhost:5001
CLIENT_URL=http://localhost:3000
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/auth/register    | Register user     |
| POST   | /api/auth/login       | Login             |
| GET    | /api/auth/me          | Get current user  |

### Prediction
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| POST   | /api/prediction       | Make prediction       |
| GET    | /api/prediction/my    | User's prediction history |
| GET    | /api/prediction/models | Available ML models  |

### Admin (Admin only)
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/admin/stats      | Dashboard stats     |
| GET    | /api/admin/predictions | All predictions    |
| GET    | /api/admin/students   | All students        |

### ML Service (Flask)
| Method | Endpoint   | Description         |
|--------|------------|---------------------|
| POST   | /predict   | Run ML prediction   |
| GET    | /models    | List models         |
| GET    | /health    | Health check        |

---

## 📊 ML Models

Three algorithms are trained on synthetic placement data:

- **Random Forest** – Best accuracy, ~85%+
- **Logistic Regression** – Fast, interpretable
- **Decision Tree** – Explainable predictions

### Input Features
| Feature              | Range     |
|----------------------|-----------|
| CGPA                 | 5.0–10.0  |
| Internships          | 0–5       |
| Communication Skills | 1–10      |
| Technical Skills     | 1–10      |
| Aptitude Score       | 40–100    |
| Projects             | 0–10      |

---

## 👤 Creating an Admin User

After registering, manually update the user role in MongoDB:

```js
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 🌟 Features

- ✅ Student registration & login (JWT auth)
- ✅ Interactive prediction form with sliders
- ✅ Real-time ML predictions (3 models)
- ✅ Probability percentage + feature importance
- ✅ Actionable improvement insights
- ✅ Prediction history tracking
- ✅ Admin dashboard with charts & analytics
- ✅ MongoDB storage for all data
