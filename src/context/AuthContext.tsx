import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/users';

interface AuthContextType {
  currentUser: User;
  users: User[];
  loginAs: (user: User) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  canApprovePermit: () => boolean;
  canCreatePermit: () => boolean;
  canSignOff: (roleSlotEn: string) => boolean;
  isAuditor: boolean;
}

const AUTH_STORAGE_KEY = 'zfod_smart_ptw_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved user', e);
    }
    // Default to HSE Officer (Ammar Al-Haidari) as shown in reference design
    return INITIAL_USERS[0];
  });

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('Failed to save user to storage', e);
    }
  }, [currentUser]);

  const loginAs = (user: User) => {
    setCurrentUser(user);
  };

  const switchRole = (role: UserRole) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(targetUser);
  };

  const logout = () => {
    // Revert to Auditor (read-only default)
    setCurrentUser(INITIAL_USERS[3]);
  };

  const canApprovePermit = (): boolean => {
    return currentUser.role === 'HSE_OFFICER' || currentUser.role === 'ADMIN';
  };

  const canCreatePermit = (): boolean => {
    return currentUser.role !== 'AUDITOR';
  };

  const canSignOff = (roleSlotEn: string): boolean => {
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'AUDITOR') return false;

    const lower = roleSlotEn.toLowerCase();
    if (currentUser.role === 'HSE_OFFICER' && (lower.includes('hse') || lower.includes('safety') || lower.includes('authority'))) {
      return true;
    }
    if (currentUser.role === 'CONTRACTOR' && (lower.includes('contractor') || lower.includes('supervisor') || lower.includes('performer'))) {
      return true;
    }
    return currentUser.role === 'HSE_OFFICER';
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users: INITIAL_USERS,
        loginAs,
        switchRole,
        logout,
        canApprovePermit,
        canCreatePermit,
        canSignOff,
        isAuditor: currentUser.role === 'AUDITOR',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
