import React, { useEffect, useState } from 'react';
import { getUsers, getAttendance } from '../../services/mockFirebase';
import { User, AttendanceRecord } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStaff: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const users = await getUsers();
      const staffCount = users.filter(u => u.role === 'staff' && u.isActive).length;

      const today = new Date().toISOString().split('T')[0];
      const todayRecords = await getAttendance(today);
      
      const present = todayRecords.filter(r => r.status === 'present').length;
      const late = todayRecords.filter(r => r.status === 'late').length;
      const checkedInIds = todayRecords.map(r => r.userId);
      const absent = staffCount - checkedInIds.length; // Approximate, depends on if they check in later

      setStats({
        totalStaff: staffCount,
        presentToday: present,
        lateToday: late,
        absentToday: absent > 0 ? absent : 0,
      });

      // Prepare chart data for last 5 days
      const data = [];
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const records = await getAttendance(dateStr);
        data.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          Present: records.length,
        });
      }
      setChartData(data);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-gray-500 text-sm uppercase">Total Staff</div>
          <div className="text-3xl font-bold text-gray-800">{stats.totalStaff}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-gray-500 text-sm uppercase">Present Today</div>
          <div className="text-3xl font-bold text-green-600">{stats.presentToday}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-gray-500 text-sm uppercase">Late Today</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.lateToday}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-gray-500 text-sm uppercase">Not Yet In</div>
          <div className="text-3xl font-bold text-red-600">{stats.absentToday}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Attendance Trends (Last 5 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Present" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
