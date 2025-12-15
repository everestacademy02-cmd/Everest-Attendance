import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockLogin } from '../services/mockFirebase';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await mockLogin(username, password);
      if (user) {
        login(user);
        if (user.role === 'admin') navigate('/admin');
        else navigate('/staff');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Everest Academy</h1>
          <p className="text-blue-200 text-sm">Staff Attendance Portal</p>
        </div>
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Sign In</h2>
          {error && <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition duration-200"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>Everest Academy Sec. School, Alwar</p>
          </div>
        </div>
      </div>
    </div>
  );
};
