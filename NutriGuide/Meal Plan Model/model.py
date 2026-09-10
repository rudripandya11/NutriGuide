import pandas as pd
from pathlib import Path
import random

BASE_DIR = Path(__file__).resolve().parent
foods = pd.read_csv(BASE_DIR / "food_master.csv")

foods.columns = foods.columns.str.strip().str.lower()

foods["meal_type"] = (
    foods["meal_type"]
    .str.lower()
    .str.strip()
    .replace({"snack": "snacks"})
)

# =============================
# GLOBAL MEMORY FOR ROTATION
# =============================
used_foods = {
    "breakfast": set(),
    "lunch": set(),
    "dinner": set(),
    "snacks": set()
}


def normalize_goal(goal):
    mapping = {
        "lose": "lose_weight",
        "gain": "gain_weight",
        "maintain": "maintain_weight",
        "muscle": "build_muscle",
        "healthy": "healthy_lifestyle",
    }
    return mapping.get(goal.lower(), "maintain_weight")


def calculate_tdee(user):

    if user["gender"].lower() == "male":
        bmr = 10 * user["weight"] + 6.25 * user["height"] - 5 * user["age"] + 5
    else:
        bmr = 10 * user["weight"] + 6.25 * user["height"] - 5 * user["age"] - 161

    activity_factor = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
    }.get(user["activity_level"].lower(), 1.2)

    tdee = bmr * activity_factor
    goal = normalize_goal(user["goal"])

    if goal == "lose_weight":
        tdee *= 0.85
    elif goal == "gain_weight":
        tdee *= 1.15
    elif goal == "build_muscle":
        tdee *= 1.10

    return round(tdee), goal


def apply_filters(df, user, goal):

    df_filtered = df.copy()

    goal_map = {
        "lose_weight": "weight_loss_friendly",
        "gain_weight": "weight_gain_friendly",
        "maintain_weight": "maintenance_friendly",
        "build_muscle": "muscle_gain_friendly",
        "healthy_lifestyle": "healthy_lifestyle_friendly",
    }

    goal_col = goal_map.get(goal)

    if goal_col in df_filtered.columns:
        preferred = df_filtered[df_filtered[goal_col] == 1]
        if not preferred.empty:
            df_filtered = preferred

    diet = user.get("diet_preference", "").lower()

    if diet == "vegetarian":
        df_filtered = df_filtered[df_filtered["vegetarian"] == 1]

    elif diet == "eggetarian":
        df_filtered = df_filtered[
            (df_filtered["vegetarian"] == 1)
            | (df_filtered["eggetarian"] == 1)
        ]

    health_map = {
        "diabetes": "diabetes_friendly",
        "hypertension": "bp_friendly",
        "pcos": "pcos_friendly",
        "heart_disease": "heart_friendly",
        "cholesterol": "cholesterol_friendly",
        "anemia": "anemia_friendly",
        "arthritis": "arthritis_friendly",
    }

    for condition, col in health_map.items():
        if user.get(condition, 0) == 1 and col in df_filtered.columns:
            safe = df_filtered[df_filtered[col] == 1]
            if not safe.empty:
                df_filtered = safe

    budget = user.get("budget", "").lower()
    if budget and "budget_level" in df_filtered.columns:
        budget_df = df_filtered[df_filtered["budget_level"] == budget]
        if not budget_df.empty:
            df_filtered = budget_df

    return df_filtered


# =============================
# ROTATION FOOD SELECTOR
# =============================
def select_foods(df, meal_type, count, max_calories):

    global used_foods

    # Remove already used foods
    df = df[~df["name"].isin(used_foods[meal_type])]

    # If exhausted → reset rotation
    if df.empty:
        used_foods[meal_type].clear()
        df = foods[foods["meal_type"] == meal_type]

    df = df.sample(frac=1)

    selected = []
    total = 0

    for _, row in df.iterrows():
        if len(selected) >= count:
            break
        if total + row["calories"] <= max_calories:

            selected.append({
                    "name": row["name"],
                    "calories": int(row["calories"]),
                    "protein": int(row["protein"]),
                    "carbs": int(row["carbs"]),
                    "fats": int(row["fats"]),
                    "ingredients": row.get("ingredients", "")
                })

            used_foods[meal_type].add(row["name"])
            total += row["calories"]

    return selected


# =============================
# BUILD PLAN
# =============================
def build_meal_plan(user):

    tdee, goal = calculate_tdee(user)

    meal_counts = {
        "breakfast": 1,
        "lunch": 1,
        "dinner": 1,
        "snacks": 2
    }

    calorie_split = {
        "breakfast": 0.25,
        "lunch": 0.35,
        "dinner": 0.25,
        "snacks": 0.15
    }

    plan = {}

    for meal, count in meal_counts.items():

        meal_df = foods[foods["meal_type"] == meal]
        filtered = apply_filters(meal_df, user, goal)

        if filtered.empty:
            filtered = meal_df

        max_cal = tdee * calorie_split[meal]

        plan[meal] = select_foods(filtered, meal, count, max_cal)

    return {
        "goal": goal,
        "tdee": tdee,
        "meal_plan": plan
    }