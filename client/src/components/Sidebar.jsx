import { useContext } from 'react'; // <--- Import Hook
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // <--- Import Context
import { LayoutDashboard, PenTool, Home, TrendingUp, LogOut, Timer } from 'lucide-react'; // Add Timer icon
import { motion } from 'framer-motion';

const MENU_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/focus', icon: Timer, label: 'Live Focus' }, // <--- New Item
  { path: '/log', icon: PenTool, label: 'Manual Log' },
  { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // <--- Get logout function

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-64 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 z-50"
    >
      <div className="mb-10 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <LayoutDashboard size={18} className="text-black" />
        </div>
        <h1 className="text-xl font-bold tracking-tighter text-white">
          Focus<span className="text-primary">OS</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive ? 'bg-primary text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}
              `}>
                <item.icon size={20} className={isActive ? 'text-black' : 'group-hover:text-primary transition-colors'} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <button 
          onClick={handleLogout} // <--- Attach Click Handler
          className="flex items-center gap-3 text-zinc-500 hover:text-red-400 transition-colors w-full px-4 py-2"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Disconnect</span>
        </button>
      </div>
    </motion.div>
  );
}