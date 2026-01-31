import { useContext } from 'react';
import { TimerContext } from '../context/TimerContext';
import { Play, Pause, Square, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function MiniTimer() {
  const { 
    seconds, 
    isActive, 
    activeTrack, 
    pauseTimer, 
    resumeTimer, 
    logSession, 
    formatTime 
  } = useContext(TimerContext);
  
  const location = useLocation();

  // LOGIC: Hide this widget if:
  // 1. No session is running (activeTrack is null)
  // 2. We are currently ON the main Focus page (redundant)
  if (!activeTrack || location.pathname === '/focus') return null;

  return (
    <div className="mt-auto pt-6 border-t border-white/10 animate-in slide-in-from-left duration-300">
      <div className="bg-zinc-900 border border-primary/30 rounded-xl p-4 shadow-[0_0_15px_rgba(34,197,94,0.1)] relative overflow-hidden">
        
        {/* Subtle Glow Effect */}
        <div className={`absolute inset-0 bg-primary/5 pointer-events-none transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Active Protocol</span>
              <span className="text-sm font-bold text-white truncate max-w-[120px] block">{activeTrack.name}</span>
            </div>
            <Link to="/focus" className="text-zinc-500 hover:text-primary transition-colors">
              <ExternalLink size={14} />
            </Link>
          </div>

          <div className="text-3xl font-mono font-bold text-primary mb-3 tracking-tight">
            {formatTime(seconds)}
          </div>

          <div className="flex gap-2">
            {isActive ? (
              <button 
                onClick={pauseTimer} 
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 h-8 rounded-lg flex items-center justify-center text-white transition-colors"
                title="Pause"
              >
                <Pause size={14} />
              </button>
            ) : (
              <button 
                onClick={resumeTimer} 
                className="flex-1 bg-white hover:bg-zinc-200 h-8 rounded-lg flex items-center justify-center text-black transition-colors"
                title="Resume"
              >
                <Play size={14} />
              </button>
            )}
            
            <button 
              onClick={logSession} 
              className="flex-1 bg-primary/20 hover:bg-primary/30 h-8 rounded-lg flex items-center justify-center text-primary transition-colors"
              title="Finish & Log"
            >
              <Square size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}