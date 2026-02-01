import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AuthContext } from './AuthContext';
import { getTodayIST } from '../utils/dateHelpers'; // <--- IMPORT
export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);
  const [sessionTopic, setSessionTopic] = useState('');

  // Timer Ticking Logic
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const startSession = (track) => {
    if (track === 'Sudden') {
      setActiveTrack({ name: 'Sudden' });
      setSessionTopic('Ad-Hoc Task');
    } else {
      setActiveTrack(track);
      setSessionTopic(track.currentTopic);
    }
    setSeconds(0);
    setIsActive(true);
  };

  const logSession = async () => {
    setIsActive(false);

    // SAFETY CHECK: Minimum 36 seconds
    if (seconds < 36) {
      toast.warning("Session too short to log (min 36s)");
      return;
    }

    const hours = (seconds / 3600).toFixed(2);

    try {
      const today = getTodayIST();
      
      const payload = {
        date: today,
        sessions: [{
          // FIX: Removed the ternary check. Now "Sudden" stays "Sudden".
          category: activeTrack.name, 
          subCategory: sessionTopic || 'Focus Session',
          tags: ['Live-Focus'],
          focused: Number(hours),
          assigned: 0 
        }],
        // Note: We removed the 'notes' field previously to protect your manual reflection
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/focus`, payload);
      
      toast.success('Session Logged', { description: `${hours} hrs added to ${activeTrack.name}.` });
      discardSession();
    } catch (err) {
      console.error("Log Error:", err);
      toast.error('Sync Failed');
    }
  };

  const discardSession = () => {
    setIsActive(false);
    setSeconds(0);
    setActiveTrack(null);
  };
  
  const pauseTimer = () => setIsActive(false);
  const resumeTimer = () => setIsActive(true);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <TimerContext.Provider value={{ 
      seconds, isActive, activeTrack, sessionTopic, setSessionTopic,
      startSession, pauseTimer, resumeTimer, discardSession, logSession, formatTime 
    }}>
      {children}
    </TimerContext.Provider>
  );
};