"""
food_suggestions.py (UPGRADED HEALTH VERSION)

✔ 30+ options per category
✔ Mostly ≤ 200 kcal (some slightly above for balance)
✔ Clean structure
✔ Goal-aware sorting
✔ Randomized output
"""

import random


# =========================
# 🍽️ FOOD DATABASE (HEALTH-FIRST)
# =========================
FOOD_DB = {

    # ================= SWEET =================
    "sweet": {
        "normal": [
            {"name": "Dark Chocolate (2 squares)", "calories": 120},
            {"name": "Dates (2)", "calories": 110},
            {"name": "Honey oats", "calories": 180},
            {"name": "Banana with peanut butter (light)", "calories": 190},
            {"name": "Fruit smoothie (no sugar)", "calories": 150},
            {"name": "Apple with cinnamon", "calories": 90},
            {"name": "Greek yogurt with honey", "calories": 140},
            {"name": "Chia pudding", "calories": 160},
            {"name": "Energy bar (low sugar)", "calories": 180},
            {"name": "Sweet lassi (light)", "calories": 160},
            {"name": "Banana", "calories": 100},
            {"name": "Papaya bowl", "calories": 80},
            {"name": "Watermelon bowl", "calories": 60},
            {"name": "Strawberries", "calories": 50},
            {"name": "Mango slices (small)", "calories": 120},
            {"name": "Dry fruit mix (small)", "calories": 190},
            {"name": "Low-fat kheer (small)", "calories": 200},
            {"name": "Oats ladoo (1)", "calories": 150},
            {"name": "Coconut water", "calories": 45},
            {"name": "Protein shake (light)", "calories": 130},
            {"name": "Rice cake with honey", "calories": 110},
            {"name": "Whole wheat pancake (1)", "calories": 170},
            {"name": "Peanut chikki (small)", "calories": 150},
            {"name": "Fruit custard (light)", "calories": 180},
            {"name": "Low-fat milk", "calories": 100},
            {"name": "Apple smoothie", "calories": 150},
            {"name": "Banana oats shake", "calories": 190},
            {"name": "Raisin snack", "calories": 120},
            {"name": "Dates smoothie (light)", "calories": 180},
            {"name": "Carrot halwa (light)", "calories": 200}
        ],

        "low_calorie": [
            {"name": "Apple", "calories": 80},
            {"name": "Papaya", "calories": 60},
            {"name": "Watermelon", "calories": 50},
            {"name": "Strawberries", "calories": 50},
            {"name": "Low-fat yogurt", "calories": 90},
            {"name": "Greek yogurt", "calories": 100},
            {"name": "Coconut water", "calories": 45},
            {"name": "Chia water", "calories": 60},
            {"name": "Dates (1)", "calories": 60},
            {"name": "Apple with cinnamon", "calories": 80}
        ]
    },


    # ================= SALTY =================
    "salty": {
        "normal": [
            {"name": "Roasted chana", "calories": 150},
            {"name": "Peanuts (small)", "calories": 180},
            {"name": "Salted makhana", "calories": 120},
            {"name": "Khakhra", "calories": 150},
            {"name": "Thepla", "calories": 180},
            {"name": "Boiled corn", "calories": 100},
            {"name": "Sprouts chaat", "calories": 120},
            {"name": "Veg sandwich (brown bread)", "calories": 180},
            {"name": "Upma (small bowl)", "calories": 200},
            {"name": "Poha", "calories": 200},
            {"name": "Masala peanuts", "calories": 190},
            {"name": "Popcorn (light salted)", "calories": 120},
            {"name": "Veg soup", "calories": 80},
            {"name": "Buttermilk", "calories": 60},
            {"name": "Cucumber + salt", "calories": 40},
            {"name": "Tomato slices + salt", "calories": 50},
            {"name": "Oats savory bowl", "calories": 180},
            {"name": "Boiled chickpeas", "calories": 150},
            {"name": "Corn chaat", "calories": 130},
            {"name": "Paneer cubes (light)", "calories": 180},
            {"name": "Moong dal chilla (1)", "calories": 160},
            {"name": "Idli (2)", "calories": 180},
            {"name": "Dhokla", "calories": 150},
            {"name": "Vegetable upma", "calories": 190},
            {"name": "Whole wheat toast + butter", "calories": 170},
            {"name": "Salted curd", "calories": 100},
            {"name": "Veg cutlet (air fried)", "calories": 180},
            {"name": "Lentil soup", "calories": 120},
            {"name": "Boiled peanuts", "calories": 150},
            {"name": "Vegetable sandwich", "calories": 180}
        ],

        "low_calorie": [
            {"name": "Makhana", "calories": 90},
            {"name": "Cucumber slices", "calories": 30},
            {"name": "Tomato slices", "calories": 40},
            {"name": "Veg soup", "calories": 80},
            {"name": "Buttermilk", "calories": 60},
            {"name": "Sprouts", "calories": 100},
            {"name": "Roasted chana", "calories": 120},
            {"name": "Boiled corn", "calories": 90},
            {"name": "Lemon water + salt", "calories": 20},
            {"name": "Salad bowl", "calories": 70}
        ]
    },


    # ================= SPICY =================
    "spicy": {
        "normal": [
            {"name": "Paneer tikka", "calories": 200},
            {"name": "Chana chaat", "calories": 150},
            {"name": "Spicy sprouts", "calories": 120},
            {"name": "Masala dosa (small)", "calories": 200},
            {"name": "Veg stir fry", "calories": 150},
            {"name": "Grilled paneer", "calories": 180},
            {"name": "Spicy corn", "calories": 130},
            {"name": "Egg bhurji (light)", "calories": 180},
            {"name": "Spicy soup", "calories": 100},
            {"name": "Veg noodles (small)", "calories": 200},
            {"name": "Paneer wrap (light)", "calories": 200},
            {"name": "Chole (small)", "calories": 200},
            {"name": "Spicy poha", "calories": 180},
            {"name": "Vegetable pulao (small)", "calories": 200},
            {"name": "Spicy lentils", "calories": 150},
            {"name": "Masala oats", "calories": 180},
            {"name": "Grilled tofu", "calories": 150},
            {"name": "Veg curry", "calories": 180},
            {"name": "Spicy sandwich", "calories": 190},
            {"name": "Stuffed roti (light)", "calories": 200},
            {"name": "Vegetable cutlet", "calories": 180},
            {"name": "Spicy salad", "calories": 100},
            {"name": "Tomato soup spicy", "calories": 90},
            {"name": "Chili paneer (light)", "calories": 200},
            {"name": "Spicy chickpeas", "calories": 160},
            {"name": "Veg fried rice (small)", "calories": 200},
            {"name": "Masala corn", "calories": 130},
            {"name": "Spicy tofu bowl", "calories": 180},
            {"name": "Chaat (light)", "calories": 150},
            {"name": "Paneer bhurji", "calories": 200}
        ],

        "low_calorie": [
            {"name": "Spicy sprouts", "calories": 100},
            {"name": "Cucumber chili salad", "calories": 50},
            {"name": "Tomato soup", "calories": 80},
            {"name": "Boiled corn masala", "calories": 100},
            {"name": "Lemon chili salad", "calories": 60},
            {"name": "Veg soup spicy", "calories": 80},
            {"name": "Grilled tofu", "calories": 120},
            {"name": "Chana chaat", "calories": 120},
            {"name": "Egg whites spicy", "calories": 100},
            {"name": "Stir fry veg", "calories": 120}
        ]
    },


    # ================= FAST FOOD =================
    "fast_food": {
        "normal": [
            {"name": "Veg burger (grilled)", "calories": 200},
            {"name": "Whole wheat wrap", "calories": 180},
            {"name": "Grilled sandwich", "calories": 180},
            {"name": "Veg roll (light)", "calories": 190},
            {"name": "Paneer wrap", "calories": 200},
            {"name": "Oats cutlet", "calories": 150},
            {"name": "Air fried fries", "calories": 150},
            {"name": "Brown bread sandwich", "calories": 170},
            {"name": "Stuffed roti wrap", "calories": 180},
            {"name": "Veg pizza (thin crust small)", "calories": 200},
            {"name": "Grilled burger (light)", "calories": 200},
            {"name": "Veg toast sandwich", "calories": 170},
            {"name": "Paneer sandwich", "calories": 190},
            {"name": "Veg noodles (light)", "calories": 200},
            {"name": "Veg pasta (small)", "calories": 200},
            {"name": "Cheese sandwich (light)", "calories": 200},
            {"name": "Grilled roll", "calories": 180},
            {"name": "Veg quesadilla (light)", "calories": 200},
            {"name": "Mini burger", "calories": 180},
            {"name": "Veg cutlet burger", "calories": 190},
            {"name": "Paneer roll", "calories": 200},
            {"name": "Grilled wrap", "calories": 180},
            {"name": "Veg frankie", "calories": 200},
            {"name": "Veg sandwich grilled", "calories": 180},
            {"name": "Whole wheat pizza", "calories": 200},
            {"name": "Veg tacos (light)", "calories": 180},
            {"name": "Paneer taco", "calories": 200},
            {"name": "Veg burger mini", "calories": 180},
            {"name": "Stuffed sandwich", "calories": 190},
            {"name": "Veg grilled toast", "calories": 170}
        ],

        "low_calorie": [
            {"name": "Veg lettuce wrap", "calories": 120},
            {"name": "Grilled veg sandwich", "calories": 150},
            {"name": "Air fried fries", "calories": 150},
            {"name": "Brown bread sandwich", "calories": 160},
            {"name": "Veg roll light", "calories": 150},
            {"name": "Oats cutlet", "calories": 140},
            {"name": "Grilled wrap", "calories": 160},
            {"name": "Stuffed roti wrap", "calories": 170},
            {"name": "Mini burger", "calories": 150},
            {"name": "Veg toast", "calories": 140}
        ]
    },


    # ================= CREAMY =================
    "creamy": {
        "normal": [
            {"name": "Low-fat paneer curry", "calories": 200},
            {"name": "Greek yogurt", "calories": 100},
            {"name": "Protein shake", "calories": 150},
            {"name": "Milkshake (light)", "calories": 180},
            {"name": "Curd", "calories": 90},
            {"name": "Buttermilk", "calories": 60},
            {"name": "Oats milk bowl", "calories": 180},
            {"name": "Paneer cubes", "calories": 180},
            {"name": "Cheese omelette (light)", "calories": 200},
            {"name": "Creamy soup (light)", "calories": 150},
            {"name": "Soy milk", "calories": 100},
            {"name": "Almond milk", "calories": 90},
            {"name": "Tofu curry", "calories": 180},
            {"name": "Paneer bhurji (light)", "calories": 200},
            {"name": "Low-fat milk", "calories": 100},
            {"name": "Smoothie bowl", "calories": 180},
            {"name": "Chia yogurt", "calories": 120},
            {"name": "Fruit yogurt", "calories": 150},
            {"name": "Protein pudding", "calories": 150},
            {"name": "Creamy oats", "calories": 180},
            {"name": "Paneer tikka", "calories": 200},
            {"name": "Yogurt parfait", "calories": 180},
            {"name": "Curd rice (small)", "calories": 200},
            {"name": "Smoothie (light)", "calories": 150},
            {"name": "Milk + oats", "calories": 180},
            {"name": "Protein smoothie", "calories": 150},
            {"name": "Paneer salad", "calories": 180},
            {"name": "Tofu bowl", "calories": 160},
            {"name": "Low-fat cheese sandwich", "calories": 200},
            {"name": "Greek yogurt bowl", "calories": 150}
        ],

        "low_calorie": [
            {"name": "Curd", "calories": 80},
            {"name": "Buttermilk", "calories": 60},
            {"name": "Greek yogurt", "calories": 100},
            {"name": "Low-fat milk", "calories": 90},
            {"name": "Protein shake", "calories": 120},
            {"name": "Chia yogurt", "calories": 100},
            {"name": "Smoothie light", "calories": 120},
            {"name": "Tofu", "calories": 120},
            {"name": "Almond milk", "calories": 80},
            {"name": "Soy milk", "calories": 90}
        ]
    }
}


# =========================
# 🧠 MAIN FUNCTION
# =========================
def get_food_suggestions(data: dict):
    craving_type = data.get("craving_type", "unknown")
    suggestion_type = data.get("suggestion_type", "normal")
    goal = data.get("goal", "maintain")

    # fallback
    if craving_type not in FOOD_DB:
        fallback = [
            {"name": "Fruit Bowl", "calories": 100},
            {"name": "Salad", "calories": 80},
            {"name": "Nuts (small)", "calories": 150},
            {"name": "Vegetable soup", "calories": 80}
        ]
        return random.sample(fallback, min(4, len(fallback)))

    foods = FOOD_DB[craving_type].get(suggestion_type, [])

    # 🎯 Goal-based sorting
    if goal == "lose_weight":
        foods = sorted(foods, key=lambda x: x["calories"])
    elif goal == "gain_weight":
        foods = sorted(foods, key=lambda x: -x["calories"])

    # 🔀 Return 4 suggestions
    return random.sample(foods, min(4, len(foods)))