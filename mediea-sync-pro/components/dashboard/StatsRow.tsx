'use client';

import { Users, ListChecks, TrendingUp, Award } from 'lucide-react';

const stats = [
  { icon: <Users size={22} />, value: '10.000+', label: 'Ketua Tim Terbantu', color: 'from-[#10b981] to-[#059669]' },
  { icon: <ListChecks size={22} />, value: '50.000+', label: 'Tugas Terdelegasikan', color: 'from-[#3b82f6] to-[#2563eb]' },
  { icon: <TrendingUp size={22} />, value: '99.2%', label: 'Tingkat Transparansi', color: 'from-[#f59e0b] to-[#d97706]' },
  { icon: <Award size={22} />, value: '4.9/5', label: 'Penilaian Kepuasan', color: 'from-[#8b5cf6] to-[#7c3aed]' },
];

export default function StatsRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="group rounded-2xl bg-[#2c2c38] border border-white/5 p-5 hover:border-[#10b981]/10 transition-all duration-300"
        >
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
            {stat.icon}
          </div>
          <div className="text-2xl font-bold text-[#fafafa] mb-0.5">{stat.value}</div>
          <div className="text-xs text-[#8c8c8e]">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
