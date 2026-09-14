import React, { useState } from 'react';
import { Menu, Search, Zap, Globe, Bell, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleLanguage: () => void;
  onToggleSidebar: () => void;
  onAutoFillData: () => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  searchQuery,
  onSearchChange,
  onToggleLanguage,
  onToggleSidebar,
  onAutoFillData,
  onShowToast,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      titleAr: 'تنبيه فحص الغاز الدوري',
      titleEn: 'Periodic Gas Testing Due',
      descAr: 'مطلوب فحص دوري للغازات عند الساعة 13:00 لموقع Header-4',
      descEn: 'Periodic gas test required at 13:00 for Header-4 site',
      time: '12:45',
      urgent: true,
    },
    {
      id: 2,
      titleAr: 'اعتماد تصريح الأشعة RAD-084',
      titleEn: 'RAD-084 Radiography Approved',
      descAr: 'تم توقيع كافة بنود تصريح فحص الأشعة للوردية الليلية',
      descEn: 'All sections of Radiography permit signed for night shift',
      time: '11:15',
      urgent: false,
    },
    {
      id: 3,
      titleAr: 'اكتمال العزل الكهربائي LOTO',
      titleEn: 'LOTO Electrical Lock Completed',
      descAr: 'تم قفل وتأريض القاطع Feeder C-14 لمضخة P-102A',
      descEn: 'Feeder C-14 breaker racked out and padlocked for pump P-102A',
      time: '07:15',
      urgent: false,
    },
  ];

  return (
    <header className="relative z-40 h-20 bg-[#0b1324]/95 backdrop-blur-md border-b border-[#1c2b4c] flex items-center justify-between px-4 lg:px-7 sticky top-0 shadow-2xl">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="p-2.5 rounded-lg bg-[#101b33] text-slate-300 hover:text-white hover:bg-[#152445] border border-[#1c2b4c] transition flex items-center justify-center cursor-pointer"
          title={language === 'ar' ? 'القائمة الجانبية' : 'Toggle Sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          {/* Stylized Official ZFOD Emblem */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#062c3e] via-[#093539] to-[#044331] border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <div className="absolute inset-0.5 rounded-[10px] border border-emerald-400/20" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-200 to-emerald-400 font-extrabold font-mono tracking-tighter text-sm">
              ZFOD
            </span>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0b1324] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span className="text-cyan-400 font-mono">ZFOD</span>
                <span>SMART PTW</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 hidden sm:inline-block">
                v5.4 HSE-OSHA
              </span>
            </div>
            <span className="text-xs text-[#9fb3c8] font-medium hidden md:inline-block">
              {language === 'ar'
                ? 'Zubair Field Operating Division | هيئة تشغيل حقل الزبير'
                : 'Zubair Field Operating Division | Basra, Iraq'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Search Input */}
      <div className="hidden xl:flex items-center relative w-80">
        <Search className={`w-4 h-4 text-slate-400 absolute pointer-events-none ${language === 'ar' ? 'right-3' : 'left-3'}`} />
        <input
          id="global-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={language === 'ar' ? 'بحث برقم التصريح أو الموقع أو المقاول...' : 'Search PTW Code, Location, Contractor...'}
          className={`w-full py-1.5 text-xs rounded-lg bg-[#101b33]/90 border border-[#1c2b4c] text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-500 transition ${
            language === 'ar' ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'
          }`}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className={`absolute text-xs text-slate-400 hover:text-white ${language === 'ar' ? 'left-2.5' : 'right-2.5'}`}
          >
            ✕
          </button>
        )}
      </div>

      {/* Action Strip */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-Time Operational Tag */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse" />
          <span>{language === 'ar' ? 'النظام يعمل بكفاءة 100%' : 'SYSTEM OPERATIONAL 100%'}</span>
        </div>

        {/* Auto Fill Data */}
        <button
          id="btn-autofill-demo"
          onClick={onAutoFillData}
          title={language === 'ar' ? 'تعبئة وتحديث البيانات الواقعية' : 'Fill Realistic Sample Data'}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-cyan-100 text-xs font-semibold transition cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ar' ? 'تعبئة ذكية للبيانات' : 'Smart Auto-Fill'}</span>
        </button>

        {/* Language Toggle */}
        <button
          id="btn-toggle-lang"
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#101b33] hover:bg-[#152445] border border-[#1c2b4c] text-slate-200 text-xs font-bold transition cursor-pointer"
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>{language === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-[#101b33] hover:bg-[#152445] border border-[#1c2b4c] text-slate-300 relative cursor-pointer"
            title={language === 'ar' ? 'الإشعارات والتنبيهات' : 'Notifications'}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              {notifications.length}
            </span>
          </button>

          {showNotifications && (
            <div
              className={`absolute top-12 w-80 sm:w-96 rounded-xl bg-[#0b1324] border border-[#1c2b4c] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 ${
                language === 'ar' ? 'left-0 sm:left-auto sm:right-0' : 'right-0 sm:right-auto sm:left-0'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#1c2b4c] mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  {language === 'ar' ? 'تنبيهات السلامة الصناعية النشطة' : 'Active Operational Alerts'}
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded">
                  {notifications.length} {language === 'ar' ? 'تنبيهات' : 'Alerts'}
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifications(false);
                      onShowToast(language === 'ar' ? n.descAr : n.descEn, n.urgent ? 'error' : 'info');
                    }}
                    className="p-2.5 rounded-lg bg-[#101b33]/80 hover:bg-[#152445] border border-[#1c2b4c] text-xs space-y-1 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold flex items-center gap-1 ${n.urgent ? 'text-rose-400' : 'text-slate-200'}`}>
                        {n.urgent && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                        {language === 'ar' ? n.titleAr : n.titleEn}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {language === 'ar' ? n.descAr : n.descEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-lg bg-[#101b33] border border-[#1c2b4c]">
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white text-xs font-bold font-mono">
            HSE
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-200 leading-tight">
              {language === 'ar' ? 'م. عمار الحيدري' : 'Eng. Ammar Al-Haidari'}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              Lead Safety Auth. (ZFOD)
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
