from fastapi import FastAPI
from pydantic import BaseModel
from model import build_meal_plan
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class UserInput(BaseModel):
    age: int
    gender: str
    height: int
    weight: int
    activity_level: str
    goal: str
    diet_preference: str

    diabetes: int = 0
    hypertension: int = 0
    pcos: int = 0
    heart_disease: int = 0
    cholesterol: int = 0
    anemia: int = 0
    arthritis: int = 0

    allergy_dairy: int = 0
    allergy_gluten: int = 0
    allergy_nuts: int = 0
    allergy_soy: int = 0
    allergy_eggs: int = 0
    allergy_seafood: int = 0


@app.post("/generate-meal-plan")
def generate_meal_plan(user: UserInput):
    return build_meal_plan(user.dict())


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)