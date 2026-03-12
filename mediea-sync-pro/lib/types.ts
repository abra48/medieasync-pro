export type Role = 'ketua' | 'sekretaris' | 'bendahara' | 'anggota';

export interface Member {
  id: string;
  name: string;
  email?: string;
  nim?: string;
  role: Role;
  invited_by?: string;
  created_at?: string;
}

export type TaskStatus = 'Belum Dikerjakan' | 'Menunggu Konfirmasi' | 'Selesai';

export interface Task {
  id: string;
  task_name: string;
  assignee_name: string;
  status: TaskStatus;
  file_url?: string;
  submission_note?: string;
  invited_by?: string;
  created_at?: string;
}

export interface Finance {
  id: string;
  item_name: string;
  price: number;
  invited_by?: string;
  created_at?: string;
}

export interface Literature {
  id: string;
  title: string;
  link_url: string;
  invited_by?: string;
}

export interface Schedule {
  id: string;
  event_name: string;
  event_date: string;
  description?: string;
  invited_by?: string;
}

export interface Guideline {
  id: string;
  title: string;
  content: string;
  invited_by?: string;
}

export interface Warning {
  id: string;
  member_name: string;
  issue: string;
  status?: string;
  invited_by?: string;
  created_at?: string;
}

export interface SOSMessage {
  id: string;
  from_name: string;
  message: string;
  sent_by?: string;
  created_at?: string;
}

export interface KasPayment {
  id: string;
  member_id: string;
  member_name: string;
  paid: boolean;
  invited_by?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredRole: Role | 'semua';
  modalKey: string;
}
