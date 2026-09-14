import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, FileCheck2, Printer } from 'lucide-react';
import { Language } from '../types';

interface AuditModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  language,
  isOpen,
  onClose,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const complianceStandards = [
    {
      code: 'OSHA 1910.119',
      titleEn: 'Process Safety Management of Highly Hazardous Chemicals (PSM)',
      titleAr: 'إدارة سلامة العمليات للمواد الكيميائية شديدة الخطورة',
      score: '100%',
      status: 'FULLY COMPLIANT',
      detailsEn: 'Hot work permits require authorized written certification prior to work beginning in PSM covered areas.',
      detailsAr: 'إصدار تصريح عمل كتابي معتمد قبل بدء اللحام أو القطع في المنشآت الهيدروكربونية.',
    },
    {
      code: 'ISO 45001:2018',
      titleEn: 'Occupational Health and Safety Management Systems',
      titleAr: 'أنظمة إدارة الصحة والسلامة المهنية المعتمدة دولياً',
      score: '100%',
      status: 'AUDITED & CERTIFIED',
      detailsEn: 'Elimination of hazards and reduction of OH&S risks through hierarchy of controls and LOTO protocol.',
      detailsAr: 'السيطرة على المخاطر عبر التسلسل الهرمي للتحكم وتطبيق إجراءات العزل الميكانيكي والكهربائي.',
    },
    {
      code: 'API 2201 (6th Ed.)',
      titleEn: 'Safe Hot Tapping Practices in the Petroleum & Petrochemical Industries',
      titleAr: 'الممارسات الآمنة للتثقيب والنقر الساخن في المنشآت النفطية',
      score: '100%',
      status: 'VALIDATED ON-STREAM',
      detailsEn: 'Minimum pipe wall thickness mapped; zero product flow stagnant pockets verified.',
      detailsAr: 'تدقيق سمك جدار الأنبوب بالموجات فوق الصوتية وعدم وجود جيوب ركود غازية.',
    },
    {
      code: 'OSHA 1910.146',
      titleEn: 'Permit-Required Confined Spaces Standard',
      titleAr: 'معيار دخول الأماكن المغلقة التي تتطلب تصريح عمل',
      score: '100%',
      status: 'CONTINUOUS MONITOR',
      detailsEn: 'Dedicated Standby Man, calibrated multi-gas detector and non-entry mechanical retrieval apparatus.',
      detailsAr: 'حارس متفرغ عند المدخل وجهاز قياس غازات مستمر وركيزة إنقاذ ميكانيكية فورية.',
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 lg:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl rounded-2xl bg-[#0b1324] border border-[#1c2b4c] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 lg:p-5 bg-gradient-to-r from-[#101b33] to-[#0b1324] border-b border-[#1c2b4c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base lg:text-lg font-bold text-white">
                  {language === 'ar'
                    ? 'سجل التدقيق والامتثال لمعايير السلامة (ISO / OSHA)'
                    : 'Safety Audit & Compliance Register (ISO / OSHA)'}
                </h3>
                <span className="badge-success text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  100% AUDIT READY
                </span>
              </div>
              <p className="text-xs text-[#9fb3c8] font-mono mt-0.5">
                Zubair Field Operating Division (ZFOD) • Station ZUB-01 Compliance Matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onShowToast(language === 'ar' ? 'جارٍ إعداد تقرير التدقيق للطباعة...' : 'Printing audit report...', 'info');
                setTimeout(() => window.print(), 400);
              }}
              className="p-2 rounded-lg bg-[#101b33] hover:bg-[#152445] text-slate-200 border border-[#1c2b4c] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-[#101b33] hover:bg-rose-900/80 hover:text-white text-slate-400 border border-[#1c2b4c] flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 lg:p-6 space-y-5 overflow-y-auto bg-[#060b14] text-xs">
          {/* Status Summary Banner */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {language === 'ar' ? 'النظام مطابق لجميع معايير السلامة المهنية' : 'All Workplace Safety Standards Satisfied'}
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {language === 'ar'
                  ? 'تم فحص وتدقيق كافة سجلات التصاريح، التواقيع الإلكترونية، شهادات العزل، وفحوصات الغاز الدورية لحقل الزبير.'
                  : 'Full alignment verified across all permit logs, electronic authorizations, LOTO hardware locks, and atmospheric readings.'}
              </p>
            </div>
            <div className="font-mono text-center px-4 py-2 rounded-lg bg-[#0b1324] border border-emerald-500/40">
              <span className="text-[10px] text-[#627d98] block uppercase">Compliance Score</span>
              <span className="text-2xl font-black text-emerald-400">100%</span>
            </div>
          </div>

          {/* Standards Cards */}
          <div className="space-y-3">
            {complianceStandards.map((std, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0b1324] border border-[#1c2b4c] hover:border-cyan-500/40 transition space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono font-bold text-[11px] border border-cyan-700/50">
                      {std.code}
                    </span>
                    <span className="font-bold text-white text-xs">
                      {language === 'ar' ? std.titleAr : std.titleEn}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-600/40">
                    {std.status}
                  </span>
                </div>
                <p className="text-[#9fb3c8] text-xs leading-relaxed">
                  {language === 'ar' ? std.detailsAr : std.detailsEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#101b33] border-t border-[#1c2b4c] flex items-center justify-between text-xs">
          <span className="text-[#627d98] font-mono">ZFOD-HSE-AUDIT-2026-CERTIFIED</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-600/40 font-semibold cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
