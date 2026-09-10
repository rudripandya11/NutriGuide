import joblib
import matplotlib.pyplot as plt
from pathlib import Path

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
# PATH
# =========================
BASE_DIR = Path(__file__).resolve().parent

# =========================
# LOAD MODEL + TEST DATA
# =========================
model = joblib.load(BASE_DIR / "xgb_exercise_recommender.pkl")
X_test = joblib.load(BASE_DIR / "X_test.pkl")
y_test = joblib.load(BASE_DIR / "y_test.pkl")

# =========================
# PREDICT
# =========================
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# =========================
# METRICS
# =========================
print("\n===== FINAL MODEL EVALUATION =====")

print("Accuracy:", accuracy_score(y_test, y_pred))
print("Precision:", precision_score(y_test, y_pred))
print("Recall:", recall_score(y_test, y_pred))
print("F1-Score:", f1_score(y_test, y_pred))
print("ROC-AUC:", roc_auc_score(y_test, y_prob))

print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# =========================
# ROC CURVE
# =========================
RocCurveDisplay.from_predictions(y_test, y_prob)
plt.title("ROC Curve (Exercise Model - FINAL)")
plt.savefig(BASE_DIR / "roc_curve_final_exercise.png")
plt.close()

print("\nROC curve saved as roc_curve_final_exercise.png")