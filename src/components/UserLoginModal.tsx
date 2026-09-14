import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, KeyRound, Check, LogOut } from 'lucide-react';
import { Language, User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface UserLoginModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  language,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { currentUser, users, loginAs } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  if (!isOpen) return null;

  const handleSelectUser = (user: User) => {
    loginAs(user);
    onShowToast(
      language === 'ar'
        ? `تم تسجيل الدخول بنجاح بصلاحية: ${user.nameAr} (${user.role})`
        : `Logged in successfully as: ${user.name} (${user.role})`,
      'success'
    );
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = users.find(
      (u) => u.email.toLowerCase() === emailInput.trim().toLowerCase()
    );
    if (matched) {
      handleSelectUser(matched);
    } else {
      onShowToast(
        language === 'ar'
          ? 'البريد الإلكتروني غير مسجل في منظومة حقل الزبير!'
          : 'User email not found in ZFOD authorization register!',
        'error'
      );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-950 text-purple-300 border-purple-500/50';
      case 'HSE_OFFICER':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/50';
      case 'CONTRACTOR':
        return 'bg-amber-950 text-amber-300 border-amber-500/50';
      case 'AUDITOR':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500/50';
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 lg:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl bg-[#0b1324] border border-[#1c2b4c] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#101b33] to-[#0b1324] border-b border-[#1c2b4c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'ar' ? 'إدارة الهوية وتسجيل الدخول الرقمي' : 'User Authentication & Role Switcher'}
              </h3>
              <p className="text-xs text-[#9fb3c8] font-mono">
                ZFOD Enterprise Access Control • 4 Verified Operational Roles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#101b33] hover:bg-rose-900/80 text-slate-400 hover:text-white border border-[#1c2b4c] flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto bg-[#060b14] text-xs">
          {/* Current User Pill */}
          <div className="p-3.5 rounded-xl bg-[#101b33] border border-cyan-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{currentUser.avatar || '👤'}</div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-mono">
                  {language === 'ar' ? 'المستخدم الحالي النشط:' : 'Current Active User:'}
                </span>
                <span className="font-bold text-white text-sm">
                  {language === 'ar' ? currentUser.nameAr : currentUser.name}
                </span>
                <div className="text-[10px] text-cyan-300 font-mono">
                  Badge: {currentUser.badgeId} • {currentUser.email}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${getRoleBadge(currentUser.role)}`}>
              {currentUser.role}
            </span>
          </div>

          {/* Quick 1-Click Role Switcher */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">
              {language === 'ar' ? 'التبديل الفوري بين أدوار المنظومة الأربعة:' : 'Select Authorized Persona (1-Click Switch):'}
            </span>
            <div className="space-y-2">
              {users.map((user) => {
                const isSelected = currentUser.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-[#0b1324] border-[#1c2b4c] text-slate-300 hover:border-slate-500 hover:bg-[#101b33]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{user.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">
                            {language === 'ar' ? user.nameAr : user.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#9fb3c8] mt-0.5">
                          {language === 'ar' ? user.departmentAr : user.departmentEn}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {user.email} • ID: {user.badgeId}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Login Form */}
          <form onSubmit={handleCustomLogin} className="p-3.5 rounded-xl bg-[#0b1324] border border-[#1c2b4c] space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              {language === 'ar' ? 'أو تسجيل الدخول ببيانات معتمدة:' : 'Or Sign In with Corporate Email:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="email"
                placeholder="hse@zfod.iq"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#101b33] border border-[#1c2b4c] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              <span>{language === 'ar' ? 'تسجيل الدخول والتحقق' : 'Authenticate & Sign In'}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#101b33] border-t border-[#1c2b4c] flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">ZFOD-AUTH-RBAC-STRICT</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
