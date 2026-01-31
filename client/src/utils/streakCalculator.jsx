export const calculateStreak = (entries) => {
  if (!entries || entries.length === 0) return 0;

  // 1. Sort entries by date (newest first)
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  // 2. Get unique dates where you actually worked (focused > 0)
  const activeDates = new Set();
  sorted.forEach(entry => {
    const totalFocus = entry.sessions.reduce((sum, s) => sum + (s.focused || 0), 0);
    if (totalFocus > 0) {
      activeDates.add(entry.date.split('T')[0]);
    }
  });

  if (activeDates.size === 0) return 0;

  // 3. Setup Dates (Local Time safe)
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // 4. Check if streak is alive
  // To have a streak, you must have worked Today OR Yesterday.
  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    return 0; 
  }

  // 5. Count backwards
  let streak = 0;
  let currentCheck = new Date(); // Start from today
  
  // If we haven't worked today yet, start counting from yesterday
  if (!activeDates.has(todayStr)) {
     currentCheck.setDate(currentCheck.getDate() - 1);
  }

  while (true) {
    const checkStr = currentCheck.toISOString().split('T')[0];
    if (activeDates.has(checkStr)) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1); // Go back 1 day
    } else {
      break; // Chain broken
    }
  }

  return streak;
};