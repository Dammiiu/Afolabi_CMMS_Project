import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      addToast('Passwords do not match', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const data = { ...formData, role: 'requestor' };
      await register(data);
      addToast('Registration successful', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.detail || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex bg-slate-50 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm flex">
            <span className="mr-2">ℹ️</span>
            This form creates a <strong>Requestor</strong> account for reporting faults. Staff and Admin accounts must be created by an Administrator.
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="full_name">Full Name</label>
              <input id="full_name" name="full_name" type="text" required className="input-field" onChange={handleChange} />
            </div>

            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required className="input-field" onChange={handleChange} />
            </div>

            <div>
              <label className="label" htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" type="tel" className="input-field" onChange={handleChange} />
            </div>

            <div>
              <label className="label" htmlFor="department">Department</label>
              <input id="department" name="department" type="text" className="input-field" onChange={handleChange} />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required className="input-field" onChange={handleChange} />
            </div>

            <div>
              <label className="label" htmlFor="confirm_password">Confirm Password</label>
              <input id="confirm_password" name="confirm_password" type="password" required className="input-field" onChange={handleChange} />
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 mt-2">
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
