import pandas as pd
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# ============================
# LOAD MODEL + DATA
# ============================
model = joblib.load(BASE_DIR / "xgb_exercise_recommender.pkl")
encoders = joblib.load(BASE_DIR / "exercise_encoders.pkl")
exercises = pd.read_csv(BASE_DIR / "exercise_master.csv")

TEXT_COLS = [
    "name","category","intensity_level","impact_level",
    "effort_type","energy_band","primary_goal","equipment_level"
]

for col in exercises.columns:
    if col not in TEXT_COLS:
        exercises[col] = pd.to_numeric(exercises[col], errors="coerce")

exercises.fillna(0, inplace=True)


# ============================
# CALORIE FORMULA (MET)
# ============================
def calculate_calories(row, weight):
    return int((row["met_value"] * weight * 3.5 / 200) * row["duration_min"])


# ============================
# SAFETY FILTER
# ============================
def filter_exercises(user, df):

    if user.get("knee_issue"):
        df = df[df["knee_safe"] == 1]

    if user.get("shoulder_issue"):
        df = df[df["shoulder_safe"] == 1]

    if user.get("lower_back_issue"):
        df = df[df["lower_back_safe"] == 1]

    if user.get("is_on_period"):
        df = df[df["period_safe"] == 1]

    return df


# ============================
# SAFE ENCODER
# ============================
def safe_encode(X):
    for col, enc in encoders.items():
        if col not in X.columns:
            continue

        allowed = set(enc.classes_)
        default_val = list(allowed)[0]

        X[col] = X[col].apply(lambda x: x if x in allowed else default_val)
        X[col] = enc.transform(X[col].astype(str))

    return X


# ============================
# ML SCORING
# ============================
def score_exercises(user, df):

    rows = [{**user, **ex.to_dict()} for _, ex in df.iterrows()]
    X = pd.DataFrame(rows)

    X.drop(columns=["exercise_id","name","category"], errors="ignore", inplace=True)

    expected = model.get_booster().feature_names

    for col in expected:
        if col not in X.columns:
            X[col] = 0

    X = X[expected]
    X = safe_encode(X)

    df = df.copy()
    df["score"] = model.predict_proba(X)[:,1]

    return df.sort_values("score", ascending=False)


# ============================
# MAIN PLAN BUILDER
# ============================
def build_exercise_plan(user):

    weight = float(user["weight"])

    goal_map = {
        "lose": "weight_loss",
        "muscle": "gain_muscle",
        "gain": "gain_weight",
        "maintain": "maintain"
    }

    goal = goal_map.get(user["goal"], "maintain")
    user["primary_goal"] = goal

    safe = filter_exercises(user, exercises)
    if safe.empty:
        return {"error": "No safe exercises available"}

    ranked = score_exercises(user, safe)

    ranked["category"] = ranked["category"].str.lower()

    warmup_pool = ranked[ranked["category"].isin(["yoga", "mobility"])]
    main_pool = ranked[
        ranked["category"].isin(["cardio", "strength", "stretching", "balance"])
    ]
    cooldown_pool = ranked[ranked["category"] == "yoga"]

    # fallback safety
    if warmup_pool.empty:
        warmup_pool = ranked
    if main_pool.empty:
        main_pool = ranked
    if cooldown_pool.empty:
        cooldown_pool = ranked

    # -----------------------------
    # BUILD PROPER EXERCISE OBJECTS
    # -----------------------------

    def build_list(df, count):
        selected = df.sample(min(count, len(df)))
        result = []

        for _, ex in selected.iterrows():
            duration = int(ex.get("duration_min", 10))
            calories = calculate_calories(ex, weight)

            result.append({
                "name": ex["name"],
                "duration": duration,
                "calories": calories,
                "sets": int(ex.get("sets_min", 0)),
                "reps": int(ex.get("reps_min", 0)),
                "rest": int(ex.get("rest_seconds", 0))
            })

        return result

    warmup = build_list(warmup_pool, 4)
    main = build_list(main_pool, 8)
    cooldown = build_list(cooldown_pool, 3)

    return {
        "warmup": warmup,
        "main": main,
        "cooldown": cooldown,
        "total_time": 0,
        "total_calories": 0
    }