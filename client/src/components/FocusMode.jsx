import { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Pause, Square, Zap, BookOpen, Code, AlertTriangle, Save } from 'lucide-react';
import { toast } from 'sonner';

// --- YOUR LIVE ROADMAP CONFIGURATION ---
// Update this object as you "Level Up" in your roadmap.
const ACTIVE_ROADMAP = {
  Maths: {
    label: 'Maths Track',
    current_topic: 'L1: Pre-Algebra (GreeneMath)', // Your current specific step
    default_assigned: 1.5
  },
  DSA: {
    label: 'DSA Engine',
    current_topic: 'P1: Foundations (MIT 6.006)', // Your current specific step
    default_assigned: 1.5
  },
  Dev: {
    label: 'Dev Execution',
    current_topic: 'HTML/CSS Bootstrapping',
    default_assigned: 1.0
  },
  Sudden: {
    label: '⚠️ Ad-Hoc / Sudden',
    current_topic: 'Unplanned Task',
    default_assigned: 0.5
  }
};

export default function FocusMode() {
  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Session State
  const [selectedTrack, setSelectedTrack] = useState(null); // 'Maths', 'DSA', etc.
  const [customTopic, setCustomTopic] = useState(''); // For editing the topic if needed
  const [assignedHours, setAssignedHours] = useState(0);
  
  // Database State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // Format Time (HH:MM:SS)
  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Select a Block
  const selectBlock = (key) => {
    setSelectedTrack(key);
    setCustomTopic(ACTIVE_ROADMAP[key].current_topic);
    setAssignedHours(ACTIVE_ROADMAP[key].default_assigned);
    setSeconds(0);
    setIsActive(false);
  };

  // 2. Commit Session
  const finishSession = async () => {
    setIsActive(false);
    
    const actualHours = (seconds / 3600).toFixed(2); // Convert seconds to hours
    
    // Don't log 0 second sessions
    if (parseFloat(actualHours) < 0.01) {
        toast.error("Session too short to log.");
        return;
    }

    const sessionPayload = {
      category: selectedTrack === 'Sudden' ? 'Core' : selectedTrack, // Map 'Sudden' to 'Core' or keep separate
      subCategory: customTopic,
      tags: ['Live-Timer', selectedTrack === 'Sudden' ? 'Ad-Hoc' : 'Roadmap'],
      focused: Number(actualHours),
      assigned: Number(assignedHours)
    };

    try {
      // We send an array of sessions (even if it's just one)
      await axios.post('http://localhost:5000/api/focus', { 
        date, 
        sessions: [sessionPayload],
        notes: `Live Session: ${customTopic}` 
      });

      toast.success('Session Sync Complete', {
        description: `Logged ${actualHours} hrs to ${selectedTrack}`,
      });
      
      // Reset
      setSeconds(0);
      setSelectedTrack(null);
    } catch (err) {
      console.error(err);
      toast.error('Sync Failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-white tracking-tighter flex justify-center items-center gap-3">
           <Zap className="text-primary fill-primary" /> Live Execution Mode
        </h2>
        <p className="text-zinc-400">Select your roadmap track. Start the engine.</p>
      </div>

      {/* --- 1. TRACK SELECTOR (The Roadmap Integration) --- */}
      {!selectedTrack ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => selectBlock('Maths')} className="bg-zinc-900 border border-white/10 hover:border-blue-500 p-6 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] group text-left">
            <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-colors"><BookOpen size={24} /></div>
            <div>
              <h3 className="font-bold text-white text-lg">Maths Track</h3>
              <p className="text-zinc-500 text-sm">Current: {ACTIVE_ROADMAP.Maths.current_topic}</p>
            </div>
          </button>

          <button onClick={() => selectBlock('DSA')} className="bg-zinc-900 border border-white/10 hover:border-purple-500 p-6 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] group text-left">
            <div className="bg-purple-500/20 p-4 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-colors"><Code size={24} /></div>
            <div>
              <h3 className="font-bold text-white text-lg">DSA Engine</h3>
              <p className="text-zinc-500 text-sm">Current: {ACTIVE_ROADMAP.DSA.current_topic}</p>
            </div>
          </button>

          <button onClick={() => selectBlock('Dev')} className="bg-zinc-900 border border-white/10 hover:border-green-500 p-6 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] group text-left">
            <div className="bg-green-500/20 p-4 rounded-xl text-green-400 group-hover:bg-green-500 group-hover:text-black transition-colors"><Zap size={24} /></div>
            <div>
              <h3 className="font-bold text-white text-lg">Dev Execution</h3>
              <p className="text-zinc-500 text-sm">Current: {ACTIVE_ROADMAP.Dev.current_topic}</p>
            </div>
          </button>

           {/* SUDDEN / AD-HOC TASK */}
          <button onClick={() => selectBlock('Sudden')} className="bg-zinc-900 border border-white/10 hover:border-red-500 p-6 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] group text-left">
            <div className="bg-red-500/20 p-4 rounded-xl text-red-400 group-hover:bg-red-500 group-hover:text-black transition-colors"><AlertTriangle size={24} /></div>
            <div>
              <h3 className="font-bold text-white text-lg">Sudden / Ad-Hoc</h3>
              <p className="text-zinc-500 text-sm">Handle chaos or sudden assignments.</p>
            </div>
          </button>
        </div>
      ) : (
        /* --- 2. ACTIVE TIMER INTERFACE --- */
        <div className="bg-black/50 border border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
          
          {/* Glowing Background */}
          <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000 ${isActive ? 'bg-primary/20 animate-pulse' : 'bg-transparent'}`} />
          
          {/* Task Info */}
          <div className="z-10 text-center space-y-2 w-full max-w-lg">
             <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">{selectedTrack} Protocol</div>
             {/* Editable Topic Input */}
             <input 
               value={customTopic}
               onChange={(e) => setCustomTopic(e.target.value)}
               className="bg-transparent border-b border-white/20 text-center text-2xl font-bold text-white w-full outline-none focus:border-primary pb-2"
             />
          </div>

          {/* THE TIMER */}
          <div className="z-10 font-mono text-8xl md:text-9xl font-bold text-white tracking-tighter">
            {formatTime(seconds)}
          </div>

          {/* Controls */}
          <div className="z-10 flex gap-4">
            {!isActive ? (
              <button 
                onClick={() => setIsActive(true)}
                className="bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all"
              >
                <Play size={20} fill="black" /> Resume
              </button>
            ) : (
              <button 
                onClick={() => setIsActive(false)}
                className="bg-zinc-800 text-white hover:bg-zinc-700 px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all"
              >
                <Pause size={20} fill="white" /> Pause
              </button>
            )}

            <button 
               onClick={finishSession}
               className="bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all"
            >
              <Square size={20} fill="currentColor" /> Finish & Log
            </button>
          </div>

          {/* Cancel */}
          <button onClick={() => setSelectedTrack(null)} className="z-10 text-zinc-500 hover:text-red-500 text-sm mt-4">
            Discard Session
          </button>

        </div>
      )}
    </div>
  );
}