import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkIn, checkOut, getAttendance } from '../../services/mockFirebase';
import { AttendanceRecord } from '../../types';
import { CameraCapture } from '../../components/CameraCapture';

export const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [showCamera, setShowCamera] = useState<'in' | 'out' | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const all = await getAttendance(undefined, user.id);
    const today = new Date().toISOString().split('T')[0];
    const todayRec = all.find(r => r.date === today);
    setTodayRecord(todayRec || null);
    setHistory(all);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCapture = async (image: string) => {
    setLoading(true);
    if (showCamera === 'in' && user) {
      await checkIn(user.id, user.fullName, image);
    } else if (showCamera === 'out' && todayRecord) {
      await checkOut(todayRecord.id, image);
    }
    setShowCamera(null);
    await loadData();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-lg leading-tight">Everest Academy</h1>
          <p className="text-xs text-blue-200">Welcome, {user?.fullName}</p>
        </div>
        <button onClick={logout} className="text-sm bg-blue-800 px-3 py-1 rounded">Logout</button>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Action Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <p className="text-gray-500 mb-2">{new Date().toDateString()}</p>
          <div className="text-4xl font-bold text-gray-800 mb-6">
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>

          {!todayRecord ? (
            <button
              onClick={() => setShowCamera('in')}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fas fa-camera"></i> CHECK IN
            </button>
          ) : !todayRecord.checkOutTime ? (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-800 p-3 rounded-lg">
                Checked In at {new Date(todayRecord.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <button
                onClick={() => setShowCamera('out')}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3"
              >
                 <i className="fas fa-sign-out-alt"></i> CHECK OUT
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-600 p-4 rounded-lg">
              <p className="font-semibold">Day Complete</p>
              <p className="text-sm">Total: {todayRecord.workingHours} hrs</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white p-4 rounded-lg shadow text-center">
             <div className="text-sm text-gray-500">Days Present</div>
             <div className="text-2xl font-bold text-primary">{history.filter(h => h.status !== 'absent').length}</div>
           </div>
           <div className="bg-white p-4 rounded-lg shadow text-center">
             <div className="text-sm text-gray-500">Est. Salary</div>
             <div className="text-2xl font-bold text-green-600">₹{(history.filter(h => h.status !== 'absent').length) * (user?.dailyWage || 0)}</div>
           </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-gray-700">Recent Attendance</div>
          <ul className="divide-y divide-gray-100">
            {history.slice(0, 5).map(rec => (
              <li key={rec.id} className="px-4 py-3 flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium text-gray-800">{rec.date}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(rec.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                    {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                   ${rec.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {rec.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showCamera && (
        <CameraCapture 
          label={showCamera === 'in' ? "Staff Check-In" : "Staff Check-Out"}
          onCapture={handleCapture}
          onCancel={() => setShowCamera(null)}
        />
      )}
    </div>
  );
};
