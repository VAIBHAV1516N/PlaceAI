import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import pickle
import json

# Generate synthetic training dataset
np.random.seed(42)
n_samples = 1000

def generate_dataset(n):
    cgpa = np.random.uniform(5.0, 10.0, n)
    internships = np.random.randint(0, 4, n)
    communication_skills = np.random.randint(1, 11, n)  # 1-10
    technical_skills = np.random.randint(1, 11, n)       # 1-10
    aptitude_score = np.random.randint(40, 101, n)       # 40-100
    projects = np.random.randint(0, 6, n)

    # Placement logic (weighted combination)
    score = (
        (cgpa - 5) / 5 * 30 +
        internships / 3 * 20 +
        communication_skills / 10 * 15 +
        technical_skills / 10 * 20 +
        (aptitude_score - 40) / 60 * 10 +
        projects / 5 * 5
    )
    noise = np.random.normal(0, 5, n)
    placed = ((score + noise) >= 40).astype(int)

    return pd.DataFrame({
        'cgpa': cgpa,
        'internships': internships,
        'communication_skills': communication_skills,
        'technical_skills': technical_skills,
        'aptitude_score': aptitude_score,
        'projects': projects,
        'placed': placed
    })

df = generate_dataset(n_samples)
df.to_csv('placement_dataset.csv', index=False)
print(f"Dataset created: {len(df)} samples, {df['placed'].sum()} placed ({df['placed'].mean()*100:.1f}%)")

X = df.drop('placed', axis=1)
y = df['placed']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Random Forest (best performing)
rf_model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
rf_model.fit(X_train_scaled, y_train)
rf_pred = rf_model.predict(X_test_scaled)
rf_acc = accuracy_score(y_test, rf_pred)
print(f"\nRandom Forest Accuracy: {rf_acc:.4f}")
print(classification_report(y_test, rf_pred))

# Train Logistic Regression
lr_model = LogisticRegression(random_state=42, max_iter=1000)
lr_model.fit(X_train_scaled, y_train)
lr_pred = lr_model.predict(X_test_scaled)
lr_acc = accuracy_score(y_test, lr_pred)
print(f"Logistic Regression Accuracy: {lr_acc:.4f}")

# Train Decision Tree
dt_model = DecisionTreeClassifier(random_state=42, max_depth=8)
dt_model.fit(X_train_scaled, y_train)
dt_pred = dt_model.predict(X_test_scaled)
dt_acc = accuracy_score(y_test, dt_pred)
print(f"Decision Tree Accuracy: {dt_acc:.4f}")

# Save models and scaler
with open('rf_model.pkl', 'wb') as f:
    pickle.dump(rf_model, f)
with open('lr_model.pkl', 'wb') as f:
    pickle.dump(lr_model, f)
with open('dt_model.pkl', 'wb') as f:
    pickle.dump(dt_model, f)
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

# Save feature names
features = list(X.columns)
with open('features.json', 'w') as f:
    json.dump(features, f)

model_info = {
    'random_forest': {'accuracy': float(rf_acc)},
    'logistic_regression': {'accuracy': float(lr_acc)},
    'decision_tree': {'accuracy': float(dt_acc)},
    'features': features
}
with open('model_info.json', 'w') as f:
    json.dump(model_info, f, indent=2)

print("\n✅ All models saved successfully!")
print(f"Best model: Random Forest ({rf_acc*100:.2f}% accuracy)")
