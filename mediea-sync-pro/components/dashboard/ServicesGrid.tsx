'use client';

import { useState } from 'react';
import { serviceItems } from '@/lib/mock-data';
import ServiceCard from './ServiceCard';
import Modal from '@/components/ui/Modal';
import ScanModal from '@/components/modals/ScanModal';
import AllocatorModal from '@/components/modals/AllocatorModal';
import BoardModal from '@/components/modals/BoardModal';
import DaruratModal from '@/components/modals/DaruratModal';
import KasModal from '@/components/modals/KasModal';
import PakemModal from '@/components/modals/PakemModal';
import BrankasModal from '@/components/modals/BrankasModal';
import DraftModal from '@/components/modals/DraftModal';
import JadwalModal from '@/components/modals/JadwalModal';
import ReportModal from '@/components/modals/ReportModal';
import ColekModal from '@/components/modals/ColekModal';
import SOSModal from '@/components/modals/SOSModal';

const modalComponents: Record<string, { component: React.ComponentType; title: string }> = {
  scan: { component: ScanModal, title: 'Pemindaian Anggota' },
  allocator: { component: AllocatorModal, title: 'Alokasi Beban Kerja' },
  board: { component: BoardModal, title: 'Papan Sinkronisasi' },
  darurat: { component: DaruratModal, title: 'Manajemen Krisis' },
  kas: { component: KasModal, title: 'Manajemen Kas' },
  pakem: { component: PakemModal, title: 'Papan Pakem' },
  brankas: { component: BrankasModal, title: 'Brankas Tautan' },
  draft: { component: DraftModal, title: 'Draft Surat' },
  jadwal: { component: JadwalModal, title: 'Jadwal Kegiatan' },
  report: { component: ReportModal, title: 'Laporan Periodik' },
  colek: { component: ColekModal, title: 'Colek / Pengingat' },
  sos: { component: SOSModal, title: 'SOS / Bantuan' },
};

export default function ServicesGrid() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const activeConfig = activeModal ? modalComponents[activeModal] : null;
  const ActiveComponent = activeConfig?.component;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#fafafa] mb-1">Layanan Sync Pro</h2>
        <p className="text-sm text-[#8c8c8e]">12 fitur terintegrasi untuk manajemen kelas modern.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {serviceItems.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onOpenModal={() => setActiveModal(service.modalKey)}
          />
        ))}
      </div>

      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={activeConfig?.title || ''}
      >
        {ActiveComponent && <ActiveComponent />}
      </Modal>
    </>
  );
}
