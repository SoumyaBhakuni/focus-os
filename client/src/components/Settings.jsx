import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Plus, Save, Trash2, Settings as GearIcon, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { AuthContext } from '../context/AuthContext';

export default function Settings() {
  const { user, loadUser } = useContext(AuthContext);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load initial tracks from user profile
  useEffect(() => {
    if (user && user.tracks) {
      setTracks(user.tracks);
    }
  }, [user]);

  // 1. HANDLE TEXT CHANGE (Topics/Names)
  const handleChange = (index, field, value) => {
    const newTracks = [...tracks];
    newTracks[index][field] = value;
    setTracks(newTracks);
  };

  // 2. HANDLE ADD (New Subject)
  const addTrack = () => {
    // Adds a clean new object
    setTracks([...tracks, { name: 'New Subject', currentTopic: 'Chapter 1' }]);
  };

  // 3. HANDLE REMOVE (Delete Subject)
  const removeTrack = (index) => {
    // Filters out the item at 'index'
    const newTracks = tracks.filter((_, i) => i !== index);
    setTracks(newTracks);
  };

  // 4. SUBMIT (The Fix)
  const saveSettings = async () => {
    setLoading(true);
    try {
      // Send the clean 'tracks' array directly
      await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/update`, { tracks });
      
      // Refresh the global user state so other components (Sidebar/Timer) see changes instantly
      await loadUser(); 
      
      toast.success('System Configuration Updated');
    } catch (err) {
      console.error(err);
      toast.error('Update Failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in duration-500">
      
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-zinc-800 p-3 rounded-xl">
          <GearIcon className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">System Configuration</h2>
          <p className="text-zinc-400">Define your active protocols. Targets are managed daily in the Manual Log.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"/> Active Tracks
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-2 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-4">Track Name</div>
            <div className="col-span-7">Current Topic / Focus</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {tracks.map((track, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center bg-black/40 p-3 rounded-xl border border-white/5 transition-colors hover:border-white/10">
              
              {/* Name Input */}
              <div className="col-span-4">
                <input 
                  value={track.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="e.g. DSA"
                />
              </div>

              {/* Topic Input */}
              <div className="col-span-7">
                <input 
                  value={track.currentTopic}
                  onChange={(e) => handleChange(index, 'currentTopic', e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-zinc-300 outline-none focus:border-white/30 transition-all"
                  placeholder="e.g. Graphs"
                />
              </div>

              {/* Delete Button */}
              <div className="col-span-1 flex justify-center">
                <button 
                  onClick={() => removeTrack(index)}
                  className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete Track"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Add Button */}
        <button 
          onClick={addTrack}
          className="mt-6 flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 px-4 py-2 rounded-lg border border-transparent hover:border-white/20"
        >
          <Plus size={14} /> Add New Track
        </button>

        {/* Footer Actions */}
        <div className="mt-12 pt-6 border-t border-white/5 flex justify-end">
           <button 
            onClick={saveSettings}
            disabled={loading}
            className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><Save size={18} /> Commit Changes</>}
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl">
        <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
        <p className="text-sm text-yellow-500/80 leading-relaxed">
          <strong>Note:</strong> Renaming a track here updates it for <em>future</em> sessions. Historical logs will keep the old name to preserve data integrity.
        </p>
      </div>

    </div>
  );
}