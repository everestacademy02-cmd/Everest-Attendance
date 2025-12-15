export type Role = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  password?: string; // Only used for initial auth check, usually not stored in plain text in prod
  role: Role;
  fullName: string;
  mobile?: string;
  designation?: string;
  dailyWage?: number;
  isActive: boolean;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // ISO string
  checkOutTime?: string; // ISO string
  checkInPhoto?: string; // Base64 or URL
  checkOutPhoto?: string; // Base64 or URL
  status: 'present' | 'absent' | 'late' | 'half-day';
  workingHours?: number;
}

export interface AppSettings {
  officeStartTime: string; // "09:00"
  lateGracePeriodMinutes: number; // e.g. 15
}

export const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  password: 'Admin@123',
  role: 'admin',
  fullName: 'System Administrator',
  isActive: true,
  createdAt: new Date().toISOString(),
};
