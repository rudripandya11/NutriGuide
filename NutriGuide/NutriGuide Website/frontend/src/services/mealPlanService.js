// src/services/mealPlanService.js

export async function generateMealPlan(payload) {
  const response = await fetch(
    "http://127.0.0.1:8000/generate-meal-plan",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Backend error");
  }

  return await response.json();
}
