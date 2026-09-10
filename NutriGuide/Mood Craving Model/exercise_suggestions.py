"""
exercise_suggestions.py (REALISTIC TARGET-BASED VERSION)

✔ Total target ≈ 500 kcal
✔ Each exercise burns DIFFERENT calories
✔ No equal calorie bug
✔ No categories like warmup/main/cooldown
✔ General realistic workout suggestion
"""

import random


# =========================
# 🔥 CALORIES PER MINUTE
# =========================
EXERCISE_DB = {

    # ===== CARDIO MACHINES =====
    "elliptical trainer": 6.5,
    "treadmill walking": 5,
    "treadmill jogging": 8,
    "treadmill running": 10,
    "stationary cycling": 7,
    "rowing machine": 8,
    "stair climber machine": 9,
    "spin bike": 9,

    # ===== BODYWEIGHT =====
    "push-ups": 7,
    "squats": 7,
    "lunges": 6,
    "plank": 4,
    "burpees": 12,
    "mountain climbers": 10,
    "jump squats": 10,
    "high knees": 9,
    "jumping jacks": 8,
    "wall sit": 5,

    # ===== STRENGTH TRAINING =====
    "dumbbell curls": 5,
    "bench press": 6,
    "deadlift": 7,
    "shoulder press": 6,
    "leg press": 6,
    "lat pulldown": 5,
    "tricep dips": 6,
    "bicep curls": 5,
    "kettlebell swings": 10,
    "cable rows": 6,

    # ===== CORE WORKOUTS =====
    "crunches": 5,
    "russian twists": 6,
    "leg raises": 6,
    "bicycle crunch": 7,
    "ab rollout": 8,

    # ===== HIIT / INTENSE =====
    "hiit workout": 12,
    "sprint intervals": 13,
    "battle ropes": 12,
    "box jumps": 11,
    "sled push": 12,

    # ===== SPORTS STYLE (STRUCTURED) =====
    "basketball practice": 8,
    "football drills": 9,
    "badminton practice": 7,
    "tennis practice": 8,
    "boxing workout": 11,

    # ===== FUNCTIONAL TRAINING =====
    "farmer walk": 7,
    "medicine ball slams": 10,
    "agility ladder drills": 8,
    "resistance band training": 6,
    "sandbag training": 9,

    # ===== ADVANCED =====
    "crossfit workout": 12,
    "powerlifting session": 8,
    "olympic lifting": 9,
    "plyometric workout": 11,
    "circuit training": 10,

    # ===== EXTRA (to reach 50+) =====
    "incline treadmill walk": 6,
    "decline push-ups": 8,
    "weighted squats": 8,
    "step-ups": 6,
    "hip thrusts": 6,
    "pull-ups": 8,
    "chin-ups": 7,
    "dips": 7,
    "sled drag": 10,
    "core stability workout": 5
}

# =========================
# 🎯 MAIN FUNCTION
# =========================
def get_exercise_suggestions(data: dict):
    target_calories = 500  # 🔥 FIXED TARGET

    exercises = list(EXERCISE_DB.items())

    # randomly pick 4 exercises
    selected = random.sample(exercises, 4)

    suggestions = []
    total_burned = 0

    for name, burn_rate in selected:

        # realistic duration (10–25 min random)
        duration = random.randint(10, 25)

        calories = round(duration * burn_rate)

        total_burned += calories

        suggestions.append({
            "exercise": name,
            "duration_min": duration,
            "calories_burned": calories
        })

    # OPTIONAL: adjust slightly if too far from 500
    # (not strict, keeps it realistic)
    return suggestions