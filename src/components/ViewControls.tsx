import React from 'react';
import { LayoutGrid, Table, Printer } from 'lucide-react';
import { Language, ViewMode } from '../types';

interface ViewControlsProps {
  language: Language;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onPrintReport: () => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  language,
  viewMode,
  onViewChange,
  onPrintReport,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1c2b4c]">
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
          ZFOD-LIVE
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

        {/* Print Summary Report */}
        <button
          id="btn-print-overview"
          onClick={onPrintReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101b33] hover:bg-[#152445] border border-[#1c2b4c] text-xs font-semibold text-slate-200 transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>{language === 'ar' ? 'طباعة التقرير الشامل' : 'Print System Report'}</span>
        </button>
      </div>
    </div>
  );
};
