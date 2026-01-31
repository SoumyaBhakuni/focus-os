import { useContext } from 'react';
import { Play, Pause, Square, Zap, AlertTriangle, Target } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { TimerContext } from '../context/TimerContext';

export default function FocusMode() {
  const { user } = useContext(AuthContext);
  
  const { 
    seconds, 
    isActive, 
    activeTrack, 
    sessionTopic, 
    setSessionTopic,
    startSession, 
    pauseTimer, 
    resumeTimer, 
    discardSession, 
    logSession, // <--- THIS IS YOUR LOG FUNCTION. IT IS STILL HERE.
    formatTime 
  } = useContext(TimerContext);

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {!activeTrack ? (
        // SELECTION SCREEN
        <>
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold text-white tracking-tighter flex justify-center items-center gap-3">
               <Zap className="text-primary fill-primary" /> Live Execution
            </h2>
            <p className="text-zinc-400">Select a track. Targets are managed in Manual Log.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.tracks?.map((track, i) => (
              <button key={i} onClick={() => startSession(track)} className="bg-zinc-900 border border-white/10 hover:border-primary p-6 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] group text-left">
                <div className="bg-white/5 p-4 rounded-xl text-zinc-400 group-hover:bg-primary group-hover:text-black transition-colors">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{track.name}</h3>
                  <p className="text-zinc-500 text-sm">Next: {track.currentTopic}</p>
                </div>
              </button>
            ))}
            <button onClick={() => startSession('Sudden')} className="bg-zinc-900 border border-white/10 hover:border-red-500 p-6 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] group text-left">
              <div className="bg-red-500/20 p-4 rounded-xl text-red-400 group-hover:bg-red-500 group-hover:text-black transition-colors"><AlertTriangle size={24} /></div>
              <div>
                <h3 className="font-bold text-white text-lg">Sudden / Ad-Hoc</h3>
                <p className="text-zinc-500 text-sm">Handle chaos or sudden tasks.</p>
              </div>
            </button>
          </div>
        </>
      ) : (
        // ACTIVE TIMER SCREEN
        <div className="bg-black/50 border border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
          
          <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000 ${isActive ? 'bg-primary/20 animate-pulse' : 'bg-transparent'}`} />
          
          {/* TOPIC INPUT ONLY (No Target Input) */}
          <div className="z-10 text-center space-y-2 w-full max-w-lg">
             <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">{activeTrack.name} Protocol</div>
             <input 
               value={sessionTopic} 
               onChange={(e) => setSessionTopic(e.target.value)} 
               className="bg-transparent border-b border-white/20 text-center text-2xl font-bold text-white w-full outline-none focus:border-primary pb-2" 
               placeholder="What are you working on?"
             />
          </div>

          {/* TIMER */}
          <div className="z-10 font-mono text-8xl md:text-9xl font-bold text-white tracking-tighter">
            {formatTime(seconds)}
          </div>

          {/* CONTROLS (Log button is right here) */}
          <div className="z-10 flex gap-4">
            {!isActive ? (
              <button onClick={resumeTimer} className="bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all">
                <Play size={20} /> Resume
              </button>
            ) : (
              <button onClick={pauseTimer} className="bg-zinc-800 text-white hover:bg-zinc-700 px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all">
                <Pause size={20} /> Pause
              </button>
            )}

            {/* THIS BUTTON SAVES TO DB */}
            <button onClick={logSession} className="bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all">
              <Square size={20} fill="currentColor" /> Log
            </button>
          </div>

          <button onClick={discardSession} className="z-10 text-zinc-500 hover:text-red-500 text-sm mt-4">
            Discard Session
          </button>
        </div>
      )}
    </div>
  );
}