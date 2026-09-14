import React from 'react';
import { Flame, CheckSquare, Wind, Fingerprint } from 'lucide-react';
import { Language } from '../types';

interface KpiGaugesProps {
  language: Language;
}

export const KpiGauges: React.FC<KpiGaugesProps> = ({ language }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* KPI 1 */}
      <div className="p-5 rounded-xl bg-[#0b1324] border border-[#1c2b4c] hover:border-cyan-500/40 transition shadow-lg flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-xs text-[#9fb3c8] font-medium">
            {language === 'ar' ? 'تصاريح عمل رئيسية نشطة' : 'Active Main Work Permits'}
          </span>
          <div className="text-3xl font-extrabold font-mono text-white flex items-baseline gap-2">
            <span>03</span>
            <span className="text-xs text-rose-400 font-semibold">1 Critical</span>
          </div>
          <span className="text-[10px] text-[#627d98]">Radiography, Hot, Cold</span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition">
          <Flame className="w-6 h-6" />
        </div>
      </div>

      {/* KPI 2 */}
      <div className="p-5 rounded-xl bg-[#0b1324] border border-[#1c2b4c] hover:border-cyan-500/40 transition shadow-lg flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-xs text-[#9fb3c8] font-medium">
            {language === 'ar' ? 'شهادات سلامة معتمدة سارية' : 'Approved Safety Certificates'}
          </span>
          <div className="text-3xl font-extrabold font-mono text-white flex items-baseline gap-2">
            <span>11</span>
            <span className="text-xs text-emerald-400 font-semibold">100% Valid</span>
          </div>
          <span className="text-[10px] text-[#627d98]">LOTO, Confined, Excavation</span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
          <CheckSquare className="w-6 h-6" />
        </div>
      </div>

      {/* KPI 3 */}
      <div className="p-5 rounded-xl bg-[#0b1324] border border-[#1c2b4c] hover:border-cyan-500/40 transition shadow-lg flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-xs text-[#9fb3c8] font-medium">
            {language === 'ar' ? 'فحوصات الغاز المستمرة' : 'Continuous Atmospheric Tests'}
          </span>
          <div className="text-3xl font-extrabold font-mono text-white flex items-baseline gap-2">
            <span>07</span>
            <span className="text-xs text-cyan-400 font-semibold">LEL 0% Safe</span>
          </div>
          <span className="text-[10px] text-[#627d98]">H2S &lt; 0.0 ppm / O2: 20.9%</span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
          <Wind className="w-6 h-6" />
        </div>
      </div>

      {/* KPI 4 */}
      <div className="p-5 rounded-xl bg-[#0b1324] border border-[#1c2b4c] hover:border-cyan-500/40 transition shadow-lg flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-xs text-[#9fb3c8] font-medium">
            {language === 'ar' ? 'نسبة التوقيع الرقمي والامتثال' : 'Digital Signatures & Compliance'}
          </span>
          <div className="text-3xl font-extrabold font-mono text-white flex items-baseline gap-2">
            <span>100%</span>
            <span className="text-xs text-teal-400 font-semibold">Verified</span>
          </div>
          <span className="text-[10px] text-[#627d98]">OSHA 1910.119 Audit Logged</span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition">
          <Fingerprint className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
