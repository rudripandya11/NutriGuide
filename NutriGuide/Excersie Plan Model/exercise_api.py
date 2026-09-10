from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from exercise_model import build_exercise_plan

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# USER INPUT SCHEMA
# -------------------------
class ExerciseUser(BaseModel):

    weight: float
    age: int
    gender: str
    activity_level: str
    goal: str

    # Optional health fields (default = safe)
    diabetes: int = 0
    hypertension: int = 0
    thyroid: int = 0
    pcos: int = 0
    heart_disease: int = 0
    cholesterol: int = 0
    anemia: int = 0
    arthritis: int = 0

    knee_issue: int = 0
    shoulder_issue: int = 0
    lower_back_issue: int = 0

    is_on_period: int = 0
    has_cramps: int = 0
    heavy_flow: int = 0

    home_preference: int = 1
    gym_access: int = 0


# -------------------------
# API ENDPOINT
# -------------------------
@app.post("/generate-exercise-plan")
def generate_plan(user: ExerciseUser):
    return build_exercise_plan(user.dict())