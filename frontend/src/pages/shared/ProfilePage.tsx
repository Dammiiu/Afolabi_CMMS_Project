import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/PageHeader';

const ProfilePage = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="My Profile" />
      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Full Name</label>
          <div className="input-field bg-slate-50">{user.full_name}</div>
        </div>
        <div>
          <label className="label">Email</label>
          <div className="input-field bg-slate-50">{user.email}</div>
        </div>
        <div>
          <label className="label">Role</label>
          <div className="input-field bg-slate-50 capitalize">{user.role}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
