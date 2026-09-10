"""
api.py (FINAL VERSION - WITH UNIFIED LOGGING)

✔ Craving engine intact
✔ Single collection: mood_cravings
✔ Logs both food + exercise
✔ Clean, production-ready structure
"""

# =========================
# 🚀 IMPORTS
# =========================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, firestore

from craving_engine import run_craving_engine
from food_suggestions import get_food_suggestions
from exercise_suggestions import get_exercise_suggestions


# =========================
# 🚀 FASTAPI INIT
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# 🔥 FIREBASE INIT
# =========================
if not firebase_admin._apps:
    cred = credentials.Certificate("nutriguide-23c40-firebase-adminsdk-fbsvc-6831adf46a.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()


# =========================
# 📥 REQUEST MODELS
# =========================
class CravingRequest(BaseModel):
    user_id: str
    mood: str
    craving: str
    hunger_level: int
    did_eat: bool


class LogFoodRequest(BaseModel):
    user_id: str
    mood: str
    craving: str
    food_name: str
    calories: int


class LogExerciseRequest(BaseModel):
    user_id: str
    mood: str
    craving: str
    exercise_name: str
    calories_burned: int


# =========================
# 📅 HELPERS
# =========================
def get_today():
    return datetime.now().strftime("%Y-%m-%d")


def get_timestamp():
    return datetime.now()


# ✅ UNIFIED LOG FUNCTION
def save_log(user_id, data):
    db.collection("users") \
      .document(user_id) \
      .collection("mood_cravings") \
      .add(data)


# =========================
# 🔧 PARSERS
# =========================
def parse_sleep(s):
    try:
        return int(str(s).split("h")[0])
    except:
        return 0


def parse_water(w):
    try:
        return int(str(w).split()[0])
    except:
        return 0


# =========================
# 🕒 LAST MEAL
# =========================
def calculate_last_meal_hours(meals):
    latest = None

    for meal in meals:
        m = meal.to_dict()
        ts = m.get("loggedAt")

        if not ts:
            continue

        dt = ts.replace(tzinfo=None)

        if latest is None or dt > latest:
            latest = dt

    if not latest:
        return 5

    now = datetime.now()
    return round((now - latest).total_seconds() / 3600, 2)


# =========================
# 🔥 FETCH USER DATA
# =========================
def fetch_user_data(user_id):
    today = get_today()

    user_doc = db.collection("users").document(user_id).get()
    user_data = user_doc.to_dict() or {}

    basic = user_data.get("basicProfile", {})
    fitness = user_data.get("fitnessProfile", {})
    ml = user_data.get("mlResult", {})

    fitbit_doc = db.collection("users").document(user_id) \
        .collection("fitbit_data").document(today).get()

    fitbit = fitbit_doc.to_dict() if fitbit_doc.exists else {}

    meals_ref = db.collection("users").document(user_id).collection("loggedMeals")
    meals_today = list(meals_ref.where("date", "==", today).stream())

    total_calories = sum(m.to_dict().get("calories", 0) for m in meals_today)

    last_meal_hours = calculate_last_meal_hours(meals_today)

    return {
        "basic": basic,
        "fitness": fitness,
        "ml": ml,
        "fitbit": fitbit,
        "consumed_calories": total_calories,
        "last_meal_hours": last_meal_hours
    }


# =========================
# 🚀 MAIN CRAVING API
# =========================
@app.post("/craving")
def handle_craving(request: CravingRequest):

    data = fetch_user_data(request.user_id)

    basic = data["basic"]
    fitness = data["fitness"]
    ml = data["ml"]
    fitbit = data["fitbit"]

    combined_data = {
        "mood": request.mood,
        "craving": request.craving,
        "hunger_level": request.hunger_level,
        "did_eat": request.did_eat,

        "sleep_hours": parse_sleep(fitbit.get("sleep")),
        "water_intake": parse_water(fitbit.get("water")),
        "steps": fitbit.get("steps", 0),

        "last_meal_hours": data["last_meal_hours"],

        "age": basic.get("age"),
        "weight": basic.get("weight"),
        "height": basic.get("height"),
        "gender": basic.get("gender"),

        "activity_level": fitness.get("activityLevel", "sedentary"),
        "tdee": ml.get("tdee"),

        "consumed_calories": data["consumed_calories"]
    }

    engine_result = run_craving_engine(combined_data)

    fitness_level = fitness.get("fitnessLevel", "Beginner").lower()

    if engine_result["action"] == "food":
        suggestions = get_food_suggestions({
            "craving_type": engine_result["craving_type"],
            "suggestion_type": engine_result["suggestion_type"],
            "goal": fitness.get("goal", "maintain")
        })
    else:
        suggestions = get_exercise_suggestions({
            "calories_to_burn": abs(engine_result["remaining_calories"]),
            "fitness_level": fitness_level
        })

    return {
        "reason": engine_result["reason"],
        "confidence": engine_result["confidence"],
        "message": engine_result["message"],
        "action": engine_result["action"],
        "suggestions": suggestions,
        "remaining_calories": engine_result["remaining_calories"],
        "signals": engine_result["signals"]
    }


# =========================
# 🍽️ LOG FOOD
# =========================
@app.post("/log-food")
def log_food(request: LogFoodRequest):

    log_data = {
        "type": "food",
        "mood": request.mood,
        "craving": request.craving,
        "item": request.food_name,
        "calories": request.calories,
        "timestamp": get_timestamp()
    }

    save_log(request.user_id, log_data)

    return {"message": "Food logged successfully"}


# =========================
# 🏃 LOG EXERCISE
# =========================
@app.post("/log-exercise")
def log_exercise(request: LogExerciseRequest):

    log_data = {
        "type": "exercise",
        "mood": request.mood,
        "craving": request.craving,
        "item": request.exercise_name,
        "calories_burned": request.calories_burned,
        "timestamp": get_timestamp()
    }

    save_log(request.user_id, log_data)

    return {"message": "Exercise logged successfully"}