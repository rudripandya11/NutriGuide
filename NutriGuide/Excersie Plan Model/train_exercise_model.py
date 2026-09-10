import pandas as pd
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score

BASE_DIR = Path(__file__).resolve().parent

# ---------------------------
# LOAD DATASET
# ---------------------------
print("Loading dataset...")
df = pd.read_csv(BASE_DIR / "user_exercise_training_data.csv")
print("Dataset shape:", df.shape)

# ---------------------------
# CLEAN DATA
# ---------------------------
df.fillna(0, inplace=True)

# ---------------------------
# TARGET
# ---------------------------
y = df["suitable"]

# ---------------------------
# REMOVE LEAKAGE FEATURES
# ---------------------------
leakage_cols = [
    "exercise_id", "name", "category", "suitable",

    # ❌ leakage (target hints)
    "weight_loss_friendly", "muscle_gain_friendly",
    "flexibility_friendly", "stress_relief_friendly",
    "endurance_friendly", "posture_improving",
    "core_targeted", "upper_body_targeted",
    "lower_body_targeted", "full_body",
    "mobility_improving", "balance_improving",

    "diabetes_friendly", "bp_friendly", "thyroid_friendly",
    "pcos_friendly", "heart_friendly", "cholesterol_friendly",
    "anemia_friendly", "arthritis_friendly"
]

X = df.drop(columns=[col for col in leakage_cols if col in df.columns])

# ---------------------------
# ENCODE CATEGORICAL FEATURES
# ---------------------------
encoders = {}

for col in X.columns:
    if X[col].dtype == "object":
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        encoders[col] = le

# ---------------------------
# TRAIN / TEST SPLIT
# ---------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("Training size:", X_train.shape)

# ---------------------------
# TRAIN MODEL
# ---------------------------
model = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="logloss",
    random_state=42
)

model.fit(X_train, y_train)

# ---------------------------
# QUICK CHECK
# ---------------------------
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("ROC-AUC:", roc_auc_score(y_test, y_prob))
print(classification_report(y_test, y_pred))

# ---------------------------
# SAVE EVERYTHING
# ---------------------------
joblib.dump(model, BASE_DIR / "xgb_exercise_recommender.pkl")
joblib.dump(encoders, BASE_DIR / "exercise_encoders.pkl")
joblib.dump(X_test, BASE_DIR / "X_test.pkl")
joblib.dump(y_test, BASE_DIR / "y_test.pkl")

print("\n✅ MODEL + CLEAN TEST DATA SAVED")