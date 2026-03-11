import { ServiceItem } from './types';

export const serviceItems: ServiceItem[] = [
  { id: 's1', title: 'Pemindaian Anggota', description: 'Pengelolaan data anggota tim serta struktur organisasi kelas secara terstruktur.', icon: 'ScanSearch', requiredRole: 'ketua', modalKey: 'scan' },
  { id: 's2', title: 'Alokasi Beban Kerja', description: 'Pendelegasian tugas kepada anggota dan pemantauan progres secara transparan.', icon: 'ListTodo', requiredRole: 'ketua', modalKey: 'allocator' },
  { id: 's3', title: 'Laporan Periodik', description: 'Penyusunan ringkasan kinerja dan progres tim secara berkala.', icon: 'FileBarChart', requiredRole: 'ketua', modalKey: 'report' },
  { id: 's4', title: 'Realokasi Tugas', description: 'Mekanisme intervensi untuk mengambil alih tugas yang terhambat.', icon: 'ShieldAlert', requiredRole: 'ketua', modalKey: 'darurat' },
  { id: 's5', title: 'Peringatan Kinerja', description: 'Distribusi teguran profesional secara tertutup untuk memitigasi keterlambatan.', icon: 'BellRing', requiredRole: 'ketua', modalKey: 'colek' },
  { id: 's6', title: 'Kompilasi Naskah', description: 'Sinkronisasi dan penggabungan teks menjadi satu dokumen baku.', icon: 'FileText', requiredRole: 'sekretaris', modalKey: 'draft' },
  { id: 's7', title: 'Jadwal Kegiatan', description: 'Pengaturan dan pengelolaan jadwal acara kelas secara terstruktur.', icon: 'CalendarDays', requiredRole: 'sekretaris', modalKey: 'jadwal' },
  { id: 's8', title: 'Pedoman Penulisan', description: 'Penetapan parameter baku penyusunan dokumen untuk konsistensi naskah.', icon: 'BookOpen', requiredRole: 'sekretaris', modalKey: 'pakem' },
  { id: 's9', title: 'Repositori Literatur', description: 'Pusat pengarsipan tautan referensi akademik yang terenkripsi.', icon: 'Link2', requiredRole: 'sekretaris', modalKey: 'brankas' },
  { id: 's10', title: 'Tata Kelola Anggaran', description: 'Sistem pencatatan pengeluaran operasional secara transparan.', icon: 'Wallet', requiredRole: 'bendahara', modalKey: 'kas' },
  { id: 's11', title: 'Dasbor Progres', description: 'Pelacakan visual status penyelesaian tugas secara akurat.', icon: 'LayoutDashboard', requiredRole: 'semua', modalKey: 'board' },
  { id: 's12', title: 'Dukungan Ekosistem', description: 'Integrasi layanan eskalasi untuk bantuan teknis dan akademis.', icon: 'Siren', requiredRole: 'semua', modalKey: 'sos' },
];
