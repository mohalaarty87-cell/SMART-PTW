import { PTWItem, User, GasReading, SignatureEntry } from '../types';
import { INITIAL_PTW_DATA } from '../data/mockData';

const CACHE_KEY = 'zfod_smart_ptw_items';
const PENDING_SYNC_QUEUE_KEY = 'zfod_smart_ptw_pending_queue';

interface PendingMutation {
  id: string;
  type: 'UPDATE_PERMIT' | 'GAS_READING' | 'SIGN' | 'STATUS_CHANGE';
  permitKey: string;
  payload: any;
  timestamp: number;
}

class ApiService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Array<(online: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners();
        this.processPendingSync();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners();
      });
    }
  }

  public subscribeOnlineStatus(cb: (online: boolean) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.isOnline));
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Local Cache Helpers
  public getCachedPermits(): Record<string, PTWItem> {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read permits from cache', e);
    }
    return INITIAL_PTW_DATA;
  }

  public setCachedPermits(items: Record<string, PTWItem>) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to write permits to cache', e);
    }
  }

  // Queue mutations for offline resilience
  private queuePendingMutation(mutation: Omit<PendingMutation, 'id' | 'timestamp'>) {
    try {
      const existing: PendingMutation[] = JSON.parse(
        localStorage.getItem(PENDING_SYNC_QUEUE_KEY) || '[]'
      );
      existing.push({
        ...mutation,
        id: 'sync-' + Date.now() + Math.random().toString(36).substring(2, 6),
        timestamp: Date.now(),
      });
      localStorage.setItem(PENDING_SYNC_QUEUE_KEY, JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to queue offline mutation', err);
    }
  }

  public async processPendingSync(): Promise<number> {
    if (!this.isOnline) return 0;
    try {
      const existing: PendingMutation[] = JSON.parse(
        localStorage.getItem(PENDING_SYNC_QUEUE_KEY) || '[]'
      );
      if (existing.length === 0) return 0;

      let syncedCount = 0;
      const failed: PendingMutation[] = [];

      for (const m of existing) {
        try {
          if (m.type === 'UPDATE_PERMIT') {
            await fetch(`/api/permits/${m.permitKey}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(m.payload),
            });
            syncedCount++;
          } else if (m.type === 'GAS_READING') {
            await fetch(`/api/permits/${m.permitKey}/gas-reading`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(m.payload),
            });
            syncedCount++;
          } else if (m.type === 'SIGN') {
            await fetch(`/api/permits/${m.permitKey}/sign`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(m.payload),
            });
            syncedCount++;
          } else if (m.type === 'STATUS_CHANGE') {
            await fetch(`/api/permits/${m.permitKey}/status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(m.payload),
            });
            syncedCount++;
          }
        } catch (syncErr) {
          console.error('Sync error for item', m, syncErr);
          failed.push(m);
        }
      }

      localStorage.setItem(PENDING_SYNC_QUEUE_KEY, JSON.stringify(failed));
      return syncedCount;
    } catch (e) {
      console.error('Error processing pending sync queue', e);
      return 0;
    }
  }

  public syncPendingQueue(): Promise<number> {
    return this.processPendingSync();
  }

  public getPendingSyncCount(): number {
    try {
      const existing = JSON.parse(localStorage.getItem(PENDING_SYNC_QUEUE_KEY) || '[]');
      return Array.isArray(existing) ? existing.length : 0;
    } catch {
      return 0;
    }
  }

  // --- API CALLS ---

  public async fetchPermits(): Promise<Record<string, PTWItem>> {
    try {
      const response = await fetch('/api/permits');
      if (response.ok) {
        const data = await response.json();
        if (data.permits && Object.keys(data.permits).length > 0) {
          this.setCachedPermits(data.permits);
          return data.permits;
        }
      }
    } catch (err) {
      console.warn('Network request failed, serving from offline cache', err);
    }
    return this.getCachedPermits();
  }

  public getPermits(): Promise<Record<string, PTWItem>> {
    return this.fetchPermits();
  }

  public async savePermit(permit: PTWItem): Promise<PTWItem> {
    // Update local cache immediately (Optimistic UI)
    const cached = this.getCachedPermits();
    cached[permit.key] = permit;
    this.setCachedPermits(cached);

    if (!this.isOnline) {
      this.queuePendingMutation({
        type: 'UPDATE_PERMIT',
        permitKey: permit.key,
        payload: permit,
      });
      return permit;
    }

    try {
      const response = await fetch(`/api/permits/${permit.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permit),
      });
      if (response.ok) {
        const data = await response.json();
        return data.permit;
      }
    } catch (err) {
      console.warn('Failed to save to server, queued for sync', err);
      this.queuePendingMutation({
        type: 'UPDATE_PERMIT',
        permitKey: permit.key,
        payload: permit,
      });
    }
    return permit;
  }

  public async addGasReading(
    permitKey: string,
    reading: {
      time: string;
      lel: string;
      o2: string;
      h2s: string;
      co: string;
      tester: string;
      signature: string;
      user: User | null;
    }
  ): Promise<{
    reading: GasReading;
    permit: PTWItem;
    statusChanged: boolean;
    suspensionMessage?: string;
  }> {
    if (!this.isOnline) {
      // Local evaluation fallback
      const cached = this.getCachedPermits();
      const permit = cached[permitKey];
      if (!permit) throw new Error('Permit not found');

      const newReading: GasReading = {
        id: 'g-off-' + Date.now(),
        time: reading.time,
        lel: reading.lel,
        o2: reading.o2,
        h2s: reading.h2s,
        co: reading.co,
        tester: reading.tester,
        signature: reading.signature,
        status: 'SAFE',
      };

      permit.gasTests.push(newReading);
      this.setCachedPermits(cached);
      this.queuePendingMutation({
        type: 'GAS_READING',
        permitKey,
        payload: reading,
      });

      return { reading: newReading, permit, statusChanged: false };
    }

    const response = await fetch(`/api/permits/${permitKey}/gas-reading`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit gas reading');
    }

    const data = await response.json();
    // Update cache with fresh permit
    const cached = this.getCachedPermits();
    cached[permitKey] = data.permit;
    this.setCachedPermits(cached);

    return data;
  }

  public async signPermit(
    permitKey: string,
    roleIndex: number,
    user: User
  ): Promise<{ signature: SignatureEntry; permit: PTWItem }> {
    if (!this.isOnline) {
      const cached = this.getCachedPermits();
      const permit = cached[permitKey];
      if (!permit) throw new Error('Permit not found');

      const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      permit.signatures[roleIndex] = {
        ...permit.signatures[roleIndex],
        name: user.name,
        badgeId: user.badgeId,
        signedAt: now,
        status: 'DIGITALLY SIGNED',
        userId: user.id,
        userEmail: user.email,
      };

      this.setCachedPermits(cached);
      this.queuePendingMutation({
        type: 'SIGN',
        permitKey,
        payload: { roleIndex, user },
      });

      return { signature: permit.signatures[roleIndex], permit };
    }

    const response = await fetch(`/api/permits/${permitKey}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleIndex, user }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to sign permit');
    }

    const data = await response.json();
    const cached = this.getCachedPermits();
    cached[permitKey] = data.permit;
    this.setCachedPermits(cached);

    return data;
  }

  public async transitionStatus(
    permitKey: string,
    targetStatus: string,
    user: User,
    reason?: string
  ): Promise<PTWItem> {
    const response = await fetch(`/api/permits/${permitKey}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStatus, user, reason }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.errorAr || err.error || 'Status transition denied');
    }

    const data = await response.json();
    const cached = this.getCachedPermits();
    cached[permitKey] = data.permit;
    this.setCachedPermits(cached);

    return data.permit;
  }

  // --- GEMINI AI SERVICES ---

  public async analyzeWorkDescription(params: {
    description: string;
    location?: string;
    equipment?: string;
    permitType?: string;
  }): Promise<{
    suggestedRisk: string;
    recommendedChecklist: Array<{
      titleEn: string;
      titleAr: string;
      descEn: string;
      descAr: string;
    }>;
    specialPrecautionsEn: string;
    specialPrecautionsAr: string;
    requiredPPE: string[];
    gasTestingFrequencyEn?: string;
    gasTestingFrequencyAr?: string;
  }> {
    const response = await fetch('/api/ai/analyze-work', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'AI Hazard Analysis failed');
    }

    return response.json();
  }

  public async generateAuditSummary(): Promise<{
    executiveSummaryEn: string;
    executiveSummaryAr: string;
    keyFindingsEn: string[];
    keyFindingsAr: string[];
    complianceScore: number;
    source: string;
  }> {
    const response = await fetch('/api/ai/audit-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'AI Audit Summary failed');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
