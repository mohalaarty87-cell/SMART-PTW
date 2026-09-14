import React, { useState } from 'react';
import {
  MapPin,
  Flame,
  Snowflake,
  Radiation,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers,
  Compass,
  Building2,
  Activity,
} from 'lucide-react';
import { Language, PTWItem } from '../types';

interface FieldMapViewProps {
  language: Language;
  items: Record<string, PTWItem>;
  onOpenModal: (key: string) => void;
}

interface FacilityZone {
  id: string;
  nameAr: string;
  nameEn: string;
  tag: string;
  coords: { x: number; y: number }; // Percentage 0-100
  sector: string;
  descriptionAr: string;
  descriptionEn: string;
}

const ZUBAIR_ZONES: FacilityZone[] = [
  {
    id: 'ds1',
    nameAr: 'محطة عزل الغاز المشرف ZUB-DS1',
    nameEn: 'Mishrif Degassing Station 1 (ZUB-DS1)',
    tag: 'ZUB-DS1',
    coords: { x: 28, y: 32 },
    sector: 'North Hub Sector A',
    descriptionAr: 'منظومة العزل الأولي للنفط الرطب ووحدات فحص الغازات الطبيعية',
    descriptionEn: 'Primary 3-phase separation, gas sweetening, and test separators',
  },
  {
    id: 'ds2',
    nameAr: 'محطة عزل الغاز المشرف ZUB-DS2',
    nameEn: 'Mishrif Degassing Station 2 (ZUB-DS2)',
    tag: 'ZUB-DS2',
    coords: { x: 48, y: 22 },
    sector: 'North Hub Sector B',
    descriptionAr: 'وحدات معالجة وتثبيت النفط الخام وتوليد الطاقة المساعدة',
    descriptionEn: 'Crude stabilization trains, heater treaters, and power generation',
  },
  {
    id: 'hammar',
    nameAr: 'محطة حمار مشراق للإنتاج والتجميع',
    nameEn: 'Hammar Mishraq Production Facility',
    tag: 'HMR-PROD',
    coords: { x: 74, y: 38 },
    sector: 'East Gathering Sector',
    descriptionAr: 'مجمع الآبار الشرقية ومضخات التعزيز الرئيسية نحو مستودع التصدير',
    descriptionEn: 'East field gathering manifold, multiphase pumps, and flare system',
  },
  {
    id: 'cluster14',
    nameAr: 'مجمع الآبار الشمالي عنقود 14',
    nameEn: 'Northern Wellpad Cluster 14',
    tag: 'PAD-CL14',
    coords: { x: 22, y: 68 },
    sector: 'Drilling & Wellhead Area',
    descriptionAr: 'رؤوس آبار الحقن والإنتاج، صمامات الأمان السطحية والعميقة',
    descriptionEn: 'Active producing wellheads, choke manifolds, and wireline access',
  },
  {
    id: 'tankfarm',
    nameAr: 'مستودع وخزانات جنوب الزبير النفطية',
    nameEn: 'South Zubair Tank Farm & Manifold',
    tag: 'SZ-TFARM',
    coords: { x: 55, y: 75 },
    sector: 'Storage & Fiscal Metering',
    descriptionAr: 'خزانات النفط الخام سعة 50,000 م³ ومحطة الضخ التصديري الرئيسية',
    descriptionEn: 'Strategic crude storage tanks, custody transfer metering skid',
  },
  {
    id: 'hpcomp',
    nameAr: 'محطة كبس الغاز عالي الضغط HP Hub',
    nameEn: 'High Pressure Gas Compression Hub',
    tag: 'HP-GAS-01',
    coords: { x: 80, y: 72 },
    sector: 'Gas Reinjection System',
    descriptionAr: 'ضواغط الغاز التوربينية للحقن وإعادة استثمار الغاز المصاحب',
    descriptionEn: 'Turbocompressor units, gas reinjection, and flare gas recovery',
  },
];

