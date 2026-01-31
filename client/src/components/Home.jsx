import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Target, Zap } from 'lucide-react';
import { calculateStreak } from '../utils/streakCalculator'; // Import the logic

export default function Home() {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Quick fetch to get streak
    axios.get('http://localhost:5000/api/focus').then(res => {
      setStreak(calculateStreak(res.data));
      setLoading(false);
    }).catch(err => setLoading(false));
  }, []);

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-12">
      <div className="space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-white tracking-tight"
        >
          Good Morning, <span className="text-zinc-500">Architect.</span>
        </motion.h1>
        <motion.p 
          className="text-xl text-zinc-400 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
           Your mind is a compounding asset. 
           {streak > 0 ? (
             <span className="text-primary font-bold ml-1">🔥 {streak} Day Streak active.</span>
           ) : (
             <span className="text-zinc-600 ml-1">No active streak. Start today.</span>
           )}
        </motion.p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/log">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group p-8 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-6 text-primary">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Log Session</h3>
              <div className="flex items-center gap-2 text-zinc-400 group-hover:text-primary transition-colors">
                <span>Enter today's protocol</span> <ArrowRight size={16} />
              </div>
            </div>
          </motion.div>
        </Link>

        <Link to="/analytics">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group p-8 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 hover:border-accent/50 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-6 text-accent">
                <Target size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">View Intelligence</h3>
              <div className="flex items-center gap-2 text-zinc-400 group-hover:text-accent transition-colors">
                <span>Analyze performance</span> <ArrowRight size={16} />
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Mini Stats Row */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-4"
      >
        <StatPill label="Current Streak" value="12 Days" icon={<Flame size={16} className="text-orange-500" />} />
        <StatPill label="Efficiency (W)" value="84%" icon={<Zap size={16} className="text-yellow-400" />} />
        <StatPill label="Total Hours (All)" value="342.5" icon={<Target size={16} className="text-blue-400" />} />
      </motion.div>
    </div>
  );
}

function StatPill({ label, value, icon }) {
  return (
    <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-zinc-400 text-sm font-medium">{label}</span>
      </div>
      <span className="text-white font-mono font-bold">{value}</span>
    </div>
  );
}