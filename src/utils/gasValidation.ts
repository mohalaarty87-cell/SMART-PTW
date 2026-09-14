export interface GasEvaluationResult {
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  violationsEn: string[];
  violationsAr: string[];
  parsedValues: {
    lel: number;
    o2: number;
    h2s: number;
    co: number;
  };
}

/**
 * Safely parses any number from string inputs such as "20.9%", "0 ppm", " 15.2 "
 */
export function parseGasValue(val: string | number): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  // Remove non-numeric characters except period and minus
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Standard ZFOD / OSHA 1910.146 / API 2201 Atmospheric Gas Testing Rules:
 * - LEL: Must be < 10% (CRITICAL if >= 10%)
 * - O2: Safe range 19.5% - 23.5%. Outside is WARNING/CRITICAL.
 *        O2 < 18.0% or > 24.0% is strictly CRITICAL (IDLH / asphyxiation or fire enrichment).
 * - H2S: Must be < 10 ppm (CRITICAL if >= 10 ppm)
 * - CO: Must be < 35 ppm (CRITICAL if >= 35 ppm)
 */
export function evaluateGasReadings(
  rawLel: string | number,
  rawO2: string | number,
  rawH2s: string | number,
  rawCo: string | number
): GasEvaluationResult {
  const lel = parseGasValue(rawLel);
  const o2 = parseGasValue(rawO2);
  const h2s = parseGasValue(rawH2s);
  const co = parseGasValue(rawCo);

  const violationsEn: string[] = [];
  const violationsAr: string[] = [];
  let isCritical = false;
  let isWarning = false;

  // LEL Check (< 10%)
  if (lel >= 10) {
    isCritical = true;
    violationsEn.push(`LEL is ${lel}% (Limit: < 10% LEL) - Flammable atmosphere hazard!`);
    violationsAr.push(`نسبة الغاز القابل للاشتعال LEL بلغت ${lel}% (الحد الأقصى < 10%) - خطر انفجار وشيك!`);
  }

  // O2 Check (Safe: 19.5% - 23.5%)
  if (o2 < 18.0) {
    isCritical = true;
    violationsEn.push(`Oxygen is critically deficient at ${o2}% (Limit: >= 19.5%) - Immediate asphyxiation risk!`);
    violationsAr.push(`نقص أكسجين حرج ${o2}% (الحد الأدنى 19.5%) - خطر اختناق فوري للكوادر!`);
  } else if (o2 < 19.5) {
    isWarning = true;
    violationsEn.push(`Oxygen is low at ${o2}% (Safe range: 19.5% - 23.5%)`);
    violationsAr.push(`مستوى الأكسجين منخفض عند ${o2}% (المستوى الآمن: 19.5% - 23.5%)`);
  } else if (o2 > 24.0) {
    isCritical = true;
    violationsEn.push(`Oxygen enriched at ${o2}% (Limit: <= 23.5%) - Extreme fire acceleration hazard!`);
    violationsAr.push(`تشبع أكسجين حرج ${o2}% (الحد الأقصى 23.5%) - خطر تسارع الاشتعال التلقائي!`);
  } else if (o2 > 23.5) {
    isWarning = true;
    violationsEn.push(`Oxygen is slightly elevated at ${o2}% (Safe range: 19.5% - 23.5%)`);
    violationsAr.push(`مستوى الأكسجين مرتفع نسبياً ${o2}% (المستوى الآمن: 19.5% - 23.5%)`);
  }

  // H2S Check (< 10 ppm)
  if (h2s >= 10) {
    isCritical = true;
    violationsEn.push(`H2S toxic gas is ${h2s} ppm (Limit: < 10 ppm) - Fatal sour gas poisoning hazard!`);
    violationsAr.push(`غاز كبريتيد الهيدروجين السام H2S بلغ ${h2s} ppm (الحد المسموح < 10 ppm) - خطر تسمم غازي مميت!`);
  }

  // CO Check (< 35 ppm)
  if (co >= 35) {
    isCritical = true;
    violationsEn.push(`Carbon Monoxide CO is ${co} ppm (Limit: < 35 ppm) - Toxic exposure limit exceeded!`);
    violationsAr.push(`غاز أول أكسيد الكربون CO بلغ ${co} ppm (الحد المسموح < 35 ppm) - تجاوز حد التسمم المهني!`);
  }

  const status = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'SAFE';

  return {
    status,
    violationsEn,
    violationsAr,
    parsedValues: { lel, o2, h2s, co },
  };
}