export const FieldMapView: React.FC<FieldMapViewProps> = ({
  language,
  items,
  onOpenModal,
}) => {
  const [selectedZone, setSelectedZone] = useState<FacilityZone | null>(ZUBAIR_ZONES[0]);

  const allPermits = Object.values(items) as PTWItem[];

  // Match permits to zone
  const getZonePermits = (zone: FacilityZone): PTWItem[] => {
    return allPermits.filter((p) => {
      const loc = (p.locationEn || '').toLowerCase() + (p.locationAr || '');
      const tag = zone.tag.toLowerCase();
      const nameMatch = zone.nameEn.toLowerCase();

      if (zone.id === 'ds1') return loc.includes('ds1') || loc.includes('station 1') || loc.includes('المشرف 1');
      if (zone.id === 'ds2') return loc.includes('ds2') || loc.includes('station 2') || loc.includes('المشرف 2');
      if (zone.id === 'hammar') return loc.includes('hammar') || loc.includes('حمار');
      if (zone.id === 'cluster14') return loc.includes('cluster') || loc.includes('pad') || loc.includes('14') || loc.includes('بئر');
      if (zone.id === 'tankfarm') return loc.includes('tank') || loc.includes('خزان') || loc.includes('جنوب');
      if (zone.id === 'hpcomp') return loc.includes('compress') || loc.includes('gas') || loc.includes('كبس');
      return false;
    });
  };

  const currentZonePermits = selectedZone ? getZonePermits(selectedZone) : [];

  return (
    <div className="space-y-4">
      {/* Map Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0b1324] border border-[#1c2b4c]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>
              {language === 'ar'
                ? 'الخارطة التفاعلية لمنشآت حقل الزبير النفطي (GIS Field Layout)'
                : 'Zubair Oil Field GIS Interactive Facility Layout'}
            </span>
          </h3>
          <p className="text-xs text-[#9fb3c8]">
            {language === 'ar'
              ? 'مراقبة جغرافية فورية لمواقع تصاريح العمل النشطة وعزل LOTO وحالة الأمان'
              : 'Real-time spatial monitoring of active permits, LOTO isolations, and safety zones'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Hot Work</span>
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Radiography</span>
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Cold Work</span>
          </span>
        </div>
      </div>

      {/* Main Grid: GIS Canvas + Station Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Schematic Canvas (2 cols) */}
        <div className="lg:col-span-2 relative min-h-[460px] rounded-2xl bg-[#070e1c] border border-[#1c2b4c] p-4 overflow-hidden shadow-2xl flex flex-col justify-between">
          {/* Engineering Background Grid & Pipelines */}
          <div className="absolute inset-0 grid-lines opacity-60 pointer-events-none" />

          {/* Simulated Interconnecting Pipelines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            {/* Trunk Line 1: DS1 to DS2 */}
            <path d="M 28% 32% L 48% 22%" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6,6" fill="none" />
            {/* Trunk Line 2: DS2 to Hammar */}
            <path d="M 48% 22% L 74% 38%" stroke="#06b6d4" strokeWidth="3" fill="none" />
            {/* Trunk Line 3: Hammar to Tank Farm */}
            <path d="M 74% 38% L 55% 75%" stroke="#10b981" strokeWidth="4" fill="none" />
            {/* Trunk Line 4: Cluster 14 to DS1 */}
            <path d="M 22% 68% L 28% 32%" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4,4" fill="none" />
            {/* Trunk Line 5: HP Gas Hub to Hammar */}
            <path d="M 80% 72% L 74% 38%" stroke="#a855f7" strokeWidth="3" fill="none" />
          </svg>

          {/* Compass Rose */}
          <div className="absolute top-4 left-4 z-10 flex flex-col items-center opacity-70 font-mono text-[10px] text-cyan-300">
            <div className="w-7 h-7 rounded-full border border-cyan-500/50 flex items-center justify-center font-bold">
              N
            </div>
            <span>ZFOD GIS</span>
          </div>

          {/* Facility Location Nodes */}
          <div className="relative w-full h-[400px]">
            {ZUBAIR_ZONES.map((zone) => {
              const permitsInZone = getZonePermits(zone);
              const isSelected = selectedZone?.id === zone.id;
              const hasCritical = permitsInZone.some(
                (p) => p.gasCriticalWarningActive || p.status === 'SUSPENDED'
              );
              const hasHot = permitsInZone.some(
                (p) => p.permitNo?.startsWith('HW') || p.titleEn?.toLowerCase().includes('hot')
              );

              return (
                <div
                  key={zone.id}
                  style={{ left: `${zone.coords.x}%`, top: `${zone.coords.y}%` }}
                  onClick={() => setSelectedZone(zone)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-all duration-200 group ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                  }`}
                >
                  {/* Outer Pulsing Aura */}
                  {hasCritical ? (
                    <div className="absolute -inset-2 rounded-2xl bg-rose-500/30 animate-ping pointer-events-none" />
                  ) : hasHot ? (
                    <div className="absolute -inset-1.5 rounded-2xl bg-amber-500/20 animate-pulse pointer-events-none" />
                  ) : null}

                  {/* Node Badge */}
                  <div
                    className={`px-3 py-2 rounded-xl border flex items-center gap-2.5 backdrop-blur-md shadow-xl ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-400 text-white ring-2 ring-cyan-500/30'
                        : hasCritical
                        ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                        : 'bg-[#0f1b33]/85 border-[#22365e] text-slate-200 hover:border-cyan-500/60'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        hasCritical
                          ? 'bg-rose-500 status-pulse'
                          : hasHot
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-mono font-bold text-xs leading-none">
                        {zone.tag}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                        {language === 'ar' ? zone.nameAr.split(' ')[0] + '...' : zone.nameEn.split(' ')[0]}
                      </span>
                    </div>

                    {permitsInZone.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-cyan-900/80 text-cyan-300 font-mono text-[10px] font-bold">
                        {permitsInZone.length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Footer Bar */}
          <div className="relative z-10 p-2.5 rounded-xl bg-[#091122]/90 border border-[#1c2b4c] flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">Coordinates: 30°23'N 47°42'E • Basra Basin</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse" />
              <span>Telemetry Active • Station ZUB-01 Hub</span>
            </span>
          </div>
        </div>

        {/* Selected Facility Inspector Panel (1 col) */}
        <div className="rounded-2xl bg-[#0b1324] border border-[#1c2b4c] p-5 flex flex-col justify-between shadow-2xl space-y-4">
          {selectedZone ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#1c2b4c]">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                      {selectedZone.sector}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {language === 'ar' ? selectedZone.nameAr : selectedZone.nameEn}
                    </h4>
                  </div>
                  <span className="px-2 py-1 rounded bg-[#101b33] border border-[#1c2b4c] text-xs font-mono font-bold text-cyan-300">
                    {selectedZone.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'ar' ? selectedZone.descriptionAr : selectedZone.descriptionEn}
                </p>

                {/* Permits in this Zone */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      {language === 'ar' ? 'التصاريح المسجلة بالموقع:' : 'Permits Logged at Location:'}
                    </span>
                    <span className="font-mono text-cyan-400 font-semibold">
                      {currentZonePermits.length} {language === 'ar' ? 'تصريح' : 'Permits'}
                    </span>
                  </div>

                  {currentZonePermits.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#091122] border border-[#1c2b4c] text-center text-xs text-slate-400">
                      {language === 'ar'
                        ? 'لا توجد تصاريح عمل مسجلة حالياً في هذا القطاع.'
                        : 'No active work permits registered in this sector.'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {currentZonePermits.map((p) => (
                        <div
                          key={p.key}
                          onClick={() => onOpenModal(p.key)}
                          className="p-3 rounded-xl bg-[#0e172e] hover:bg-[#142242] border border-[#1c2b4c] hover:border-cyan-500/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-cyan-400">
                                {p.permitNo}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  p.status === 'ACTIVE'
                                    ? 'bg-cyan-950 text-cyan-300'
                                    : p.status === 'SUSPENDED'
                                    ? 'bg-rose-950 text-rose-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {language === 'ar' ? p.statusAr : p.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 truncate">
                              {language === 'ar' ? p.titleAr : p.titleEn}
                            </p>
                          </div>

                          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Facility Metrics */}
              <div className="p-3 rounded-xl bg-[#070e1c] border border-[#1c2b4c] text-xs font-mono flex items-center justify-between text-slate-400">
                <span>OSHA Compliant</span>
                <span className="text-emerald-400 font-bold">100% Atmospheric Safe</span>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              {language === 'ar' ? 'اختر موقعاً على الخارطة لمعاينته' : 'Select a facility zone on map'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
