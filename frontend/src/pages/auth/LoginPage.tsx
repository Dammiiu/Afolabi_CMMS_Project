import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      addToast('Successfully logged in', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.detail || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Sign in to AATU CMMS</h2>
            <p className="mt-2 text-sm text-slate-600">
              Or{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                register as a new requestor
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <button type="submit" disabled={loading} className="w-full btn-primary flex justify-center py-2.5">
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1 bg-primary-900">
        <div className="absolute inset-0 h-full w-full object-cover flex flex-col items-center justify-center p-12 text-center text-white">
          <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center mb-8 backdrop-blur-md">
            <span className="text-4xl font-bold text-primary-300">AATU</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-4">Maintenance Management</h1>
          <p className="text-primary-200 max-w-lg text-lg">
            Streamlining campus facilities maintenance with smart triage, automated workflows, and real-time tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
