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
  updateProfile: (name: string, nim: string) => Promise<void>;

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
        (typeof window !== 'undefined' && window.location.search.includes('ref=')) ||
        (typeof window !== 'undefined' && localStorage.getItem('mediea_join_pending') === 'true');
      const role = isJoinPath ? 'anggota' : 'ketua';

      // Resolve invited_by from URL ref param or localStorage
      let invitedBy: string | null = null;
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        invitedBy = urlParams.get('ref') || localStorage.getItem('mediea_join_ref') || null;
      }

      // Clear join intent after using it
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mediea_join_pending');
        localStorage.removeItem('mediea_join_ref');
      }

      const { data: inserted, error } = await supabase
        .from('members')
        .insert({ id: u.id, name: googleName, email: u.email || null, role, invited_by: invitedBy })
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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const profile = await ensureMemberProfile(user);
          if (profile) setProfile(profile);
        }
      } catch (err) {
        console.error('Auth init failed:', err);
      } finally {
        setLoading(false);
      }
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

  const updateProfile = async (name: string, nim: string) => {
    if (!user) return;
    const { error } = await supabase.from('members').update({ name, nim }).eq('id', user.id);
    if (!error) {
      setProfile(prev => prev ? { ...prev, name, nim } : prev);
      await refreshMembers();
    }
  };

  // --- Members CRUD ---
  const refreshMembers = useCallback(async () => {
    if (!user) return;
    setMembersLoading(true);
    try {
      const { data } = await supabase.from('members').select('*')
        .or(`invited_by.eq.${user.id},id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      if (data) setMembers(data as Member[]);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setMembersLoading(false);
    }
  }, [user]);

  const addMember = async (name: string, role: Role, email?: string) => {
    try {
      await supabase.from('members').insert({
        id: crypto.randomUUID(),
        name,
        role,
        email: email || null,
        invited_by: user?.id || null,
      });
    } catch (err) {
      console.error('Failed to add member:', err);
    } finally {
      await refreshMembers();
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await supabase.from('members').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete member:', err);
    } finally {
      await refreshMembers();
    }
  };

  const updateMemberRole = async (id: string, newRole: Role) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    try {
      await supabase.from('members').update({ role: newRole }).eq('id', id);
    } catch (err) {
      console.error('Failed to update member role:', err);
    } finally {
      await refreshMembers();
    }
  };

  // --- Tasks CRUD ---
  const refreshTasks = useCallback(async () => {
    if (!user) return;
    setTasksLoading(true);
    try {
      const { data } = await supabase.from('tasks').select('*')
        .eq('invited_by', user.id)
        .order('created_at', { ascending: true });
      if (data) setTasks(data as Task[]);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  }, [user]);

  const addTask = async (taskName: string, assigneeId: string | null, assigneeName: string) => {
    try {
      await supabase.from('tasks').insert({
        task_name: taskName,
        assignee_id: assigneeId,
        assignee_name: assigneeName,
        status: 'Belum Dikerjakan',
        file_url: '',
        invited_by: user?.id || null,
      });
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      await refreshTasks();
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      await supabase.from('tasks').update({ status }).eq('id', id);
    } catch (err) {
      console.error('Failed to update task status:', err);
    } finally {
      await refreshTasks();
    }
  };

  const updateTaskAssignee = async (id: string, assigneeId: string | null, assigneeName: string) => {
    try {
      await supabase.from('tasks').update({ assignee_id: assigneeId, assignee_name: assigneeName }).eq('id', id);
    } catch (err) {
      console.error('Failed to update task assignee:', err);
    } finally {
      await refreshTasks();
    }
  };

  const updateTaskFile = async (id: string, fileUrl: string) => {
    try {
      await supabase.from('tasks').update({ file_url: fileUrl, status: 'Menunggu Konfirmasi' }).eq('id', id);
    } catch (err) {
      console.error('Failed to update task file:', err);
    } finally {
      await refreshTasks();
    }
  };

  // --- Finances CRUD ---
  const refreshFinances = useCallback(async () => {
    if (!user) return;
    setFinancesLoading(true);
    try {
      const { data } = await supabase.from('finances').select('*')
        .eq('invited_by', user.id)
        .order('created_at', { ascending: false });
      if (data) setFinances(data as Finance[]);
    } catch (err) {
      console.error('Failed to fetch finances:', err);
    } finally {
      setFinancesLoading(false);
    }
  }, [user]);

  const addFinance = async (itemName: string, price: number) => {
    try {
      await supabase.from('finances').insert({
        item_name: itemName,
        price,
        created_by: user?.id || null,
        invited_by: user?.id || null,
      });
    } catch (err) {
      console.error('Failed to add finance:', err);
    } finally {
      await refreshFinances();
    }
  };

  const deleteFinance = async (id: string) => {
    try {
      await supabase.from('finances').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete finance:', err);
    } finally {
      await refreshFinances();
    }
  };

  // --- Project Settings CRUD ---
  const refreshSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const { data } = await supabase.from('project_settings').select('*').limit(1).single();
      if (data) {
        setProjectSettings({
          id: data.id,
          rules: Array.isArray(data.rules) ? data.rules : [],
          links: Array.isArray(data.links) ? data.links : [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const addRule = async (rule: string) => {
    const newRules = [...projectSettings.rules, rule];
    try {
      await supabase.from('project_settings').update({ rules: newRules }).eq('id', projectSettings.id);
      setProjectSettings(prev => ({ ...prev, rules: newRules }));
    } catch (err) {
      console.error('Failed to add rule:', err);
      await refreshSettings();
    }
  };

  const deleteRule = async (index: number) => {
    const newRules = projectSettings.rules.filter((_, i) => i !== index);
    try {
      await supabase.from('project_settings').update({ rules: newRules }).eq('id', projectSettings.id);
      setProjectSettings(prev => ({ ...prev, rules: newRules }));
    } catch (err) {
      console.error('Failed to delete rule:', err);
      await refreshSettings();
    }
  };

  const addLink = async (title: string, url: string) => {
    const newLinks = [...projectSettings.links, { title, url }];
    try {
      await supabase.from('project_settings').update({ links: newLinks }).eq('id', projectSettings.id);
      setProjectSettings(prev => ({ ...prev, links: newLinks }));
    } catch (err) {
      console.error('Failed to add link:', err);
      await refreshSettings();
    }
  };

  const deleteLink = async (index: number) => {
    const newLinks = projectSettings.links.filter((_, i) => i !== index);
    try {
      await supabase.from('project_settings').update({ links: newLinks }).eq('id', projectSettings.id);
      setProjectSettings(prev => ({ ...prev, links: newLinks }));
    } catch (err) {
      console.error('Failed to delete link:', err);
      await refreshSettings();
    }
  };

  // --- Schedules CRUD ---
  const refreshSchedules = useCallback(async () => {
    setSchedulesLoading(true);
    try {
      const { data } = await supabase.from('schedules').select('*').order('date', { ascending: true });
      if (data) setSchedules(data as Schedule[]);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setSchedulesLoading(false);
    }
  }, []);

  const addSchedule = async (date: string, event: string) => {
    try {
      await supabase.from('schedules').insert({ date, event });
    } catch (err) {
      console.error('Failed to add schedule:', err);
    } finally {
      await refreshSchedules();
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await supabase.from('schedules').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    } finally {
      await refreshSchedules();
    }
  };

  // --- Reminders CRUD ---
  const refreshReminders = useCallback(async () => {
    setRemindersLoading(true);
    try {
      const { data } = await supabase.from('reminders').select('*').order('created_at', { ascending: false });
      if (data) setReminders(data as Reminder[]);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    } finally {
      setRemindersLoading(false);
    }
  }, []);

  const addReminder = async (toName: string, message: string) => {
    try {
      await supabase.from('reminders').insert({
        to_name: toName,
        message,
        sent_by: user?.id || null,
      });
    } catch (err) {
      console.error('Failed to add reminder:', err);
    } finally {
      await refreshReminders();
    }
  };

  // --- SOS CRUD ---
  const refreshSOS = useCallback(async () => {
    setSosLoading(true);
    try {
      const { data } = await supabase.from('sos_messages').select('*').order('created_at', { ascending: false });
      if (data) setSosMessages(data as SOSMessage[]);
    } catch (err) {
      console.error('Failed to fetch SOS messages:', err);
    } finally {
      setSosLoading(false);
    }
  }, []);

  const addSOS = async (fromName: string, message: string) => {
    try {
      await supabase.from('sos_messages').insert({
        from_name: fromName,
        message,
        sent_by: user?.id || null,
      });
    } catch (err) {
      console.error('Failed to add SOS message:', err);
    } finally {
      await refreshSOS();
    }
  };

  // --- Initial Data Load (after auth) + Realtime Subscriptions ---
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    refreshMembers();
    refreshTasks();
    refreshFinances();
    refreshSettings();
    refreshSchedules();
    refreshReminders();
    refreshSOS();

    // Supabase Realtime: auto-sync members, tasks, finances across all clients
    const channel = supabase
      .channel('realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        () => { refreshMembers(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => { refreshTasks(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'finances' },
        () => { refreshFinances(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshMembers, refreshTasks, refreshFinances, refreshSettings, refreshSchedules, refreshReminders, refreshSOS]);

  return (
    <AppContext.Provider value={{
      user, profile, currentRole, loading, signOut, updateProfile,
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
