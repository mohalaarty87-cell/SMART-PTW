import React, { useState } from 'react';
import { Menu, Search, Zap, Globe, Bell, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { Language, NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  language: Language;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleLanguage: () => void;
  onToggleSidebar: () => void;
  onAutoFillData: () => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'error') => void;
  notifications: NotificationItem[];
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  searchQuery,
  onSearchChange,
  onToggleLanguage,
  onToggleSidebar,
  onAutoFillData,
  onShowToast,
  notifications,
  onOpenLoginModal,
}) => {
  const { currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const urgentCount = notifications.filter((n) => n.urgent).length;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'from-purple-600 to-indigo-600';
      case 'HSE_OFFICER':
        return 'from-emerald-600 to-teal-600';
      case 'CONTRACTOR':
        return 'from-amber-600 to-orange-600';
      case 'AUDITOR':
        return 'from-cyan-600 to-blue-600';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

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
            <div className="flex items-center gap-2 text-xs text-[#9fb3c8] hidden sm:flex">
              <span className="font-semibold">
                {language === 'ar'
                  ? 'هيئة تشغيل حقل الزبير النفطي • شركة نفط البصرة'
                  : 'Zubair Field Operating Division • Basra Oil Company'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse" />
                <span>Station ZUB-01</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'بحث سريع برقم التصريح، الموقع، نوع الخطر، المقاول...'
                : 'Search by Permit No, Location, Risk Level, Contractor...'
            }
            className="w-full bg-[#101b33] border border-[#1c2b4c] text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition placeholder-[#627d98]"
          />
          <Search className="w-4 h-4 text-[#627d98] absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Action Controls & User Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Auto Fill Data */}
        <button
          id="btn-autofill-demo"
          onClick={onAutoFillData}
          title={language === 'ar' ? 'تعبئة وتحديث البيانات الواقعية' : 'Fill Realistic Sample Data'}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-cyan-100 text-xs font-semibold transition cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ar' ? 'تعبئة بيانات' : 'Sample Data'}</span>
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
            {notifications.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${
                  urgentCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-cyan-600'
                }`}
              >
                {notifications.length}
              </span>
            )}
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
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">
                    {language === 'ar' ? 'لا توجد تنبيهات نشطة حالياً' : 'No active alerts'}
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onShowToast(language === 'ar' ? n.descAr : n.descEn, n.urgent ? 'error' : 'info');
                      }}
                      className={`p-2.5 rounded-lg border text-xs space-y-1 cursor-pointer transition ${
                        n.urgent
                          ? 'bg-rose-950/40 border-rose-500/50 hover:bg-rose-950/70'
                          : 'bg-[#101b33]/80 hover:bg-[#152445] border-[#1c2b4c]'
                      }`}
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill with One-Click Role Switcher */}
        <div
          onClick={onOpenLoginModal}
          title={language === 'ar' ? 'انقر لتغيير المستخدم أو الصلاحية' : 'Click to Switch User / Role'}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-lg bg-[#101b33] border border-[#1c2b4c] hover:border-cyan-500 transition cursor-pointer"
        >
          <div
            className={`w-8 h-8 rounded-md bg-gradient-to-tr ${getRoleBadgeColor(
              currentUser.role
            )} flex items-center justify-center text-white text-xs font-bold font-mono shadow`}
          >
            {currentUser.avatar || '👤'}
          </div>
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-bold text-slate-200 leading-tight">
              {language === 'ar' ? currentUser.nameAr : currentUser.name}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              {currentUser.role} • ID: {currentUser.badgeId}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
