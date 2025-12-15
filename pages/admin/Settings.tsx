import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings, mockChangePassword } from '../../services/mockFirebase';
import { AppSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    officeStartTime: '09:00',
    lateGracePeriodMinutes: 15,
  });
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const s = await getSettings();
      setSettings(s);
    };
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settings);
    setMessage('Settings updated successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if(user && newPassword) {
        await mockChangePassword(user.id, newPassword);
        setNewPassword('');
        setMessage('Password changed successfully.');
        setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
      {message && <div className="p-3 bg-green-100 text-green-700 rounded">{message}</div>}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Attendance Rules</h3>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Office Start Time</label>
            <input 
              type="time" 
              className="mt-1 block w-full border rounded-md p-2 shadow-sm"
              value={settings.officeStartTime}
              onChange={e => setSettings({...settings, officeStartTime: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Late Grace Period (Minutes)</label>
            <input 
              type="number" 
              className="mt-1 block w-full border rounded-md p-2 shadow-sm"
              value={settings.lateGracePeriodMinutes}
              onChange={e => setSettings({...settings, lateGracePeriodMinutes: Number(e.target.value)})}
            />
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-800">
            Save Rules
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border-t-4 border-secondary">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Admin Security</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">Change Admin Password</label>
            <input 
              type="password" 
              placeholder="New Password"
              className="mt-1 block w-full border rounded-md p-2 shadow-sm"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
           </div>
           <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
