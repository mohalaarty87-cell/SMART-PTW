import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HeroConsole } from './components/HeroConsole';
import { KpiGauges } from './components/KpiGauges';
import { ViewControls } from './components/ViewControls';
import { PermitCardsGrid } from './components/PermitCardsGrid';
import { RegistryTable } from './components/RegistryTable';
import { PermitModal } from './components/PermitModal';
import { AuditModal } from './components/AuditModal';
import { PrintReportView } from './components/PrintReportView';
import { UserLoginModal } from './components/UserLoginModal';
import { ToastContainer } from './components/Toast';
import { INITIAL_PTW_DATA } from './data/mockData';
import { Language, ViewMode, PTWItem, ToastMessage, NotificationItem } from './types';
import { apiService } from './services/apiService';
import { checkPermitValidity } from './utils/validityHelper';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    titleAr: 'تنبيه فحص الغاز الدوري',
    titleEn: 'Periodic Gas Testing Due',
    descAr: 'مطلوب فحص دوري للغازات عند الساعة 14:00 لموقع Header-4',
    descEn: 'Periodic gas test required at 14:00 for Header-4 site',
    time: '13:45',
    urgent: true,
    type: 'gas',
  },
  {
    id: 'notif-2',
    titleAr: 'اعتماد تصريح الأشعة RAD-084',
    titleEn: 'RAD-084 Radiography Approved',
    descAr: 'تم توقيع كافة بنود تصريح فحص الأشعة للوردية الليلية',
    descEn: 'All sections of Radiography permit signed for night shift',
    time: '11:15',
    urgent: false,
    type: 'approval',
  },
  {
    id: 'notif-3',
    titleAr: 'اكتمال العزل الكهربائي LOTO',
    titleEn: 'LOTO Electrical Lock Completed',
    descAr: 'تم قفل وتأريض القاطع Feeder C-14 لمضخة P-102A',
    descEn: 'Feeder C-14 breaker racked out and padlocked for pump P-102A',
    time: '07:15',
    urgent: false,
    type: 'loto',
  },
];

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeModalKey, setActiveModalKey] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Advanced Filters State
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [contractorFilter, setContractorFilter] = useState<string>('ALL');

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Load items from API Service (Server-first with local fallback)
  const [items, setItems] = useState<Record<string, PTWItem>>(INITIAL_PTW_DATA);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiService.getPermits();
        if (data && Object.keys(data).length > 0) {
          setItems(data);
        }
      } catch (err) {
        console.error('Initial API load failed, used cached items', err);
      }
      setPendingSyncCount(apiService.getPendingSyncCount());
    };
    loadData();
  }, []);

  // Online / Offline and Sync Listeners
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      showToast(
        language === 'ar' ? 'تم استعادة الاتصال بالشبكة! جارٍ مزامنة البيانات...' : 'Network online! Synchronizing field data...',
        'success'
      );
      const synced = await apiService.syncPendingQueue();
      setPendingSyncCount(apiService.getPendingSyncCount());
      if (synced > 0) {
        showToast(
          language === 'ar'
            ? `تم مزامنة ${synced} عمليات معلقة بنجاح مع خادم حقل الزبير ✓`
            : `Synced ${synced} queued actions successfully with Zubair field server ✓`,
          'success'
        );
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast(
        language === 'ar'
          ? 'تنبيه: أنت تعمل في وضع عدم الاتصال (Offline-First). سيتم حفظ العمليات محلياً.'
          : 'Notice: Operating in Offline-First mode. Changes will queue locally.',
        'info'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language, showToast]);

  // Periodic Expiration Checker (Every 60s)
  useEffect(() => {
    const checkExpirations = () => {
      (Object.values(items) as PTWItem[]).forEach((item: PTWItem) => {
        const validity = checkPermitValidity(item.validityWindow);
        if (validity.isExpiringSoon) {
          // Check if already in notifications
          setNotifications((prev) => {
            const exists = prev.some((n) => n.permitNo === item.permitNo && n.type === 'expiry');
            if (!exists) {
              return [
                {
                  id: 'notif-' + Date.now() + '-' + item.key,
                  titleAr: `تنبيه قرب انتهاء الصلاحية: ${item.permitNo}`,
                  titleEn: `Permit Expiring Soon: ${item.permitNo}`,
                  descAr: `متبقي أقل من ساعة (${validity.remainingMinutes} دقيقة) على انتهاء وردية العمل لموقع ${item.locationAr}`,
                  descEn: `Less than 1 hour (${validity.remainingMinutes}m) remaining on shift validity for ${item.locationEn}`,
                  time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                  urgent: true,
                  type: 'expiry',
                  permitNo: item.permitNo,
                },
                ...prev,
              ];
            }
            return prev;
          });
        }
      });
    };

    checkExpirations();
    const timer = setInterval(checkExpirations, 60000);
    return () => clearInterval(timer);
  }, [items]);

  // Keep dir and lang in sync with documentElement
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Persist items via API service (Optimistic + server sync)
  const handleSaveItem = async (updatedItem: PTWItem) => {
    // Optimistic UI update
    setItems((prev) => ({
      ...prev,
      [updatedItem.key]: updatedItem,
    }));

    try {
      await apiService.savePermit(updatedItem);
      setPendingSyncCount(apiService.getPendingSyncCount());
    } catch (err) {
      console.error('Failed to sync item to server', err);
    }
  };

  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
    showToast(
      nextLang === 'ar'
        ? 'تم تحويل واجهة النظام إلى اللغة العربية بنجاح.'
        : 'System transformed to English (LTR) mode.',
      'info'
    );
  };

  const handleAutoFillData = async () => {
    setItems(INITIAL_PTW_DATA);
    for (const key of Object.keys(INITIAL_PTW_DATA)) {
      await apiService.savePermit(INITIAL_PTW_DATA[key]);
    }
    showToast(
      language === 'ar'
        ? '⚡ تم تحديث ومزامنة بيانات حقل الزبير النموذجية لكافة التصاريح!'
        : '⚡ ZFOD operational dataset synchronized and updated!',
      'success'
    );
  };

  const handleAddNotification = (newNotif: Omit<NotificationItem, 'id'>) => {
    setNotifications((prev) => [{ ...newNotif, id: 'notif-' + Date.now() }, ...prev]);
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setRiskFilter('ALL');
    setContractorFilter('ALL');
    setSearchQuery('');
    showToast(
      language === 'ar' ? 'تمت إعادة ضبط فلاتر البحث بنجاح.' : 'Search filters reset successfully.',
      'info'
    );
  };

  const hasActiveFilters = statusFilter !== 'ALL' || riskFilter !== 'ALL' || contractorFilter !== 'ALL' || searchQuery.trim() !== '';

  const activeModalItem = activeModalKey ? items[activeModalKey] : null;

  return (
    <div className="bg-[#060b14] text-slate-100 min-h-screen flex flex-col font-sans relative selection:bg-cyan-500 selection:text-black">
      {/* Ambient Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 glow-radial" />
        <div className="absolute inset-0 grid-lines opacity-70" />
        <div className="absolute -top-40 right-10 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Global Topbar */}
      <Header
        language={language}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleLanguage={handleToggleLanguage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onAutoFillData={handleAutoFillData}
        onShowToast={showToast}
        notifications={notifications}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Offline / Sync Banner (Sticky when offline or pending sync) */}
      {(!isOnline || pendingSyncCount > 0) && (
        <div className="relative z-30 bg-gradient-to-r from-amber-950/90 to-orange-950/90 border-b border-amber-600/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2 font-semibold">
            {!isOnline ? <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" /> : <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
            <span>
              {!isOnline
                ? language === 'ar'
                  ? 'وضع الحقل بدون اتصال (Offline Mode) • التعديلات تُحفظ محلياً في المتصفح'
                  : 'Field Offline Mode Active • Changes are queued safely in local cache'
                : language === 'ar'
                ? `الاتصال متاح • يوجد ${pendingSyncCount} تعديلات بانتظار المزامنة`
                : `Connected • ${pendingSyncCount} local actions waiting for cloud sync`}
            </span>
          </div>
          {isOnline && pendingSyncCount > 0 && (
            <button
              onClick={async () => {
                const count = await apiService.syncPendingQueue();
                setPendingSyncCount(apiService.getPendingSyncCount());
                showToast(
                  language === 'ar' ? `تمت مزامنة ${count} عمليات بنجاح!` : `Synced ${count} actions successfully!`,
                  'success'
                );
              }}
              className="px-2.5 py-1 rounded bg-amber-800 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer"
            >
              {language === 'ar' ? 'مزامنة الآن' : 'Sync Now'}
            </button>
          )}
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          language={language}
          viewMode={viewMode}
          isOpen={isSidebarOpen}
          onSelectView={setViewMode}
          onOpenItemModal={(key) => setActiveModalKey(key)}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-7">
          {/* Hero Console */}
          <HeroConsole language={language} />

          {/* 4 KPI Gauges */}
          <KpiGauges language={language} />

          {/* Section Heading, View Switcher & Advanced Filters */}
          <ViewControls
            language={language}
            viewMode={viewMode}
            onViewChange={setViewMode}
            onPrintReport={() => setIsPrintReportOpen(true)}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            riskFilter={riskFilter}
            onRiskFilterChange={setRiskFilter}
            contractorFilter={contractorFilter}
            onContractorFilterChange={setContractorFilter}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            totalResultsCount={Object.keys(items).length}
          />

          {/* Grid View or Registry Table */}
          {viewMode === 'grid' ? (
            <PermitCardsGrid
              language={language}
              items={items}
              searchQuery={searchQuery}
              onOpenModal={(key) => setActiveModalKey(key)}
              statusFilter={statusFilter}
              riskFilter={riskFilter}
              contractorFilter={contractorFilter}
            />
          ) : (
            <RegistryTable
              language={language}
              items={items}
              searchQuery={searchQuery}
              onOpenModal={(key) => setActiveModalKey(key)}
              statusFilter={statusFilter}
              riskFilter={riskFilter}
              contractorFilter={contractorFilter}
            />
          )}
        </main>
      </div>

      {/* Interactive Detail Modal with Gas Testing, AI & Sign-offs */}
      {activeModalItem && (
        <PermitModal
          language={language}
          item={activeModalItem}
          onClose={() => setActiveModalKey(null)}
          onSave={handleSaveItem}
          onShowToast={showToast}
          onAddNotification={handleAddNotification}
        />
      )}

      {/* ISO / OSHA Audit Modal with Live Compliance Engine & AI Summary */}
      <AuditModal
        language={language}
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onShowToast={showToast}
        permits={items}
      />

      {/* Printable Report View Modal */}
      <PrintReportView
        language={language}
        isOpen={isPrintReportOpen}
        items={items}
        onClose={() => setIsPrintReportOpen(false)}
      />

      {/* User Login & Role Switching Modal */}
      <UserLoginModal
        language={language}
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
