'use client';

import { ServiceItem } from '@/lib/types';
import RoleBadge from '@/components/ui/RoleBadge';
import * as LucideIcons from 'lucide-react';

interface ServiceCardProps {
  service: ServiceItem;
  onOpenModal: () => void;
}

export default function ServiceCard({ service, onOpenModal }: ServiceCardProps) {
  // Dynamic icon lookup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<any>>;
  const IconComponent = icons[service.icon] || LucideIcons.Box;

  return (
    <div className="group rounded-2xl bg-[#2c2c38] border border-white/5 p-5 flex flex-col hover:border-[#10b981]/20 hover:shadow-lg hover:shadow-[#10b981]/5 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981] group-hover:scale-110 transition-transform">
          <IconComponent size={22} />
        </div>
        <RoleBadge role={service.requiredRole} />
      </div>

      <h3 className="text-sm font-bold text-[#fafafa] mb-1.5">{service.title}</h3>
      <p className="text-xs text-[#8c8c8e] leading-relaxed mb-4 flex-1">{service.description}</p>

      <button
        onClick={onOpenModal}
        className="w-full rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-2.5 text-xs font-bold text-[#10b981] uppercase tracking-wider hover:bg-[#10b981]/20 hover:border-[#10b981]/40 transition-all duration-200"
      >
        Buka Layanan
      </button>
    </div>
  );
}
