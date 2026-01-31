import { differenceInDays, parseISO } from 'date-fns';

export function calculateStreak(entries) {
  if (!entries || entries.length === 0) return 0;

  // 1. Sort entries by date (newest first)
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // 2. Check if streak is alive (did we work today or yesterday?)
  const lastEntryDate = sorted[0].date;
  if (lastEntryDate !== today && lastEntryDate !== yesterday) {
    return 0; // Streak broken
  }

  // 3. Count backwards
  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = parseISO(sorted[i].date);
    const next = parseISO(sorted[i+1].date);
    
    const diff = differenceInDays(current, next);

    if (diff === 1) {
      streak++;
    } else {
      break; // Gap found, stop counting
    }
  }

  return streak;
}