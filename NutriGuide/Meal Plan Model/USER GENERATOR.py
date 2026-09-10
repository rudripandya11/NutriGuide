import random
import pandas as pd

# ==============================
# LOAD FOOD DATA
# ==============================
foods = pd.read_csv("C:/Users/91832/Desktop/NutriGuide/Meal Plan Model/food_master.csv")

# ==============================
# USER GENERATOR
# ==============================
def generate_user(user_id):
    height = random.randint(145, 190)
    weight = random.randint(45, 100)

    bmi = weight / ((height / 100) ** 2)

    return {
        "user_id": user_id,
        "age": random.randint(18, 60),
        "gender": random.choice(["male", "female"]),
        "height": height,
        "weight": weight,
        "bmi": round(bmi, 2),

        "activity_level": random.choice(
            ["sedentary", "light", "moderate", "active"]
        ),

        "goal": random.choice([
            "lose_weight",
            "gain_weight",
            "maintain_weight",
            "build_muscle",
            "healthy_lifestyle"
        ]),

        # IMPORTANT FIX: Meal context added
        "meal_context": random.choice(
            ["breakfast", "lunch", "dinner", "snack"]
        ),

        "diet_preference": random.choice(
            ["vegetarian", "vegan", "eggetarian", "non_veg"]
        ),

        # Health conditions
        "diabetes": random.choice([0, 1]),
        "hypertension": random.choice([0, 1]),
        "pcos": random.choice([0, 1]),
        "heart_disease": random.choice([0, 1]),
        "cholesterol": random.choice([0, 1]),
        "anemia": random.choice([0, 1]),
        "arthritis": random.choice([0, 1]),

        # Allergies
        "allergy_dairy": random.choice([0, 1]),
        "allergy_gluten": random.choice([0, 1]),
        "allergy_nuts": random.choice([0, 1]),
        "allergy_soy": random.choice([0, 1]),
        "allergy_eggs": random.choice([0, 1]),
        "allergy_seafood": random.choice([0, 1]),
    }


# ==============================
# HARD RULE FILTER
# ==============================
def violates_hard_rules(user, food):

    # Meal type match (CRITICAL FIX)
    if user["meal_context"] != food["meal_type"]:
        return True

    # Diet preference
    if user["diet_preference"] == "vegetarian" and food["non_veg"] == 1:
        return True

    if user["diet_preference"] == "vegan" and (
        food["vegetarian"] == 0 or food["contains_dairy"] == 1
    ):
        return True

    if user["diet_preference"] == "eggetarian" and food["non_veg"] == 1:
        return True

    # Allergies
    allergy_map = [
        ("allergy_dairy", "contains_dairy"),
        ("allergy_gluten", "contains_gluten"),
        ("allergy_nuts", "contains_nuts"),
        ("allergy_soy", "contains_soy"),
        ("allergy_eggs", "contains_eggs"),
        ("allergy_seafood", "contains_seafood"),
    ]

    for user_key, food_key in allergy_map:
        if user[user_key] and food[food_key]:
            return True

    # Health conditions
    health_map = [
        ("diabetes", "diabetes_friendly"),
        ("hypertension", "bp_friendly"),
        ("heart_disease", "heart_friendly"),
        ("cholesterol", "cholesterol_friendly"),
        ("pcos", "pcos_friendly"),
        ("anemia", "anemia_friendly"),
        ("arthritis", "arthritis_friendly"),
    ]

    for user_key, food_key in health_map:
        if user[user_key] and food[food_key] == 0:
            return True

    return False


# ==============================
# GOAL COMPATIBILITY CHECK
# ==============================
goal_map = {
    "lose_weight": "weight_loss_friendly",
    "gain_weight": "weight_gain_friendly",
    "maintain_weight": "maintenance_friendly",
    "build_muscle": "muscle_gain_friendly",
    "healthy_lifestyle": "healthy_lifestyle_friendly",
}


# ==============================
# SUITABILITY SCORING
# ==============================
def suitability_score(user, food):

    score = 0

    # Goal compatibility check (CRITICAL FIX)
    if food[goal_map[user["goal"]]] == 0:
        return 0

    # Goal logic
    if user["goal"] == "lose_weight":
        if food["protein"] >= 15:
            score += 2
        if food["calories"] <= 400:
            score += 1

    elif user["goal"] == "gain_weight":
        if food["calories"] >= 450:
            score += 2
        if food["carbs"] >= 40:
            score += 1

    elif user["goal"] == "build_muscle":
        if food["protein"] >= 20:
            score += 3

    elif user["goal"] == "maintain_weight":
        if 300 <= food["calories"] <= 600:
            score += 2
        if 10 <= food["protein"] <= 25:
            score += 1

    elif user["goal"] == "healthy_lifestyle":
        if food["fats"] <= 15:
            score += 1
        if food["protein"] >= 10:
            score += 1

    # Activity boost
    if user["activity_level"] in ["moderate", "active"] and food["protein"] >= 15:
        score += 1

    return score


# ==============================
# FINAL LABEL
# ==============================
def label_food(user, food):

    if violates_hard_rules(user, food):
        return 0

    score = suitability_score(user, food)

    # Stronger threshold (FIXED)
    return 1 if score >= 3 else 0


# ==============================
# DATASET GENERATION
# ==============================
rows = []
NUM_USERS = 5000

for uid in range(NUM_USERS):

    user = generate_user(uid)

    # SAMPLE FOODS TO CONTROL SIZE (FIXED)
    sampled_foods = foods.sample(40)

    for _, food in sampled_foods.iterrows():

        label = label_food(user, food)

        row = {
            **user,

            "food_calories": food["calories"],
            "food_protein": food["protein"],
            "food_carbs": food["carbs"],
            "food_fats": food["fats"],
            "meal_type": food["meal_type"],

            "vegetarian": food["vegetarian"],
            "vegan": food["vegan"],
            "eggetarian": food["eggetarian"],
            "non_veg": food["non_veg"],

            "suitable": label
        }

        # Balance dataset (FIXED)
        if label == 1:
            rows.append(row)
        elif random.random() < 0.25:
            rows.append(row)


# ==============================
# SAVE DATASET
# ==============================
dataset = pd.DataFrame(rows)
dataset.to_csv("user_food_training_data.csv", index=False)

print("Dataset generated successfully!")
print("Total rows:", len(dataset))