import React, { useState } from 'react';
import { LayoutGrid, Table, Printer, Filter, RotateCcw, Compass, Plus, Download, FileSpreadsheet, FileJson } from 'lucide-react';
import { Language, ViewMode } from '../types';

interface ViewControlsProps {
  language: Language;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onPrintReport: () => void;
  onOpenCreateModal: () => void;
  onExportData: (format: 'csv' | 'json') => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  riskFilter: string;
  onRiskFilterChange: (risk: string) => void;
  contractorFilter: string;
  onContractorFilterChange: (contractor: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalResultsCount: number;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  language,
  viewMode,
  onViewChange,
  onPrintReport,
  onOpenCreateModal,
  onExportData,
  statusFilter,
  onStatusFilterChange,
  riskFilter,
  onRiskFilterChange,
  contractorFilter,
  onContractorFilterChange,
  onResetFilters,
  hasActiveFilters,
  totalResultsCount,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="space-y-3 pb-3 border-b border-[#1c2b4c]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 status-pulse" />
            <span>
              {language === 'ar'
                ? 'تصاريح العمل الرئيسية المعتمدة لحقل الزبير'
                : 'Active Main Work Permits — Zubair Field'}
            </span>
          </h2>
          <span className="text-xs font-mono text-[#627d98] px-2 py-0.5 rounded bg-[#0b1324] border border-[#1c2b4c]">
            {totalResultsCount} {language === 'ar' ? 'تصاريح' : 'Permits'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Issue New Permit Action */}
          <button
            id="issue-new-permit-btn"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-lg shadow-cyan-950/40 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إصدار تصريح جديد' : 'Issue New Permit'}</span>
          </button>

          {/* View Switcher (Grid, Table, GIS Map) */}
          <div className="flex items-center rounded-lg bg-[#0b1324] border border-[#1c2b4c] p-0.5 shadow-inner">
            <button
              id="view-btn-grid"
              onClick={() => onViewChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'بطاقات فنية' : 'Card Grid'}</span>
            </button>

            <button
              id="view-btn-table"
              onClick={() => onViewChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'سجل الجدول' : 'Registry Table'}</span>
            </button>

            <button
              id="view-btn-map"
              onClick={() => onViewChange('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'خارطة المنشآت (GIS)' : 'GIS Field Map'}</span>
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#101b33] hover:bg-[#152445] text-slate-200 border border-[#1c2b4c] transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ar' ? 'تصدير' : 'Export'}</span>
            </button>

            {showExportMenu && (
              <div
                className={`absolute ${
                  language === 'ar' ? 'left-0' : 'right-0'
                } mt-2 w-44 rounded-xl bg-[#0e172e] border border-[#1c2b4c] shadow-2xl p-1.5 z-30 text-xs`}
              >
                <button
                  onClick={() => {
                    onExportData('csv');
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#152445] text-slate-300 text-left transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ar' ? 'تصدير CSV (Excel)' : 'Export CSV (Excel)'}</span>
                </button>
                <button
                  onClick={() => {
                    onExportData('json');
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#152445] text-slate-300 text-left transition cursor-pointer"
                >
                  <FileJson className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'ar' ? 'تصدير JSON (بيانات)' : 'Export JSON (Data)'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Print Report */}
          <button
            id="print-report-btn"
            onClick={onPrintReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#101b33] hover:bg-[#152445] text-slate-200 border border-[#1c2b4c] transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'ar' ? 'طباعة التقرير' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs bg-[#09101f] p-2.5 rounded-xl border border-[#1c2b4c]">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Filter className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'تصفية سريعة:' : 'Filter By:'}</span>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-2.5 py-1 rounded-lg bg-[#0b1324] border border-[#1c2b4c] text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="ALL">{language === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
          <option value="ACTIVE">{language === 'ar' ? 'نشط ميدانياً (ACTIVE)' : 'ACTIVE'}</option>
          <option value="APPROVED">{language === 'ar' ? 'معتمد (APPROVED)' : 'APPROVED'}</option>
          <option value="UNDER_REVIEW">{language === 'ar' ? 'قيد المراجعة (UNDER REVIEW)' : 'UNDER REVIEW'}</option>
          <option value="DRAFT">{language === 'ar' ? 'مسودة (DRAFT)' : 'DRAFT'}</option>
          <option value="SUSPENDED">{language === 'ar' ? 'موقوف أمنياً (SUSPENDED)' : 'SUSPENDED'}</option>
          <option value="ISOLATED">{language === 'ar' ? 'معزول LOTO' : 'ISOLATED'}</option>
          <option value="CLOSED">{language === 'ar' ? 'مغلق (CLOSED)' : 'CLOSED'}</option>
        </select>

        {/* Risk Level Filter */}
        <select
          value={riskFilter}
          onChange={(e) => onRiskFilterChange(e.target.value)}
          className="px-2.5 py-1 rounded-lg bg-[#0b1324] border border-[#1c2b4c] text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="ALL">{language === 'ar' ? 'كافة مستويات الخطورة' : 'All Risk Levels'}</option>
          <option value="CRITICAL RISK">CRITICAL RISK</option>
          <option value="HIGH RISK (CLASS A)">HIGH RISK (CLASS A)</option>
          <option value="HIGH RISK">HIGH RISK</option>
          <option value="MEDIUM RISK">MEDIUM RISK</option>
        </select>

        {/* Contractor Filter */}
        <select
          value={contractorFilter}
          onChange={(e) => onContractorFilterChange(e.target.value)}
          className="px-2.5 py-1 rounded-lg bg-[#0b1324] border border-[#1c2b4c] text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="ALL">{language === 'ar' ? 'كافة المقاولين' : 'All Contractors'}</option>
          <option value="Eni">Eni JV / Basra</option>
          <option value="Petrofac">Petrofac International</option>
          <option value="Sinopec">Sinopec Oilfield Service</option>
          <option value="Weatherford">Weatherford</option>
          <option value="Baker">Baker Hughes</option>
          <option value="Schlumberger">Schlumberger (SLB)</option>
        </select>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-600/40 hover:bg-rose-900 transition cursor-pointer text-xs font-bold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
