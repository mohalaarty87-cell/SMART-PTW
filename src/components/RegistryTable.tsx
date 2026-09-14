import React from 'react';
import { ExternalLink, CheckCircle, Flame, Snowflake, Radiation, Zap } from 'lucide-react';
import { Language, PTWItem } from '../types';

interface RegistryTableProps {
  language: Language;
  items: Record<string, PTWItem>;
  searchQuery: string;
  onOpenModal: (key: string) => void;
}

export const RegistryTable: React.FC<RegistryTableProps> = ({
  language,
  items,
  searchQuery,
  onOpenModal,
}) => {
  const allKeys = Object.keys(items);

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

  const filteredItems = allKeys.map((k) => items[k]).filter(matchesQuery);

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
              <th className="p-3.5">{language === 'ar' ? 'فحص الغاز / تدابير السلامة' : 'Safety / LOTO Verification'}</th>
              <th className="p-3.5">{language === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="p-3.5 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c2b4c] text-slate-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-[#152445]/60 transition">
                <td className="p-3.5 font-mono text-cyan-400 font-bold whitespace-nowrap">
                  <span className="flex items-center gap-1.5">
                    <span>{item.icon}</span>
                    <span>{item.permitNo}</span>
                  </span>
                </td>
                <td className="p-3.5 font-semibold max-w-xs">
                  <div>{language === 'ar' ? item.titleAr : item.titleEn}</div>
                  <div className="text-[11px] text-[#627d98] truncate">
                    {language === 'ar' ? item.subTitleAr : item.subTitleEn}
                  </div>
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <span className={`${item.riskBadgeClass} text-[10px] px-2 py-0.5 rounded font-mono font-bold`}>
                    {item.risk}
                  </span>
                </td>
                <td className="p-3.5 text-slate-300 whitespace-nowrap font-mono text-[11px]">
                  {language === 'ar' ? item.locationAr : item.locationEn}
                </td>
                <td className="p-3.5 text-slate-300 whitespace-nowrap">
                  {language === 'ar' ? item.contractorAr : item.contractorEn}
                </td>
                <td className="p-3.5 text-emerald-400 font-mono text-[11px] max-w-[200px] truncate">
                  {item.safetyRadiusEn}
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <span className="badge-success text-[10px] px-2 py-0.5 rounded font-bold">
                    {language === 'ar' ? item.statusAr : item.status}
                  </span>
                </td>
                <td className="p-3.5 text-center whitespace-nowrap">
                  <button
                    onClick={() => onOpenModal(item.key)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/50 font-semibold text-xs flex items-center gap-1 mx-auto transition cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'عرض وتدقيق' : 'Inspect'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
