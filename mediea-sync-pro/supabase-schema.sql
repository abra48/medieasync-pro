-- ===============================================
-- Mediea Sync Pro — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ===============================================

-- 1. Members table (linked to auth.users)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'anggota' CHECK (role IN ('ketua', 'sekretaris', 'bendahara', 'anggota')),
  invited_by TEXT,  -- ID of the Ketua who invited this member (multi-tenant isolation)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name TEXT NOT NULL,
  assignee_id UUID REFERENCES members(id) ON DELETE SET NULL,
  assignee_name TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Belum Dikerjakan' CHECK (status IN ('Belum Dikerjakan', 'Menunggu Konfirmasi', 'Selesai')),
  file_url TEXT DEFAULT '',
  invited_by TEXT,  -- ID of the Ketua who owns this task (multi-tenant isolation)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Finances table
CREATE TABLE IF NOT EXISTS finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  price BIGINT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  invited_by TEXT,  -- ID of the Ketua who owns this finance entry (multi-tenant isolation)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Project settings (singleton row)
CREATE TABLE IF NOT EXISTS project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rules JSONB DEFAULT '[]'::jsonb,
  links JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default project_settings row if not exists
INSERT INTO project_settings (rules, links)
SELECT '[]'::jsonb, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM project_settings);

-- 5. Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  event TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_name TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SOS Messages table
CREATE TABLE IF NOT EXISTS sos_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_name TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- Row Level Security (RLS)
-- ===============================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all rows
CREATE POLICY "Authenticated users can read members" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read finances" ON finances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read project_settings" ON project_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read schedules" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read reminders" ON reminders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read sos_messages" ON sos_messages FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update/delete (app-level RBAC handles role checks)
CREATE POLICY "Authenticated users can insert members" ON members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update members" ON members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete members" ON members FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tasks" ON tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert finances" ON finances FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update finances" ON finances FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete finances" ON finances FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can update project_settings" ON project_settings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert schedules" ON schedules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete schedules" ON schedules FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert reminders" ON reminders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can insert sos_messages" ON sos_messages FOR INSERT TO authenticated WITH CHECK (true);

-- ===============================================
-- 8. Anggota Link table (members who joined via invite link)
-- ===============================================
CREATE TABLE IF NOT EXISTS anggota_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  peran TEXT NOT NULL DEFAULT 'Anggota',
  email TEXT,
  invited_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE anggota_link ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read anggota_link" ON anggota_link FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert anggota_link" ON anggota_link FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update anggota_link" ON anggota_link FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete anggota_link" ON anggota_link FOR DELETE TO authenticated USING (true);
