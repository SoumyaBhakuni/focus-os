import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plus, Save, Trash2, Edit2, BookOpen, X, CheckCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { AuthContext } from '../context/AuthContext';
import { getTodayIST } from '../utils/dateHelpers'; // <--- CRITICAL FIX

export default function DailyEntryForm() {
  const { user } = useContext(AuthContext);
  
  // Data State
  const [logs, setLogs] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState(null);
  
  // 1. USE IST DATE (Fixes the "Stuck on Jan 31" issue)
  const [date, setDate] = useState(getTodayIST());
  
  const [notes, setNotes] = useState('');
  const [sessions, setSessions] = useState([
    { category: 'DSA', subCategory: '', focused: 0, assigned: 0 }
  ]);

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [modalStats, setModalStats] = useState(null);

  // 1. INITIAL LOAD
  useEffect(() => {
    fetchLogs();
  }, [user]); // Re-run when user loads (to get tracks)

  // 2. Fetch Logs & CHECK DATE
  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/focus`);
      setLogs(res.data);
      
      // CRITICAL: Check against IST Today, not UTC
      const todayStr = getTodayIST();
      const todayLog = res.data.find(l => l.date === todayStr);

      if (todayLog) {
        loadEntryIntoForm(todayLog);
      } else {
        // If no log exists for *today* (IST), explicitly RESET the form.
        // This prevents yesterday's data from sticking around past midnight.
        resetFormForNewDay(todayStr);
      }
      
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  // Helper: Clear form for a fresh day
  const resetFormForNewDay = (todayStr) => {
    setDate(todayStr);
    setEditingId(null);
    setNotes('');
    
    // Pre-fill with user's active tracks from Settings
    if (user && user.tracks && user.tracks.length > 0) {
      const defaultSessions = user.tracks.map(track => ({
        category: track.name,
        subCategory: track.currentTopic || '',
        focused: 0,
        assigned: 0
      }));
      setSessions(defaultSessions);
    } else {
      setSessions([{ category: 'DSA', subCategory: '', focused: 0, assigned: 0 }]);
    }
  };

  const loadEntryIntoForm = (log) => {
    setEditingId(log._id);
    setDate(log.date);
    setNotes(log.notes || '');
    
    // Merge existing log data with current User Tracks
    // This ensures that if you added a new Subject in Settings, it appears here
    if (user && user.tracks) {
      const mergedSessions = user.tracks.map(track => {
        // Find if this track was already logged today
        const existing = log.sessions.find(s => s.category === track.name);
        return existing ? existing : {
          category: track.name,
          subCategory: track.currentTopic || '',
          focused: 0,
          assigned: 0
        };
      });
      
      // Also keep any "Sudden" or extra tracks logged that aren't in settings
      const extraSessions = log.sessions.filter(s => 
        !user.tracks.find(t => t.name === s.category)
      );

      setSessions([...mergedSessions, ...extraSessions]);
    } else {
      setSessions(log.sessions);
    }
  };

  // Form Handlers
  const handleSessionChange = (index, field, value) => {
    const newSessions = [...sessions];
    newSessions[index][field] = value;
    setSessions(newSessions);
  };

  const addSessionRow = () => {
    setSessions([...sessions, { category: 'Sudden', subCategory: '', focused: 0, assigned: 0 }]);
  };

  const removeSessionRow = (index) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  // 3. SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cleanSessions = sessions.map(s => ({
      ...s,
      focused: Number(s.focused),
      assigned: Number(s.assigned)
    }));

    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/focus/${editingId}`, { sessions: cleanSessions, notes });
      } else {
        // Ensure we send the IST Date
        await axios.post(`${import.meta.env.VITE_API_URL}/api/focus`, { date, sessions: cleanSessions, notes });
      }
      
      // Calculate Stats for Modal
      const totalFocused = cleanSessions.reduce((sum, s) => sum + s.focused, 0);
      const totalAssigned = cleanSessions.reduce((sum, s) => sum + s.assigned, 0);
      const efficiency = totalAssigned > 0 ? Math.round((totalFocused / totalAssigned) * 100) : 0;

      setModalStats({ totalFocused, totalAssigned, efficiency });
      setShowModal(true);
      
      // Refresh background data
      fetchLogs(); // This will reload the table below

    } catch (err) {
      console.error(err);
      toast.error('Save Failed');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this entire day?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/focus/${id}`);
      toast.success('Entry Deleted');
      if (id === editingId) {
        // Reset to today
        resetFormForNewDay(getTodayIST());
      }
      fetchLogs();
    } catch (err) {
      toast.error('Delete Failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 animate-in fade-in duration-500 relative">
      
      {/* --- SUCCESS MODAL --- */}
      {showModal && modalStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl p-8 relative shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X size={24} />
            </button>

            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white">Day Updated!</h2>
                <p className="text-zinc-400">Your control panel is synced.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                   <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Total Focus</div>
                   <div className="text-2xl font-mono font-bold text-white">{modalStats.totalFocused.toFixed(1)}h</div>
                </div>
                <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                   <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Target</div>
                   <div className="text-2xl font-mono font-bold text-primary">{modalStats.totalAssigned.toFixed(1)}h</div>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className={modalStats.efficiency >= 80 ? "text-yellow-500" : "text-zinc-600"} size={20} />
                  <span className="text-sm font-bold text-zinc-300">Efficiency Score</span>
                </div>
                <span className={`text-xl font-bold ${modalStats.efficiency >= 100 ? 'text-green-500' : 'text-white'}`}>
                  {modalStats.efficiency}%
                </span>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Back to Work
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDITOR PANEL --- */}
      <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl relative">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             {editingId ? <Edit2 className="text-primary" /> : <Plus className="text-zinc-500" />}
             {editingId ? 'Control Panel: Today' : 'Initialize New Day'}
           </h2>
           <div className="text-xs text-zinc-500 font-mono bg-black/50 px-3 py-1 rounded-full border border-white/5">
              {editingId ? 'LIVE EDIT MODE' : 'CREATION MODE'}
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Date (IST)</label>
              <input 
                type="date" 
                value={date} 
                disabled // Lock date to today to prevent errors
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-mono opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Daily Reflection</label>
              <input 
                type="text" 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Key learnings or focus for the day..."
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between px-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Track / Subject</label>
                <div className="flex gap-8 mr-12">
                   <label className="text-xs font-bold text-zinc-500 uppercase">Focused</label>
                   <label className="text-xs font-bold text-primary uppercase">Target</label>
                </div>
             </div>

            {sessions.map((session, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-black/40 p-3 rounded-xl border border-white/5">
                <select 
                  value={session.category}
                  onChange={(e) => handleSessionChange(index, 'category', e.target.value)}
                  className="bg-zinc-900 text-white p-2 rounded-lg border border-white/10 outline-none w-full md:w-32 focus:border-primary"
                >
                  <option value="Sudden">Sudden / Ad-Hoc</option>
                  {user?.tracks?.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)}
                </select>

                <input 
                  placeholder="Topic..." 
                  value={session.subCategory}
                  onChange={(e) => handleSessionChange(index, 'subCategory', e.target.value)}
                  className="bg-transparent border-b border-white/10 p-2 text-white w-full outline-none focus:border-primary"
                />

                <div className="flex gap-2 w-full md:w-auto">
                  <input 
                    type="number" step="0.1" 
                    value={session.focused}
                    onChange={(e) => handleSessionChange(index, 'focused', e.target.value)}
                    className="bg-zinc-900 border border-white/10 rounded-lg p-2 w-full md:w-24 text-center text-white font-bold outline-none focus:border-primary"
                  />
                  <input 
                    type="number" step="0.1" 
                    value={session.assigned}
                    onChange={(e) => handleSessionChange(index, 'assigned', e.target.value)}
                    className="bg-zinc-900 border border-primary/30 text-primary rounded-lg p-2 w-full md:w-24 text-center font-bold outline-none focus:border-primary shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                  />
                </div>

                <button type="button" onClick={() => removeSessionRow(index)} className="text-zinc-600 hover:text-red-500 p-2">
                    <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            <button type="button" onClick={addSessionRow} className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-1 mt-2">
              <Plus size={14} /> Add Track
            </button>
          </div>

          <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-zinc-200 transition-all">
            <Save size={18} /> {editingId ? 'Update Day Plan' : 'Initialize Day'}
          </button>
        </form>
      </div>

      {/* HISTORY TABLE */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BookOpen className="text-zinc-500" /> Log History
        </h3>

        {loading ? (
          <div className="text-zinc-500 animate-pulse">Loading records...</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const isEditing = log._id === editingId;
              return (
                <div key={log._id} className={`border p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all group ${isEditing ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-zinc-900/30 border-white/5 hover:border-white/10'}`}>
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <span className={`text-lg font-mono font-bold ${isEditing ? 'text-yellow-500' : 'text-white'}`}>{log.date}</span>
                         {isEditing && <span className="text-[10px] font-bold bg-yellow-500 text-black px-2 py-0.5 rounded-full uppercase">Active</span>}
                         <span className="text-xs text-zinc-500 uppercase font-bold">{log.sessions.length} Items</span>
                      </div>
                      {log.notes && <p className="text-zinc-400 text-sm italic line-clamp-1">"{log.notes}"</p>}
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {log.sessions.slice(0, 4).map((s, i) => (
                       <div key={i} className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-lg border border-white/10">
                         <span className="text-xs font-bold text-zinc-300 uppercase">{s.category}</span>
                         <span className="text-xs font-mono text-white">{s.focused}h</span>
                         <span className="text-[10px] text-zinc-600">/ {s.assigned}h</span>
                       </div>
                     ))}
                   </div>
                   <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => loadEntryIntoForm(log)} className="p-2 bg-zinc-800 hover:text-yellow-500 rounded-lg transition-colors"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(log._id)} className="p-2 bg-zinc-800 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}