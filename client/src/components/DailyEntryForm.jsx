import { useState } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, CheckCircle, AlertCircle, Tag } from 'lucide-react';
import { toast } from 'sonner'; // Add import

const PRESET_CATEGORIES = ['Maths', 'Dev', 'Core', 'ML', 'DSA', 'Reading', 'Design'];
const PRESET_TAGS = ['Learning', 'Project', 'Self-Coded', 'Tools/AI', 'Review', 'Practice'];

export default function DailyEntryForm() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('idle');
  const [notes, setNotes] = useState('');
  
  // Dynamic State: Start with one empty session
  const [sessions, setSessions] = useState([
    { category: 'DSA', subCategory: '', tags: [], focused: '', assigned: '' }
  ]);

  const addRow = () => {
    setSessions([...sessions, { category: 'Dev', subCategory: '', tags: [], focused: '', assigned: '' }]);
  };

  const removeRow = (index) => {
    const newSessions = sessions.filter((_, i) => i !== index);
    setSessions(newSessions);
  };

  const updateRow = (index, field, value) => {
    const newSessions = [...sessions];
    newSessions[index][field] = value;
    setSessions(newSessions);
  };

  const toggleTag = (index, tag) => {
    const newSessions = [...sessions];
    const currentTags = newSessions[index].tags;
    if (currentTags.includes(tag)) {
      newSessions[index].tags = currentTags.filter(t => t !== tag);
    } else {
      newSessions[index].tags = [...currentTags, tag];
    }
    setSessions(newSessions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Clean data before sending
      const cleanSessions = sessions.map(s => ({
        ...s,
        focused: Number(s.focused) || 0,
        assigned: Number(s.assigned) || 0
      }));

      await axios.post('http://localhost:5000/api/focus', { date, sessions: cleanSessions, notes });
      
      toast.success('Protocol Logged Successfully', {
    description: 'Your consistency is compounding.',
    duration: 3000,
  });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      toast.error('Sync Failed', { description: 'Check your connection.' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-surface rounded-xl border border-white/10 shadow-2xl">
      <div className="mb-6 flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Session Logger</h2>
          <p className="text-zinc-400 text-sm mt-1">Granular tracking for high-performance.</p>
        </div>
        <div className="flex flex-col gap-1">
           <label className="text-[10px] uppercase text-zinc-500 font-bold">Date</label>
           <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-background border border-white/10 text-white rounded px-3 py-1 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {sessions.map((session, index) => (
          <div key={index} className="bg-background/50 p-4 rounded-lg border border-white/5 relative group">
            
            {/* Delete Button (Visible on Hover) */}
            {sessions.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              
              {/* 1. Category (Dropdown + Editable) */}
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Category</label>
                <input 
                  list={`cat-options-${index}`}
                  value={session.category}
                  onChange={(e) => updateRow(index, 'category', e.target.value)}
                  className="w-full bg-black border border-white/10 text-white rounded p-2 text-sm focus:border-primary outline-none"
                  placeholder="Select..."
                />
                <datalist id={`cat-options-${index}`}>
                  {PRESET_CATEGORIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              {/* 2. Sub-Category (Topic) */}
              <div className="md:col-span-3">
                <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Topic / Project</label>
                <input 
                  type="text"
                  value={session.subCategory}
                  onChange={(e) => updateRow(index, 'subCategory', e.target.value)}
                  className="w-full bg-black border border-white/10 text-zinc-300 rounded p-2 text-sm focus:border-primary outline-none"
                  placeholder="e.g. Graphs, AutoScan..."
                />
              </div>

              {/* 3. Tags (Multi-select) */}
              <div className="md:col-span-4">
                <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Attributes</label>
                <div className="flex flex-wrap gap-1">
                  {PRESET_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(index, tag)}
                      className={`
                        text-[10px] px-2 py-1 rounded border transition-all
                        ${session.tags.includes(tag) 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : 'bg-black border-white/10 text-zinc-500 hover:border-zinc-400'}
                      `}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Numbers */}
              <div className="md:col-span-3 flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] uppercase text-primary font-bold mb-1 block">Focused</label>
                  <input 
                    type="number" step="0.5"
                    value={session.focused}
                    onChange={(e) => updateRow(index, 'focused', e.target.value)}
                    className="w-full bg-black border border-white/10 text-primary font-mono text-center rounded p-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex-1">
                   <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Assigned</label>
                   <input 
                    type="number" step="0.5"
                    value={session.assigned}
                    onChange={(e) => updateRow(index, 'assigned', e.target.value)}
                    className="w-full bg-black border border-white/10 text-zinc-400 font-mono text-center rounded p-2 text-sm outline-none focus:border-white/30"
                  />
                </div>
              </div>

            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={addRow}
            className="flex-1 py-3 border border-dashed border-white/20 rounded-lg text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus size={16} /> Add Another Session
          </button>
        </div>

        <div className="pt-4 border-t border-white/10">
           <label className="text-[10px] uppercase text-zinc-500 font-bold mb-2 block">Daily Reflections (Optional)</label>
           <textarea 
             value={notes}
             onChange={(e) => setNotes(e.target.value)}
             className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-zinc-300 min-h-[80px] outline-none focus:border-primary"
             placeholder="What went well? What blocked me?"
           />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className={`
            w-full p-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
            ${status === 'success' ? 'bg-primary text-black' : 'bg-white text-black hover:bg-zinc-200'}
            ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {status === 'loading' ? 'Syncing...' : <><Save size={20} /> Commit Session Log</>}
        </button>

      </form>
    </div>
  );
}