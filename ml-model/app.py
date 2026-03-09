from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)

# Load models and scaler
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

def load_model(filename):
    filepath = os.path.join(MODEL_DIR, filename)
    with open(filepath, 'rb') as f:
        return pickle.load(f)

rf_model = load_model('rf_model.pkl')
lr_model = load_model('lr_model.pkl')
dt_model = load_model('dt_model.pkl')
scaler = load_model('scaler.pkl')

with open(os.path.join(MODEL_DIR, 'model_info.json')) as f:
    model_info = json.load(f)

MODELS = {
    'random_forest': rf_model,
    'logistic_regression': lr_model,
    'decision_tree': dt_model
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'models_loaded': list(MODELS.keys())})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        model_name = data.get('model', 'random_forest')

        if model_name not in MODELS:
            return jsonify({'error': f'Model {model_name} not found'}), 400

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

        prediction = int(model.predict(X_scaled)[0])
        probability = float(model.predict_proba(X_scaled)[0][1])

        # Compute feature importances (only for tree-based models)
        importances = {}
        if hasattr(model, 'feature_importances_'):
            feature_names = model_info['features']
            for name, imp in zip(feature_names, model.feature_importances_):
                importances[name] = round(float(imp) * 100, 2)

        return jsonify({
            'placed': bool(prediction),
            'probability': round(probability * 100, 2),
            'model_used': model_name,
            'model_accuracy': round(model_info[model_name]['accuracy'] * 100, 2),
            'feature_importances': importances
        })

    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models', methods=['GET'])
def get_models():
    return jsonify({
        'models': [
            {'name': 'random_forest', 'label': 'Random Forest', 'accuracy': round(model_info['random_forest']['accuracy'] * 100, 2)},
            {'name': 'logistic_regression', 'label': 'Logistic Regression', 'accuracy': round(model_info['logistic_regression']['accuracy'] * 100, 2)},
            {'name': 'decision_tree', 'label': 'Decision Tree', 'accuracy': round(model_info['decision_tree']['accuracy'] * 100, 2)},
        ]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
