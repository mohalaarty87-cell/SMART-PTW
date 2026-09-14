import { PTWItem } from '../types';

export interface StandardComplianceReport {
  code: string;
  titleEn: string;
  titleAr: string;
  score: number; // 0 to 100
  status: 'FULLY COMPLIANT' | 'NEEDS ATTENTION' | 'CRITICAL DEFICIENCIES';
  statusAr: string;
  evaluatedCriteria: number;
  passedCriteria: number;
  deficienciesEn: string[];
  deficienciesAr: string[];
}

export interface SystemComplianceResult {
  overallScore: number;
  overallStatusEn: string;
  overallStatusAr: string;
  totalPermitsEvaluated: number;
  totalChecklistsEvaluated: number;
  checklistPassRate: number;
  totalGasTestsEvaluated: number;
  gasSafetyRate: number;
  totalSignaturesEvaluated: number;
  signatureCompletionRate: number;
  standards: StandardComplianceReport[];
}

export function calculateSystemCompliance(items: Record<string, PTWItem>): SystemComplianceResult {
  const permits = Object.values(items);
  if (permits.length === 0) {
    return {
      overallScore: 100,
      overallStatusEn: 'NO ACTIVE PERMITS',
      overallStatusAr: 'لا توجد تصاريح عمل نشطة',
      totalPermitsEvaluated: 0,
      totalChecklistsEvaluated: 0,
      checklistPassRate: 100,
      totalGasTestsEvaluated: 0,
      gasSafetyRate: 100,
      totalSignaturesEvaluated: 0,
      signatureCompletionRate: 100,
      standards: [],
    };
  }

  let totalChecklistItems = 0;
  let passedChecklistItems = 0;
  let totalGasTests = 0;
  let safeGasTests = 0;
  let criticalGasAlarms = 0;
  let totalSignatures = 0;
  let completedSignatures = 0;

  const oshaPsmDeficienciesEn: string[] = [];
  const oshaPsmDeficienciesAr: string[] = [];

  const iso45001DeficienciesEn: string[] = [];
  const iso45001DeficienciesAr: string[] = [];

  const api2201DeficienciesEn: string[] = [];
  const api2201DeficienciesAr: string[] = [];

  const oshaConfinedDeficienciesEn: string[] = [];
  const oshaConfinedDeficienciesAr: string[] = [];

  permits.forEach((permit) => {
    // 1. Checklist metrics
    const checklists = permit.checklists || [];
    totalChecklistItems += checklists.length;
    const passed = checklists.filter((c) => c.status === 'PASS' || c.verified).length;
    passedChecklistItems += passed;

    if (checklists.length > 0 && passed < checklists.length && permit.status === 'ACTIVE') {
      iso45001DeficienciesEn.push(`Permit ${permit.permitNo} is ACTIVE with ${checklists.length - passed} unverified safety checklist items.`);
      iso45001DeficienciesAr.push(`التصريح ${permit.permitNo} نشط ميدانياً وبداخله ${checklists.length - passed} بنود تدقيق سلامة غير مؤكدة.`);
    }

    // 2. Gas testing metrics
    const gasTests = permit.gasTests || [];
    totalGasTests += gasTests.length;
    gasTests.forEach((g) => {
      if (g.status === 'SAFE') {
        safeGasTests++;
      } else if (g.status === 'CRITICAL') {
        criticalGasAlarms++;
        api2201DeficienciesEn.push(`Critical atmospheric reading detected on ${permit.permitNo} at ${g.time} (LEL: ${g.lel}, H2S: ${g.h2s}).`);
        api2201DeficienciesAr.push(`قراءة غاز حرجة مرصودة في ${permit.permitNo} بتوقيت ${g.time} (LEL: ${g.lel}, H2S: ${g.h2s}).`);

        if (g.violations && g.violations.length > 0) {
          oshaConfinedDeficienciesEn.push(`${permit.permitNo}: ${g.violations.join(', ')}`);
          oshaConfinedDeficienciesAr.push(`${permit.permitNo}: تجاوز حدود التعرض الغازي الآمن.`);
        }
      }
    });

    if (gasTests.length === 0 && (permit.risk === 'CRITICAL RISK' || permit.risk === 'HIGH RISK (CLASS A)')) {
      api2201DeficienciesEn.push(`Permit ${permit.permitNo} classified as high risk but has zero atmospheric test logs recorded.`);
      api2201DeficienciesAr.push(`التصريح ${permit.permitNo} مصنف عالي الخطورة دون وجود أي سجل فحص غازات معتمد.`);
    }

    // 3. Signature metrics
    const signatures = permit.signatures || [];
    totalSignatures += signatures.length;
    const signed = signatures.filter((s) => s.status === 'DIGITALLY SIGNED').length;
    completedSignatures += signed;

    if (signed < signatures.length && (permit.status === 'ACTIVE' || permit.status === 'APPROVED')) {
      oshaPsmDeficienciesEn.push(`Permit ${permit.permitNo} is ${permit.status} but missing ${signatures.length - signed} mandatory digital authorizations.`);
      oshaPsmDeficienciesAr.push(`التصريح ${permit.permitNo} بحالة ${permit.statusAr} مع نقص في ${signatures.length - signed} تواقيع إلزامية معتمدة.`);
    }
  });

  const checklistPassRate = totalChecklistItems > 0 ? Math.round((passedChecklistItems / totalChecklistItems) * 100) : 100;
  const gasSafetyRate = totalGasTests > 0 ? Math.round((safeGasTests / totalGasTests) * 100) : 100;
  const signatureCompletionRate = totalSignatures > 0 ? Math.round((completedSignatures / totalSignatures) * 100) : 100;

  // Calculate individual standard scores
  const psmScore = Math.max(0, Math.min(100, Math.round((signatureCompletionRate * 0.6) + (gasSafetyRate * 0.4) - (oshaPsmDeficienciesEn.length * 5))));
  const isoScore = Math.max(0, Math.min(100, Math.round((checklistPassRate * 0.7) + (signatureCompletionRate * 0.3) - (iso45001DeficienciesEn.length * 5))));
  const apiScore = Math.max(0, Math.min(100, Math.round(gasSafetyRate - (criticalGasAlarms * 15) - (api2201DeficienciesEn.length * 5))));
  const confinedScore = Math.max(0, Math.min(100, Math.round((gasSafetyRate * 0.5) + (checklistPassRate * 0.5) - (oshaConfinedDeficienciesEn.length * 8))));

  const getStatus = (score: number) => {
    if (score >= 90) return { en: 'FULLY COMPLIANT' as const, ar: 'مطابق بالكامل للمعاير' };
    if (score >= 70) return { en: 'NEEDS ATTENTION' as const, ar: 'يتطلب إجراءات تصحيحية' };
    return { en: 'CRITICAL DEFICIENCIES' as const, ar: 'قصور حرج يتطلب تدخلاً فورياً' };
  };

  const standards: StandardComplianceReport[] = [
    {
      code: 'OSHA 1910.119',
      titleEn: 'Process Safety Management of Highly Hazardous Chemicals (PSM)',
      titleAr: 'إدارة سلامة العمليات للمواد الكيميائية شديدة الخطورة (PSM)',
      score: psmScore,
      status: getStatus(psmScore).en,
      statusAr: getStatus(psmScore).ar,
      evaluatedCriteria: totalSignatures,
      passedCriteria: completedSignatures,
      deficienciesEn: oshaPsmDeficienciesEn,
      deficienciesAr: oshaPsmDeficienciesAr,
    },
    {
      code: 'ISO 45001:2018',
      titleEn: 'Occupational Health and Safety Management Systems',
      titleAr: 'أنظمة إدارة الصحة والسلامة المهنية المعتمدة دولياً',
      score: isoScore,
      status: getStatus(isoScore).en,
      statusAr: getStatus(isoScore).ar,
      evaluatedCriteria: totalChecklistItems,
      passedCriteria: passedChecklistItems,
      deficienciesEn: iso45001DeficienciesEn,
      deficienciesAr: iso45001DeficienciesAr,
    },
    {
      code: 'API 2201 (6th Ed.)',
      titleEn: 'Safe Hot Tapping Practices in the Petroleum & Petrochemical Industries',
      titleAr: 'الممارسات الآمنة للتثقيب والنقر الساخن واللحام بالمنشآت النفطية',
      score: apiScore,
      status: getStatus(apiScore).en,
      statusAr: getStatus(apiScore).ar,
      evaluatedCriteria: totalGasTests,
      passedCriteria: safeGasTests,
      deficienciesEn: api2201DeficienciesEn,
      deficienciesAr: api2201DeficienciesAr,
    },
    {
      code: 'OSHA 1910.146',
      titleEn: 'Permit-Required Confined Spaces Standard',
      titleAr: 'معيار دخول الأماكن المغلقة التي تتطلب تصريح عمل',
      score: confinedScore,
      status: getStatus(confinedScore).en,
      statusAr: getStatus(confinedScore).ar,
      evaluatedCriteria: totalChecklistItems + totalGasTests,
      passedCriteria: passedChecklistItems + safeGasTests,
      deficienciesEn: oshaConfinedDeficienciesEn,
      deficienciesAr: oshaConfinedDeficienciesAr,
    },
  ];

  const overallScore = Math.round((psmScore + isoScore + apiScore + confinedScore) / 4);
  const overallStatus = getStatus(overallScore);

  return {
    overallScore,
    overallStatusEn: overallStatus.en,
    overallStatusAr: overallStatus.ar,
    totalPermitsEvaluated: permits.length,
    totalChecklistsEvaluated: totalChecklistItems,
    checklistPassRate,
    totalGasTestsEvaluated: totalGasTests,
    gasSafetyRate,
    totalSignaturesEvaluated: totalSignatures,
    signatureCompletionRate,
    standards,
  };
}
