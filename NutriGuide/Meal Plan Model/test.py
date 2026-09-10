import joblib
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
    RocCurveDisplay
)

# =========================
# PATH SETUP
# =========================
BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(BASE_DIR / "xgb_food_recommender.pkl")
df = pd.read_csv(BASE_DIR / "user_food_training_data.csv")

# =========================
# PREPROCESS (MATCH TRAINING EXACTLY)
# =========================

# Drop same columns as training
drop_cols = ["user_id", "suitable"]
leakage_cols = ["vegetarian", "vegan", "eggetarian", "non_veg"]

cols_to_drop = [c for c in drop_cols + leakage_cols if c in df.columns]

X = df.drop(columns=cols_to_drop)
y = df["suitable"]

# Same categorical columns
cat_cols = [
    "gender",
    "activity_level",
    "goal",
    "diet_preference",
    "meal_type",
    "meal_context"
]

# Apply encoding
X = pd.get_dummies(X, columns=cat_cols, drop_first=True)

# =========================
# ALIGN FEATURES (CRITICAL)
# =========================
feature_cols = joblib.load(BASE_DIR / "feature_columns.pkl")
X = X.reindex(columns=feature_cols, fill_value=0)

# =========================
# TRAIN-TEST SPLIT (FIXED)
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# =========================
# PREDICTION (ONLY ON TEST)
# =========================
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# =========================
# METRICS (USE y_test ONLY)
# =========================
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)
cm = confusion_matrix(y_test, y_pred)

# =========================
# OUTPUT
# =========================
print("\n===== MODEL EVALUATION (TEST DATA) =====")
print("Accuracy:", accuracy)
print("Precision:", precision)
print("Recall:", recall)
print("F1-Score:", f1)
print("ROC-AUC:", roc_auc)

print("\nConfusion Matrix:\n", cm)

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# =========================
# ROC CURVE
# =========================
RocCurveDisplay.from_predictions(y_test, y_prob)
plt.title("ROC Curve (Test Data)")
plt.show()