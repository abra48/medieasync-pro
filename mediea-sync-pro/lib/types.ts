export type Role = 'ketua' | 'sekretaris' | 'bendahara' | 'anggota';

export interface Member {
  id: string;
  name: string;
  email?: string;
  nim?: string;
  role: Role;
  created_at?: string;
}

export type TaskStatus = 'Belum Dikerjakan' | 'Menunggu Konfirmasi' | 'Selesai';

export interface Task {
  id: string;
  task_name: string;
  assignee_id: string | null;
  assignee_name: string;
  status: TaskStatus;
  file_url: string;
  created_at?: string;
}

export interface Finance {
  id: string;
  item_name: string;
  price: number;
  created_by?: string;
  created_at?: string;
}

export interface ProjectSettings {
  id: string;
  rules: string[];
  links: { title: string; url: string }[];
}

export interface Schedule {
  id: string;
  date: string;
  event: string;
  created_at?: string;
}

export interface Reminder {
  id: string;
  to_name: string;
  message: string;
  sent_by?: string;
  created_at?: string;
}

export interface SOSMessage {
  id: string;
  from_name: string;
  message: string;
  sent_by?: string;
  created_at?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredRole: Role | 'semua';
  modalKey: string;
}
