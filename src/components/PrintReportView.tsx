import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { Language, PTWItem } from '../types';

interface PrintReportViewProps {
  language: Language;
  isOpen: boolean;
  items: Record<string, PTWItem>;
  onClose: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  language,
  isOpen,
  items,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const allItems: PTWItem[] = Object.values(items);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 lg:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl rounded-2xl bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Actions Bar (hidden in print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm">
              {language === 'ar' ? 'معاينة التقرير الشامل للطباعة' : 'Printable System Summary Report'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'ar' ? 'طباعة التقرير (Print)' : 'Print Report'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 overflow-y-auto text-xs font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-slate-900 text-white font-mono font-black text-xl flex items-center justify-center">
                ZFOD
              </div>
              <div>
                <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
                  Zubair Field Operating Division (ZFOD)
                </h1>
                <h2 className="text-sm font-semibold text-slate-700">
                  هيئة تشغيل حقل الزبير — المنظومة الرقمية لتصاريح العمل والسلامة (HSE)
                </h2>
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-600">
              <div>Ref: ZFOD-HSE-SUM-2026</div>
              <div>Date: {new Date().toLocaleDateString('en-GB')}</div>
              <div>Shift: Day Shift (06:00-18:00)</div>
            </div>
          </div>

          {/* Station Status Summary */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-100 border border-slate-300 rounded">
              <span className="block text-slate-500 text-[10px] uppercase font-bold">Location</span>
              <span className="font-bold text-slate-900">ZUB-SITE-01 Mishrif</span>
            </div>
            <div className="p-3 bg-slate-100 border border-slate-300 rounded">
              <span className="block text-slate-500 text-[10px] uppercase font-bold">Active Permits</span>
              <span className="font-bold text-slate-900">3 Main PTW</span>
            </div>
            <div className="p-3 bg-slate-100 border border-slate-300 rounded">
              <span className="block text-slate-500 text-[10px] uppercase font-bold">Attached Certs</span>
              <span className="font-bold text-slate-900">7 Supplementary</span>
            </div>
            <div className="p-3 bg-slate-100 border border-slate-300 rounded">
              <span className="block text-slate-500 text-[10px] uppercase font-bold">Atmosphere</span>
              <span className="font-bold text-emerald-700">LEL 0% / 100% Safe</span>
            </div>
          </div>

          {/* Permits & Certs Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">
              Operational Permit &amp; Certificate Roster (سجل التصاريح والشهادات السارية)
            </h3>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-400 text-left">
                  <th className="p-2">Code</th>
                  <th className="p-2">Title / Description</th>
                  <th className="p-2">Risk</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Contractor</th>
                  <th className="p-2">Safety Controls</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allItems.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 font-mono font-bold text-slate-900">{item.permitNo}</td>
                    <td className="p-2 font-medium">
                      <div>{item.titleEn}</div>
                      <div className="text-[10px] text-slate-500">{item.titleAr}</div>
                    </td>
                    <td className="p-2 font-mono text-[10px] font-bold text-slate-700">{item.risk}</td>
                    <td className="p-2">{item.locationEn}</td>
                    <td className="p-2">{item.contractorEn}</td>
                    <td className="p-2 text-[10px] text-slate-600">{item.safetyRadiusEn}</td>
                    <td className="p-2 font-bold text-emerald-700">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures & Certification */}
          <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="border-t border-slate-400 pt-2">
              <span className="block font-bold">Eng. Ammar Al-Haidari</span>
              <span className="text-[10px] text-slate-500">Lead Safety Authority (ZFOD HSE)</span>
              <span className="block font-mono text-[9px] text-slate-400 mt-1">Badge: HSE-AUTH-01</span>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <span className="block font-bold">Eng. Ziyad Fadhil Al-Kaabi</span>
              <span className="text-[10px] text-slate-500">Zubair Operations Area Manager</span>
              <span className="block font-mono text-[9px] text-slate-400 mt-1">Badge: ZFOD-MGR-01</span>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <span className="block font-bold">Control Room Shift Supervisor</span>
              <span className="text-[10px] text-slate-500">Station ZUB-01 Central Dispatch</span>
              <span className="block font-mono text-[9px] text-slate-400 mt-1">Status: VERIFIED 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
