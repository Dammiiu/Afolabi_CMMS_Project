import React, { useEffect, useState } from 'react';
import { getUsers, updateUser } from '../../api/users';
import { User, UserRole } from '../../types';
import PageHeader from '../../components/PageHeader';
import DataTable, { Column } from '../../components/DataTable';
import SearchBar from '../../components/SearchBar';
import { useToast } from '../../contexts/ToastContext';

type SortOption = 'name_asc' | 'name_desc' | 'role_asc' | 'role_desc';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
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
      accessor: (user: User) => (
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
    { header: 'Department', accessor: (u: User) => u.department || '-' }
  ];

  const filteredUsers = users
    .filter(u => 
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.full_name.localeCompare(b.full_name);
        case 'name_desc': return b.full_name.localeCompare(a.full_name);
        case 'role_asc': return a.role.localeCompare(b.role);
        case 'role_desc': return b.role.localeCompare(a.role);
        default: return 0;
      }
    });

  return (
    <div>
      <PageHeader title="User Management" description="Manage user accounts and system roles." />
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96">
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search users by name or email..." 
          />
        </div>
        <div className="w-full sm:w-auto flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Sort by:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="input-field py-2"
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="role_asc">Role (A-Z)</option>
            <option value="role_desc">Role (Z-A)</option>
          </select>
        </div>
      </div>

      <div className="card p-1">
        <DataTable columns={cols} data={filteredUsers} emptyMessage="No users match your search." />
      </div>
    </div>
  );
};

export default UserManagement;
