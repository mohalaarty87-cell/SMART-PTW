import React, { useState, useEffect } from 'react';
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
import { ToastContainer } from './components/Toast';
import { INITIAL_PTW_DATA } from './data/mockData';
import { Language, ViewMode, PTWItem, ToastMessage } from './types';

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeModalKey, setActiveModalKey] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load persisted items or fallback to initial data
  const [items, setItems] = useState<Record<string, PTWItem>>(() => {
    try {
      const saved = localStorage.getItem('zfod_smart_ptw_items');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved items', e);
    }
    return INITIAL_PTW_DATA;
  });

  // Keep dir and lang in sync with documentElement
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Persist items
  const handleSaveItem = (updatedItem: PTWItem) => {
    setItems((prev) => {
      const updated = { ...prev, [updatedItem.key]: updatedItem };
      try {
        localStorage.setItem('zfod_smart_ptw_items', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      return updated;
    });
  };

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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

  const handleAutoFillData = () => {
    setItems(INITIAL_PTW_DATA);
    try {
      localStorage.setItem('zfod_smart_ptw_items', JSON.stringify(INITIAL_PTW_DATA));
    } catch (e) {
      console.error(e);
    }
    showToast(
      language === 'ar'
        ? '⚡ تم تحديث ومزامنة بيانات حقل الزبير النموذجية لكافة التصاريح!'
        : '⚡ ZFOD operational dataset synchronized and updated!',
      'success'
    );
  };

  const activeModalItem = activeModalKey ? items[activeModalKey] : null;

  return (
    <div className="bg-[#060b14] text-slate-100 min-h-screen flex flex-col font-sans relative selection:bg-cyan-500 selection:text-black">
      {/* Ambient Backdrop matching reference design */}
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
      />

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

          {/* Section Heading & View Switcher */}
          <ViewControls
            language={language}
            viewMode={viewMode}
            onViewChange={setViewMode}
            onPrintReport={() => setIsPrintReportOpen(true)}
          />

          {/* Grid View or Registry Table */}
          {viewMode === 'grid' ? (
            <PermitCardsGrid
              language={language}
              items={items}
              searchQuery={searchQuery}
              onOpenModal={(key) => setActiveModalKey(key)}
            />
          ) : (
            <RegistryTable
              language={language}
              items={items}
              searchQuery={searchQuery}
              onOpenModal={(key) => setActiveModalKey(key)}
            />
          )}
        </main>
      </div>

      {/* Interactive Detail Modal */}
      {activeModalItem && (
        <PermitModal
          language={language}
          item={activeModalItem}
          onClose={() => setActiveModalKey(null)}
          onSave={handleSaveItem}
          onShowToast={showToast}
        />
      )}

      {/* ISO / OSHA Audit Modal */}
      <AuditModal
        language={language}
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Printable Report View Modal */}
      <PrintReportView
        language={language}
        isOpen={isPrintReportOpen}
        items={items}
        onClose={() => setIsPrintReportOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
