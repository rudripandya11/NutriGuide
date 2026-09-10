import pandas as pd
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

exercises = pd.read_csv(BASE_DIR / "exercise_master.csv")

DATA_SIZE = 400000   # dataset size


# -----------------------------
# RANDOM USER GENERATOR
# -----------------------------
def generate_user():
    goal = random.choice([
        "lose_weight",
        "gain_muscle",
        "flexibility",
        "stress_relief"
    ])

    return {
        "age": random.randint(18, 60),
        "gender": random.choice(["male", "female"]),
        "activity_level": random.choice(["sedentary","moderate","active"]),
        "goal": goal,

        "diabetes": random.randint(0,1),
        "hypertension": random.randint(0,1),
        "thyroid": random.randint(0,1),
        "pcos": random.randint(0,1),
        "heart_disease": random.randint(0,1),
        "cholesterol": random.randint(0,1),
        "anemia": random.randint(0,1),
        "arthritis": random.randint(0,1),

        "knee_issue": random.randint(0,1),
        "shoulder_issue": random.randint(0,1),
        "lower_back_issue": random.randint(0,1),

        "is_on_period": random.randint(0,1),
        "has_cramps": random.randint(0,1),
        "heavy_flow": random.randint(0,1),

        "home_preference": random.randint(0,1),
        "gym_access": random.randint(0,1)
    }


# -----------------------------
# SUITABILITY LOGIC
# -----------------------------
def check_suitable(user, ex):
    score = 0

    # GOAL MATCH
    if user["goal"] == "lose_weight" and ex["weight_loss_friendly"] == 1:
        score += 3
    if user["goal"] == "gain_muscle" and ex["muscle_gain_friendly"] == 1:
        score += 3
    if user["goal"] == "flexibility" and ex["flexibility_friendly"] == 1:
        score += 3
    if user["goal"] == "stress_relief" and ex["stress_relief_friendly"] == 1:
        score += 3

    # HEALTH CONDITIONS
    if user["diabetes"] and not ex["diabetes_friendly"]:
        score -= 5
    if user["arthritis"] and not ex["arthritis_friendly"]:
        score -= 5
    if user["heart_disease"] and not ex["heart_friendly"]:
        score -= 5

    # JOINT SAFETY
    if user["knee_issue"] and not ex["knee_safe"]:
        score -= 3
    if user["shoulder_issue"] and not ex["shoulder_safe"]:
        score -= 3
    if user["lower_back_issue"] and not ex["lower_back_safe"]:
        score -= 3

    # PERIOD SAFETY
    if user["is_on_period"] and not ex["period_safe"]:
        score -= 4

    # HOME / GYM
    if user["home_preference"] and not ex["home_friendly"]:
        score -= 2
    if user["gym_access"] == 0 and ex["gym_required"]:
        score -= 3

    return 1 if score > 0 else 0


# -----------------------------
# GENERATE DATASET
# -----------------------------
rows = []

for _ in range(DATA_SIZE):
    user = generate_user()
    ex = exercises.sample(1).iloc[0]

    label = check_suitable(user, ex)

    row = {
        **user,
        **ex.to_dict(),
        "suitable": label
    }

    rows.append(row)

    if _ % 50000 == 0:
        print(f"Generated {_} rows")


df = pd.DataFrame(rows)

df.to_csv(BASE_DIR / "user_exercise_training_data.csv", index=False)

print("✅ Training dataset created!")
