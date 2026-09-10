"""
craving_engine.py (FINAL PRODUCTION VERSION)

✔ Fully dynamic
✔ Signal-aware decision making
✔ Context-aware responses
✔ Insight-ready architecture
"""

from craving_detector import detect_craving_reason
from calorie_balance import calculate_calorie_balance


# =========================
# 🧠 DECISION ENGINE
# =========================
def decide_action(craving_result, calorie_result, data):
    did_eat = data.get("did_eat", False)

    remaining = calorie_result["remaining"]
    status = calorie_result["status"]

    reason = craving_result["reason"]
    craving_type = craving_result.get("craving_type", "unknown")

    # =========================
    # 🍽️ IF ALREADY ATE
    # =========================
    if did_eat:
        return {
            "action": "exercise",
            "suggestion_type": "burn_calories",
            "message": "You've already eaten. Let’s balance it with some activity.",
        }

    # =========================
    # 🧠 CONTEXT-AWARE DECISIONS
    # =========================

    # Emotional eating → prefer control
    if reason == "emotional_eating":
        if status == "can_eat":
            return {
                "action": "food",
                "suggestion_type": "low_calorie",
                "message": "You're craving due to emotions. Try a lighter, healthier option.",
            }
        else:
            return {
                "action": "exercise",
                "suggestion_type": "burn_calories",
                "message": "This seems emotional. A short walk or activity may help.",
            }

    # True hunger → allow food
    if reason == "true_hunger":
        return {
            "action": "food",
            "suggestion_type": "normal",
            "message": "Your body needs energy. Go for a balanced meal.",
        }

    # Dehydration → water first
    if reason == "dehydration_craving":
        return {
            "action": "food",
            "suggestion_type": "low_calorie",
            "message": "You might be dehydrated. Drink water first, then eat light if needed.",
        }

    # =========================
    # ⚖️ DEFAULT CALORIE LOGIC
    # =========================
    if status == "can_eat":
        return {
            "action": "food",
            "suggestion_type": "normal",
            "message": "You have enough calories. Choose a healthy option.",
        }

    if status == "limited_eat":
        return {
            "action": "food",
            "suggestion_type": "low_calorie",
            "message": "You're close to your limit. Keep it light.",
        }

    return {
        "action": "exercise",
        "suggestion_type": "burn_calories",
        "message": "You've exceeded your limit. Let’s burn some calories.",
    }


# =========================
# 🚀 MAIN ENGINE
# =========================
def run_craving_engine(data: dict) -> dict:

    # =========================
    # 🧠 STEP 1: CRAVING DETECTION
    # =========================
    craving_result = detect_craving_reason(data)

    # =========================
    # 🔥 STEP 2: CALORIE BALANCE
    # =========================
    calorie_result = calculate_calorie_balance(data)

    # =========================
    # ⚙️ STEP 3: DECISION
    # =========================
    decision = decide_action(craving_result, calorie_result, data)

    # =========================
    # 🔗 STEP 4: MERGE SIGNALS
    # =========================
    signals = []

    signals.extend(craving_result.get("signals", []))
    signals.extend(calorie_result.get("signals", []))

    # remove duplicates
    signals = list(set(signals))

    # =========================
    # 📤 FINAL RESPONSE
    # =========================
    return {
        "reason": craving_result["reason"],
        "confidence": craving_result["confidence"],
        "craving_type": craving_result.get("craving_type"),

        "calorie_status": calorie_result["status"],
        "remaining_calories": calorie_result["remaining"],

        "action": decision["action"],
        "suggestion_type": decision["suggestion_type"],
        "message": decision["message"],

        # 🔥 NEW (VERY IMPORTANT)
        "signals": signals
    }
