import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set default header for axios
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }

  useEffect(() => {
    loadUser();
  }, [token]);

  const loadUser = async () => {
    if (token) {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/user');
        setUser(res.data);
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
  };

  const register = async (username, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/register', { username, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};