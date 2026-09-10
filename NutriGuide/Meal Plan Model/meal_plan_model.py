import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

from xgboost import XGBClassifier


# ======================================================
# LOAD DATASET
# ======================================================
df = pd.read_csv(
    "C:/Users/91832/Desktop/NutriGuide/Meal Plan Model/user_food_training_data.csv"
)

print("Dataset Shape:", df.shape)
print("\nLabel Distribution:")
print(df["suitable"].value_counts(normalize=True))


# ======================================================
# REMOVE UNUSED + LEAKAGE COLUMNS
# ======================================================
drop_cols = ["user_id", "suitable"]

leakage_cols = [
    "vegetarian",
    "vegan",
    "eggetarian",
    "non_veg"
]

cols_to_drop = [c for c in drop_cols + leakage_cols if c in df.columns]

X = df.drop(columns=cols_to_drop)
y = df["suitable"]


# ======================================================
# ENCODE ALL CATEGORICAL FEATURES
# ======================================================
cat_cols = [
    "gender",
    "activity_level",
    "goal",
    "diet_preference",
    "meal_type",
    "meal_context"   # ⭐ THIS WAS MISSING (ROOT CAUSE)
]

X = pd.get_dummies(X, columns=cat_cols, drop_first=True)

print("\nFinal Feature Count:", X.shape[1])


# ======================================================
# TRAIN / VALIDATION SPLIT
# ======================================================
X_train, X_val, y_train, y_val = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ======================================================
# HANDLE CLASS IMBALANCE
# ======================================================
scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

print("\nScale Pos Weight:", scale_pos_weight)


# ======================================================
# BUILD XGBOOST MODEL
# ======================================================
model = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=scale_pos_weight,
    objective="binary:logistic",
    eval_metric="logloss",
    n_jobs=-1,
    random_state=42
)


# ======================================================
# TRAIN MODEL (NO EARLY STOPPING FOR STABILITY)
# ======================================================
model.fit(X_train, y_train)


# ======================================================
# EVALUATE MODEL
# ======================================================
y_pred = model.predict(X_val)
y_prob = model.predict_proba(X_val)[:, 1]

print("\n========== MODEL PERFORMANCE ==========")
print("Accuracy:", accuracy_score(y_val, y_pred))
print("ROC-AUC:", roc_auc_score(y_val, y_prob))
print("\nClassification Report:")
print(classification_report(y_val, y_pred))


# ======================================================
# SAVE MODEL + FEATURES
# ======================================================
joblib.dump(model, "xgb_food_recommender.pkl")
joblib.dump(X.columns.tolist(), "feature_columns.pkl")

print("\nModel and feature schema saved successfully!")