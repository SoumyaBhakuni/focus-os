import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      toast.success('Access Granted');
      navigate('/');
    } catch (err) {
      toast.error('Access Denied', { description: 'Invalid credentials' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-4">
      <div className="w-full max-w-md bg-zinc-900/50 p-8 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex justify-center mb-6 text-primary"><Lock size={40} /></div>
        <h2 className="text-2xl font-bold text-center mb-6">FocusOS Secure Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Username" 
            className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:border-primary outline-none"
            onChange={e => setForm({...form, username: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:border-primary outline-none"
            onChange={e => setForm({...form, password: e.target.value})}
          />
          <button className="w-full bg-primary text-black font-bold p-3 rounded-lg hover:opacity-90 transition">
            Authenticate
          </button>
        </form>
        <p className="mt-4 text-center text-zinc-500 text-sm">
          New Architect? <Link to="/register" className="text-primary hover:underline">Initialize Protocol</Link>
        </p>
      </div>
    </div>
  );
}