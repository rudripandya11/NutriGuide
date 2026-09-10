export const getCravingResult = async (data) => {
  const res = await fetch("http://127.0.0.1:8002/craving", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("API failed");
  return res.json();
};


// ✅ LOG FOOD
export const logFood = async (data) => {
  const res = await fetch("http://127.0.0.1:8002/log-food", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Food log failed");
  return res.json();
};


// ✅ LOG EXERCISE
export const logExercise = async (data) => {
  const res = await fetch("http://127.0.0.1:8002/log-exercise", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Exercise log failed");
  return res.json();
};