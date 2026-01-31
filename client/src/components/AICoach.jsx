import { useState } from 'react';
import axios from 'axios';
import { Sparkles, Bot } from 'lucide-react';
import { toast } from 'sonner';

export default function AICoach() {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const getCoaching = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/analyze`);
      
      // FIX: Changed .advice to .analysis to match your backend
      setAdvice(res.data.analysis); 
      
      toast.success('Analysis Complete');
    } catch (err) {
      toast.error('AI Unreachable');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-primary/20 p-6 rounded-2xl shadow-2xl relative overflow-hidden mb-8">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bot className="text-primary" /> AI Performance Coach
        </h3>
        <button 
          onClick={getCoaching}
          disabled={loading}
          className="bg-primary/10 text-primary border border-primary/50 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-black transition-all flex items-center gap-2"
        >
          {loading ? 'Analyzing...' : <><Sparkles size={14} /> Analyze Week</>}
        </button>
      </div>

      {advice && (
        <div className="bg-black/50 border border-white/5 p-4 rounded-xl text-zinc-300 text-sm leading-relaxed font-mono animate-in fade-in slide-in-from-bottom-2 whitespace-pre-line">
          {advice}
        </div>
      )}
      
      {!advice && !loading && (
        <p className="text-zinc-600 text-sm italic">
          "Tap analyze to let Gemini audit your cognitive output."
        </p>
      )}
    </div>
  );
}