import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext'; // Import Context

import Sidebar from './components/Sidebar';
import Home from './components/Home';
import DailyEntryForm from './components/DailyEntryForm';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import FocusMode from './components/FocusMode'; // <--- Import

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="text-zinc-500 p-10">Initializing Secure Context...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Layout Wrapper (Sidebar + Content)
const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-[#09090b] text-white font-sans selection:bg-primary/30">
    <Sidebar />
    <main className="flex-1 ml-64 relative">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 p-8 min-h-screen">
        {children}
      </div>
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" theme="dark" richColors closeButton />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes (Wrapped in Layout) */}
          <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
          <Route path="/log" element={<PrivateRoute><Layout><div className="max-w-4xl mx-auto py-8"><DailyEntryForm /></div></Layout></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Layout><div className="max-w-6xl mx-auto py-4"><Dashboard /></div></Layout></PrivateRoute>} />
          <Route path="/focus" element={
    <PrivateRoute>
      <Layout>
        <FocusMode /> {/* <--- New Route */}
      </Layout>
    </PrivateRoute>
  } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;