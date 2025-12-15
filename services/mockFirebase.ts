import { User, AttendanceRecord, AppSettings, DEFAULT_ADMIN } from '../types';

// Keys for LocalStorage
const USERS_KEY = 'everest_users';
const ATTENDANCE_KEY = 'everest_attendance';
const SETTINGS_KEY = 'everest_settings';

// Initialize default data if empty
const initData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    const defaultSettings: AppSettings = {
      officeStartTime: '09:00',
      lateGracePeriodMinutes: 15,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
  }
};

initData();

// --- Simulated Auth Service ---

export const mockLogin = async (username: string, password: string): Promise<User | null> => {
  await new Promise(r => setTimeout(r, 500)); // Simulate network delay
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find(u => u.username === username && u.password === password && u.isActive);
  return user || null;
};

export const mockChangePassword = async (userId: string, newPass: string): Promise<void> => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        users[idx].password = newPass;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
}

// --- Simulated Firestore Service ---

export const getUsers = async (): Promise<User[]> => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const saveUser = async (user: User): Promise<void> => {
  const users = await getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const deleteUser = async (userId: string): Promise<void> => {
  let users = await getUsers();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getSettings = async (): Promise<AppSettings> => {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getAttendance = async (
  date?: string,
  userId?: string
): Promise<AttendanceRecord[]> => {
  const all: AttendanceRecord[] = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
  return all.filter(r => {
    let match = true;
    if (date && r.date !== date) match = false;
    if (userId && r.userId !== userId) match = false;
    return match;
  }).sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
};

export const getAllAttendance = async (): Promise<AttendanceRecord[]> => {
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
}

export const checkIn = async (userId: string, userName: string, photo: string): Promise<void> => {
  const settings = await getSettings();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Determine late status
  const [startHour, startMin] = settings.officeStartTime.split(':').map(Number);
  const startTime = new Date(now);
  startTime.setHours(startHour, startMin, 0, 0);
  
  // Add grace period
  const lateTime = new Date(startTime.getTime() + settings.lateGracePeriodMinutes * 60000);
  
  const isLate = now > lateTime;

  const record: AttendanceRecord = {
    id: crypto.randomUUID(),
    userId,
    userName,
    date: today,
    checkInTime: now.toISOString(),
    checkInPhoto: photo,
    status: isLate ? 'late' : 'present',
  };

  const all = await getAllAttendance();
  all.push(record);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(all));
};

export const checkOut = async (recordId: string, photo: string): Promise<void> => {
  const all = await getAllAttendance();
  const idx = all.findIndex(r => r.id === recordId);
  if (idx !== -1) {
    const record = all[idx];
    const now = new Date();
    record.checkOutTime = now.toISOString();
    record.checkOutPhoto = photo;
    
    // Calculate duration
    const start = new Date(record.checkInTime);
    const durationMs = now.getTime() - start.getTime();
    record.workingHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
    
    all[idx] = record;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(all));
  }
};
