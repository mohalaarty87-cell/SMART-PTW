import React from 'react';
import { LayoutDashboard, TableProperties, ShieldAlert, HeartHandshake, Flame, Snowflake, Radiation, Compass } from 'lucide-react';
import { Language, ViewMode } from '../types';

interface SidebarProps {
  language: Language;
  viewMode: ViewMode;
  isOpen: boolean;
  onSelectView: (v: ViewMode) => void;
  onOpenItemModal: (key: string) => void;
  onOpenAuditModal: () => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  language,
  viewMode,
  isOpen,
  onSelectView,
  onOpenItemModal,
  onOpenAuditModal,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed lg:sticky top-20 ${
          language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
        } h-[calc(100vh-5rem)] w-64 xl:w-72 bg-[#0b1324]/95 backdrop-blur-lg border-[#1c2b4c] flex flex-col justify-between transition-transform duration-300 z-30 shrink-0 select-none ${
          isOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Main Navigation */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#627d98] px-3 mb-2 block">
              {language === 'ar' ? 'المنظومة الرقمية | DIGITAL SYSTEM' : 'DIGITAL WORKSPACE'}
            </span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectView('grid');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-600/40 shadow-sm'
                    : 'text-slate-300 hover:bg-[#152445] hover:text-white border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>{language === 'ar' ? 'لوحة القيادة والمراقبة' : 'Dashboard & Monitoring'}</span>
              </button>

              <button
                onClick={() => {
                  onSelectView('table');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-600/40 shadow-sm'
                    : 'text-slate-300 hover:bg-[#152445] hover:text-white border border-transparent'
                }`}
              >
                <TableProperties className="w-4 h-4 text-slate-400" />
                <span>{language === 'ar' ? 'سجل التصاريح الإلكتروني' : 'Electronic PTW Register'}</span>
                <span className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'} font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300`}>
                  10 Total
                </span>
              </button>

              <button
                onClick={() => {
                  onSelectView('map');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-600/40 shadow-sm'
                    : 'text-slate-300 hover:bg-[#152445] hover:text-white border border-transparent'
                }`}
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>{language === 'ar' ? 'الخارطة الجغرافية للحقل (GIS)' : 'GIS Field Facility Map'}</span>
              </button>

              <button
                onClick={() => {
                  onOpenAuditModal();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-[#152445] hover:text-white border border-transparent text-xs font-semibold transition cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'التدقيق والامتثال (ISO/OSHA)' : 'Audit & Compliance (ISO/OSHA)'}</span>
                <span className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'} w-2 h-2 rounded-full bg-emerald-400`} />
              </button>
            </div>
          </div>

          {/* Category: Main Permits (3) */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#627d98]">
                {language === 'ar' ? 'تصاريح العمل الرئيسية (PTW)' : 'MAIN PERMITS (PTW)'}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">3 ACTIVE</span>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenItemModal('rad');
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#152445] hover:text-white border border-slate-800/80 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Radiography Permit</span>
                </span>
                <span className="text-[10px] font-mono text-purple-300">RAD-084</span>
              </button>

              <button
                onClick={() => {
                  onOpenItemModal('hot');
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#152445] hover:text-white border border-slate-800/80 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>HOT Work Permit</span>
                </span>
                <span className="text-[10px] font-mono text-rose-400">HW-1102</span>
              </button>

              <button
                onClick={() => {
                  onOpenItemModal('cold');
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#152445] hover:text-white border border-slate-800/80 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Cold Work Permit</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-300">CW-3390</span>
              </button>
            </div>
          </div>

          {/* Category: Certificates (7) */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#627d98]">
                {language === 'ar' ? 'الشهادات التكميلية (7)' : 'ATTACHED CERTS (7)'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">LOTO / HSE</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onOpenItemModal('hotperf');
                  onCloseMobile();
                }}
                className="p-2 rounded bg-[#101b33]/60 hover:bg-[#152445] text-[11px] text-slate-300 text-right border border-[#1c2b4c] transition cursor-pointer"
              >
                ⚡ {language === 'ar' ? 'تثقيب حار' : 'Hot Perf'}
              </button>

              <button
                onClick={() => {
                  onOpenItemModal('excavation');
                  onCloseMobile();
                }}
                className="p-2 rounded bg-[#101b33]/60 hover:bg-[#152445] text-[11px] text-slate-300 text-right border border-[#1c2b4c] transition cursor-pointer"
              >
                ⛏️ {language === 'ar' ? 'حفر وتنقيب' : 'Excavation'}
              </button>

              <button
                onClick={() => {
                  onOpenItemModal('confined');
                  onCloseMobile();
                }}
                className="p-2 rounded bg-[#101b33]/60 hover:bg-[#152445] text-[11px] text-slate-300 text-right border border-[#1c2b4c] transition cursor-pointer"
              >
                🚷 {language === 'ar' ? 'حيز مغلق' : 'Confined'}
              </button>

              <button
                onClick={() => {
                  onOpenItemModal('override');
                  onCloseMobile();
                }}
                className="p-2 rounded bg-[#101b33]/60 hover:bg-[#152445] text-[11px] text-slate-300 text-right border border-[#1c2b4c] transition cursor-pointer"
              >
                ⚠️ {language === 'ar' ? 'تجاوز ESD' : 'ESD Override'}
              </button>

              <button
                onClick={() => {
                  onOpenItemModal('scaffolding');
                  onCloseMobile();
                }}
                className="p-2 rounded bg-[#101b33]/60 hover:bg-[#152445] text-[11px] text-slate-300 text-right border border-[#1c2b4c] transition cursor-pointer"
              >
                🏗️ {language === 'ar' ? 'سقالات' : 'Scaffolding'}
              </button>

              <button
                onClick={() => {
                  onOpenItemModal('hse-iso');
                  onCloseMobile();
                }}
                className="p-2 rounded bg-[#101b33]/60 hover:bg-[#152445] text-[11px] text-slate-300 text-right border border-[#1c2b4c] transition cursor-pointer"
              >
                🔒 {language === 'ar' ? 'عزل LOTO' : 'Process LOTO'}
              </button>

              <button
                onClick={() => {
                  onOpenItemModal('elec-iso');
                  onCloseMobile();
                }}
                className="col-span-2 p-2 rounded bg-[#101b33]/60 hover:bg-[#152445] text-[11px] text-slate-300 text-right border border-[#1c2b4c] transition cursor-pointer"
              >
                🔌 {language === 'ar' ? 'عزل وتأريض كهربائي (HV/MV)' : 'Electrical LOTO (HV/MV 3.3 kV)'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#1c2b4c] bg-[#0b1324] text-[11px] text-[#627d98] flex items-center justify-between">
          <div>
            <span className="block text-slate-300 font-mono font-bold">ZFOD STATION ZUB-01</span>
            <span className="text-[10px]">OSHA 1910 / ISO 45001</span>
          </div>
          <HeartHandshake className="w-5 h-5 text-emerald-400" />
        </div>
      </aside>
    </>
  );
};
