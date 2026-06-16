import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { User } from '../types';
import { UserModal } from './UserModal';
import { toast } from './Toast';
import { fetchUsers, createUser, updateUser, deleteUser as apiDeleteUser } from '../api.client.ts';
import { mapApiUserToUser } from '../mappers.ts';

interface AccountsPageProps {
  searchQuery: string;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({ searchQuery }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Invited'>('All');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUsers = await fetchUsers();
        if (!mounted) return;
        setUsers(apiUsers.map(mapApiUserToUser));
      } catch (err) {
        console.error(err);
        if (mounted) setError('Failed to load users');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'Editor': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'Accountant': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Invited': return 'bg-orange-500';
      case 'Disabled': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const handleAddUser = async (userData: Omit<User, 'id' | 'lastActive' | 'avatarUrl'>) => {
    try {
      const apiUser = await createUser({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
      });
      const newUser = mapApiUserToUser(apiUser);
      setUsers([...users, newUser]);
      toast.success('User created successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create user. Please try again.');
    }
  };

  const handleEditUser = async (userData: Omit<User, 'id' | 'lastActive' | 'avatarUrl'>) => {
    if (!selectedUser) return;
    try {
      const apiUser = await updateUser(Number(selectedUser.id), {
        role: userData.role,
        status: userData.status,
      });
      const updated = mapApiUserToUser(apiUser);
      const updatedUsers = users.map((u) => (u.id === selectedUser.id ? updated : u));
      setUsers(updatedUsers);
      setSelectedUser(null);
      toast.success('User updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await apiDeleteUser(Number(id));
      setUsers(users.filter(u => u.id !== id));
      toast.success('User removed successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'Invited') {
      return matchesSearch && user.status === 'Invited';
    }
    return matchesSearch;
  });

  return (
    <>
      <UserModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
        onSubmit={selectedUser ? handleEditUser : handleAddUser}
        initialData={selectedUser}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Administration</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts & Users</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-gray-850 p-1 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center">
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeFilter === 'All' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveFilter('Invited')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeFilter === 'Invited' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Invited
            </button>
          </div>

          <button
            onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-gray-500/10 transition-all"
          >
            <Icons.UserPlus size={18} />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Last Active</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-600 dark:text-red-400">
                    {error}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img loading="lazy" className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" src={user.avatarUrl} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-900/30 text-gray-900 dark:text-gray-600 flex items-center justify-center font-bold border border-gray-200 dark:border-gray-800">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {user.lastActive}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-600 transition-colors"
                          title="Edit User"
                        >
                          <Icons.Edit size={16} />
                        </button>
                        <button
                          className="p-1.5 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                          title="Reset Password"
                        >
                          <Icons.Lock size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                          title="Delete User"
                        >
                          <Icons.Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </span>
          <div className="flex gap-2">
            <button disabled className="p-1 rounded text-gray-400 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">
              <Icons.ChevronLeft size={16} />
            </button>
            <button disabled className="p-1 rounded text-gray-400 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">
              <Icons.ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};