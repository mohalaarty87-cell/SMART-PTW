import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Flame,
  Snowflake,
  Radiation,
  Lock,
  Pickaxe,
  Box,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Language, PTWItem, RiskLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

interface CreatePermitModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newPermit: PTWItem) => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

const CATEGORIES = [
  {
    type: 'HOT_WORK',
    prefix: 'HW',
    icon: Flame,
    color: 'border-rose-500/40 text-rose-400 bg-rose-950/30',
    titleAr: 'تصريح عمل حار (لحام / قطع / شرر)',
    titleEn: 'HOT WORK PERMIT (Class A)',
    defaultRisk: 'HIGH RISK (CLASS A)' as RiskLevel,
  },
  {
    type: 'COLD_WORK',
    prefix: 'CW',
    icon: Snowflake,
    color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
    titleAr: 'تصريح عمل بارد (صيانة ميكانيكية)',
    titleEn: 'COLD WORK PERMIT (General)',
    defaultRisk: 'MEDIUM RISK' as RiskLevel,
  },
  {
    type: 'RADIOGRAPHY',
    prefix: 'RAD',
    icon: Radiation,
    color: 'border-purple-500/40 text-purple-400 bg-purple-950/30',
    titleAr: 'تصريح تصوير إشعاعي (فحص NDT)',
    titleEn: 'RADIOGRAPHY TESTING PERMIT (Ir-192)',
    defaultRisk: 'CRITICAL RISK' as RiskLevel,
  },
  {
    type: 'CONFINED_SPACE',
    prefix: 'CSE',
    icon: Box,
    color: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
    titleAr: 'تصريح دخول الحيز المغلق',
    titleEn: 'CONFINED SPACE ENTRY CERTIFICATE',
    defaultRisk: 'CRITICAL RISK' as RiskLevel,
  },
  {
    type: 'LOTO_ISOLATION',
    prefix: 'LOTO',
    icon: Lock,
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
    titleAr: 'عزل وتأريض كهربائي وميكانيكي LOTO',
    titleEn: 'ELECTRICAL & MECHANICAL LOTO ISOLATION',
    defaultRisk: 'CRITICAL (3.3 kV)' as RiskLevel,
  },
  {
    type: 'EXCAVATION',
    prefix: 'EXC',
    icon: Pickaxe,
    color: 'border-amber-600/40 text-amber-300 bg-amber-950/20',
    titleAr: 'تصريح حفر وتنقيب أرضي',
    titleEn: 'EXCAVATION & GROUND DISTURBANCE',
    defaultRisk: 'HIGH RISK' as RiskLevel,
  },
];

const ZUBAIR_LOCATIONS = [
  { ar: 'محطة عزل الغاز المشرف ZUB-DS1', en: 'Mishrif Degassing Station 1 (ZUB-DS1)' },
  { ar: 'محطة عزل الغاز المشرف ZUB-DS2', en: 'Mishrif Degassing Station 2 (ZUB-DS2)' },
  { ar: 'محطة حمار مشراق للإنتاج والتجميع', en: 'Hammar Mishraq Production Facility' },
  { ar: 'مستودع وخزانات جنوب الزبير النفطية', en: 'South Zubair Tank Farm & Manifold' },
  { ar: 'مجمع الآبار الشمالي عنقود 14', en: 'Northern Wellpad Cluster 14' },
  { ar: 'محطة كبس الغاز عالي الضغط HP Gas Hub', en: 'High Pressure Gas Compression Hub' },
];

const CONTRACTORS = [
  { ar: 'شركة إيني العراق (Eni Iraq B.V.)', en: 'Eni Iraq B.V. Operations' },
  { ar: 'شلمبرجير العالمية للخدمات النفطية (SLB)', en: 'Schlumberger (SLB Oilfield)' },
  { ar: 'شركة ويذرفورد لخدمات الآبار', en: 'Weatherford Middle East' },
  { ar: 'بتروفاك للمقاولات الهندسية (Petrofac)', en: 'Petrofac Facilities Management' },
  { ar: 'شركة المشاريع النفطية (SCOP)', en: 'State Company for Oil Projects (SCOP)' },
  { ar: 'كوادر الصيانة الداخلية — شركة نفط البصرة', en: 'BOC In-House Maintenance Operations' },
];

