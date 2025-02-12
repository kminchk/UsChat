import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Loader, User, Lock, Heart, Waves, Cloud } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!['sky', 'sea'].includes(username)) {
      setError('Invalid username. Please use "sky" or "sea"');
      return;
    }

    const validCredentials = {
      sky: 'onlysea',
      sea: 'onlysky'
    };

    if (password !== validCredentials[username as keyof typeof validCredentials]) {
      setError('Invalid password. Please try again');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(username, password);
      navigate('/chat');
    } catch (error) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-300">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-white/20 animate-float">
          <Cloud className="w-24 h-24" />
        </div>
        <div className="absolute bottom-20 right-10 text-white/20 animate-float-delayed">
          <Waves className="w-32 h-32" />
        </div>
        <div className="absolute top-1/3 right-1/4 text-pink-200/20 animate-pulse">
          <Heart className="w-16 h-16" />
        </div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute -top-1 -right-1">
                <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full p-4 shadow-lg">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mt-4">
              Welcome to UsChat
            </h1>
            <p className="text-gray-500 mt-2">Where Sky meets Sea</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r animate-shake">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter sky or sea"
                  className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:translate-y-[-1px]"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Available accounts
              </p>
              <div className="flex justify-center space-x-6">
                <div className="bg-blue-50 rounded-lg p-3 text-xs">
                  <p className="font-semibold text-blue-700">sky</p>
                  <p className="text-blue-500">onlysea</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-3 text-xs">
                  <p className="font-semibold text-cyan-700">sea</p>
                  <p className="text-cyan-500">onlysky</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}