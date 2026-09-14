import React from 'react';
import { LayoutGrid, Table, Printer, Filter, RotateCcw, AlertTriangle } from 'lucide-react';
import { Language, ViewMode, PTWStatus, RiskLevel } from '../types';

interface ViewControlsProps {
  language: Language;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onPrintReport: () => void;
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
          {/* View Switcher */}
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
          </div>

          {/* Print Report */}
          <button
            id="print-report-btn"
            onClick={onPrintReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#101b33] hover:bg-[#152445] text-slate-200 border border-[#1c2b4c] transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'ar' ? 'طباعة التقرير الشامل' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar (Item 8) */}
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
