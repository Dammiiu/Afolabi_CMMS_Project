import React, { useEffect, useState } from 'react';
import { getUsers, updateUser } from '../../api/users';
import { User, UserRole } from '../../types';
import PageHeader from '../../components/PageHeader';
import DataTable, { Column } from '../../components/DataTable';
import { useToast } from '../../contexts/ToastContext';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    getUsers().then(res => setUsers(res.items)).catch(console.error);
  }, []);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await updateUser(userId, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      addToast('User role updated successfully', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Failed to update user role', 'error');
    }
  };

  const cols: Column<User>[] = [
    { header: 'Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (user) => (
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="requestor">Requestor</option>
          <option value="technician">Technician</option>
          <option value="supervisor">Supervisor</option>
          <option value="admin">Admin</option>
        </select>
      )
    },
    { header: 'Department', accessor: 'department' }
  ];

  return (
    <div>
      <PageHeader title="User Management" description="Manage user accounts and system roles." />
      <div className="card p-1">
        <DataTable columns={cols} data={users} />
      </div>
    </div>
  );
};

export default UserManagement;
