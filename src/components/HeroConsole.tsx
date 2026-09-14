import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface HeroConsoleProps {
  language: Language;
}

export const HeroConsole: React.FC<HeroConsoleProps> = ({ language }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0b1324] via-[#101b33] to-[#0b1324] border border-[#1c2b4c] shadow-xl p-6 lg:p-8">
      {/* Top Accent Gradient Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-blue-600" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>
              {language === 'ar'
                ? 'هيئة تشغيل حقل الزبير — ZUBAIR FIELD OPERATING DIVISION (ZFOD)'
                : 'ZUBAIR FIELD OPERATING DIVISION (ZFOD) — SAFETY MANAGEMENT'}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
            <span>{language === 'ar' ? 'منظومة تصاريح العمل الذكية' : 'Smart Permit To Work (PTW)'}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              {language === 'ar' ? ' للسلامة الصناعية (HSE)' : ' Industrial Safety & HSE System'}
            </span>
          </h1>

          <p className="text-sm text-[#9fb3c8] leading-relaxed">
            {language === 'ar'
              ? 'المنصة الموحدة لإصدار وتدقيق وتتبع تصاريح العمل الساخنة والباردة والإشعاعية وشهادات العزل الميكانيكي والكهربائي، وفق الاشتراطات الصارمة لمنشآت النفط والغاز ومعايير OSHA 1910.119 و ISO 45001.'
              : 'Enterprise digital platform for issuing, reviewing, and tracking Hot, Cold, and Radiography work permits and isolation certificates strictly aligned with OSHA 1910.119 & ISO 45001.'}
          </p>
        </div>

        {/* Metadata Spec Strip */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#060b14]/90 border border-[#1c2b4c] font-mono text-xs w-full lg:w-auto shrink-0 shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#627d98] uppercase">
              {language === 'ar' ? 'الموقع / الحقل' : 'SITE / FIELD'}
            </span>
            <span className="text-cyan-400 font-bold">ZUB-SITE-01 (Mishrif)</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-[#627d98] uppercase">
              {language === 'ar' ? 'معيار التصريح' : 'STANDARD CODE'}
            </span>
            <span className="text-emerald-400 font-bold">ZFOD-PTW-2026</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-[#627d98] uppercase">
              {language === 'ar' ? 'الوردية الحالية' : 'CURRENT SHIFT'}
            </span>
            <span className="text-amber-400 font-bold">Day Shift (06:00-18:00)</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-[#627d98] uppercase">
              {language === 'ar' ? 'رئيس السلامة المناوب' : 'DUTY HSE LEAD'}
            </span>
            <span className="text-slate-200 font-bold">ZFOD / Lead HSE Auth.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
