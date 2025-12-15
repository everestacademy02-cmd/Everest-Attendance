import React, { useEffect, useState } from 'react';
import { getAllAttendance, getUsers } from '../../services/mockFirebase';
import { AttendanceRecord, User } from '../../types';

export const AttendanceView: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterUser, setFilterUser] = useState('');
  const [viewPhoto, setViewPhoto] = useState<{url: string, title: string} | null>(null);

  useEffect(() => {
    const load = async () => {
      const allRecords = await getAllAttendance();
      setRecords(allRecords);
      const allUsers = await getUsers();
      setUsers(allUsers.filter(u => u.role === 'staff'));
    };
    load();
  }, []);

  const filteredRecords = records.filter(r => {
    const matchDate = filterDate ? r.date === filterDate : true;
    const matchUser = filterUser ? r.userId === filterUser : true;
    return matchDate && matchUser;
  });

  const handleExport = () => {
    // Simple CSV Export Logic
    const headers = ["Staff Name", "Date", "Check In", "Check Out", "Status", "Hours"];
    const rows = filteredRecords.map(r => [
      r.userName,
      r.date,
      new Date(r.checkInTime).toLocaleTimeString(),
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-',
      r.status,
      r.workingHours || 0
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Reports</h2>
        <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          <i className="fas fa-file-excel mr-2"></i> Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input 
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Staff Member</label>
          <select 
            value={filterUser} 
            onChange={e => setFilterUser(e.target.value)}
            className="border rounded p-2 min-w-[200px]"
          >
            <option value="">All Staff</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
             <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photos</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {filteredRecords.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No records found.</td></tr>
             ) : filteredRecords.map(r => (
               <tr key={r.id}>
                 <td className="px-6 py-4 font-medium text-gray-900">{r.userName}</td>
                 <td className="px-6 py-4 text-gray-500">{r.date}</td>
                 <td className="px-6 py-4 text-gray-500">
                   {new Date(r.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </td>
                 <td className="px-6 py-4 text-gray-500">
                   {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                 </td>
                 <td className="px-6 py-4">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                     ${r.status === 'present' ? 'bg-green-100 text-green-800' : 
                       r.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                     {r.status.toUpperCase()}
                   </span>
                 </td>
                 <td className="px-6 py-4 text-sm font-medium">
                    <button 
                      onClick={() => r.checkInPhoto && setViewPhoto({url: r.checkInPhoto, title: `Check In: ${r.userName}`})}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >In</button>
                    {r.checkOutPhoto && (
                      <button 
                         onClick={() => setViewPhoto({url: r.checkOutPhoto!, title: `Check Out: ${r.userName}`})}
                         className="text-blue-600 hover:text-blue-900"
                      >Out</button>
                    )}
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {viewPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setViewPhoto(null)}>
           <div className="bg-white p-4 rounded-lg max-w-lg w-full">
             <h3 className="font-bold mb-2">{viewPhoto.title}</h3>
             <img src={viewPhoto.url} alt="Proof" className="w-full h-auto rounded" />
             <button className="mt-4 w-full bg-gray-200 py-2 rounded">Close</button>
           </div>
        </div>
      )}
    </div>
  );
};
