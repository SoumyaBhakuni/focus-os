import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext'; 

// Components
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import DailyEntryForm from './components/DailyEntryForm';
import Sidebar from './components/Sidebar';
import FocusMode from './components/FocusMode';
import Settings from './components/Settings';
import Analytics from './components/Analytics';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-black text-zinc-500">Initializing FocusOS...</div>;
  return token ? children : <Navigate to="/login" />;
};

// Layout Wrapper (Sidebar + Page Content)
const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black">
      
      {/* Sidebar stays fixed on the left */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 p-8 overflow-y-auto h-screen custom-scrollbar relative">
        <div className="max-w-7xl mx-auto">
           {children}
        </div>
      </main>
      
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* --- CORE WORKSPACES --- */}
            
            {/* 1. HOME (Landing Page) */}
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Home />
                </Layout>
              </PrivateRoute>
            } />

            {/* 2. DASHBOARD (AI & Stats) */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />

            {/* 3. ANALYTICS (Charts) */}
            <Route path="/analytics" element={
              <PrivateRoute>
                <Layout>
                  <Analytics /> 
                </Layout>
              </PrivateRoute>
            } />

            {/* --- TOOLS --- */}

            <Route path="/log" element={
              <PrivateRoute>
                <Layout>
                  <DailyEntryForm />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/focus" element={
              <PrivateRoute>
                <Layout>
                  <FocusMode />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/settings" element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;