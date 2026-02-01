// client/src/utils/dateHelpers.js

export const getTodayIST = () => {
  // Returns YYYY-MM-DD specifically for Indian Standard Time
  return new Date().toLocaleDateString('en-CA', { 
    timeZone: 'Asia/Kolkata' 
  });
};