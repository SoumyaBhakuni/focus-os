import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, PenTool, TrendingUp, Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { calculateStreak } from '../utils/streakCalculator';
import TodoList from './TodoList';

export default function Home() {
  const { user } = useContext(AuthContext);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStreak = async () => {
      try {
        // Fetch only necessary data for streak calculation
        const res = await axios.get('http://localhost:5000/api/focus');
        setStreak(calculateStreak(res.data));
        setLoading(false);
      } catch (err) {
        console.error("Streak fetch failed", err);
        setLoading(false);
      }
    };
    getStreak();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center">
      
      {/* 1. WELCOME SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 space-y-2"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter">
          Good Morning, <span className="text-zinc-500">{user?.username || 'Architect'}.</span>
        </h1>
        <div className="flex items-center gap-3 text-xl text-zinc-400">
           <Activity size={20} className={streak > 0 ? "text-primary" : "text-zinc-600"} />
           {loading ? (
             <span className="animate-pulse">Syncing neural link...</span>
           ) : (
             <span>
               System Status: <span className={streak > 0 ? "text-primary font-bold" : "text-zinc-500"}>
                 {streak > 0 ? `🔥 ${streak} Day Streak Active` : "No Active Streak"}
               </span>
             </span>
           )}
        </div>
      </motion.div>

      {/* 2. MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        
        {/* LEFT COLUMN: ACTION CARDS (Span 2) */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          
          {/* A. PRIMARY ACTION: LIVE FOCUS */}
          <motion.div variants={item} className="md:col-span-2">
            <Link to="/focus" className="group relative block h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-zinc-900 border border-primary/20 hover:border-primary/50 p-8 rounded-3xl flex flex-col justify-between transition-all group-hover:transform group-hover:scale-[1.01]">
                <div className="flex justify-between items-start">
                  <div className="bg-primary/20 p-4 rounded-2xl text-primary">
                    <Zap size={32} />
                  </div>
                  <ArrowRight className="text-zinc-600 group-hover:text-primary transition-colors" />
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Initiate Live Focus</h3>
                  <p className="text-zinc-400">Select a roadmap track and enter flow state. The system will handle the logging.</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* B. SECONDARY: MANUAL LOG */}
          <motion.div variants={item}>
            <Link to="/log" className="group block h-full">
              <div className="h-full bg-zinc-900/50 border border-white/5 hover:border-blue-500/50 p-6 rounded-3xl transition-all hover:bg-zinc-900">
                <div className="bg-blue-500/10 w-fit p-3 rounded-xl text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-black transition-colors">
                  <PenTool size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Manual Entry</h3>
                <p className="text-zinc-500 text-sm">Log past sessions or bulk data.</p>
              </div>
            </Link>
          </motion.div>

          {/* C. SECONDARY: ANALYTICS */}
          <motion.div variants={item}>
            <Link to="/analytics" className="group block h-full">
              <div className="h-full bg-zinc-900/50 border border-white/5 hover:border-purple-500/50 p-6 rounded-3xl transition-all hover:bg-zinc-900">
                <div className="bg-purple-500/10 w-fit p-3 rounded-xl text-purple-400 mb-6 group-hover:bg-purple-500 group-hover:text-black transition-colors">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Intelligence</h3>
                <p className="text-zinc-500 text-sm">View heatmaps and AI analysis.</p>
              </div>
            </Link>
          </motion.div>

        </motion.div>

        {/* RIGHT COLUMN: TODO LIST WIDGET (Span 1) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full min-h-[400px]"
        >
          <TodoList />
        </motion.div>

      </div>
    </div>
  );
}