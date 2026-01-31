import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.username, form.password);
      toast.success('Identity Created');
      navigate('/');
    } catch (err) {
      toast.error('Registration Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-4">
      <div className="w-full max-w-md bg-zinc-900/50 p-8 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex justify-center mb-6 text-primary"><UserPlus size={40} /></div>
        <h2 className="text-2xl font-bold text-center mb-6">Initialize New Account</h2>
        
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
          <button className="w-full bg-white text-black font-bold p-3 rounded-lg hover:bg-zinc-200 transition">
            Create Identity
          </button>
        </form>
        <p className="mt-4 text-center text-zinc-500 text-sm">
          Existing user? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}