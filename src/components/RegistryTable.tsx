import React from 'react';
import { ExternalLink, CheckCircle, Flame, Snowflake, Radiation, Zap, AlertTriangle } from 'lucide-react';
import { Language, PTWItem } from '../types';
import { checkPermitValidity } from '../utils/validityHelper';

interface RegistryTableProps {
  language: Language;
  items: Record<string, PTWItem>;
  searchQuery: string;
  onOpenModal: (key: string) => void;
  statusFilter?: string;
  riskFilter?: string;
  contractorFilter?: string;
}

export const RegistryTable: React.FC<RegistryTableProps> = ({
  language,
  items,
  searchQuery,
  onOpenModal,
  statusFilter = 'ALL',
  riskFilter = 'ALL',
  contractorFilter = 'ALL',
}) => {
  const allKeys = Object.keys(items);

  const matchesFilters = (item: PTWItem) => {
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

    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }

    if (riskFilter !== 'ALL' && item.risk !== riskFilter) {
      return false;
    }

    if (contractorFilter !== 'ALL' && !item.contractorEn.toLowerCase().includes(contractorFilter.toLowerCase())) {
      return false;
    }

    return true;
  };

  const filteredItems = allKeys.map((k) => items[k]).filter(matchesFilters);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="overflow-x-auto rounded-xl border border-[#1c2b4c] bg-[#0b1324] shadow-2xl">
        <table className={`w-full text-xs ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <thead className="bg-[#101b33]/90 text-[#9fb3c8] font-mono border-b border-[#1c2b4c]">
            <tr>
              <th className="p-3.5">{language === 'ar' ? 'كود التصريح (ID)' : 'Permit / Cert ID'}</th>
              <th className="p-3.5">{language === 'ar' ? 'نوع التصريح / المهمة' : 'Type / Work Scope'}</th>
              <th className="p-3.5">{language === 'ar' ? 'مستوى الخطر' : 'Risk Rating'}</th>
              <th className="p-3.5">{language === 'ar' ? 'الموقع الفعلي' : 'Physical Location'}</th>
              <th className="p-3.5">{language === 'ar' ? 'الجهة المنفذة' : 'Contractor / Unit'}</th>
              <th className="p-3.5">{language === 'ar' ? 'الصلاحية والغاز' : 'Validity & Gas Test'}</th>
              <th className="p-3.5">{language === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="p-3.5 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c2b4c] text-slate-200">
            {filteredItems.map((item) => {
              const validity = checkPermitValidity(item.validityWindow);
              const isCriticalGas = item.gasCriticalWarningActive || (item.gasTests || []).some((g) => g.status === 'CRITICAL');
              const isSuspended = item.status === 'SUSPENDED';

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-[#152445]/60 transition ${
                    isCriticalGas || isSuspended ? 'bg-rose-950/20' : ''
                  }`}
                >
                  <td className="p-3.5 font-mono text-cyan-400 font-bold whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      <span>{item.permitNo}</span>
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">
                      {language === 'ar' ? item.titleAr : item.titleEn}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {language === 'ar' ? item.subTitleAr : item.subTitleEn}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`${item.riskBadgeClass} px-2 py-0.5 rounded font-mono text-[10px] font-bold whitespace-nowrap`}>
                      {item.risk}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {language === 'ar' ? item.locationAr : item.locationEn}
                  </td>
                  <td className="p-3.5 text-cyan-300 font-semibold">
                    {language === 'ar' ? item.contractorAr : item.contractorEn}
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">
                    <div className={validity.isExpiringSoon ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {language === 'ar' ? validity.labelAr : validity.labelEn}
                    </div>
                    {isCriticalGas ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        CRITICAL GAS
                      </span>
                    ) : (
                      <span className="text-emerald-400">
                        {item.gasTests.length} Samples (SAFE)
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold border whitespace-nowrap ${
                        isSuspended || isCriticalGas
                          ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                          : 'bg-cyan-950 text-cyan-300 border-cyan-700/50'
                      }`}
                    >
                      {language === 'ar' ? item.statusAr : item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onOpenModal(item.key)}
                      className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>{language === 'ar' ? 'فتح' : 'View'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
