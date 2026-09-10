"""
calorie_balance.py (FINAL PRODUCTION VERSION)

✔ Uses ML TDEE if available
✔ Falls back to BMR calculation
✔ Fully dynamic (no static assumptions)
✔ Insight-ready (signals added)
"""


# =========================
# 🔧 SAFE HELPERS
# =========================
def safe_float(val):
    try:
        return float(val)
    except:
        return 0


# =========================
# 🔢 BMR CALCULATION
# =========================
def calculate_bmr(weight, height, age, gender):
    if not weight or not height or not age:
        return 0

    gender = str(gender).lower()

    if gender == "male":
        return (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:
        return (10 * weight) + (6.25 * height) - (5 * age) - 161


# =========================
# 🏃 ACTIVITY MULTIPLIER
# =========================
def get_activity_multiplier(level):
    level = str(level).lower()

    mapping = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }

    return mapping.get(level, 1.2)


# =========================
# 🔥 MAIN FUNCTION
# =========================
def calculate_calorie_balance(data: dict) -> dict:
    """
    Returns:
    {
        bmr,
        daily_limit,
        consumed,
        remaining,
        status,
        signals
    }
    """

    signals = []

    age = safe_float(data.get("age"))
    weight = safe_float(data.get("weight"))
    height = safe_float(data.get("height"))
    gender = data.get("gender", "female")
    activity = data.get("activity_level", "sedentary")

    consumed = safe_float(data.get("consumed_calories"))

    # =========================
    # 🧠 STEP 1: USE TDEE (PRIORITY)
    # =========================
    tdee = data.get("tdee")

    if tdee:
        daily_limit = safe_float(tdee)
        bmr = daily_limit / 1.2  # approx back-calc

        signals.append("used_ml_tdee")

    else:
        # fallback to calculation
        bmr = calculate_bmr(weight, height, age, gender)
        multiplier = get_activity_multiplier(activity)
        daily_limit = bmr * multiplier

        signals.append("used_bmr_estimation")

    # =========================
    # 📉 STEP 2: REMAINING
    # =========================
    remaining = daily_limit - consumed

    # =========================
    # ⚖️ STEP 3: STATUS
    # =========================
    if remaining > 300:
        status = "can_eat"
    elif 0 < remaining <= 300:
        status = "limited_eat"
    else:
        status = "exceed_limit"

    # =========================
    # 🔍 SIGNALS FOR INSIGHTS
    # =========================
    if consumed > daily_limit:
        signals.append("over_consumption")

    if remaining < 0:
        signals.append("calorie_surplus")

    if remaining > 800:
        signals.append("calorie_deficit_high")

    # =========================
    # 📤 OUTPUT
    # =========================
    return {
        "bmr": round(bmr, 2),
        "daily_limit": round(daily_limit, 2),
        "consumed": consumed,
        "remaining": round(remaining, 2),
        "status": status,
        "signals": signals
    }


