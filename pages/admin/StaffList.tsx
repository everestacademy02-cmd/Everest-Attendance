import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { getUsers, saveUser, deleteUser } from '../../services/mockFirebase';

export const StaffList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    mobile: '',
    designation: '',
    dailyWage: 0,
  });

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data.filter(u => u.role === 'staff'));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName,
        username: user.username,
        password: user.password || '',
        mobile: user.mobile || '',
        designation: user.designation || '',
        dailyWage: user.dailyWage || 0,
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        username: '',
        password: '',
        mobile: '',
        designation: '',
        dailyWage: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: editingUser ? editingUser.id : crypto.randomUUID(),
      role: 'staff',
      isActive: true,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
      ...formData,
    };
    await saveUser(newUser);
    setIsModalOpen(false);
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) {
      await deleteUser(id);
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add Staff
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wage (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credentials</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No staff added yet.</td></tr>
            ) : users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.designation}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.mobile}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">₹{user.dailyWage}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {user.username} / {user.password}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">{editingUser ? 'Edit Staff' : 'Add New Staff'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input required type="text" className="w-full border rounded p-2 mt-1" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <input required type="text" className="w-full border rounded p-2 mt-1" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <input required type="text" className="w-full border rounded p-2 mt-1" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input required type="text" className="w-full border rounded p-2 mt-1" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input required type="text" className="w-full border rounded p-2 mt-1" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Daily Wage (₹)</label>
                <input required type="number" className="w-full border rounded p-2 mt-1" value={formData.dailyWage} onChange={e => setFormData({...formData, dailyWage: Number(e.target.value)})} />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-800">Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
