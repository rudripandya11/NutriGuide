import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🔥 IMPORT FIREBASE (THIS CONNECTS IT)
import "./firebase";

// Layout
import MainLayout from "./layouts/MainLayout";

// Pages
import Home from "./pages/Home/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import NutritionBasics from "./pages/Home/NutritionBasics";
import FoodGroups from "./pages/Home/FoodGroups";
import HealthyTips from "./pages/Home/HealthyTips";
import About from "./pages/Home/About";
import Meals from "./pages/dashboard/meals/Meals";
import Exercise from "./pages/dashboard/exercise/Exercise";
import ProfilePage from "./pages/dashboard/profile/ProfilePage";
import Mood from "./pages//dashboard/mood/Mood";
import FemaleHealth from "./pages/dashboard/femaleHealth/FemaleHealth";
import History from "./pages/dashboard/history/History";

// Steps
import BasicProfileStep from "./pages/auth/steps/BasicProfileStep";
import HealthStep from "./pages/auth/steps/HealthStep";
import GoalsStep from "./pages/auth/steps/GoalsStep";
import FitnessStep from "./pages/auth/steps/FitnessStep";
import PreferencesStep from "./pages/auth/steps/PreferencesStep";
import Dashboard from "./pages/dashboard/Dashboard";

import FitbitCallback from "./pages/FitbitCallback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/nutrition-basics" element={<NutritionBasics />} />
          <Route path="/food-groups" element={<FoodGroups />} />
          <Route path="/healthy-tips" element={<HealthyTips />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Route>
        {/* ONBOARDING STEPS */}
          <Route path="/steps/basic-profile" element={<BasicProfileStep />} />
          <Route path="/steps/health" element={<HealthStep />} />
          <Route path="/steps/goals" element={<GoalsStep />} />
          <Route path="/steps/fitness" element={<FitnessStep />} />
          <Route path="/steps/preferences" element={<PreferencesStep />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/dashboard/meals" element={<Meals />} />
          <Route path="/dashboard/exercise" element={<Exercise />} />
          <Route path="/dashboard/mood" element={<Mood />} />
          <Route path="/dashboard/female-health" element={<FemaleHealth />} />
          <Route path="/dashboard/history" element={<History />} />
          <Route path="/fitbit-callback" element={<FitbitCallback />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;