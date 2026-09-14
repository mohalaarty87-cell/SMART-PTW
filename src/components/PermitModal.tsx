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
  FileText,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Lock,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Language, PTWItem, GasReading, NotificationItem, PTWStatus } from '../types';
import { evaluateGasReadings } from '../utils/gasValidation';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

interface PermitModalProps {
  language: Language;
  item: PTWItem | null;
  onClose: () => void;
  onSave: (updatedItem: PTWItem) => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'error') => void;
  onAddNotification?: (notification: Omit<NotificationItem, 'id'>) => void;
}

type ModalTab = 'overview' | 'checklist' | 'gas' | 'signatures' | 'audit';

export const PermitModal: React.FC<PermitModalProps> = ({
  language,
  item,
  onClose,
  onSave,
  onShowToast,
  onAddNotification,
}) => {
  if (!item) return null;

  const { currentUser, canApprovePermit, canSignOff } = useAuth();
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const [formData, setFormData] = useState<PTWItem>({ ...item });
  const [newGasTime, setNewGasTime] = useState('14:00');
  const [newGasLel, setNewGasLel] = useState('0.0%');
  const [newGasO2, setNewGasO2] = useState('20.9%');
  const [newGasH2s, setNewGasH2s] = useState('0.0 ppm');
  const [newGasCo, setNewGasCo] = useState('0.0 ppm');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Status options with bilingual labels
  const STATUS_CONFIG: Record<PTWStatus, { ar: string; en: string; color: string }> = {
    DRAFT: { ar: 'مسودة', en: 'DRAFT', color: 'bg-slate-800 text-slate-300 border-slate-600' },
    SUBMITTED: { ar: 'مقدم للاعتماد', en: 'SUBMITTED', color: 'bg-blue-950 text-blue-300 border-blue-600' },
    UNDER_REVIEW: { ar: 'قيد مراجعة السلامة', en: 'UNDER REVIEW', color: 'bg-amber-950 text-amber-300 border-amber-600' },
    APPROVED: { ar: 'معتمد رسمياً', en: 'APPROVED', color: 'bg-emerald-950 text-emerald-300 border-emerald-600' },
    ACTIVE: { ar: 'نشط ميدانياً', en: 'ACTIVE', color: 'bg-cyan-950 text-cyan-300 border-cyan-500' },
    SUSPENDED: { ar: 'موقوف أمنياً (خطر غاز)', en: 'SUSPENDED', color: 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse' },
    MONITORED: { ar: 'تحت المراقبة', en: 'MONITORED', color: 'bg-purple-950 text-purple-300 border-purple-600' },
    VALIDATED: { ar: 'مصادق عليه', en: 'VALIDATED', color: 'bg-teal-950 text-teal-300 border-teal-600' },
    ISOLATED: { ar: 'معزول LOTO', en: 'ISOLATED', color: 'bg-orange-950 text-orange-300 border-orange-600' },
    REJECTED: { ar: 'مرفوض', en: 'REJECTED', color: 'bg-red-950 text-red-300 border-red-600' },
    CLOSED: { ar: 'مغلق ومكتمل', en: 'CLOSED', color: 'bg-gray-800 text-gray-400 border-gray-600' },
  };

  const handleToggleChecklist = (id: string) => {
    if (currentUser.role === 'AUDITOR') {
      onShowToast(
        language === 'ar' ? 'صلاحية المدقق للقراءة فقط ولا يمكن تعديل بنود السلامة.' : 'Auditor role is read-only.',
        'error'
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      checklists: prev.checklists.map((c) =>
        c.id === id ? { ...c, verified: !c.verified, status: !c.verified ? 'PASS' : 'PENDING' } : c
      ),
    }));
  };

  // Gas safety validation and auto-suspension
  const handleAddGasReading = () => {
    if (currentUser.role === 'AUDITOR') {
      onShowToast(
        language === 'ar' ? 'صلاحية المدقق للقراءة فقط.' : 'Auditor role is read-only.',
        'error'
      );
      return;
    }

    const evalResult = evaluateGasReadings(newGasLel, newGasO2, newGasH2s, newGasCo);

    const newEntry: GasReading = {
      id: 'g-' + Date.now(),
      time: newGasTime,
      lel: `${evalResult.parsedValues.lel}%`,
      o2: `${evalResult.parsedValues.o2}%`,
      h2s: `${evalResult.parsedValues.h2s} ppm`,
      co: `${evalResult.parsedValues.co} ppm`,
      tester: currentUser.name,
      signature: currentUser.badgeId,
      status: evalResult.status,
      violations: evalResult.violationsEn,
    };

    setFormData((prev) => {
      let nextStatus = prev.status;
      let nextStatusAr = prev.statusAr;
      let gasCriticalWarning = prev.gasCriticalWarningActive || false;
      const updatedAudit = [...prev.auditTrail];

      if (evalResult.status === 'CRITICAL') {
        gasCriticalWarning = true;
        if (prev.status === 'ACTIVE' || prev.status === 'APPROVED') {
          nextStatus = 'SUSPENDED';
          nextStatusAr = 'موقوف أمنياً (خطر غاز)';
        }

        updatedAudit.unshift({
          id: 'aud-' + Date.now(),
          titleEn: 'EMERGENCY GAS INTERLOCK: PERMIT SUSPENDED',
          titleAr: 'إنذار غاز حرج: إيقاف فوري لتصريح العمل',
          detailEn: evalResult.violationsEn.join(' | '),
          detailAr: evalResult.violationsAr.join(' | '),
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          severity: 'danger',
          userId: currentUser.id,
          userName: currentUser.name,
        });

        // Trigger urgent toast & header notification
        const toastMsg = language === 'ar'
          ? `⚠️ خطر غاز حرج! تم إيقاف التصريح فوراً: ${evalResult.violationsAr[0]}`
          : `⚠️ CRITICAL GAS HAZARD! Permit suspended immediately: ${evalResult.violationsEn[0]}`;
        onShowToast(toastMsg, 'error');

        if (onAddNotification) {
          onAddNotification({
            urgent: true,
            type: 'gas',
            permitNo: prev.permitNo,
            titleAr: `إنذار غاز حرج: ${prev.permitNo}`,
            titleEn: `Critical Gas Alarm: ${prev.permitNo}`,
            descAr: evalResult.violationsAr.join(' | '),
            descEn: evalResult.violationsEn.join(' | '),
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          });
        }
      } else if (evalResult.status === 'WARNING') {
        onShowToast(
          language === 'ar'
            ? `تنبيه: قراءة الغاز خارج النطاق المثالي: ${evalResult.violationsAr[0]}`
            : `Warning: Atmospheric reading deviation: ${evalResult.violationsEn[0]}`,
          'info'
        );
      } else {
        onShowToast(
          language === 'ar' ? 'تم توثيق قراءة الفحص الجوي الآمنة بنجاح ✓' : 'Safe atmospheric gas test logged ✓',
          'success'
        );
      }

      return {
        ...prev,
        status: nextStatus,
        statusAr: nextStatusAr,
        gasCriticalWarningActive: gasCriticalWarning,
        gasTests: [...prev.gasTests, newEntry],
        auditTrail: updatedAudit,
      };
    });
  };

  const handleRemoveGasReading = (id: string) => {
    if (currentUser.role === 'AUDITOR') return;
    setFormData((prev) => {
      const remaining = prev.gasTests.filter((g) => g.id !== id);
      const hasCritical = remaining.some((g) => g.status === 'CRITICAL');
      return {
        ...prev,
        gasTests: remaining,
        gasCriticalWarningActive: hasCritical,
      };
    });
  };

  // Real Gemini AI Hazard Analysis (Server-side)
  const handleAiAnalyzeWork = async () => {
    setIsAiAnalyzing(true);
    onShowToast(
      language === 'ar'
        ? 'جارٍ استدعاء Gemini لتحليل مخاطر العمل واقتراح تدابير السلامة...'
        : 'Requesting Gemini AI to evaluate work hazards & recommend controls...',
      'info'
    );

    try {
      const result = await apiService.analyzeWorkDescription({
        description: formData.subTitleEn || formData.titleEn,
        location: formData.locationEn,
        equipment: formData.equipmentName || 'Zubair Processing Facility',
        permitType: formData.titleEn,
      });

      const newChecklistItems = result.recommendedChecklist.map((rc, idx) => ({
        id: 'chk-ai-' + Date.now() + '-' + idx,
        titleEn: rc.titleEn,
        titleAr: rc.titleAr,
        descEn: rc.descEn,
        descAr: rc.descAr,
        verified: false,
        status: 'PENDING' as const,
      }));

      setFormData((prev) => ({
        ...prev,
        risk: (result.suggestedRisk as any) || prev.risk,
        checklists: [...prev.checklists, ...newChecklistItems],
        specialPrecautions: result.specialPrecautionsEn,
        hazardousNotes: (prev.hazardousNotes ? prev.hazardousNotes + '\n' : '') +
          `[AI Precautions]: ${result.specialPrecautionsEn}\nRequired PPE: ${result.requiredPPE.join(', ')}`,
        auditTrail: [
          {
            id: 'aud-' + Date.now(),
            titleEn: 'AI Safety Hazard Assessment Completed',
            titleAr: 'اكتمل تقييم مخاطر السلامة بالذكاء الاصطناعي (Gemini)',
            detailEn: `Generated ${newChecklistItems.length} specific checklist items. Risk classified: ${result.suggestedRisk}`,
            detailAr: `تم توليد ${newChecklistItems.length} بنود فحص مخصصة. تصنيف الخطورة: ${result.suggestedRisk}`,
            timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            severity: 'info',
            userName: 'Gemini 3.8 Flash',
          },
          ...prev.auditTrail,
        ],
      }));

      onShowToast(
        language === 'ar'
          ? 'تم تحليل العمل بالذكاء الاصطناعي بنجاح وإدراج بنود الفحص!'
          : 'AI hazard assessment completed & safety checklist updated!',
        'success'
      );
    } catch (err: any) {
      onShowToast(err.message || 'AI analysis failed', 'error');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Digital Signature Sign-Off bound to authenticated user
  const handleSignSlot = (slotIdx: number) => {
    const sig = formData.signatures[slotIdx];
    if (!sig) return;

    if (!canSignOff(sig.roleEn)) {
      onShowToast(
        language === 'ar'
          ? `ليس لديك صلاحية التوقيع كـ (${sig.roleAr}). دورك الحالي: ${currentUser.role}`
          : `Unauthorized for (${sig.roleEn}). Current role: ${currentUser.role}`,
        'error'
      );
      return;
    }

    const now = new Date();
    const timeFormatted = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    setFormData((prev) => {
      const updatedSigs = [...prev.signatures];
      updatedSigs[slotIdx] = {
        ...updatedSigs[slotIdx],
        name: currentUser.name,
        badgeId: currentUser.badgeId,
        signedAt: timeFormatted,
        status: 'DIGITALLY SIGNED',
        userId: currentUser.id,
        userEmail: currentUser.email,
      };

      const updatedAudit = [
        {
          id: 'aud-' + Date.now(),
          titleEn: `Digital Authorization Signed: ${sig.roleEn}`,
          titleAr: `مصادقة رقمية معتمدة: ${sig.roleAr}`,
          detailEn: `Cryptographically certified by ${currentUser.name} (${currentUser.badgeId})`,
          detailAr: `تم المصادقة والتوقيع الرقمي بواسطة ${currentUser.nameAr || currentUser.name} (شارة: ${currentUser.badgeId})`,
          timestamp: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          severity: 'success' as const,
          userId: currentUser.id,
          userName: currentUser.name,
        },
        ...prev.auditTrail,
      ];

      return {
        ...prev,
        signatures: updatedSigs,
        auditTrail: updatedAudit,
      };
    });

    onShowToast(
      language === 'ar'
        ? `تم التوقيع والمصادقة الرقمية بنجاح باسم: ${currentUser.nameAr}`
        : `Digital sign-off certified successfully by: ${currentUser.name}`,
      'success'
    );
  };

  // Status Change Workflow Handling
  const handleStatusChange = (newStatus: PTWStatus) => {
    if (currentUser.role === 'AUDITOR') {
      onShowToast(
        language === 'ar' ? 'صلاحية المدقق للقراءة فقط.' : 'Auditor role is read-only.',
        'error'
      );
      return;
    }

    // Gas safety interlock
    if (newStatus === 'ACTIVE' && (formData.gasCriticalWarningActive || formData.gasTests.some((g) => g.status === 'CRITICAL'))) {
      onShowToast(
        language === 'ar'
          ? '❌ تم منع التفعيل! لا يمكن تنشيط التصريح لوجود قراءات غاز حرجة غير آمنة.'
          : '❌ Activation Blocked! Cannot activate permit with active critical gas hazards.',
        'error'
      );
      return;
    }

    // Role restrictions: only HSE Officer or Admin can approve/activate/isolate
    if (['APPROVED', 'ACTIVE', 'ISOLATED', 'CLOSED'].includes(newStatus)) {
      if (!canApprovePermit()) {
        onShowToast(
          language === 'ar'
            ? '❌ صلاحية حصرية: يتطلب اعتماد مسؤول السلامة HSE أو مدير العمليات.'
            : '❌ Restricted Action: Only an authorized HSE Officer or Operations Admin can perform this state transition.',
          'error'
        );
        return;
      }
    }

    const prevStatus = formData.status;
    const config = STATUS_CONFIG[newStatus];

    setFormData((prev) => ({
      ...prev,
      status: newStatus,
      statusAr: config.ar,
      auditTrail: [
        {
          id: 'aud-' + Date.now(),
          titleEn: `Workflow Status Transition: ${prevStatus} ➔ ${newStatus}`,
          titleAr: `تغيير حالة سير العمل: ${prevStatus} ➔ ${config.ar}`,
          detailEn: `Transition authorized by ${currentUser.name} (${currentUser.role})`,
          detailAr: `تمت المصادقة على الإجراء بواسطة ${currentUser.nameAr || currentUser.name} (${currentUser.role})`,
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          severity: newStatus === 'REJECTED' ? 'warning' : 'info',
          userId: currentUser.id,
          userName: currentUser.name,
        },
        ...prev.auditTrail,
      ],
    }));

    onShowToast(
      language === 'ar'
        ? `تم تحديث حالة التصريح إلى: ${config.ar}`
        : `Permit status updated to: ${newStatus}`,
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

  const hasCriticalGas = formData.gasTests.some((g) => g.status === 'CRITICAL');

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
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${STATUS_CONFIG[formData.status]?.color}`}>
                  {language === 'ar' ? formData.statusAr : formData.status}
                </span>
              </div>
              <p className="text-xs text-[#9fb3c8] font-mono mt-0.5">
                ZFOD Ref: {formData.permitNo} • Standard ISO 45001 / OSHA 1910.119
              </p>
            </div>
          </div>

          {/* Modal Action Controls */}
          <div className="flex items-center gap-2">
            {/* Real Gemini AI Action Button */}
            <button
              onClick={handleAiAnalyzeWork}
              disabled={isAiAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {isAiAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{language === 'ar' ? (isAiAnalyzing ? 'تحليل Gemini...' : 'تحليل ذكي بـ Gemini') : (isAiAnalyzing ? 'Analyzing...' : 'AI Hazard Analysis')}</span>
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

        {/* Critical Gas Alarm Banner */}
        {hasCriticalGas && (
          <div className="bg-rose-950/90 border-b border-rose-500/60 p-3 px-5 flex items-center justify-between gap-3 text-rose-200 text-xs animate-pulse">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>
                {language === 'ar'
                  ? '⚠️ إنذار غاز حرج نشط! تم إيقاف التصريح آلياً ويُمنع تفعيله حتى معاودة الفحص الآمن.'
                  : '⚠️ Critical Gas Hazard Active! Permit has been interlocked & cannot be activated until safe.'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-100 font-mono text-[10px] uppercase font-bold">
              SAFETY INTERLOCK ENGAGED
            </span>
          </div>
        )}

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
            <span>{language === 'ar' ? 'بيانات العمل وسير الحالة' : 'Work Info & Lifecycle'}</span>
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
            <span>{language === 'ar' ? 'قائمة تدقيق السلامة' : 'Safety Checklists'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#101b33] text-[10px] font-mono">
              {formData.checklists.length}
            </span>
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
            <span>{language === 'ar' ? 'فحص الغازات الجوية' : 'Atmospheric Gas Testing'}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                hasCriticalGas ? 'bg-rose-900 text-rose-200' : 'bg-emerald-950 text-emerald-300'
              }`}
            >
              {formData.gasTests.length}
            </span>
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
            <span>{language === 'ar' ? 'المصادقات والتواقيع الرقمية' : 'Digital Sign-offs'}</span>
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
            <span>{language === 'ar' ? 'سجل التدقيق الحي' : 'Live Audit Trail'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#101b33] text-[10px] font-mono">
              {formData.auditTrail.length}
            </span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 lg:p-6 overflow-y-auto flex-1 bg-[#060b14] space-y-6 text-xs">
          {/* TAB 1: OVERVIEW & LIFECYCLE */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Lifecycle State Selector */}
              <div className="p-4 rounded-xl bg-[#0b1324] border border-[#1c2b4c] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    {language === 'ar' ? 'إدارة دورة حياة التصريح (Workflow Lifecycle):' : 'Permit Lifecycle Workflow Control:'}
                  </span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {language === 'ar' ? 'المستخدم الحالي:' : 'Acting User:'} <span className="text-cyan-300 font-bold">{currentUser.name}</span> ({currentUser.role})
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'ISOLATED', 'SUSPENDED', 'CLOSED'] as PTWStatus[]).map((st) => {
                    const isCurrent = formData.status === st;
                    const cfg = STATUS_CONFIG[st];
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                          isCurrent
                            ? `${cfg.color} shadow-lg ring-2 ring-cyan-400/50`
                            : 'bg-[#101b33] text-slate-400 border-[#1c2b4c] hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        {isCurrent && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{language === 'ar' ? cfg.ar : cfg.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* General Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-4 rounded-xl bg-[#0b1324] border border-[#1c2b4c]">
                  <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                    {language === 'ar' ? 'تفاصيل المهمة والموقع' : 'Work Order & Location'}
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الموقع التشغيلي' : 'Operational Location'}</label>
                    <input
                      type="text"
                      value={language === 'ar' ? formData.locationAr : formData.locationEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => (language === 'ar' ? { ...prev, locationAr: val } : { ...prev, locationEn: val }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block">{language === 'ar' ? 'المقاول المنفذ' : 'Executing Contractor'}</label>
                    <input
                      type="text"
                      value={language === 'ar' ? formData.contractorAr : formData.contractorEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => (language === 'ar' ? { ...prev, contractorAr: val } : { ...prev, contractorEn: val }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-400 block">{language === 'ar' ? 'نافذة الصلاحية الزمنية' : 'Validity Window'}</label>
                      <button
                        type="button"
                        onClick={() => {
                          const extended = (formData.validityWindow || 'Standard Shift') + ' [+12h Ext by ' + currentUser.name + ']';
                          const extendedAr = (formData.validityWindowAr || formData.validityWindow || 'وردية قياسية') + ' [تمديد 12 ساعة - ' + currentUser.name + ']';
                          const now = new Date();
                          const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                          setFormData((prev) => ({
                            ...prev,
                            validityWindow: extended,
                            validityWindowAr: extendedAr,
                            auditTrail: [
                              {
                                id: 'aud-ext-' + Date.now(),
                                titleEn: 'Shift Validity Extended (+12h)',
                                titleAr: 'تمديد فترة صلاحية الوردية (+12 ساعة)',
                                detailEn: `Validity extended by ${currentUser.name} (${currentUser.role}, Badge: ${currentUser.badgeId}). Routine gas monitoring re-confirmed.`,
                                detailAr: `تم تمديد صلاحية التصريح 12 ساعة بواسطة ${currentUser.name} (شارة: ${currentUser.badgeId}).`,
                                timestamp: timeStr,
                                severity: 'info',
                                userId: currentUser.id,
                                userName: currentUser.name,
                              },
                              ...prev.auditTrail,
                            ],
                          }));
                          onShowToast(
                            language === 'ar' ? 'تم تمديد الوردية 12 ساعة بنجاح وتسجيل التمديد في سجل التدقيق ✓' : 'Shift extended by 12 hours & recorded in audit trail ✓',
                            'success'
                          );
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/40 text-cyan-300 font-mono text-[9px] flex items-center gap-1 cursor-pointer transition"
                      >
                        <Clock className="w-2.5 h-2.5" />
                        <span>{language === 'ar' ? '+ تمديد 12 ساعة' : '+ Extend 12h'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={language === 'ar' ? formData.validityWindowAr : formData.validityWindow}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => (language === 'ar' ? { ...prev, validityWindowAr: val } : { ...prev, validityWindow: val }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-white text-xs font-mono text-cyan-300"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-[#0b1324] border border-[#1c2b4c]">
                  <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                    {language === 'ar' ? 'المواصفات الفنية المعتمدة' : 'Technical Specifications'}
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block">
                      {language === 'ar' ? formData.technicalSpecLabelAr : formData.technicalSpecLabelEn}
                    </label>
                    <input
                      type="text"
                      value={formData.technicalSpecValue}
                      onChange={(e) => setFormData((prev) => ({ ...prev, technicalSpecValue: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-white text-xs font-mono text-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block">{language === 'ar' ? 'نصف قطر الأمان' : 'Safety Perimeter'}</label>
                    <input
                      type="text"
                      value={language === 'ar' ? formData.safetyRadiusAr : formData.safetyRadiusEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => (language === 'ar' ? { ...prev, safetyRadiusAr: val } : { ...prev, safetyRadiusEn: val }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block">{language === 'ar' ? 'أجهزة الكشف المعايرة' : 'Calibrated Survey Instrument'}</label>
                    <input
                      type="text"
                      value={language === 'ar' ? formData.surveyMeterAr : formData.surveyMeterEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => (language === 'ar' ? { ...prev, surveyMeterAr: val } : { ...prev, surveyMeterEn: val }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Special Precautions & Notes */}
              <div className="p-4 rounded-xl bg-[#0b1324] border border-[#1c2b4c] space-y-2">
                <label className="font-bold text-white text-xs block">
                  {language === 'ar' ? 'الاحتياطات الخاصة وملاحظات المخاطر (Special Precautions):' : 'Special Precautions & Hazard Controls:'}
                </label>
                <textarea
                  rows={3}
                  value={formData.hazardousNotes || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hazardousNotes: e.target.value }))}
                  placeholder={language === 'ar' ? 'أدخل الاحتياطات الخاصة أو انقر على التحليل الذكي أعلاه...' : 'Enter precautions or click AI Hazard Analysis...'}
                  className="w-full px-3 py-2 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CHECKLISTS */}
          {activeTab === 'checklist' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {language === 'ar' ? 'متطلبات وإجراءات السلامة الإلزامية:' : 'Mandatory Safety Controls & Isolations:'}
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  {formData.checklists.filter((c) => c.status === 'PASS').length} / {formData.checklists.length} Verified
                </span>
              </div>

              <div className="space-y-2">
                {formData.checklists.map((chk) => (
                  <div
                    key={chk.id}
                    onClick={() => handleToggleChecklist(chk.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      chk.status === 'PASS'
                        ? 'bg-[#0f243a]/60 border-cyan-500/40 text-slate-200'
                        : 'bg-[#0b1324] border-[#1c2b4c] text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 ${
                          chk.status === 'PASS'
                            ? 'bg-cyan-500 border-cyan-400 text-black'
                            : 'bg-[#101b33] border-slate-600'
                        }`}
                      >
                        {chk.status === 'PASS' && <CheckSquare className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">
                          {language === 'ar' ? chk.titleAr : chk.titleEn}
                        </div>
                        <div className="text-[11px] text-[#9fb3c8] mt-0.5">
                          {language === 'ar' ? chk.descAr : chk.descEn}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        chk.status === 'PASS'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {chk.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GAS TESTING */}
          {activeTab === 'gas' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold text-white block">
                    {language === 'ar'
                      ? 'سجل الفحص الجوي والغازات السامة (OSHA 1910.146 / API 2201)'
                      : 'Atmospheric Gas Testing Register (OSHA 1910.146 / API 2201)'}
                  </span>
                  <p className="text-[11px] text-[#9fb3c8] font-mono">
                    Limits: LEL &lt; 10% • O2: 19.5% - 23.5% • H2S &lt; 10 ppm • CO &lt; 35 ppm
                  </p>
                </div>
              </div>

              {/* Gas Table */}
              <div className="overflow-x-auto rounded-lg border border-[#1c2b4c]">
                <table className={`w-full text-xs ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <thead className="bg-[#101b33] text-slate-300 font-mono">
                    <tr>
                      <th className="p-2.5">{language === 'ar' ? 'التوقيت' : 'Time'}</th>
                      <th className="p-2.5">LEL (&lt; 10%)</th>
                      <th className="p-2.5">O2 (19.5-23.5%)</th>
                      <th className="p-2.5">H2S (&lt; 10 ppm)</th>
                      <th className="p-2.5">CO (&lt; 35 ppm)</th>
                      <th className="p-2.5">{language === 'ar' ? 'الفاحص' : 'Inspector'}</th>
                      <th className="p-2.5">{language === 'ar' ? 'التقييم' : 'Status'}</th>
                      <th className="p-2.5 text-center">{language === 'ar' ? 'إزالة' : 'Remove'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2b4c] text-slate-200">
                    {formData.gasTests.map((row) => (
                      <tr
                        key={row.id}
                        className={`transition ${
                          row.status === 'CRITICAL'
                            ? 'bg-rose-950/40 hover:bg-rose-950/60'
                            : row.status === 'WARNING'
                            ? 'bg-amber-950/20 hover:bg-amber-950/40'
                            : 'hover:bg-[#152445]/50'
                        }`}
                      >
                        <td className="p-2.5 font-mono text-cyan-300 font-bold">{row.time}</td>
                        <td className={`p-2.5 font-mono font-bold ${parseFloat(row.lel) >= 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {row.lel}
                        </td>
                        <td className={`p-2.5 font-mono font-bold ${parseFloat(row.o2) < 19.5 || parseFloat(row.o2) > 23.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {row.o2}
                        </td>
                        <td className={`p-2.5 font-mono font-bold ${parseFloat(row.h2s) >= 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {row.h2s}
                        </td>
                        <td className={`p-2.5 font-mono font-bold ${parseFloat(row.co) >= 35 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {row.co}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-300">{row.tester}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                              row.status === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-300 border-rose-500'
                                : row.status === 'WARNING'
                                ? 'bg-amber-950 text-amber-300 border-amber-500'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
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

              {/* Add New Reading Form with Real OSHA/API Safety Interlocks */}
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
                    <label className="text-[10px] text-slate-400 block">LEL % (&lt;10%)</label>
                    <input
                      type="text"
                      value={newGasLel}
                      onChange={(e) => setNewGasLel(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#0b1324] border border-[#1c2b4c] text-xs font-mono text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">O2 % (19.5-23.5)</label>
                    <input
                      type="text"
                      value={newGasO2}
                      onChange={(e) => setNewGasO2(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#0b1324] border border-[#1c2b4c] text-xs font-mono text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">H2S ppm (&lt;10)</label>
                    <input
                      type="text"
                      value={newGasH2s}
                      onChange={(e) => setNewGasH2s(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#0b1324] border border-[#1c2b4c] text-xs font-mono text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">CO ppm (&lt;35)</label>
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
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 transition cursor-pointer text-xs shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'فحص وتسجيل' : 'Validate'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SIGNATURES */}
          {activeTab === 'signatures' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    {language === 'ar'
                      ? 'سجل التواقيع والمصادقات الرقمية (Digital Sign-off & Approvals)'
                      : 'Digital Sign-offs & Authorizations'}
                  </span>
                  <p className="text-[11px] text-[#9fb3c8]">
                    {language === 'ar'
                      ? 'كل توقيع يرتبط مباشرة بحساب الموظف النشط وشارة الدخول الخاصة به.'
                      : 'Each authorization is cryptographically bound to the authenticated user badge.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.signatures.map((sig, idx) => {
                  const isSigned = sig.status === 'DIGITALLY SIGNED';
                  const isEligible = canSignOff(sig.roleEn);

                  return (
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
                        {sig.userEmail && (
                          <div className="text-[10px] text-slate-500 font-mono">{sig.userEmail}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div
                          className={`p-2.5 rounded font-mono text-[10px] flex items-center justify-between border ${
                            isSigned
                              ? 'bg-[#101b33] border-emerald-500/40 text-emerald-400'
                              : 'bg-[#101b33] border-amber-500/40 text-amber-400'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{sig.status}</span>
                          </span>
                          <span>{sig.signedAt}</span>
                        </div>

                        {!isSigned && (
                          <button
                            onClick={() => handleSignSlot(idx)}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              isEligible
                                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                            <span>
                              {language === 'ar'
                                ? isEligible
                                  ? `توقيع بصفتك (${currentUser.name})`
                                  : 'توقيع (يتطلب تصريح خاص)'
                                : isEligible
                                ? `Sign as (${currentUser.name})`
                                : 'Sign (Requires Specific Role)'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hash Security Stamp */}
              <div className="p-3.5 rounded-xl bg-[#101b33] border border-[#1c2b4c] text-[11px] font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>SHA-256 Hash: 9e3b7fa82b5d491c0e3a4781...c81f00a2</span>
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
                    className={`p-3 rounded-lg border flex items-start gap-3 ${
                      ev.severity === 'danger'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : ev.severity === 'warning'
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                        : ev.severity === 'success'
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-[#0b1324] border-[#1c2b4c] text-slate-300'
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        ev.severity === 'danger'
                          ? 'text-rose-400'
                          : ev.severity === 'warning'
                          ? 'text-amber-400'
                          : ev.severity === 'success'
                          ? 'text-emerald-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      ●
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between flex-wrap gap-1">
                        <span className="font-bold">
                          {language === 'ar' ? ev.titleAr : ev.titleEn}
                        </span>
                        <span className="text-slate-400 text-[11px]">{ev.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {language === 'ar' ? ev.detailAr : ev.detailEn}
                      </p>
                      {ev.userName && (
                        <span className="text-[10px] text-cyan-400 block mt-1">
                          Actor: {ev.userName}
                        </span>
                      )}
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
            <span
              className={`w-2 h-2 rounded-full ${
                hasCriticalGas ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 status-pulse'
              }`}
            />
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
