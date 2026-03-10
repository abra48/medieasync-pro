'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Role, Member, Task, Finance, ProjectSettings, TaskStatus, Schedule, Reminder, SOSMessage } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  // Auth
  user: User | null;
  profile: Member | null;
  currentRole: Role;
  loading: boolean;
  signOut: () => Promise<void>;

  // Members
  members: Member[];
  membersLoading: boolean;
  addMember: (name: string, role: Role, email?: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  updateMemberRole: (id: string, newRole: Role) => Promise<void>;
  refreshMembers: () => Promise<void>;

  // Tasks
  tasks: Task[];
  tasksLoading: boolean;
  addTask: (taskName: string, assigneeId: string | null, assigneeName: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTaskAssignee: (id: string, assigneeId: string | null, assigneeName: string) => Promise<void>;
  updateTaskFile: (id: string, fileUrl: string) => Promise<void>;
  refreshTasks: () => Promise<void>;

  // Finances
  finances: Finance[];
  financesLoading: boolean;
  addFinance: (itemName: string, price: number) => Promise<void>;
  deleteFinance: (id: string) => Promise<void>;
  refreshFinances: () => Promise<void>;

  // Project Settings
  projectSettings: ProjectSettings;
  settingsLoading: boolean;
  addRule: (rule: string) => Promise<void>;
  deleteRule: (index: number) => Promise<void>;
  addLink: (title: string, url: string) => Promise<void>;
  deleteLink: (index: number) => Promise<void>;
  refreshSettings: () => Promise<void>;

  // Schedules
  schedules: Schedule[];
  schedulesLoading: boolean;
  addSchedule: (date: string, event: string) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  refreshSchedules: () => Promise<void>;

  // Reminders
  reminders: Reminder[];
  remindersLoading: boolean;
  addReminder: (toName: string, message: string) => Promise<void>;
  refreshReminders: () => Promise<void>;

  // SOS
  sosMessages: SOSMessage[];
  sosLoading: boolean;
  addSOS: (fromName: string, message: string) => Promise<void>;
  refreshSOS: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const emptySettings: ProjectSettings = { id: '', rules: [], links: [] };

export function AppProvider({ children }: { children: ReactNode }) {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Data State ---
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [finances, setFinances] = useState<Finance[]>([]);
  const [financesLoading, setFinancesLoading] = useState(true);
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>(emptySettings);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [sosMessages, setSosMessages] = useState<SOSMessage[]>([]);
  const [sosLoading, setSosLoading] = useState(true);

  const currentRole: Role = profile?.role || 'anggota';

  // --- Auth Init ---
  useEffect(() => {
    const ensureMemberProfile = async (u: User): Promise<Member | null> => {
      // Check if member row already exists
      const { data: existing } = await supabase.from('members').select('*').eq('id', u.id).single();
      if (existing) return existing as Member;

      // Extract name from Google metadata or email
      const googleName =
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        u.email?.split('@')[0] ||
        'Pengguna Baru';

      // Determine role: check localStorage join intent (set by /join page before OAuth redirect)
      // AND current URL path for non-OAuth flows
      const isJoinPath =
        (typeof window !== 'undefined' && window.location.pathname.includes('/join')) ||
        (typeof window !== 'undefined' && window.location.search.includes('code=')) ||
        (typeof window !== 'undefined' && localStorage.getItem('mediea_join_pending') === 'true');
      const role = isJoinPath ? 'anggota' : 'ketua';

      // Clear join intent after using it
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mediea_join_pending');
      }

      const { data: inserted, error } = await supabase
        .from('members')
        .insert({ id: u.id, name: googleName, email: u.email || null, role })
        .select()
        .single();

      if (error) {
        // If conflict (already inserted by another tab/listener), fetch it
        if (error.code === '23505') {
          const { data: refetched } = await supabase.from('members').select('*').eq('id', u.id).single();
          return (refetched as Member) || null;
        }
        console.error('Failed to create member profile:', error.message);
        return null;
      }
      return inserted as Member;
    };

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const profile = await ensureMemberProfile(user);
        if (profile) setProfile(profile);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) {
        const profile = await ensureMemberProfile(u);
        if (profile) setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // --- Members CRUD ---
  const refreshMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const { data } = await supabase.from('members').select('*').order('created_at', { ascending: true });
      if (data) setMembers(data as Member[]);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const addMember = async (name: string, role: Role, email?: string) => {
    // For members added by ketua (non-auth users), generate a random UUID
    const { error } = await supabase.from('members').insert({
      id: crypto.randomUUID(),
      name,
      role,
      email: email || null,
    });
    if (!error) await refreshMembers();
  };

  const deleteMember = async (id: string) => {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (!error) await refreshMembers();
  };

  const updateMemberRole = async (id: string, newRole: Role) => {
    // Optimistic update
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    const { error } = await supabase.from('members').update({ role: newRole }).eq('id', id);
    if (error) {
      // Revert on error
      await refreshMembers();
    }
  };

  // --- Tasks CRUD ---
  const refreshTasks = useCallback(async () => {
    setTasksLoading(true);
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: true });
    if (data) setTasks(data as Task[]);
    setTasksLoading(false);
  }, []);

  const addTask = async (taskName: string, assigneeId: string | null, assigneeName: string) => {
    const { error } = await supabase.from('tasks').insert({
      task_name: taskName,
      assignee_id: assigneeId,
      assignee_name: assigneeName,
      status: 'Belum Dikerjakan',
      file_url: '',
    });
    if (!error) await refreshTasks();
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
    if (!error) await refreshTasks();
  };

  const updateTaskAssignee = async (id: string, assigneeId: string | null, assigneeName: string) => {
    const { error } = await supabase.from('tasks').update({ assignee_id: assigneeId, assignee_name: assigneeName }).eq('id', id);
    if (!error) await refreshTasks();
  };

  const updateTaskFile = async (id: string, fileUrl: string) => {
    const { error } = await supabase.from('tasks').update({ file_url: fileUrl, status: 'Menunggu Konfirmasi' }).eq('id', id);
    if (!error) await refreshTasks();
  };

  // --- Finances CRUD ---
  const refreshFinances = useCallback(async () => {
    setFinancesLoading(true);
    const { data } = await supabase.from('finances').select('*').order('created_at', { ascending: true });
    if (data) setFinances(data as Finance[]);
    setFinancesLoading(false);
  }, []);

  const addFinance = async (itemName: string, price: number) => {
    const { error } = await supabase.from('finances').insert({
      item_name: itemName,
      price,
      created_by: user?.id || null,
    });
    if (!error) await refreshFinances();
  };

  const deleteFinance = async (id: string) => {
    const { error } = await supabase.from('finances').delete().eq('id', id);
    if (!error) await refreshFinances();
  };

  // --- Project Settings CRUD ---
  const refreshSettings = useCallback(async () => {
    setSettingsLoading(true);
    const { data } = await supabase.from('project_settings').select('*').limit(1).single();
    if (data) {
      setProjectSettings({
        id: data.id,
        rules: Array.isArray(data.rules) ? data.rules : [],
        links: Array.isArray(data.links) ? data.links : [],
      });
    }
    setSettingsLoading(false);
  }, []);

  const addRule = async (rule: string) => {
    const newRules = [...projectSettings.rules, rule];
    const { error } = await supabase.from('project_settings').update({ rules: newRules }).eq('id', projectSettings.id);
    if (!error) setProjectSettings(prev => ({ ...prev, rules: newRules }));
  };

  const deleteRule = async (index: number) => {
    const newRules = projectSettings.rules.filter((_, i) => i !== index);
    const { error } = await supabase.from('project_settings').update({ rules: newRules }).eq('id', projectSettings.id);
    if (!error) setProjectSettings(prev => ({ ...prev, rules: newRules }));
  };

  const addLink = async (title: string, url: string) => {
    const newLinks = [...projectSettings.links, { title, url }];
    const { error } = await supabase.from('project_settings').update({ links: newLinks }).eq('id', projectSettings.id);
    if (!error) setProjectSettings(prev => ({ ...prev, links: newLinks }));
  };

  const deleteLink = async (index: number) => {
    const newLinks = projectSettings.links.filter((_, i) => i !== index);
    const { error } = await supabase.from('project_settings').update({ links: newLinks }).eq('id', projectSettings.id);
    if (!error) setProjectSettings(prev => ({ ...prev, links: newLinks }));
  };

  // --- Schedules CRUD ---
  const refreshSchedules = useCallback(async () => {
    setSchedulesLoading(true);
    const { data } = await supabase.from('schedules').select('*').order('date', { ascending: true });
    if (data) setSchedules(data as Schedule[]);
    setSchedulesLoading(false);
  }, []);

  const addSchedule = async (date: string, event: string) => {
    const { error } = await supabase.from('schedules').insert({ date, event });
    if (!error) await refreshSchedules();
  };

  const deleteSchedule = async (id: string) => {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (!error) await refreshSchedules();
  };

  // --- Reminders CRUD ---
  const refreshReminders = useCallback(async () => {
    setRemindersLoading(true);
    const { data } = await supabase.from('reminders').select('*').order('created_at', { ascending: false });
    if (data) setReminders(data as Reminder[]);
    setRemindersLoading(false);
  }, []);

  const addReminder = async (toName: string, message: string) => {
    const { error } = await supabase.from('reminders').insert({
      to_name: toName,
      message,
      sent_by: user?.id || null,
    });
    if (!error) await refreshReminders();
  };

  // --- SOS CRUD ---
  const refreshSOS = useCallback(async () => {
    setSosLoading(true);
    const { data } = await supabase.from('sos_messages').select('*').order('created_at', { ascending: false });
    if (data) setSosMessages(data as SOSMessage[]);
    setSosLoading(false);
  }, []);

  const addSOS = async (fromName: string, message: string) => {
    const { error } = await supabase.from('sos_messages').insert({
      from_name: fromName,
      message,
      sent_by: user?.id || null,
    });
    if (!error) await refreshSOS();
  };

  // --- Initial Data Load (after auth) ---
  useEffect(() => {
    if (user) {
      refreshMembers();
      refreshTasks();
      refreshFinances();
      refreshSettings();
      refreshSchedules();
      refreshReminders();
      refreshSOS();
    }
  }, [user, refreshMembers, refreshTasks, refreshFinances, refreshSettings, refreshSchedules, refreshReminders, refreshSOS]);

  return (
    <AppContext.Provider value={{
      user, profile, currentRole, loading, signOut,
      members, membersLoading, addMember, deleteMember, updateMemberRole, refreshMembers,
      tasks, tasksLoading, addTask, updateTaskStatus, updateTaskAssignee, updateTaskFile, refreshTasks,
      finances, financesLoading, addFinance, deleteFinance, refreshFinances,
      projectSettings, settingsLoading, addRule, deleteRule, addLink, deleteLink, refreshSettings,
      schedules, schedulesLoading, addSchedule, deleteSchedule, refreshSchedules,
      reminders, remindersLoading, addReminder, refreshReminders,
      sosMessages, sosLoading, addSOS, refreshSOS,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
