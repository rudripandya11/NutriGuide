"""
craving_detector.py (FINAL PRODUCTION VERSION)

✔ Fully dynamic-ready
✔ Robust input handling
✔ Clean reasoning hierarchy
✔ Supports insights layer (signals)
"""


# =========================
# 🔧 SAFE PARSERS
# =========================
def safe_float(val):
    try:
        return float(val)
    except:
        return 0


def safe_int(val):
    try:
        return int(val)
    except:
        return 0


# =========================
# 🔄 NORMALIZATION
# =========================
def normalize_input(data: dict) -> dict:
    return {
        "mood": str(data.get("mood", "")).lower(),
        "craving": str(data.get("craving", "")).lower(),
        "hunger_level": safe_int(data.get("hunger_level")),

        "sleep_hours": safe_float(data.get("sleep_hours")),
        "water_intake": safe_float(data.get("water_intake")),
        "steps": safe_int(data.get("steps")),

        "last_meal_hours": safe_float(data.get("last_meal_hours")),
    }


# =========================
# 🍽️ CRAVING MAPPER
# =========================
def map_craving_type(craving: str) -> str:
    craving = craving.lower().strip()

    mapping = {
        "sweet": ["sweet", "chocolate", "dessert", "sugar"],
        "salty": ["salty", "chips", "namkeen"],
        "spicy": ["spicy", "masala", "chatpata"],
        "fast_food": ["pizza", "burger", "fries", "fastfood", "fast_food"],
        "creamy": ["creamy", "cheese", "butter", "pasta"],
        "carb_heavy": ["rice", "bread", "roti"],
        "protein": ["protein", "eggs", "paneer", "chicken"]
    }

    for key, values in mapping.items():
        if craving in values:
            return key

    return "unknown"


# =========================
# 🧠 MAIN DETECTOR
# =========================
def detect_craving_reason(data: dict) -> dict:
    data = normalize_input(data)

    mood = data["mood"]
    craving = map_craving_type(data["craving"])

    hunger = data["hunger_level"]
    sleep = data["sleep_hours"]
    water = data["water_intake"]
    steps = data["steps"]
    last_meal = data["last_meal_hours"]

    signals = []  # 🔥 used later for insights

    # =========================
    # 🥇 SLEEP FATIGUE
    # =========================
    if sleep > 0 and sleep < 5:
        signals.append("low_sleep")

        return {
            "reason": "low_sleep_energy_drop",
            "confidence": "high",
            "craving_type": craving,
            "signals": signals,
            "details": "Low sleep causing energy drop."
        }

    # =========================
    # 🥈 DEHYDRATION
    # =========================
    if water > 0 and water < 4:
        signals.append("low_water")

        return {
            "reason": "dehydration_craving",
            "confidence": "medium",
            "craving_type": craving,
            "signals": signals,
            "details": "Low hydration may mimic hunger."
        }

    # =========================
    # 🥉 EMOTIONAL EATING
    # =========================
    if mood in ["stressed", "sad", "anxious", "bored"]:
        signals.append("emotional_state")

        if craving in ["sweet", "fast_food", "creamy"]:
            return {
                "reason": "emotional_eating",
                "confidence": "high",
                "craving_type": craving,
                "signals": signals,
                "details": "Emotion-driven craving."
            }

    # =========================
    # 🍽️ TRUE HUNGER
    # =========================
    if hunger >= 7 and last_meal >= 3:
        signals.append("real_hunger")

        return {
            "reason": "true_hunger",
            "confidence": "high",
            "craving_type": craving,
            "signals": signals,
            "details": "Body needs actual energy."
        }

    # =========================
    # 🧂 ELECTROLYTE
    # =========================
    if craving == "salty":
        signals.append("salt_craving")

        return {
            "reason": "electrolyte_imbalance",
            "confidence": "low",
            "craving_type": craving,
            "signals": signals,
            "details": "Possible mineral imbalance."
        }

    # =========================
    # 🌶️ SPICY
    # =========================
    if craving == "spicy":
        signals.append("taste_craving")

        return {
            "reason": "taste_stimulation",
            "confidence": "low",
            "craving_type": craving,
            "signals": signals,
            "details": "Seeking strong flavors."
        }

    # =========================
    # 🧀 HIGH REWARD FOOD
    # =========================
    if craving in ["creamy", "fast_food"]:
        signals.append("dopamine_food")

        return {
            "reason": "dopamine_reward_craving",
            "confidence": "medium",
            "craving_type": craving,
            "signals": signals,
            "details": "High-reward food craving."
        }

    # =========================
    # 💤 LOW ACTIVITY
    # =========================
    if steps < 1500:
        signals.append("low_activity")

        return {
            "reason": "low_activity_fatigue",
            "confidence": "low",
            "craving_type": craving,
            "signals": signals,
            "details": "Low movement affects metabolism."
        }

    # =========================
    # 🔁 DEFAULT
    # =========================
    return {
        "reason": "general_craving",
        "confidence": "low",
        "craving_type": craving,
        "signals": signals,
        "details": "No dominant signal detected."
    }


# =========================
# 🧪 TEST
# =========================
if __name__ == "__main__":
    test_data = {
        "mood": "stressed",
        "craving": "pizza",
        "hunger_level": 5,
        "sleep_hours": 6,
        "water_intake": 5,
        "steps": 2000,
        "last_meal_hours": 2
    }

    print(detect_craving_reason(test_data))