import React from 'react';
import { ExternalLink, CheckCircle2, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { Language, PTWItem } from '../types';
import { checkPermitValidity } from '../utils/validityHelper';

interface PermitCardsGridProps {
  language: Language;
  items: Record<string, PTWItem>;
  searchQuery: string;
  onOpenModal: (key: string) => void;
  statusFilter?: string;
  riskFilter?: string;
  contractorFilter?: string;
}

export const PermitCardsGrid: React.FC<PermitCardsGridProps> = ({
  language,
  items,
  searchQuery,
  onOpenModal,
  statusFilter = 'ALL',
  riskFilter = 'ALL',
  contractorFilter = 'ALL',
}) => {
  const matchesFilters = (item: PTWItem) => {
    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = (
        item.permitNo.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.titleAr.toLowerCase().includes(q) ||
        item.locationEn.toLowerCase().includes(q) ||
        item.locationAr.toLowerCase().includes(q) ||
        item.contractorEn.toLowerCase().includes(q) ||
        item.contractorAr.toLowerCase().includes(q) ||
        item.risk.toLowerCase().includes(q)
      );
      if (!matchText) return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }

    // Risk filter
    if (riskFilter !== 'ALL' && item.risk !== riskFilter) {
      return false;
    }

    // Contractor filter
    if (contractorFilter !== 'ALL' && !item.contractorEn.toLowerCase().includes(contractorFilter.toLowerCase())) {
      return false;
    }

    return true;
  };

  const mainPermitKeys = ['rad', 'hot', 'cold'];
  const certKeys = ['hotperf', 'excavation', 'confined', 'override', 'scaffolding', 'hse-iso', 'elec-iso'];

  const filteredMainPermits = mainPermitKeys.filter((k) => items[k] && matchesFilters(items[k]));
  const filteredCerts = certKeys.filter((k) => items[k] && matchesFilters(items[k]));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 3 Main Work Permits Grid */}
      {filteredMainPermits.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredMainPermits.map((k) => {
            const item = items[k];
            const isPurple = k === 'rad';
            const isRose = k === 'hot';
            const isCyan = k === 'cold';

            const validity = checkPermitValidity(item.validityWindow);
            const isCriticalGas = item.gasCriticalWarningActive || (item.gasTests || []).some((g) => g.status === 'CRITICAL');
            const isSuspended = item.status === 'SUSPENDED';

            const borderClass = isCriticalGas || isSuspended
              ? 'border-rose-500 ring-2 ring-rose-500/50 animate-pulse'
              : validity.isExpiringSoon
              ? 'border-amber-500 ring-2 ring-amber-500/50'
              : isPurple
              ? 'hover:border-purple-500/50 border-[#1c2b4c]'
              : isRose
              ? 'hover:border-rose-500/50 border-[#1c2b4c]'
              : 'hover:border-cyan-500/50 border-[#1c2b4c]';

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
                className={`rounded-xl bg-[#0b1324] border ${borderClass} transition-all duration-200 p-5 flex flex-col justify-between relative group shadow-lg`}
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
                      {isCriticalGas && (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500 flex items-center gap-1 animate-bounce">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          GAS DANGER
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Titles */}
                  <div>
                    <h3 className={`text-base font-bold text-white transition ${titleHover}`}>
                      {language === 'ar' ? item.titleAr : item.titleEn}
                    </h3>
                    <p className="text-xs text-[#9fb3c8] mt-1 line-clamp-2 leading-relaxed">
                      {language === 'ar' ? item.subTitleAr : item.subTitleEn}
                    </p>
                  </div>

                  {/* Key Metadata Table */}
                  <div className="space-y-2 text-xs border-t border-b border-[#1c2b4c]/80 py-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">{language === 'ar' ? 'الموقع التشغيلي:' : 'Location:'}</span>
                      <span className="font-semibold text-slate-200 text-right">
                        {language === 'ar' ? item.locationAr : item.locationEn}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">{language === 'ar' ? 'المقاول المنفذ:' : 'Contractor:'}</span>
                      <span className="font-semibold text-cyan-300 text-right">
                        {language === 'ar' ? item.contractorAr : item.contractorEn}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">{language === 'ar' ? 'الصلاحية:' : 'Validity:'}</span>
                      <span className={`font-mono text-[11px] font-bold ${validity.isExpiringSoon ? 'text-amber-400' : 'text-slate-300'}`}>
                        {language === 'ar' ? validity.labelAr : validity.labelEn}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">
                        {language === 'ar' ? item.technicalSpecLabelAr : item.technicalSpecLabelEn}:
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {item.technicalSpecValue}
                      </span>
                    </div>
                  </div>

                  {/* Progress & Status */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">
                        {language === 'ar' ? item.progressTextAr : item.progressTextEn}
                      </span>
                      <span className="font-bold text-white">{item.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-[#101b33] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${progressBarBg} transition-all duration-300`}
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-4 mt-2">
                  <button
                    onClick={() => onOpenModal(k)}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition border flex items-center justify-center gap-2 cursor-pointer shadow-md ${btnBg}`}
                  >
                    <span>{language === 'ar' ? 'فتح ومراجعة التصريح' : 'Open & Review Permit'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7 Complementary Safety Certificates */}
      {filteredCerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c2b4c]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                {language === 'ar'
                  ? 'شهادات وإجراءات السلامة التكميلية المرتبطة'
                  : 'Complementary Safety Certificates & Precautions'}
              </span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {filteredCerts.length} / {certKeys.length} {language === 'ar' ? 'نشطة' : 'Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCerts.map((k) => {
              const item = items[k];
              const isIso = k === 'hse-iso' || k === 'elec-iso';
              const isCritical = item.risk.includes('CRITICAL');
              const hasGasDanger = item.gasCriticalWarningActive || (item.gasTests || []).some((g) => g.status === 'CRITICAL');

              return (
                <div
                  key={item.id}
                  onClick={() => onOpenModal(k)}
                  className={`p-4 rounded-xl bg-[#0b1324] border ${
                    hasGasDanger
                      ? 'border-rose-500 animate-pulse ring-1 ring-rose-500'
                      : 'border-[#1c2b4c] hover:border-cyan-500/50'
                  } transition cursor-pointer flex flex-col justify-between space-y-3 group shadow`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{item.icon}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border-rose-600/50'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                        {language === 'ar' ? item.titleAr : item.titleEn}
                      </div>
                      <div className="text-[11px] font-mono text-[#9fb3c8] mt-0.5">
                        {item.permitNo}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {language === 'ar' ? item.subTitleAr : item.subTitleEn}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1c2b4c]/60 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                    <span>{language === 'ar' ? 'فحص السجل' : 'Inspect'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
