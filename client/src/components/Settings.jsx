import { useState, useContext } from 'react';
import { Save, Plus, Trash2, Settings as SettingsIcon, Layers } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

export default function Settings() {
  const { user, login } = useContext(AuthContext); // We use login to re-save user data
  const [tracks, setTracks] = useState(user?.tracks || []);
  const [loading, setLoading] = useState(false);

  // Handle Input Changes
  const handleTrackChange = (index, field, value) => {
    const newTracks = [...tracks];
    newTracks[index][field] = value;
    setTracks(newTracks);
  };

  // Add New Track
  const addTrack = () => {
    setTracks([...tracks, { name: '', currentTopic: '' }]);
  };

  // Remove Track
  const removeTrack = (index) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  // Save to Backend
  const saveSettings = async () => {
    setLoading(true);
    try {
      // Filter out empty rows
      const cleanTracks = tracks.filter(t => t.name.trim() !== '');

      // We need to send this to a user update endpoint. 
      // Assuming you have a route like PUT /api/auth/update or similar.
      // If not, we can assume we update via the same auth endpoint logic.
      // For now, let's assume we update the user object locally and sync.
      
      const res = await axios.put('http://localhost:5000/api/auth/update', { 
        tracks: cleanTracks 
      });

      // Update Local Context
      login(res.data.token, res.data.user);
      toast.success('Configuration Saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="text-zinc-500" /> System Configuration
        </h2>
        <p className="text-zinc-400 mt-2">
          Define your active protocols. Targets are now managed daily in the Manual Log.
        </p>
      </div>

      {/* Track Editor */}
      <div className="bg-zinc-900/30 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
           <Layers className="text-primary" /> Active Tracks
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-2 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
             <div className="col-span-4">Track Name</div>
             <div className="col-span-7">Current Topic / Focus</div>
             <div className="col-span-1">Action</div>
          </div>

          {tracks.map((track, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center bg-black/40 p-3 rounded-xl border border-white/5">
              
              {/* Track Name */}
              <div className="col-span-4">
                <input
                  value={track.name}
                  onChange={(e) => handleTrackChange(index, 'name', e.target.value)}
                  placeholder="e.g. DSA"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white font-bold outline-none focus:border-primary"
                />
              </div>

              {/* Current Topic */}
              <div className="col-span-7">
                <input
                  value={track.currentTopic}
                  onChange={(e) => handleTrackChange(index, 'currentTopic', e.target.value)}
                  placeholder="e.g. Graphs & Trees"
                  className="w-full bg-transparent border-b border-white/10 p-3 text-zinc-300 outline-none focus:border-primary focus:text-white transition-all"
                />
              </div>

              {/* Delete */}
              <div className="col-span-1 flex justify-center">
                <button 
                  onClick={() => removeTrack(index)}
                  className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
           <button 
             onClick={addTrack}
             className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl transition-all"
           >
             <Plus size={16} /> Add New Track
           </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-white/10">
        <button 
          onClick={saveSettings}
          disabled={loading}
          className="bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <span className="animate-spin">⏳</span> : <Save size={20} />} 
          {loading ? 'Saving...' : 'Commit Changes'}
        </button>
      </div>

    </div>
  );
}