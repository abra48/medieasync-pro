'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Role, Member, Task, Finance, TaskStatus, Schedule, Literature, Guideline, Warning, SOSMessage } from '@/lib/types';
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
  refreshProfile: () => Promise<void>;

  // Members
  members: Member[];
  membersLoading: boolean;
  addMember: (name: string, role: Role) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  updateMemberRole: (id: string, newRole: Role) => Promise<void>;
  refreshMembers: () => Promise<void>;

  // Tasks (tabel: tasks — kolom: title, assignee_name, status, invited_by)
  tasks: Task[];
  tasksLoading: boolean;
  addTask: (taskName: string, assigneeName: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTaskAssignee: (id: string, assigneeName: string) => Promise<void>;
  submitTask: (taskId: string, file: File | null, note: string) => Promise<void>;
  refreshTasks: () => Promise<void>;

  // Finances (tabel: finances — kolom: item_name, price, invited_by)
  finances: Finance[];
  financesLoading: boolean;
  addFinance: (itemName: string, price: number) => Promise<void>;
  deleteFinance: (id: string) => Promise<void>;
  refreshFinances: () => Promise<void>;

  // Literatures (tabel: literatures — kolom: title, link_url, invited_by)
  literatures: Literature[];
  literaturesLoading: boolean;
  addLiterature: (title: string, linkUrl: string) => Promise<void>;
  deleteLiterature: (id: string) => Promise<void>;
  refreshLiteratures: () => Promise<void>;

  // Schedules (tabel: schedules — kolom: event_name, event_date, description, invited_by)
  schedules: Schedule[];
  schedulesLoading: boolean;
  addSchedule: (eventName: string, eventDate: string, description?: string) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  refreshSchedules: () => Promise<void>;

  // Guidelines (tabel: guidelines — kolom: title, content, invited_by)
  guidelines: Guideline[];
  guidelinesLoading: boolean;
  addGuideline: (title: string, content: string) => Promise<void>;
  deleteGuideline: (id: string) => Promise<void>;
  refreshGuidelines: () => Promise<void>;

  // Warnings (tabel: warnings — kolom: member_name, issue, status, invited_by)
  warnings: Warning[];
  warningsLoading: boolean;
  addWarning: (memberName: string, issue: string) => Promise<void>;
  refreshWarnings: () => Promise<void>;

  // SOS
  sosMessages: SOSMessage[];
  sosLoading: boolean;
  addSOS: (fromName: string, message: string) => Promise<void>;
  refreshSOS: () => Promise<void>;

  // Refresh all data at once
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);
  const userRef = useRef<User | null>(null);
  const profileRef = useRef<Member | null>(null);

  // --- Data State ---
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [finances, setFinances] = useState<Finance[]>([]);
  const [financesLoading, setFinancesLoading] = useState(false);
  const [literatures, setLiteratures] = useState<Literature[]>([]);
  const [literaturesLoading, setLiteraturesLoading] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [guidelinesLoading, setGuidelinesLoading] = useState(false);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [warningsLoading, setWarningsLoading] = useState(false);
  const [sosMessages, setSosMessages] = useState<SOSMessage[]>([]);
  const [sosLoading, setSosLoading] = useState(false);

  const currentRole: Role = profile?.role || 'anggota';

  // Group owner ID: ketua uses own ID, others use their invited_by (the ketua's UUID)
  // This ensures all members in the same group see the same data
  const groupOwnerId: string | undefined = profile?.role === 'ketua' ? user?.id ?? undefined : profile?.invited_by ?? undefined;

  // Keep refs in sync with state (for use in event listeners to avoid stale closures)
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  // --- Auth Init ---
  const fetchMemberProfile = useCallback(async (userId: string): Promise<Member | null> => {
    try {
      const { data, error } = await supabase.from('members').select('*').eq('id', userId).single();
      if (error) {
        console.error('Fetch member profile error:', error.message);
        return null;
      }
      return (data as Member) || null;
    } catch (err) {
      console.error('Failed to fetch member profile:', err);
      return null;
    }
  }, []);

  // Refresh profile from DB — useful after role changes
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const memberProfile = await fetchMemberProfile(user.id);
      if (memberProfile) {
        setProfile(memberProfile);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }, [user, fetchMemberProfile]);

  useEffect(() => {
    const ensureMemberProfile = async (u: User): Promise<Member | null> => {
      const existing = await fetchMemberProfile(u.id);
      if (existing) return existing;

      // If a join is pending, let /join page handle profile creation
      // (it has direct access to the ref parameter for invited_by)
      if (typeof window !== 'undefined' && localStorage.getItem('mediea_join_pending') === 'true') {
        return null;
      }

      const googleName =
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        u.email?.split('@')[0] ||
        'Pengguna Baru';

      const isJoinPath =
        (typeof window !== 'undefined' && window.location.pathname.includes('/join')) ||
        (typeof window !== 'undefined' && window.location.search.includes('ref=')) ||
        (typeof window !== 'undefined' && localStorage.getItem('mediea_join_pending') === 'true');
      const role = isJoinPath ? 'anggota' : 'ketua';

      let invitedBy: string | null = null;
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        invitedBy = urlParams.get('ref') || localStorage.getItem('mediea_join_ref') || null;
      }

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
        if (error.code === '23505') {
          return await fetchMemberProfile(u.id);
        }
        console.error('Failed to create member profile:', error.message);
        return null;
      }
      return inserted as Member;
    };

    const init = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
          const memberProfile = await ensureMemberProfile(authUser);
          if (memberProfile) setProfile(memberProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth init failed:', err);
      } finally {
        setLoading(false);
        initialLoadDone.current = true;
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Use REFS (not state) to avoid stale closure — state values are frozen at first render
      if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && profileRef.current && userRef.current) {
        return;
      }

      const u = session?.user || null;
      if (!u) {
        // Don't clear state on tab switch / visibility change — only on explicit SIGNED_OUT
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        return;
      }

      setUser(u);
      const memberProfile = await fetchMemberProfile(u.id);
      if (memberProfile) {
        setProfile(memberProfile);
      } else {
        const newProfile = await ensureMemberProfile(u);
        if (newProfile) setProfile(newProfile);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMemberProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (name: string, nim: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('members').update({ name, nim }).eq('id', user.id);
      if (error) throw new Error(error.message);

      // Also update name in anggota_link if this user has a record there (joined via invite link)
      if (user.email) {
        await supabase.from('anggota_link').update({ nama: name }).eq('email', user.email);
      }

      setProfile(prev => prev ? { ...prev, name, nim } : prev);
      await refreshMembers();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Gagal memperbarui profil: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    }
  };

  // =============================================
  // MEMBERS CRUD (combined: members + anggota_manual + anggota_link)
  // =============================================
  const refreshMembers = useCallback(async () => {
    if (!user || !groupOwnerId) return;
    setMembersLoading(true);
    try {
      // Fetch 1: from members table (auth-linked members)
      const { data: authMembers, error: authErr } = await supabase.from('members').select('*')
        .or(`invited_by.eq.${groupOwnerId},id.eq.${groupOwnerId}`)
        .order('created_at', { ascending: true });
      if (authErr) console.error('Fetch auth members error:', authErr.message);

      // Fetch 2: from anggota_manual table
      const { data: manualMembers, error: manualErr } = await supabase.from('anggota_manual').select('*')
        .eq('invited_by', groupOwnerId);
      if (manualErr) console.error('Fetch manual members error:', manualErr.message);

      // Fetch 3: from anggota_link table (members who joined via invite link)
      const { data: linkMembers, error: linkErr } = await supabase.from('anggota_link').select('*')
        .eq('invited_by', groupOwnerId);
      if (linkErr) console.error('Fetch link members error:', linkErr.message);

      // Map anggota_manual to Member type
      const mappedManual: Member[] = (manualMembers || []).map((m: Record<string, unknown>) => ({
        id: m.id as string,
        name: m.nama as string,
        role: (m.peran as Role) || 'anggota',
        invited_by: m.invited_by as string,
      }));

      // Map anggota_link to Member type
      const mappedLink: Member[] = (linkMembers || []).map((m: Record<string, unknown>) => ({
        id: m.id as string,
        name: m.nama as string,
        email: m.email as string | undefined,
        role: (m.peran as Role) || 'anggota',
        invited_by: m.invited_by as string,
        created_at: m.created_at as string | undefined,
      }));

      // Deduplicate: remove anggota_link entries whose email already exists in authMembers
      // This prevents duplicate entries for members who exist in both tables
      const authEmails = new Set(
        (authMembers || []).map((m: Record<string, unknown>) => m.email as string).filter(Boolean)
      );
      const dedupedLink = mappedLink.filter(m => !m.email || !authEmails.has(m.email));

      // Combine all three sources (deduplicated)
      const combined = [...(authMembers as Member[] || []), ...mappedManual, ...dedupedLink];
      setMembers(combined);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      alert('Gagal memuat daftar anggota: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      setMembersLoading(false);
    }
  }, [user, groupOwnerId]);

  const addMember = async (name: string, role: Role) => {
    if (!user) { alert('Sesi login tidak ditemukan. Silakan login ulang.'); return; }
    try {
      const { error } = await supabase.from('anggota_manual').insert({
        nama: name,
        peran: role,
        invited_by: groupOwnerId,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to add member:', err);
      alert('Gagal menambah anggota: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshMembers();
    }
  };

  const deleteMember = async (id: string) => {
    try {
      // Try deleting from anggota_manual first
      const { error: manualError } = await supabase.from('anggota_manual').delete().eq('id', id);
      if (manualError) {
        // Try deleting from anggota_link
        const { error: linkError } = await supabase.from('anggota_link').delete().eq('id', id);
        if (linkError) {
          // Finally try deleting from members
          const { error: authError } = await supabase.from('members').delete().eq('id', id);
          if (authError) throw new Error(authError.message);
        }
      }
    } catch (err) {
      console.error('Failed to delete member:', err);
      alert('Gagal menghapus anggota: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshMembers();
    }
  };

  const updateMemberRole = async (id: string, newRole: Role) => {
    // Find the target member to get their email for cross-table sync
    const targetMember = members.find(m => m.id === id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    try {
      // Update in ALL tables where this member exists (not just one)
      // 1. Try anggota_manual by ID
      await supabase.from('anggota_manual').update({ peran: newRole }).eq('id', id);

      // 2. Try anggota_link by ID
      await supabase.from('anggota_link').update({ peran: newRole }).eq('id', id);

      // 3. Try members table by ID
      await supabase.from('members').update({ role: newRole }).eq('id', id);

      // 4. Also sync by email across tables (for link-joined members who exist in both)
      if (targetMember?.email) {
        await supabase.from('members').update({ role: newRole }).eq('email', targetMember.email);
        await supabase.from('anggota_link').update({ peran: newRole }).eq('email', targetMember.email);
      }
    } catch (err) {
      console.error('Failed to update member role:', err);
      alert('Gagal mengubah role: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshMembers();
    }
  };

  // =============================================
  // TASKS CRUD (tabel: tasks — kolom: title, assignee_name, status, invited_by)
  // =============================================
  const refreshTasks = useCallback(async () => {
    if (!user || !groupOwnerId) return;
    setTasksLoading(true);
    try {
      const { data, error } = await supabase.from('tasks').select('*')
        .eq('invited_by', groupOwnerId);
      if (error) { console.error('Fetch tasks error:', error.message); return; }
      if (data) setTasks(data as Task[]);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  }, [user, groupOwnerId]);

  const addTask = async (taskName: string, assigneeName: string) => {
    if (!user) { alert('Sesi login tidak ditemukan. Silakan login ulang.'); return; }
    try {
      const { error } = await supabase.from('tasks').insert({
        task_name: taskName,
        assignee_name: assigneeName,
        status: 'Belum Dikerjakan',
        invited_by: groupOwnerId,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to add task:', err);
      alert('Gagal menambah tugas: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshTasks();
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Gagal mengubah status tugas: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshTasks();
    }
  };

  const updateTaskAssignee = async (id: string, assigneeName: string) => {
    try {
      const { error } = await supabase.from('tasks').update({ assignee_name: assigneeName }).eq('id', id);
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to update task assignee:', err);
      alert('Gagal mengubah penanggung jawab: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshTasks();
    }
  };

  const submitTask = async (taskId: string, file: File | null, note: string) => {
    if (!user) { alert('Sesi login tidak ditemukan. Silakan login ulang.'); return; }
    try {
      let fileUrl = '';
      if (file) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('task_files').upload(filePath, file);
        if (uploadError) throw new Error('Gagal upload file: ' + uploadError.message);
        const { data: publicUrlData } = supabase.storage.from('task_files').getPublicUrl(filePath);
        fileUrl = publicUrlData.publicUrl;
      }
      const { error } = await supabase.from('tasks').update({
        status: 'Menunggu Konfirmasi',
        file_url: fileUrl,
        submission_note: note,
      }).eq('id', taskId);
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to submit task:', err);
      alert('Gagal mengirim tugas: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshTasks();
    }
  };

  // =============================================
  // FINANCES CRUD (tabel: finances — kolom: item_name, price, invited_by)
  // =============================================
  const refreshFinances = useCallback(async () => {
    if (!user || !groupOwnerId) return;
    setFinancesLoading(true);
    try {
      const { data, error } = await supabase.from('finances').select('*')
        .eq('invited_by', groupOwnerId);
      if (error) { console.error('Fetch finances error:', error.message); return; }
      if (data) setFinances(data as Finance[]);
    } catch (err) {
      console.error('Failed to fetch finances:', err);
    } finally {
      setFinancesLoading(false);
    }
  }, [user, groupOwnerId]);

  const addFinance = async (itemName: string, price: number) => {
    if (!user) { alert('Sesi login tidak ditemukan. Silakan login ulang.'); return; }
    try {
      const { error } = await supabase.from('finances').insert({
        item_name: itemName,
        price,
        invited_by: groupOwnerId,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to add finance:', err);
      alert('Gagal menambah pengeluaran: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshFinances();
    }
  };

  const deleteFinance = async (id: string) => {
    try {
      const { error } = await supabase.from('finances').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to delete finance:', err);
      alert('Gagal menghapus pengeluaran: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshFinances();
    }
  };

  // =============================================
  // LITERATURES CRUD (tabel: literatures — kolom: title, link_url, invited_by)
  // =============================================
  const refreshLiteratures = useCallback(async () => {
    if (!user || !groupOwnerId) return;
    setLiteraturesLoading(true);
    try {
      const { data, error } = await supabase.from('literatures').select('*')
        .eq('invited_by', groupOwnerId);
      if (error) { console.error('Fetch literatures error:', error.message); return; }
      if (data) setLiteratures(data as Literature[]);
    } catch (err) {
      console.error('Failed to fetch literatures:', err);
    } finally {
      setLiteraturesLoading(false);
    }
  }, [user, groupOwnerId]);

  const addLiterature = async (title: string, linkUrl: string) => {
    if (!user) { alert('Sesi login tidak ditemukan. Silakan login ulang.'); return; }
    try {
      const { error } = await supabase.from('literatures').insert({
        title,
        link_url: linkUrl,
        invited_by: groupOwnerId,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to add literature:', err);
      alert('Gagal menambah tautan: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshLiteratures();
    }
  };

  const deleteLiterature = async (id: string) => {
    try {
      const { error } = await supabase.from('literatures').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to delete literature:', err);
      alert('Gagal menghapus tautan: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshLiteratures();
    }
  };

  // =============================================
  // SCHEDULES CRUD (tabel: schedules — kolom: event_name, event_date, description, invited_by)
  // =============================================
  const refreshSchedules = useCallback(async () => {
    if (!user || !groupOwnerId) return;
    setSchedulesLoading(true);
    try {
      const { data, error } = await supabase.from('schedules').select('*')
        .eq('invited_by', groupOwnerId);
      if (error) { console.error('Fetch schedules error:', error.message); return; }
      if (data) setSchedules(data as Schedule[]);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setSchedulesLoading(false);
    }
  }, [user, groupOwnerId]);

  const addSchedule = async (eventName: string, eventDate: string, description?: string) => {
    if (!user) { alert('Sesi login tidak ditemukan. Silakan login ulang.'); return; }
    try {
      const { error } = await supabase.from('schedules').insert({
        event_name: eventName,
        event_date: eventDate,
        description: description || '',
        invited_by: groupOwnerId,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to add schedule:', err);
      alert('Gagal menambah jadwal: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshSchedules();
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      alert('Gagal menghapus jadwal: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshSchedules();
    }
  };

  // =============================================
  // GUIDELINES CRUD (tabel: guidelines — kolom: title, content, invited_by)
  // =============================================
  const refreshGuidelines = useCallback(async () => {
    if (!user || !groupOwnerId) return;
    setGuidelinesLoading(true);
    try {
      const { data, error } = await supabase.from('guidelines').select('*')
        .eq('invited_by', groupOwnerId);
      if (error) { console.error('Fetch guidelines error:', error.message); return; }
      if (data) setGuidelines(data as Guideline[]);
    } catch (err) {
      console.error('Failed to fetch guidelines:', err);
    } finally {
      setGuidelinesLoading(false);
    }
  }, [user, groupOwnerId]);

  const addGuideline = async (title: string, content: string) => {
    if (!user) { alert('Sesi login tidak ditemukan. Silakan login ulang.'); return; }
    try {
      const { error } = await supabase.from('guidelines').insert({
        title,
        content,
        invited_by: groupOwnerId,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to add guideline:', err);
      alert('Gagal menambah aturan: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshGuidelines();
    }
  };

  const deleteGuideline = async (id: string) => {
    try {
      const { error } = await supabase.from('guidelines').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to delete guideline:', err);
      alert('Gagal menghapus aturan: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshGuidelines();
    }
  };

  // =============================================
  // WARNINGS CRUD (tabel: warnings — kolom: member_name, issue, status, invited_by)
  // =============================================
  const refreshWarnings = useCallback(async () => {
    if (!user || !groupOwnerId) return;
    setWarningsLoading(true);
    try {
      const { data, error } = await supabase.from('warnings').select('*')
        .eq('invited_by', groupOwnerId);
      if (error) { console.error('Fetch warnings error:', error.message); return; }
      if (data) setWarnings(data as Warning[]);
    } catch (err) {
      console.error('Failed to fetch warnings:', err);
    } finally {
      setWarningsLoading(false);
    }
  }, [user, groupOwnerId]);

  const addWarning = async (memberName: string, issue: string) => {
    if (!user) { alert('Sesi login tidak ditemukan. Silakan login ulang.'); return; }
    try {
      const { error } = await supabase.from('warnings').insert({
        member_name: memberName,
        issue,
        status: 'Belum Diselesaikan',
        invited_by: groupOwnerId,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to add warning:', err);
      alert('Gagal menambah peringatan: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshWarnings();
    }
  };

  // =============================================
  // SOS CRUD
  // =============================================
  const refreshSOS = useCallback(async () => {
    if (!user || !groupOwnerId) return;
    setSosLoading(true);
    try {
      const { data, error } = await supabase.from('sos_messages').select('*')
        .eq('invited_by', groupOwnerId);
      if (error) { console.error('Fetch SOS error:', error.message); return; }
      if (data) setSosMessages(data as SOSMessage[]);
    } catch (err) {
      console.error('Failed to fetch SOS messages:', err);
    } finally {
      setSosLoading(false);
    }
  }, [user, groupOwnerId]);

  const addSOS = async (fromName: string, message: string) => {
    if (!user) { alert('Sesi login tidak ditemukan. Silakan login ulang.'); return; }
    try {
      const { error } = await supabase.from('sos_messages').insert({
        from_name: fromName,
        message,
        sent_by: user.id,
        invited_by: groupOwnerId,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Failed to add SOS message:', err);
      alert('Gagal mengirim SOS: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      await refreshSOS();
    }
  };

  // =============================================
  // REFRESH ALL DATA AT ONCE
  // =============================================
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      refreshProfile(),
      refreshMembers(),
      refreshTasks(),
      refreshFinances(),
      refreshLiteratures(),
      refreshSchedules(),
      refreshGuidelines(),
      refreshWarnings(),
      refreshSOS(),
    ]);
  }, [refreshProfile, refreshMembers, refreshTasks, refreshFinances, refreshLiteratures, refreshSchedules, refreshGuidelines, refreshWarnings, refreshSOS]);

  // =============================================
  // INITIAL DATA LOAD + REALTIME SUBSCRIPTIONS
  // =============================================
  useEffect(() => {
    if (!user) return;

    refreshMembers();
    refreshTasks();
    refreshFinances();
    refreshLiteratures();
    refreshSchedules();
    refreshGuidelines();
    refreshWarnings();
    refreshSOS();

    const channel = supabase
      .channel('realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => { refreshMembers(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anggota_manual' }, () => { refreshMembers(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anggota_link' }, () => { refreshMembers(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => { refreshTasks(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finances' }, () => { refreshFinances(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'literatures' }, () => { refreshLiteratures(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => { refreshSchedules(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guidelines' }, () => { refreshGuidelines(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'warnings' }, () => { refreshWarnings(); })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshMembers, refreshTasks, refreshFinances, refreshLiteratures, refreshSchedules, refreshGuidelines, refreshWarnings, refreshSOS]);

  return (
    <AppContext.Provider value={{
      user, profile, currentRole, loading, signOut, updateProfile, refreshProfile,
      members, membersLoading, addMember, deleteMember, updateMemberRole, refreshMembers,
      tasks, tasksLoading, addTask, updateTaskStatus, updateTaskAssignee, submitTask, refreshTasks,
      finances, financesLoading, addFinance, deleteFinance, refreshFinances,
      literatures, literaturesLoading, addLiterature, deleteLiterature, refreshLiteratures,
      schedules, schedulesLoading, addSchedule, deleteSchedule, refreshSchedules,
      guidelines, guidelinesLoading, addGuideline, deleteGuideline, refreshGuidelines,
      warnings, warningsLoading, addWarning, refreshWarnings,
      sosMessages, sosLoading, addSOS, refreshSOS,
      refreshAllData,
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
