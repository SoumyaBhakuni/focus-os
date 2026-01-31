import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, // <--- Added this import
  Timer, 
  PenTool, 
  TrendingUp, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Activity
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import MiniTimer from './MiniTimer';

const MENU_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },               // 1. Home
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }, // 2. Dashboard (Added)
  { path: '/analytics', icon: TrendingUp, label: 'Analytics' },      // 3. Analytics
  { path: '/log', icon: PenTool, label: 'Manual Log' },
  { path: '/focus', icon: Timer, label: 'Live Focus' },
  { path: '/settings', icon: Settings, label: 'Configuration' }
];

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`
        h-screen bg-black border-r border-white/10 flex flex-col transition-all duration-300 relative sticky top-0
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* TOGGLE BUTTON */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-zinc-800 border border-zinc-600 text-zinc-400 rounded-full p-1 hover:text-white transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* HEADER / LOGO */}
      <div className={`p-6 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
           <Activity size={20} className="text-black" />
        </div>
        {!isCollapsed && (
          <h1 className="text-xl font-bold tracking-tighter text-white animate-in fade-in duration-300">
            Focus<span className="text-zinc-500">OS</span>
          </h1>
        )}
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all group
                ${isActive ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon size={20} className={isActive ? 'text-primary' : 'group-hover:text-white'} />
              
              {!isCollapsed && (
                <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER SECTION (Mini Timer + Logout) */}
      <div className="p-4 border-t border-white/5 space-y-4">
        
        {/* Only show Mini Timer if expanded */}
        {!isCollapsed && <MiniTimer />}

        <button 
          onClick={logout}
          className={`
            flex items-center gap-3 p-2 rounded-lg text-zinc-600 hover:text-red-400 transition-colors w-full
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title="Logout"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}