export const CreatePermitModal: React.FC<CreatePermitModalProps> = ({
  language,
  isOpen,
  onClose,
  onCreated,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [locationIndex, setLocationIndex] = useState(0);
  const [contractorIndex, setContractorIndex] = useState(0);
  const [equipmentTag, setEquipmentTag] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(CATEGORIES[0].defaultRisk);
  const [validityShift, setValidityShift] = useState('Today 06:00 - 18:00 (Day Shift)');
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);

  // Generated checklist and precautions
  const [checklist, setChecklist] = useState<
    Array<{ id: string; titleEn: string; titleAr: string; descEn: string; descAr: string; verified: boolean; status: 'PASS' | 'PENDING' | 'FAIL' }>
  >([
    {
      id: 'chk-init-1',
      titleEn: 'Job Safety Analysis (JSA) Reviewed with Work Crew',
      titleAr: 'مراجعة تحليل مخاطر العمل JSA مع كافة أفراد طاقم التنفيذ',
      descEn: 'Toolbox talk completed, hazards identified, muster points communicated.',
      descAr: 'تنفيذ محادثة السلامة اليومية وتحديد نقاط التجمع ومخاطر العمل.',
      verified: true,
      status: 'PASS',
    },
    {
      id: 'chk-init-2',
      titleEn: 'Atmospheric Multi-Gas Testing Completed & Safe',
      titleAr: 'إجراء فحص الغازات الجوية المتعددة والتأكد من أمان الموقع',
      descEn: 'LEL 0.0%, Oxygen 20.9%, H2S 0.0 ppm, CO 0.0 ppm verified prior to entry.',
      descAr: 'التحقق من خلو الموقع من الغازات الهيدروكربونية وكبريتيد الهيدروجين.',
      verified: false,
      status: 'PENDING',
    },
  ]);

  const [specialPrecautionsEn, setSpecialPrecautionsEn] = useState(
    'Continuous atmospheric monitoring required. Fire extinguisher 50kg dry powder standby.'
  );
  const [specialPrecautionsAr, setSpecialPrecautionsAr] = useState(
    'مراقبة مستمرة للغازات الجوية وتعيين مراقب حريق مع عربة إطفاء بودرة جافة 50 كغم.'
  );
  const [requiredPPE, setRequiredPPE] = useState<string[]>([
    'Nomex FR Coverall (NFPA 2112)',
    'H2S Personal Escape Hood (15-min)',
    'Steel Toe Safety Boots',
    'Hard Hat & Safety Glasses',
  ]);

  const handleCategorySelect = (cat: (typeof CATEGORIES)[0]) => {
    setSelectedCategory(cat);
    setRiskLevel(cat.defaultRisk);
  };

  // AI Generation with Gemini
  const handleAiAutoFill = async () => {
    if (!workDescription.trim()) {
      onShowToast(
        language === 'ar'
          ? 'يرجى كتابة وصف موجز لطبيعة العمل أولاً ليقوم الذكاء الاصطناعي بتقييمه.'
          : 'Please enter a brief work description first for AI evaluation.',
        'error'
      );
      return;
    }

    setIsAiEvaluating(true);
    onShowToast(
      language === 'ar'
        ? 'جارٍ استدعاء Gemini لتقييم المخاطر واقتراح بنود الفحص ومعدات السلامة...'
        : 'Requesting Gemini AI to evaluate hazards and generate safety checklist...',
      'info'
    );

    try {
      const loc = ZUBAIR_LOCATIONS[locationIndex];
      const result = await apiService.analyzeWorkDescription({
        description: workDescription,
        location: loc.en,
        equipment: equipmentTag || 'Process Equipment Unit',
        permitType: selectedCategory.titleEn,
      });

      if (result.suggestedRisk) {
        setRiskLevel(result.suggestedRisk as RiskLevel);
      }
      if (result.specialPrecautionsEn) {
        setSpecialPrecautionsEn(result.specialPrecautionsEn);
      }
      if (result.specialPrecautionsAr) {
        setSpecialPrecautionsAr(result.specialPrecautionsAr);
      }
      if (Array.isArray(result.requiredPPE) && result.requiredPPE.length > 0) {
        setRequiredPPE(result.requiredPPE);
      }

      if (Array.isArray(result.recommendedChecklist) && result.recommendedChecklist.length > 0) {
        const newItems = result.recommendedChecklist.map((rc, idx) => ({
          id: 'chk-ai-new-' + Date.now() + '-' + idx,
          titleEn: rc.titleEn,
          titleAr: rc.titleAr,
          descEn: rc.descEn,
          descAr: rc.descAr,
          verified: false,
          status: 'PENDING' as const,
        }));
        setChecklist((prev) => [...prev, ...newItems]);
      }

      onShowToast(
        language === 'ar'
          ? 'تم توليد تقييم المخاطر واحتياطات السلامة بنجاح عبر Gemini 3.8 Flash ✓'
          : 'Safety hazards evaluated & checklist generated via Gemini 3.8 Flash ✓',
        'success'
      );
    } catch (err: any) {
      onShowToast(err.message || 'AI assessment failed', 'error');
    } finally {
      setIsAiEvaluating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workDescription.trim()) {
      onShowToast(
        language === 'ar' ? 'يرجى إدخال تفاصيل وطبيعة العمل المطلوب تنفيذه.' : 'Please enter the work scope description.',
        'error'
      );
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const permitNo = `${selectedCategory.prefix}-2026-${randomSuffix}`;
    const key = `permit-${Date.now()}`;
    const loc = ZUBAIR_LOCATIONS[locationIndex];
    const contractor = CONTRACTORS[contractorIndex];

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const newPermit: PTWItem = {
      id: key,
      key,
      isMainPermit: true,
      permitNo,
      icon: selectedCategory.prefix === 'HW' ? '🔥' : selectedCategory.prefix === 'CW' ? '❄️' : selectedCategory.prefix === 'RAD' ? '☢️' : '🔒',
      risk: riskLevel,
      riskBadgeClass: riskLevel.includes('CRITICAL')
        ? 'bg-rose-950 text-rose-300 border border-rose-600'
        : 'bg-amber-950 text-amber-300 border border-amber-600',
      titleAr: selectedCategory.titleAr,
      titleEn: selectedCategory.titleEn,
      subTitleAr: workDescription,
      subTitleEn: workDescription,
      status: 'SUBMITTED',
      statusAr: 'مقدم للاعتماد',
      locationAr: loc.ar,
      locationEn: loc.en,
      contractorAr: contractor.ar,
      contractorEn: contractor.en,
      validityWindow: validityShift,
      validityWindowAr: validityShift,
      attachedCerts: ['LOTO Process Isolation Cert', 'Atmospheric Gas Testing Record'],
      technicalSpecLabelEn: 'Equipment Tag / Line',
      technicalSpecLabelAr: 'رمز المعدة أو الخط',
      technicalSpecValue: equipmentTag || 'ZUB-PROC-UNIT',
      safetyRadiusEn: 'Radius 15m Clear Zone',
      safetyRadiusAr: 'نطاق عزل وأمان 15 متراً',
      surveyMeterEn: 'Multi-Gas Meter (Calibrated)',
      surveyMeterAr: 'جهاز فحص الغازات المعاير',
      progressPercent: 25,
      progressTextEn: 'Awaiting Area Authority Signature',
      progressTextAr: 'بانتظار توقيع مسؤول المنطقة',
      equipmentTag: equipmentTag || 'ZUB-AREA-TAG',
      equipmentName: equipmentTag ? `Equipment ${equipmentTag}` : 'Process Unit',
      gasCriticalWarningActive: false,
      gasTests: [
        {
          id: 'g-initial-' + Date.now(),
          time: timeString,
          lel: '0.0%',
          o2: '20.9%',
          h2s: '0.0 ppm',
          co: '0.0 ppm',
          tester: currentUser.name,
          signature: currentUser.badgeId,
          status: 'SAFE',
        },
      ],
      checklists: checklist,
      signatures: [
        {
          roleEn: 'Performing Authority (Contractor Lead)',
          roleAr: 'الجهة المنفذة (مسؤول مقاول العمل)',
          name: currentUser.name,
          badgeId: currentUser.badgeId,
          signedAt: now.toLocaleDateString('en-GB') + ' ' + timeString,
          status: 'DIGITALLY SIGNED',
          userId: currentUser.id,
          userEmail: currentUser.email,
        },
        {
          roleEn: 'Area Authority (ZFOD Operations Lead)',
          roleAr: 'مسؤول المنطقة التشغيلية (هيئة حقل الزبير)',
          name: 'Eng. Haider Salman',
          badgeId: 'ZFOD-OP-901',
          signedAt: 'Pending Review',
          status: 'PENDING',
        },
        {
          roleEn: 'HSE Safety Auditor & Gas Inspector',
          roleAr: 'مدقق السلامة الميدانية وفاحص الغازات',
          name: 'Ahmed Al-Kinani',
          badgeId: 'ZFOD-HSE-338',
          signedAt: 'Pending Review',
          status: 'PENDING',
        },
      ],
      auditTrail: [
        {
          id: 'aud-create-' + Date.now(),
          titleEn: `Permit Created & Submitted: ${permitNo}`,
          titleAr: `تم إنشاء وتقديم تصريح العمل: ${permitNo}`,
          detailEn: `Issued by ${currentUser.name} (${currentUser.role}, Badge: ${currentUser.badgeId}). Initial shift validity registered.`,
          detailAr: `صدر بواسطة ${currentUser.nameAr || currentUser.name} (شارة: ${currentUser.badgeId}). تم تسجيل وردية العمل.`,
          timestamp: timeString,
          severity: 'info',
          userId: currentUser.id,
          userName: currentUser.name,
        },
      ],
    };

    try {
      await apiService.savePermit(newPermit);
      onCreated(newPermit);
      onShowToast(
        language === 'ar'
          ? `تم إنشاء تصريح العمل الجديد بنجاح برقم: ${permitNo} ✓`
          : `New Permit created & registered successfully: ${permitNo} ✓`,
        'success'
      );
      onClose();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save new permit', 'error');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-2xl bg-[#0b1324] border border-[#1c2b4c] text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 bg-[#0e172e] border-b border-[#1c2b4c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'إصدار تصريح عمل جديد (New PTW)' : 'Issue New Work Permit (PTW)'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  ZFOD-HSE-OSHA
                </span>
              </h2>
              <p className="text-xs text-[#9fb3c8]">
                {language === 'ar'
                  ? 'هيئة تشغيل حقل الزبير • تسجيل واعتماد تصاريح السلامة الصناعية والبيئية'
                  : 'Zubair Field Operating Division • Field Work Authorization Register'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#152445] hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs">
          {/* 1. Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              {language === 'ar' ? '1. اختر نوع وتصنيف تصريح العمل:' : '1. Select Work Permit Category:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory.type === cat.type;
                return (
                  <button
                    type="button"
                    key={cat.type}
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-3 rounded-xl border text-right sm:text-start transition flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'border-[#1c2b4c] bg-[#0f1a30]/60 hover:bg-[#152445] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40">
                        {cat.prefix}
                      </span>
                    </div>
                    <span className="font-bold text-xs text-white">
                      {language === 'ar' ? cat.titleAr : cat.titleEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Facility Location & Contractor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'ar' ? 'الموقع التشغيلي بحقل الزبير:' : 'Operating Facility Location:'}</span>
              </label>
              <select
                value={locationIndex}
                onChange={(e) => setLocationIndex(Number(e.target.value))}
                className="w-full bg-[#080e1b] border border-[#1c2b4c] rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {ZUBAIR_LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={idx}>
                    {language === 'ar' ? loc.ar : loc.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'ar' ? 'الجهة المنفذة / المقاول المعتمد:' : 'Contractor / Performing Authority:'}</span>
              </label>
              <select
                value={contractorIndex}
                onChange={(e) => setContractorIndex(Number(e.target.value))}
                className="w-full bg-[#080e1b] border border-[#1c2b4c] rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {CONTRACTORS.map((c, idx) => (
                  <option key={idx} value={idx}>
                    {language === 'ar' ? c.ar : c.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Equipment Tag & Validity Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {language === 'ar' ? 'رمز المعدة أو الخط (Equipment Tag):' : 'Equipment / Piping Tag:'}
              </label>
              <input
                type="text"
                placeholder="e.g. Header-4 / Pump P-102A / Vessel V-401"
                value={equipmentTag}
                onChange={(e) => setEquipmentTag(e.target.value)}
                className="w-full bg-[#080e1b] border border-[#1c2b4c] rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'ar' ? 'فترة صلاحية الوردية (Validity Window):' : 'Shift Validity Window:'}</span>
              </label>
              <input
                type="text"
                value={validityShift}
                onChange={(e) => setValidityShift(e.target.value)}
                className="w-full bg-[#080e1b] border border-[#1c2b4c] rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* 4. Scope of Work with AI Assistant */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {language === 'ar' ? '2. تفاصيل وطبيعة العمل ومخاطره:' : '2. Work Description & Hazards:'}
              </label>

              {/* Real Gemini AI Evaluation Button */}
              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={isAiEvaluating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/60 to-cyan-900/60 hover:from-purple-800 hover:to-cyan-800 text-cyan-200 border border-cyan-500/40 font-semibold text-[11px] transition shadow cursor-pointer disabled:opacity-50"
              >
                {isAiEvaluating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>
                  {isAiEvaluating
                    ? language === 'ar'
                      ? 'جارٍ التحليل بـ Gemini...'
                      : 'Evaluating via Gemini...'
                    : language === 'ar'
                    ? 'تقييم المخاطر بـ Gemini AI ✨'
                    : 'Evaluate with Gemini AI ✨'}
                </span>
              </button>
            </div>

            <textarea
              rows={3}
              required
              placeholder={
                language === 'ar'
                  ? 'مثال: أعمال لحام وقطع ميكانيكي لتبديل صمام السحب لمضخة P-102A ضمن منطقة عزل الغاز المشرف، مع تفريغ وضغط خطوط الأنابيب...'
                  : 'Example: Hot cutting and replacement of inlet suction flange on pump P-102A at Mishrif DS1...'
              }
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              className="w-full bg-[#080e1b] border border-[#1c2b4c] rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* 5. Special Precautions & PPE generated */}
          <div className="p-3.5 rounded-xl bg-[#091122] border border-[#1c2b4c] space-y-2.5">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'معدات الوقاية والاحتياطات المقررة:' : 'Required PPE & Safety Precautions:'}</span>
            </span>

            <div className="flex flex-wrap gap-1.5">
              {requiredPPE.map((ppe, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 font-mono text-[10px]"
                >
                  ✓ {ppe}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <strong className="text-slate-300">
                {language === 'ar' ? 'الاحتياطات الميدانية:' : 'Precautions:'}
              </strong>{' '}
              {language === 'ar' ? specialPrecautionsAr : specialPrecautionsEn}
            </p>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#1c2b4c] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#152445] hover:bg-[#1c305c] text-slate-300 text-xs font-semibold cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/40 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'اعتماد وتسجيل التصريح في المنظومة' : 'Create & Register Permit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
