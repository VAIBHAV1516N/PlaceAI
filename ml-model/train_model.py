import os
import sys
import json
import pickle

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score

# ── Work from the script's own directory ─────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def save(obj, filename):
    path = os.path.join(BASE_DIR, filename)
    with open(path, 'wb') as f:
        pickle.dump(obj, f)
    print(f"  Saved → {filename}")

print("=" * 50)
print("PlaceAI — Model Training")
print("=" * 50)

# ── Skip if models already exist (saves redeploy time) ───────
required = ['rf_model.pkl', 'lr_model.pkl', 'dt_model.pkl', 'scaler.pkl', 'model_info.json']
all_exist = all(os.path.exists(os.path.join(BASE_DIR, f)) for f in required)

if all_exist:
    print("✅ Models already exist — skipping training.")
    sys.exit(0)

# ── Generate synthetic dataset ────────────────────────────────
print("\n[1/4] Generating dataset...")
np.random.seed(42)
N = 1000

cgpa                 = np.random.uniform(5.0, 10.0, N)
internships          = np.random.randint(0, 4, N)
communication_skills = np.random.randint(1, 11, N)
technical_skills     = np.random.randint(1, 11, N)
aptitude_score       = np.random.randint(40, 101, N)
projects             = np.random.randint(0, 6, N)

score = (
    (cgpa - 5) / 5 * 30 +
    internships / 3 * 20 +
    communication_skills / 10 * 15 +
    technical_skills / 10 * 20 +
    (aptitude_score - 40) / 60 * 10 +
    projects / 5 * 5
)
noise  = np.random.normal(0, 5, N)
placed = ((score + noise) >= 40).astype(int)

df = pd.DataFrame({
    'cgpa': cgpa,
    'internships': internships,
    'communication_skills': communication_skills,
    'technical_skills': technical_skills,
    'aptitude_score': aptitude_score,
    'projects': projects,
    'placed': placed
})

print(f"  Samples: {N} | Placed: {placed.sum()} ({placed.mean()*100:.1f}%)")

# ── Prepare features ─────────────────────────────────────────
print("\n[2/4] Preprocessing...")
FEATURE_COLS = ['cgpa', 'internships', 'communication_skills',
                'technical_skills', 'aptitude_score', 'projects']

X = df[FEATURE_COLS]
y = df['placed']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)

# ── Train models ─────────────────────────────────────────────
print("\n[3/4] Training models...")

rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
rf.fit(X_train_s, y_train)
rf_acc = accuracy_score(y_test, rf.predict(X_test_s))
print(f"  Random Forest       : {rf_acc*100:.2f}%")

lr = LogisticRegression(max_iter=1000, random_state=42)
lr.fit(X_train_s, y_train)
lr_acc = accuracy_score(y_test, lr.predict(X_test_s))
print(f"  Logistic Regression : {lr_acc*100:.2f}%")

dt = DecisionTreeClassifier(max_depth=8, random_state=42)
dt.fit(X_train_s, y_train)
dt_acc = accuracy_score(y_test, dt.predict(X_test_s))
print(f"  Decision Tree       : {dt_acc*100:.2f}%")

# ── Save everything ──────────────────────────────────────────
print("\n[4/4] Saving models...")
save(rf,     'rf_model.pkl')
save(lr,     'lr_model.pkl')
save(dt,     'dt_model.pkl')
save(scaler, 'scaler.pkl')

model_info = {
    'random_forest':       {'accuracy': float(rf_acc)},
    'logistic_regression': {'accuracy': float(lr_acc)},
    'decision_tree':       {'accuracy': float(dt_acc)},
    'features': FEATURE_COLS
}

with open(os.path.join(BASE_DIR, 'model_info.json'), 'w') as f:
    json.dump(model_info, f, indent=2)
print("  Saved → model_info.json")

print("\n✅ Training complete!")
print(f"   Best: Random Forest ({rf_acc*100:.2f}%)")
print("=" * 50)
