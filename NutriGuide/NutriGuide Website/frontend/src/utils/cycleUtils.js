// src/utils/cycleUtils.js

export const getCycleInfo = (periodData) => {
  if (!periodData) return null;

  let { lastPeriodDate, cycleLength } = periodData;

  if (!cycleLength || !lastPeriodDate) return null;

  // 🔥 Strong conversion (handles ALL cases)
  if (lastPeriodDate?.toDate) {
    lastPeriodDate = lastPeriodDate.toDate();
  } else if (lastPeriodDate?.seconds) {
    lastPeriodDate = new Date(lastPeriodDate.seconds * 1000);
  } else if (!(lastPeriodDate instanceof Date)) {
    lastPeriodDate = new Date(lastPeriodDate);
  }

  if (isNaN(lastPeriodDate.getTime())) return null;

  const today = new Date();
  const diffTime = today - lastPeriodDate;
  const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const dayOfCycle = (daysPassed % cycleLength) + 1;

  let phase = "";
  if (dayOfCycle <= 5) phase = "Menstrual";
  else if (dayOfCycle <= 13) phase = "Follicular";
  else if (dayOfCycle <= 16) phase = "Ovulation";
  else phase = "Luteal";

  const daysUntilNextPeriod = cycleLength - dayOfCycle;

  return {
    dayOfCycle,
    phase,
    daysUntilNextPeriod,
  };
};