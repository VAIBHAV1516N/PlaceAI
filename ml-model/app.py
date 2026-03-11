from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Safe model loading (won't crash if .pkl files missing) ──
def load_model(filename):
    filepath = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'rb') as f:
        return pickle.load(f)

def load_all_models():
    rf  = load_model('rf_model.pkl')
    lr  = load_model('lr_model.pkl')
    dt  = load_model('dt_model.pkl')
    sc  = load_model('scaler.pkl')

    info_path = os.path.join(MODEL_DIR, 'model_info.json')
    info = {}
    if os.path.exists(info_path):
        with open(info_path) as f:
            info = json.load(f)

    models = {}
    if rf: models['random_forest']       = rf
    if lr: models['logistic_regression'] = lr
    if dt: models['decision_tree']       = dt

    return models, sc, info

MODELS, scaler, model_info = load_all_models()

# ── Routes ───────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def index():
    loaded = list(MODELS.keys())
    return jsonify({
        'service': 'PlaceAI ML API',
        'status': 'running',
        'models_loaded': loaded,
        'endpoints': ['/health', '/models', '/predict']
    })

@app.route('/health', methods=['GET'])
def health():
    loaded = list(MODELS.keys())
    return jsonify({
        'status': 'ok' if loaded else 'degraded',
        'models_loaded': loaded,
        'scaler_loaded': scaler is not None
    })

@app.route('/models', methods=['GET'])
def get_models():
    result = []
    for key, label in [
        ('random_forest',       'Random Forest'),
        ('logistic_regression', 'Logistic Regression'),
        ('decision_tree',       'Decision Tree'),
    ]:
        if key in MODELS:
            acc = round(model_info.get(key, {}).get('accuracy', 0) * 100, 2)
            result.append({'name': key, 'label': label, 'accuracy': acc})
    return jsonify({'models': result})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not MODELS or scaler is None:
            return jsonify({'error': 'Models not loaded. Check build logs — train_model.py may have failed.'}), 503

        data = request.json
        if not data:
            return jsonify({'error': 'Request body must be JSON'}), 400

        model_name = data.get('model', 'random_forest')
        if model_name not in MODELS:
            return jsonify({'error': f'Model "{model_name}" not found. Available: {list(MODELS.keys())}'}), 400

        features = [
            float(data['cgpa']),
            int(data['internships']),
            int(data['communication_skills']),
            int(data['technical_skills']),
            float(data['aptitude_score']),
            int(data['projects'])
        ]

        X = np.array([features])
        X_scaled = scaler.transform(X)
        model = MODELS[model_name]

        prediction  = int(model.predict(X_scaled)[0])
        probability = float(model.predict_proba(X_scaled)[0][1])

        importances = {}
        if hasattr(model, 'feature_importances_'):
            feature_names = model_info.get('features', [
                'cgpa', 'internships', 'communication_skills',
                'technical_skills', 'aptitude_score', 'projects'
            ])
            for name, imp in zip(feature_names, model.feature_importances_):
                importances[name] = round(float(imp) * 100, 2)

        return jsonify({
            'placed':              bool(prediction),
            'probability':         round(probability * 100, 2),
            'model_used':          model_name,
            'model_accuracy':      round(model_info.get(model_name, {}).get('accuracy', 0) * 100, 2),
            'feature_importances': importances
        })

    except KeyError as e:
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
