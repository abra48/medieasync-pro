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
  board: { component: BoardModal, title: 'Dasbor Progres' },
  darurat: { component: DaruratModal, title: 'Realokasi Tugas' },
  kas: { component: KasModal, title: 'Tata Kelola Anggaran' },
  pakem: { component: PakemModal, title: 'Pedoman Penulisan' },
  brankas: { component: BrankasModal, title: 'Repositori Literatur' },
  draft: { component: DraftModal, title: 'Kompilasi Naskah' },
  jadwal: { component: JadwalModal, title: 'Jadwal Kegiatan' },
  report: { component: ReportModal, title: 'Laporan Periodik' },
  colek: { component: ColekModal, title: 'Peringatan Kinerja' },
  sos: { component: SOSModal, title: 'Dukungan Ekosistem' },
};

export default function ServicesGrid() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const activeConfig = activeModal ? modalComponents[activeModal] : null;
  const ActiveComponent = activeConfig?.component;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#fafafa] mb-1">Layanan Mediea Sync Pro</h2>
        <p className="text-sm text-[#8c8c8e]">12 fitur terintegrasi untuk pengelolaan kelas secara profesional.</p>
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
