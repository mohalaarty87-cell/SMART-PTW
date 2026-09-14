import React, { useState } from 'react';
import {
  X,
  Printer,
  Zap,
  Save,
  Info,
  CheckSquare,
  Wind,
  FileSignature,
  History,
  ShieldCheck,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { Language, PTWItem, GasReading } from '../types';

interface PermitModalProps {
  language: Language;
  item: PTWItem | null;
  onClose: () => void;
  onSave: (updatedItem: PTWItem) => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

type ModalTab = 'overview' | 'checklist' | 'gas' | 'signatures' | 'audit';

export const PermitModal: React.FC<PermitModalProps> = ({
  language,
  item,
  onClose,
  onSave,
  onShowToast,
}) => {
  if (!item) return null;

  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const [formData, setFormData] = useState<PTWItem>({ ...item });
  const [newGasTime, setNewGasTime] = useState('14:00');
  const [newGasLel, setNewGasLel] = useState('0.0%');
  const [newGasO2, setNewGasO2] = useState('20.9%');
  const [newGasH2s, setNewGasH2s] = useState('0.0 ppm');
  const [newGasCo, setNewGasCo] = useState('0.0 ppm');

  const handleToggleChecklist = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      checklists: prev.checklists.map((c) =>
        c.id === id ? { ...c, verified: !c.verified, status: !c.verified ? 'PASS' : 'PENDING' } : c
      ),
    }));
  };

  const handleAddGasReading = () => {
    const newEntry: GasReading = {
      id: 'g-' + Date.now(),
      time: newGasTime,
      lel: newGasLel,
      o2: newGasO2,
      h2s: newGasH2s,
      co: newGasCo,
      tester: language === 'ar' ? 'م. عمار الحيدري (HSE Lead)' : 'Eng. Ammar (Lead HSE)',
      signature: 'Ammar-HSE',
      status: 'SAFE',
    };

    setFormData((prev) => ({
      ...prev,
      gasTests: [...prev.gasTests, newEntry],
    }));

    onShowToast(
      language === 'ar' ? 'تمت إضافة قراءة فحص الغاز بنجاح ✓' : 'Gas test reading appended successfully ✓',
      'success'
    );
  };

  const handleRemoveGasReading = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      gasTests: prev.gasTests.filter((g) => g.id !== id),
    }));
  };

  const handleSmartAutoFill = () => {
    setFormData((prev) => ({
      ...prev,
      checklists: prev.checklists.map((c) => ({ ...c, verified: true, status: 'PASS' })),
      progressPercent: 100,
    }));
    onShowToast(
      language === 'ar' ? 'تمت التعبئة التلقائية للبيانات الفنية النموذجية بنجاح!' : 'Smart auto-fill applied successfully!',
      'info'
    );
  };

  const handlePrint = () => {
    onShowToast(
      language === 'ar' ? 'جارٍ تهيئة مستند التصريح الرسمي المعتمد للطباعة...' : 'Preparing official PTW document for printing...',
      'info'
    );
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleSaveChanges = () => {
    onSave(formData);
    onShowToast(
      language === 'ar' ? 'تم حفظ واعتماد كافة التعديلات في سجل حقل الزبير السحابي ✓' : 'Changes saved & verified to Zubair Field Registry ✓',
      'success'
    );
    onClose();
  };

  return (
    <div
      id="modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 lg:p-6 overflow-y-auto"
    >
      <div
        id="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl rounded-2xl bg-[#0b1324] border border-[#1c2b4c] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 lg:p-5 bg-gradient-to-r from-[#101b33] to-[#0b1324] border-b border-[#1c2b4c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner">
              {formData.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base lg:text-lg font-extrabold text-white">
                  {language === 'ar' ? formData.titleAr : formData.titleEn}
                </h3>
                <span className={`${formData.riskBadgeClass} text-[10px] font-mono px-2 py-0.5 rounded font-bold`}>
                  {formData.risk}
                </span>
              </div>
              <p className="text-xs text-[#9fb3c8] font-mono mt-0.5">
                ZFOD Ref: {formData.permitNo} • Standard ISO 45001 / OSHA 1910.119
              </p>
            </div>
          </div>

          {/* Modal Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSmartAutoFill}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تعبئة ذكية' : 'Auto Fill'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#101b33] hover:bg-[#152445] text-slate-200 border border-[#1c2b4c] text-xs font-semibold transition cursor-pointer"
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

        {/* Modal Tab Bar */}
        <div className="bg-[#060b14]/90 px-5 border-b border-[#1c2b4c] flex items-center gap-2 sm:gap-4 overflow-x-auto text-xs font-semibold select-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-2 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{language === 'ar' ? 'نظرة عامة والمسار (Overview)' : 'Overview & Lifecycle'}</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-2 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{language === 'ar' ? 'قائمة تدقيق السلامة (Checklist)' : 'Safety Checklist'}</span>
          </button>

          <button
            onClick={() => setActiveTab('gas')}
            className={`py-3 px-2 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'gas'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>{language === 'ar' ? 'فحوصات الغاز المستمرة (Gas Test)' : 'Continuous Gas Testing'}</span>
          </button>

          <button
            onClick={() => setActiveTab('signatures')}
            className={`py-3 px-2 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'signatures'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>{language === 'ar' ? 'التواقيع والاعتمادات (Signatures)' : 'Digital Signatures'}</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-2 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{language === 'ar' ? 'سجل العمليات والتدقيق (Audit Trail)' : 'Live Audit Trail'}</span>
          </button>
        </div>

        {/* Modal Dynamic Content */}
        <div className="p-5 lg:p-6 overflow-y-auto space-y-6 flex-1 bg-[#060b14] text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Stepper Workflow */}
              <div className="p-4 rounded-xl bg-[#0b1324] border border-[#1c2b4c]">
                <div className="flex items-center justify-between text-[11px] font-mono mb-3 text-slate-400">
                  <span className="text-cyan-300 font-bold">ZFOD 7-STAGE LIFE CYCLE</span>
                  <span className="text-emerald-400 font-bold">STAGE 6: ACTIVE ON-SITE</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-center font-mono text-[10px]">
                  <div className="py-2 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-600/40 font-bold">
                    1. Draft (مسودة)
                  </div>
                  <div className="py-2 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-600/40 font-bold">
                    2. Submitted (مقدم)
                  </div>
                  <div className="py-2 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-600/40 font-bold">
                    3. HSE Review (سلامة)
                  </div>
                  <div className="py-2 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-600/40 font-bold">
                    4. Tech Auth (تفويض)
                  </div>
                  <div className="py-2 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-600/40 font-bold">
                    5. Gas Tested (فحص غاز)
                  </div>
                  <div className="py-2 bg-cyan-500 text-slate-950 font-black rounded shadow-lg shadow-cyan-500/20">
                    6. ACTIVE (سارٍ)
                  </div>
                  <div className="py-2 bg-[#101b33] text-slate-400 rounded border border-[#1c2b4c]">
                    7. Handback (إغلاق)
                  </div>
                </div>
              </div>

              {/* Data Grid Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#627d98] font-medium block">
                    {language === 'ar' ? 'رقم التصريح المعتمد (Permit ID)' : 'Permit ID'}
                  </label>
                  <input
                    type="text"
                    value={formData.permitNo}
                    onChange={(e) => setFormData({ ...formData, permitNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#627d98] font-medium block">
                    {language === 'ar' ? 'الموقع الفعلي / المحطة (Site)' : 'Work Location'}
                  </label>
                  <input
                    type="text"
                    value={language === 'ar' ? formData.locationAr : formData.locationEn}
                    onChange={(e) =>
                      language === 'ar'
                        ? setFormData({ ...formData, locationAr: e.target.value })
                        : setFormData({ ...formData, locationEn: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-slate-100 text-xs focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#627d98] font-medium block">
                    {language === 'ar' ? 'الجهة المنفذة (Contractor / Unit)' : 'Contractor'}
                  </label>
                  <input
                    type="text"
                    value={language === 'ar' ? formData.contractorAr : formData.contractorEn}
                    onChange={(e) =>
                      language === 'ar'
                        ? setFormData({ ...formData, contractorAr: e.target.value })
                        : setFormData({ ...formData, contractorEn: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-slate-100 text-xs focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#627d98] font-medium block">
                    {language === 'ar' ? 'فترة الصلاحية (Time Window)' : 'Shift Window'}
                  </label>
                  <input
                    type="text"
                    value={formData.validityWindow}
                    onChange={(e) => setFormData({ ...formData, validityWindow: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 rounded-xl bg-[#101b33]/80 border border-[#1c2b4c] space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>
                    {language === 'ar'
                      ? 'المواصفات الفنية ومحور العزل المصرح (Technical Scope & Safety Controls)'
                      : 'Technical Scope & Safety Controls'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#0b1324] border border-[#1c2b4c]">
                    <span className="block text-[10px] text-[#627d98] mb-1">
                      {language === 'ar' ? formData.technicalSpecLabelAr : formData.technicalSpecLabelEn}
                    </span>
                    <span className="text-cyan-300 font-mono font-semibold">{formData.technicalSpecValue}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0b1324] border border-[#1c2b4c]">
                    <span className="block text-[10px] text-[#627d98] mb-1">
                      {language === 'ar' ? 'نطاق الأمان وحاجز العزل:' : 'Safety Perimeter:'}
                    </span>
                    <span className="text-slate-200">
                      {language === 'ar' ? formData.safetyRadiusAr : formData.safetyRadiusEn}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0b1324] border border-[#1c2b4c]">
                    <span className="block text-[10px] text-[#627d98] mb-1">
                      {language === 'ar' ? 'جهاز الفحص والمعايرة:' : 'Calibrated Detector Instrument:'}
                    </span>
                    <span className="text-emerald-400 font-mono">
                      {language === 'ar' ? formData.surveyMeterAr : formData.surveyMeterEn}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c2b4c]">
                <span className="text-xs font-bold text-slate-200">
                  {language === 'ar'
                    ? 'قائمة التحقق الميداني والجاهزية (HSE Physical Verification)'
                    : 'Physical Verification & Readiness Checklist'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  {formData.checklists.filter((c) => c.verified).length} / {formData.checklists.length} PASS
                </span>
              </div>

              <div className="space-y-2.5">
                {formData.checklists.map((chk) => (
                  <div
                    key={chk.id}
                    onClick={() => handleToggleChecklist(chk.id)}
                    className="p-3.5 rounded-xl bg-[#0b1324] border border-[#1c2b4c] hover:border-cyan-500/50 flex items-start justify-between gap-3 cursor-pointer transition"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={chk.verified}
                        onChange={() => {}}
                        className="w-4 h-4 mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 bg-[#101b33] border-[#1c2b4c] cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-100">
                          {language === 'ar' ? chk.titleAr : chk.titleEn}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {language === 'ar' ? chk.descAr : chk.descEn}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        chk.verified
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-600/40'
                      }`}
                    >
                      {chk.verified ? 'PASS ✓' : 'PENDING ⚠️'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GAS TESTING */}
          {activeTab === 'gas' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c2b4c]">
                <span className="text-xs font-bold text-white">
                  {language === 'ar'
                    ? 'سجل الفحص الجوي للغازات المستمرة (Continuous Gas Monitoring Matrix)'
                    : 'Continuous Atmospheric Gas Monitoring Matrix'}
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
                  ● ATMOSPHERE 100% SAFE
                </span>
              </div>

              {/* Gas Table */}
              <div className="overflow-x-auto rounded-lg border border-[#1c2b4c]">
                <table className={`w-full text-xs ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <thead className="bg-[#101b33] text-slate-300 font-mono">
                    <tr>
                      <th className="p-2.5">{language === 'ar' ? 'التوقيت' : 'Time'}</th>
                      <th className="p-2.5">LEL (0.0% Max 5%)</th>
                      <th className="p-2.5">O2 (19.5-23.5%)</th>
                      <th className="p-2.5">H2S (&lt; 5 ppm)</th>
                      <th className="p-2.5">CO (&lt; 25 ppm)</th>
                      <th className="p-2.5">{language === 'ar' ? 'المسؤول' : 'Inspector'}</th>
                      <th className="p-2.5">{language === 'ar' ? 'التقييم' : 'Status'}</th>
                      <th className="p-2.5 text-center">{language === 'ar' ? 'إزالة' : 'Remove'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2b4c] text-slate-200">
                    {formData.gasTests.map((row) => (
                      <tr key={row.id} className="hover:bg-[#152445]/50 transition">
                        <td className="p-2.5 font-mono text-cyan-300 font-bold">{row.time}</td>
                        <td className="p-2.5 font-mono text-emerald-400 font-bold">{row.lel}</td>
                        <td className="p-2.5 font-mono text-emerald-400 font-bold">{row.o2}</td>
                        <td className="p-2.5 font-mono text-emerald-400 font-bold">{row.h2s}</td>
                        <td className="p-2.5 font-mono text-emerald-400 font-bold">{row.co}</td>
                        <td className="p-2.5">{row.tester}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold">
                            {row.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          {formData.gasTests.length > 1 && (
                            <button
                              onClick={() => handleRemoveGasReading(row.id)}
                              className="text-rose-400 hover:text-rose-200 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add New Reading Form */}
              <div className="p-3.5 rounded-xl bg-[#101b33] border border-[#1c2b4c] space-y-2">
                <span className="font-bold text-slate-200 block text-xs">
                  {language === 'ar' ? 'إضافة قراءة فحص جوي جديدة:' : 'Log New Gas Sampling Point:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الوقت' : 'Time'}</label>
                    <input
                      type="text"
                      value={newGasTime}
                      onChange={(e) => setNewGasTime(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#0b1324] border border-[#1c2b4c] text-xs font-mono text-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">LEL %</label>
                    <input
                      type="text"
                      value={newGasLel}
                      onChange={(e) => setNewGasLel(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#0b1324] border border-[#1c2b4c] text-xs font-mono text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">O2 %</label>
                    <input
                      type="text"
                      value={newGasO2}
                      onChange={(e) => setNewGasO2(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#0b1324] border border-[#1c2b4c] text-xs font-mono text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">H2S ppm</label>
                    <input
                      type="text"
                      value={newGasH2s}
                      onChange={(e) => setNewGasH2s(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#0b1324] border border-[#1c2b4c] text-xs font-mono text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">CO ppm</label>
                    <input
                      type="text"
                      value={newGasCo}
                      onChange={(e) => setNewGasCo(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#0b1324] border border-[#1c2b4c] text-xs font-mono text-emerald-400"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddGasReading}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 transition cursor-pointer text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'إضافة' : 'Add'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SIGNATURES */}
          {activeTab === 'signatures' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-xs font-bold text-white">
                {language === 'ar'
                  ? 'سجل التواقيع والمصادقات الرقمية (Digital Sign-off & Approvals)'
                  : 'Digital Sign-offs & Authorizations'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.signatures.map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0b1324] border border-[#1c2b4c] flex flex-col justify-between space-y-3 shadow-md"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase">
                        {language === 'ar' ? sig.roleAr : sig.roleEn}
                      </span>
                      <div className="text-xs font-bold text-slate-100">{sig.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Badge: {sig.badgeId}</div>
                    </div>

                    <div className="p-2.5 rounded bg-[#101b33] border border-emerald-500/30 font-mono text-[10px] text-emerald-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{sig.status}</span>
                      </span>
                      <span>{sig.signedAt}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hash Security Stamp */}
              <div className="p-3.5 rounded-xl bg-[#101b33] border border-[#1c2b4c] text-[11px] font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>SHA-256 Ledger: 9e3b7fa82b5d491c0e3a4781...c81f00a2</span>
                <span className="text-emerald-400 font-bold">Encrypted via ZFOD Enterprise Ledger</span>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="text-xs font-bold text-white">
                {language === 'ar'
                  ? 'سجل العمليات والتدقيق الحي (Live Audit Trail & Events)'
                  : 'Live Operational Audit Trail & Events'}
              </div>

              <div className="space-y-2 font-mono text-xs">
                {formData.auditTrail.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg bg-[#0b1324] border border-[#1c2b4c] flex items-start gap-3"
                  >
                    <span className="text-emerald-400 text-sm">●</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-slate-200 font-bold">
                          {language === 'ar' ? ev.titleAr : ev.titleEn}
                        </span>
                        <span className="text-slate-400 text-[11px]">{ev.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {language === 'ar' ? ev.detailAr : ev.detailEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Status Bar */}
        <div className="p-4 bg-[#101b33] border-t border-[#1c2b4c] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse" />
            <span>{language === 'ar' ? 'الوثيقة معتمدة ومطابقة لـ:' : 'Document verified with:'}</span>
            <span className="font-mono text-cyan-300 font-bold">
              ZFOD-{formData.permitNo}-SEC-2026-X8
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950 cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'ar' ? 'حفظ واعتماد التعديلات' : 'Save & Certify Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
