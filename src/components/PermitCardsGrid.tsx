import React from 'react';
import { ExternalLink, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Language, PTWItem } from '../types';

interface PermitCardsGridProps {
  language: Language;
  items: Record<string, PTWItem>;
  searchQuery: string;
  onOpenModal: (key: string) => void;
}

export const PermitCardsGrid: React.FC<PermitCardsGridProps> = ({
  language,
  items,
  searchQuery,
  onOpenModal,
}) => {
  const matchesQuery = (item: PTWItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.permitNo.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.titleAr.toLowerCase().includes(q) ||
      item.locationEn.toLowerCase().includes(q) ||
      item.locationAr.toLowerCase().includes(q) ||
      item.contractorEn.toLowerCase().includes(q) ||
      item.contractorAr.toLowerCase().includes(q) ||
      item.risk.toLowerCase().includes(q)
    );
  };

  const mainPermitKeys = ['rad', 'hot', 'cold'];
  const certKeys = ['hotperf', 'excavation', 'confined', 'override', 'scaffolding', 'hse-iso', 'elec-iso'];

  const filteredMainPermits = mainPermitKeys.filter((k) => items[k] && matchesQuery(items[k]));
  const filteredCerts = certKeys.filter((k) => items[k] && matchesQuery(items[k]));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 3 Main Work Permits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredMainPermits.map((k) => {
          const item = items[k];
          const isPurple = k === 'rad';
          const isRose = k === 'hot';
          const isCyan = k === 'cold';

          const borderHover = isPurple
            ? 'hover:border-purple-500/50'
            : isRose
            ? 'hover:border-rose-500/50'
            : 'hover:border-cyan-500/50';

          const titleHover = isPurple
            ? 'group-hover:text-purple-300'
            : isRose
            ? 'group-hover:text-rose-300'
            : 'group-hover:text-cyan-300';

          const iconBg = isPurple
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
            : isRose
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';

          const progressBarBg = isPurple ? 'bg-purple-500' : isRose ? 'bg-rose-500' : 'bg-cyan-500';

          const btnBg = isPurple
            ? 'bg-purple-950 hover:bg-purple-900 text-purple-200 border-purple-600/40'
            : isRose
            ? 'bg-rose-950 hover:bg-rose-900 text-rose-200 border-rose-600/40'
            : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border-cyan-600/40';

          return (
            <div
              key={item.id}
              className={`rounded-xl bg-[#0b1324] border border-[#1c2b4c] ${borderHover} transition-all duration-200 p-5 flex flex-col justify-between relative group shadow-lg`}
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl ${iconBg}`}>
                    {item.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`${item.riskBadgeClass} text-[10px] font-mono font-bold px-2 py-0.5 rounded`}>
                      {item.risk}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-bold">{item.permitNo}</span>
                  </div>
                </div>

                <div>
                  <h3 className={`text-base font-bold text-white ${titleHover} transition`}>
                    {language === 'ar' ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-xs text-[#9fb3c8] mt-1 leading-relaxed">
                    {language === 'ar' ? item.subTitleAr : item.subTitleEn}
                  </p>
                </div>

                {/* Key-Value Details Card */}
                <div className="p-3 rounded-lg bg-[#101b33]/80 border border-[#1c2b4c] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#627d98]">{language === 'ar' ? 'الموقع الفعلي:' : 'Physical Location:'}</span>
                    <span className="font-mono text-slate-200 text-right">
                      {language === 'ar' ? item.locationAr : item.locationEn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#627d98]">{language === 'ar' ? 'الجهة المنفذة:' : 'Contractor / Team:'}</span>
                    <span className="text-slate-200 text-right">
                      {language === 'ar' ? item.contractorAr : item.contractorEn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#627d98]">{language === 'ar' ? 'صلاحية الوردية:' : 'Shift Validity:'}</span>
                    <span className="font-mono text-cyan-300">
                      {language === 'ar' ? item.validityWindowAr : item.validityWindow}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#1c2b4c]/60">
                    <span className="text-[#627d98]">{language === 'ar' ? 'الشهادات المرفقة:' : 'Attached Certs:'}</span>
                    <span className="text-[10px] font-mono text-cyan-400 truncate max-w-[170px]">
                      {item.attachedCerts.join(' + ')}
                    </span>
                  </div>
                </div>

                {/* Workflow Progress */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1 text-slate-400">
                    <span>{language === 'ar' ? 'مسار التحقق والاعتماد' : 'Verification Progress'}</span>
                    <span className="text-emerald-400 font-bold">
                      {language === 'ar' ? item.progressTextAr : item.progressTextEn}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#101b33] overflow-hidden">
                    <div className={`h-full rounded-full ${progressBarBg}`} style={{ width: `${item.progressPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Bottom Action Strip */}
              <div className="pt-4 mt-4 border-t border-[#1c2b4c] flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${k === 'hot' ? 'animate-ping' : ''}`} />
                  <span>{language === 'ar' ? item.statusAr : item.status}</span>
                </span>
                <button
                  onClick={() => onOpenModal(item.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${btnBg}`}
                >
                  <span>{language === 'ar' ? 'فتح النموذج الكامل' : 'Open Full Permit'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION: 7 ATTACHED SAFETY CERTIFICATES */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {language === 'ar'
                ? 'الشهادات الفنية المرفقة التكميلية (7 Certificates)'
                : 'Attached Safety Certificates (7 Supplementary Certs)'}
            </span>
          </h2>
          <span className="text-xs text-[#627d98] font-mono">ZFOD LOTO &amp; ISOLATION REPOSITORY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCerts.map((k) => {
            const cert = items[k];
            const isSpan2 = k === 'elec-iso';

            return (
              <div
                key={cert.id}
                className={`rounded-xl bg-[#0b1324] border border-[#1c2b4c] hover:border-cyan-500/40 p-4 flex flex-col justify-between transition group shadow-md ${
                  isSpan2 ? 'sm:col-span-2' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{cert.icon}</span>
                    <span className={`${cert.riskBadgeClass} text-[10px] font-mono px-1.5 py-0.5 rounded font-bold`}>
                      {cert.permitNo}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                    {language === 'ar' ? cert.titleAr : cert.titleEn}
                  </h4>

                  <p className="text-[11px] text-[#9fb3c8] leading-relaxed">
                    {language === 'ar' ? cert.subTitleAr : cert.subTitleEn}
                  </p>

                  <div className="text-[10px] font-mono text-[#627d98]">
                    <span>{language === 'ar' ? 'مرتبط بـ: ' : 'Linked to: '}</span>
                    <span className="text-cyan-400 font-semibold">{cert.attachedCerts.join(', ')}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenModal(cert.key)}
                  className="mt-3.5 w-full py-1.5 text-center text-xs font-semibold rounded-lg bg-[#101b33] hover:bg-[#152445] text-cyan-300 hover:text-cyan-100 border border-[#1c2b4c] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{language === 'ar' ? 'عرض الشهادة الرسمية' : 'View Certificate'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
