import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BookClubEvent,
  Participant,
  Registration,
  CheckInRecord,
  Notification,
  BlacklistEntry,
  Feedback,
  ParticipantTag,
  RegistrationStatus,
  CheckInMethod,
  EventStatus,
} from '../types';
import { mockData, uid } from '../utils/mockData';
import { generateSignInCode, formatTime } from '../utils/date';

interface AppState {
  events: BookClubEvent[];
  participants: Participant[];
  registrations: Registration[];
  checkIns: CheckInRecord[];
  notifications: Notification[];
  blacklist: BlacklistEntry[];
  feedbacks: Feedback[];
  tags: ParticipantTag[];

  getEvent: (id: string) => BookClubEvent | undefined;
  getEventRegistrations: (eventId: string) => Registration[];
  getEventCheckIns: (eventId: string) => CheckInRecord[];
  getEventFeedbacks: (eventId: string) => Feedback[];
  getEventNotifications: (eventId: string) => Notification[];
  getParticipant: (id: string) => Participant | undefined;
  isBlacklisted: (participantId: string) => boolean;

  createEvent: (data: Partial<BookClubEvent>) => string;
  duplicateEvent: (eventId: string) => string;
  updateEvent: (id: string, data: Partial<BookClubEvent>) => void;
  updateEventStatus: (id: string, status: EventStatus) => void;
  deleteEvent: (id: string) => void;

  addRegistration: (eventId: string, participantData: Partial<Participant> & { customFields: Record<string, string> }) => Registration | null;
  updateRegistrationStatus: (regId: string, status: RegistrationStatus, reason?: string) => void;
  promoteFromWaitlist: (regId: string) => void;
  evaluateCancelRule: (regId: string) => {
    allowed: boolean;
    freeCancel?: boolean;
    feeApplied?: boolean;
    feePercent?: number;
    hoursToEvent?: number;
    deadline?: number;
    message: string;
  };
  cancelRegistration: (regId: string, reason?: string) => any;
  bulkSetRegistrationTags?: any;

  checkIn: (eventId: string, identifier: string, method: CheckInMethod) => { success: boolean; participant?: Participant; message: string };
  manualCheckIn: (registrationId: string, method?: CheckInMethod, codeUsed?: string) => boolean;
  walkInCheckIn: (eventId: string, data: { name: string; phone: string; [k: string]: string }) => CheckInRecord | null;

  createNotification: (data: Partial<Notification>) => string;
  sendNotification: (id: string) => Promise<void>;

  addToBlacklist: (participantId: string, reason: string) => void;
  removeFromBlacklist: (entryId: string) => void;

  addTag: (name: string, color: string) => string;
  addParticipantTags: (participantId: string, tagIds: string[]) => void;
  removeParticipantTag: (participantId: string, tagId: string) => void;
  addFeedback: (data: {
    eventId: string;
    participantId: string;
    registrationId?: string;
    rating: number;
    content?: string;
    keywords?: string[];
    tags?: string[];
    suggestions?: string;
    wouldRecommend?: boolean;
  }) => void;
}

const STORAGE_KEY = 'book-club-store-v1';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      events: mockData.events,
      participants: mockData.participants,
      registrations: mockData.registrations,
      checkIns: mockData.checkIns,
      notifications: mockData.notifications,
      blacklist: mockData.blacklist,
      feedbacks: mockData.feedbacks,
      tags: mockData.tags,

      getEvent: (id) => get().events.find((e) => e.id === id),
      getEventRegistrations: (eventId) => get().registrations.filter((r) => r.eventId === eventId),
      getEventCheckIns: (eventId) => get().checkIns.filter((c) => c.eventId === eventId),
      getEventFeedbacks: (eventId) => get().feedbacks.filter((f) => f.eventId === eventId),
      getEventNotifications: (eventId) => get().notifications.filter((n) => n.eventId === eventId),
      getParticipant: (id) => get().participants.find((p) => p.id === id),
      isBlacklisted: (participantId) => get().blacklist.some((b) => b.participantId === participantId),

      createEvent: (data) => {
        const now = new Date().toISOString();
        const newEvent: BookClubEvent = {
          id: 'e_' + uid(),
          title: data.title || '未命名活动',
          description: data.description || '',
          bookTitle: data.bookTitle,
          bookAuthor: data.bookAuthor,
          coverImage: data.coverImage,
          status: data.status || 'draft',
          startTime: data.startTime || now,
          endTime: data.endTime || now,
          location: data.location || '',
          maxCapacity: data.maxCapacity || 30,
          waitlistCapacity: data.waitlistCapacity || 10,
          currentConfirmed: 0,
          currentWaitlist: 0,
          cancelDeadlineHours: data.cancelDeadlineHours ?? 24,
          cancellationFeePercent: data.cancellationFeePercent ?? 0,
          autoPromoteWaitlist: data.autoPromoteWaitlist ?? true,
          formFields: data.formFields || [],
          tags: data.tags || [],
          notes: data.notes || '',
          createdAt: now,
          updatedAt: now,
        };
        set({ events: [...get().events, newEvent] });
        return newEvent.id;
      },

      duplicateEvent: (eventId) => {
        const ev = get().getEvent(eventId);
        if (!ev) return '';
        const newId = get().createEvent({
          ...ev,
          title: ev.title + '（副本）',
          status: 'draft',
          startTime: new Date(Date.now() + 7 * 86400000).toISOString(),
          endTime: new Date(Date.now() + 7 * 86400000 + 2 * 3600000).toISOString(),
        });
        return newId;
      },

      updateEvent: (id, data) => {
        set({
          events: get().events.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
          ),
        });
      },

      updateEventStatus: (id, status) => {
        get().updateEvent(id, { status });
      },

      deleteEvent: (id) => {
        set({
          events: get().events.filter((e) => e.id !== id),
          registrations: get().registrations.filter((r) => r.eventId !== id),
          checkIns: get().checkIns.filter((c) => c.eventId !== id),
          feedbacks: get().feedbacks.filter((f) => f.eventId !== id),
        });
      },

      addRegistration: (eventId, participantData) => {
        const ev = get().getEvent(eventId);
        if (!ev) return null;
        const now = new Date().toISOString();

        let participant = get().participants.find(
          (p) => p.phone === participantData.phone || p.email === participantData.email
        );
        if (!participant) {
          participant = {
            id: 'p_' + uid(),
            name: participantData.name || '',
            phone: participantData.phone || '',
            email: participantData.email,
            tags: [],
            totalRegistrations: 0,
            totalCheckIns: 0,
            createdAt: now,
          };
          set({ participants: [...get().participants, participant] });
        }

        if (get().isBlacklisted(participant.id)) {
          return null;
        }

        const existing = get().registrations.find(
          (r) => r.eventId === eventId && r.participantId === participant!.id && r.status !== 'cancelled'
        );
        if (existing) return null;

        let status: RegistrationStatus;
        if (ev.currentConfirmed < ev.maxCapacity) {
          status = 'confirmed';
        } else if (ev.currentWaitlist < ev.waitlistCapacity) {
          status = 'waitlist';
        } else {
          return null;
        }

        const newReg: Registration = {
          id: 'r_' + uid(),
          eventId,
          participantId: participant.id,
          status,
          waitlistPosition: status === 'waitlist' ? ev.currentWaitlist + 1 : undefined,
          signInCode: generateSignInCode(eventId, participant.id),
          customFields: participantData.customFields,
          registeredAt: now,
        };

        set({
          registrations: [...get().registrations, newReg],
          participants: get().participants.map((p) =>
            p.id === participant!.id ? { ...p, totalRegistrations: p.totalRegistrations + 1 } : p
          ),
          events: get().events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  currentConfirmed: status === 'confirmed' ? e.currentConfirmed + 1 : e.currentConfirmed,
                  currentWaitlist: status === 'waitlist' ? e.currentWaitlist + 1 : e.currentWaitlist,
                }
              : e
          ),
        });
        return newReg;
      },

      updateRegistrationStatus: (regId, status, reason) => {
        const reg = get().registrations.find((r) => r.id === regId);
        if (!reg) return;
        const ev = get().getEvent(reg.eventId);
        if (!ev) return;
        const now = new Date().toISOString();

        const updates: Partial<Registration> = { status };
        if (status === 'cancelled') {
          updates.cancelledAt = now;
          updates.cancelReason = reason;
        }

        set({
          registrations: get().registrations.map((r) =>
            r.id === regId ? { ...r, ...updates } : r
          ),
          events: get().events.map((e) => {
            if (e.id !== reg.eventId) return e;
            let cc = e.currentConfirmed;
            let cw = e.currentWaitlist;
            if (reg.status === 'confirmed' && status !== 'confirmed' && status !== 'checked_in') cc--;
            if (reg.status === 'waitlist' && status !== 'waitlist') cw--;
            if (status === 'confirmed') cc++;
            if (status === 'waitlist') cw++;
            return { ...e, currentConfirmed: cc, currentWaitlist: cw };
          }),
        });

        if (status === 'cancelled' && ev.autoPromoteWaitlist && reg.status === 'confirmed') {
          const nextWait = get()
            .getEventRegistrations(reg.eventId)
            .filter((r) => r.status === 'waitlist')
            .sort((a, b) => (a.waitlistPosition || 0) - (b.waitlistPosition || 0))[0];
          if (nextWait) {
            setTimeout(() => get().promoteFromWaitlist(nextWait.id), 100);
          }
        }
      },

      evaluateCancelRule: (regId) => {
        const reg = get().registrations.find((r) => r.id === regId);
        if (!reg) return { allowed: false, message: '报名记录不存在' };
        const ev = get().getEvent(reg.eventId);
        if (!ev) return { allowed: false, message: '活动不存在' };
        if (reg.status === 'cancelled') return { allowed: false, message: '该报名已取消' };
        if (reg.status === 'checked_in') return { allowed: false, message: '已签到，无法取消' };

        const nowTs = Date.now();
        const eventStartTs = new Date(ev.startTime).getTime();
        const hoursToEvent = (eventStartTs - nowTs) / (1000 * 60 * 60);
        const deadline = ev.cancelDeadlineHours || 0;

        if (hoursToEvent <= 0) {
          return {
            allowed: true,
            freeCancel: false,
            feeApplied: true,
            feePercent: ev.cancellationFeePercent ?? 100,
            hoursToEvent,
            deadline,
            message: `活动已开始/结束，按规则将扣除${ev.cancellationFeePercent ?? 100}%费用作为违约金`,
          };
        }

        if (hoursToEvent < deadline) {
          return {
            allowed: true,
            freeCancel: false,
            feeApplied: ev.cancellationFeePercent > 0,
            feePercent: ev.cancellationFeePercent ?? 0,
            hoursToEvent,
            deadline,
            message: `距活动开始不足${deadline}小时，按规则扣除${ev.cancellationFeePercent ?? 0}%违约金（实际${hoursToEvent.toFixed(1)}小时）`,
          };
        }

        return {
          allowed: true,
          freeCancel: true,
          feeApplied: false,
          feePercent: 0,
          hoursToEvent,
          deadline,
          message: `距活动开始还有${hoursToEvent.toFixed(1)}小时，在免费取消时限（${deadline}小时）内，可全额退款`,
        };
      },

      cancelRegistration: (regId, reason) => {
        const rule = get().evaluateCancelRule(regId);
        if (!rule.allowed) return rule;
        const reg = get().registrations.find((r) => r.id === regId)!;
        const ev = get().getEvent(reg.eventId)!;
        const now = new Date().toISOString();

        const updates: Partial<Registration> = {
          status: 'cancelled' as const,
          cancelledAt: now,
          cancelReason: reason,
          cancelFeeApplied: rule.feeApplied,
          cancelFeeAmount: rule.feeApplied ? (reg.registrationFee ?? 0) * (rule.feePercent / 100) : 0,
        };

        set({
          registrations: get().registrations.map((r) => (r.id === regId ? { ...r, ...updates } : r)),
          events: get().events.map((e) => {
            if (e.id !== reg.eventId) return e;
            let cc = e.currentConfirmed;
            let cw = e.currentWaitlist;
            if (reg.status === 'confirmed') cc--;
            if (reg.status === 'waitlist') cw--;
            return { ...e, currentConfirmed: cc, currentWaitlist: cw };
          }),
        });

        if (ev.autoPromoteWaitlist && reg.status === 'confirmed') {
          const nextWait = get()
            .getEventRegistrations(reg.eventId)
            .filter((r) => r.status === 'waitlist')
            .sort((a, b) => (a.waitlistPosition || 0) - (b.waitlistPosition || 0))[0];
          if (nextWait) {
            setTimeout(() => get().promoteFromWaitlist(nextWait.id), 100);
          }
        }

        return {
          ...rule,
          applied: true,
          message: rule.feeApplied
            ? `取消成功，扣除${rule.feePercent}%违约金：已按${rule.message}`
            : `取消成功，${rule.message}`,
        };
      },

      promoteFromWaitlist: (regId) => {
        const reg = get().registrations.find((r) => r.id === regId);
        if (!reg || reg.status !== 'waitlist') return;
        const ev = get().getEvent(reg.eventId);
        if (!ev || ev.currentConfirmed >= ev.maxCapacity) return;
        set({
          registrations: get().registrations.map((r) =>
            r.id === regId
              ? { ...r, status: 'confirmed', waitlistPosition: undefined, promotedFromWaitlistAt: new Date().toISOString() }
              : r
          ),
          events: get().events.map((e) =>
            e.id === reg.eventId
              ? { ...e, currentConfirmed: e.currentConfirmed + 1, currentWaitlist: e.currentWaitlist - 1 }
              : e
          ),
        });
      },

      checkIn: (eventId, identifier, method) => {
        const phone = identifier.replace(/\D/g, '');
        const ev = get().getEvent(eventId);
        if (!ev) return { success: false, message: '活动不存在' };
        const regs = get().getEventRegistrations(eventId);
        const isCode = /^\d{6}$/.test(identifier.trim());

        let matchedReg: Registration | undefined;
        let participant: Participant | undefined;

        if (isCode) {
          matchedReg = regs.find((r) => r.signInCode === identifier.trim());
          if (matchedReg) {
            participant = get().getParticipant(matchedReg.participantId);
          }
        }

        if (!matchedReg) {
          participant = get().participants.find(
            (p) => p.phone === identifier || p.phone === phone || p.name === identifier || p.id === identifier
          );
          if (participant) {
            matchedReg = regs.find((r) => r.participantId === participant!.id);
          }
        }

        if (!participant) {
          if (isCode) return { success: false, message: '签到码错误，请核对后重试' };
          return { success: false, message: '未找到该参与者，可选择现场登记' };
        }
        if (!matchedReg) {
          return { success: false, participant, message: '该用户未报名本次活动' };
        }
        const existing = get().checkIns.find((c) => c.registrationId === matchedReg!.id);
        if (existing) {
          return {
            success: false,
            participant,
            message: isCode
              ? `该签到码已使用过（${formatTime(existing.checkedInAt)}已签到）`
              : '该用户已签到，请勿重复操作',
          };
        }
        if (matchedReg.status === 'cancelled') {
          return { success: false, participant, message: '报名已取消' };
        }
        if (matchedReg.status === 'waitlist') {
          return {
            success: false,
            participant,
            message: '目前仍为候补状态，如有空位将自动补位，暂无法签到',
          };
        }
        const usedCode = isCode ? identifier.trim() : undefined;
        get().manualCheckIn(matchedReg.id, method, usedCode);
        return {
          success: true,
          participant,
          message: `欢迎 ${participant.name}，签到成功！座位号 ${(regs.indexOf(matchedReg!) % 30) + 1}`,
        };
      },

      manualCheckIn: (registrationId, method = 'manual', codeUsed?: string) => {
        const reg = get().registrations.find((r) => r.id === registrationId);
        if (!reg) return false;
        const existing = get().checkIns.find((c) => c.registrationId === registrationId);
        if (existing) return false;
        const record: CheckInRecord = {
          id: 'c_' + uid(),
          registrationId,
          eventId: reg.eventId,
          participantId: reg.participantId,
          checkedInAt: new Date().toISOString(),
          checkInMethod: method,
          codeUsed,
        };
        set({
          checkIns: [...get().checkIns, record],
          registrations: get().registrations.map((r) =>
            r.id === registrationId ? { ...r, status: 'checked_in' } : r
          ),
          participants: get().participants.map((p) =>
            p.id === reg.participantId ? { ...p, totalCheckIns: p.totalCheckIns + 1 } : p
          ),
        });
        return true;
      },

      walkInCheckIn: (eventId, data) => {
        const ev = get().getEvent(eventId);
        if (!ev) return null;
        const now = new Date().toISOString();
        let participant = get().participants.find((p) => p.phone === data.phone);
        if (!participant) {
          participant = {
            id: 'p_' + uid(),
            name: data.name,
            phone: data.phone,
            email: data.email,
            tags: [],
            totalRegistrations: 0,
            totalCheckIns: 0,
            createdAt: now,
          };
          set({ participants: [...get().participants, participant] });
        }
        const regId = 'r_walk_' + uid();
        set({
          registrations: [
            ...get().registrations,
            {
              id: regId,
              eventId,
              participantId: participant.id,
              status: 'checked_in',
              signInCode: generateSignInCode(eventId, participant.id),
              customFields: data,
              registeredAt: now,
            },
          ],
        });
        const record: CheckInRecord = {
          id: 'c_' + uid(),
          registrationId: regId,
          eventId,
          participantId: participant.id,
          checkedInAt: now,
          checkInMethod: 'walk_in',
        };
        set({
          checkIns: [...get().checkIns, record],
          participants: get().participants.map((p) =>
            p.id === participant!.id ? { ...p, totalCheckIns: p.totalCheckIns + 1 } : p
          ),
        });
        return record;
      },

      createNotification: (data) => {
        const n: Notification = {
          id: 'n_' + uid(),
          eventId: data.eventId,
          type: data.type || 'in_app',
          title: data.title || '',
          content: data.content || '',
          recipientFilters: data.recipientFilters || {},
          status: data.status || 'draft',
          totalRecipients: data.totalRecipients || 0,
          sentCount: 0,
          failedCount: 0,
          createdAt: new Date().toISOString(),
        };
        set({ notifications: [...get().notifications, n] });
        return n.id;
      },

      sendNotification: async (id) => {
        const n = get().notifications.find((x) => x.id === id);
        if (!n) return;
        set({
          notifications: get().notifications.map((x) =>
            x.id === id ? { ...x, status: 'sending', sentCount: 0 } : x
          ),
        });
        const total = n.totalRecipients;
        for (let i = 1; i <= total; i++) {
          await new Promise((r) => setTimeout(r, 30));
          const failed = Math.random() < 0.02;
          set({
            notifications: get().notifications.map((x) =>
              x.id === id
                ? {
                    ...x,
                    sentCount: failed ? x.sentCount : x.sentCount + 1,
                    failedCount: failed ? x.failedCount + 1 : x.failedCount,
                  }
                : x
            ),
          });
        }
        set({
          notifications: get().notifications.map((x) =>
            x.id === id ? { ...x, status: 'sent', sentAt: new Date().toISOString() } : x
          ),
        });
      },

      addToBlacklist: (participantId, reason) => {
        if (get().isBlacklisted(participantId)) return;
        set({
          blacklist: [
            ...get().blacklist,
            {
              id: 'b_' + uid(),
              participantId,
              reason,
              blockedAt: new Date().toISOString(),
              blockedBy: '店员',
            },
          ],
        });
      },

      removeFromBlacklist: (entryId) => {
        set({ blacklist: get().blacklist.filter((b) => b.id !== entryId) });
      },

      addTag: (name, color) => {
        const t: ParticipantTag = {
          id: 't_' + uid(),
          name,
          color,
          participantCount: 0,
        };
        set({ tags: [...get().tags, t] });
        return t.id;
      },

      addParticipantTags: (participantId, tagIds) => {
        set({
          participants: get().participants.map((p) => {
            if (p.id !== participantId) return p;
            const merged = Array.from(new Set([...p.tags, ...tagIds]));
            return { ...p, tags: merged };
          }),
          tags: get().tags.map((t) => {
            if (!tagIds.includes(t.id)) return t;
            return { ...t, participantCount: t.participantCount + 1 };
          }),
        });
      },

      removeParticipantTag: (participantId, tagId) => {
        set({
          participants: get().participants.map((p) =>
            p.id === participantId ? { ...p, tags: p.tags.filter((t) => t !== tagId) } : p
          ),
          tags: get().tags.map((t) =>
            t.id === tagId ? { ...t, participantCount: Math.max(0, t.participantCount - 1) } : t
          ),
        });
      },

      addFeedback: (data) => {
        set({
          feedbacks: [
            ...get().feedbacks,
            {
              id: 'fb_' + uid(),
              eventId: data.eventId,
              participantId: data.participantId,
              registrationId: data.registrationId,
              rating: data.rating,
              content: data.content || '',
              keywords: data.keywords || data.tags || [],
              tags: data.tags,
              suggestions: data.suggestions,
              wouldRecommend: data.wouldRecommend,
              submittedAt: new Date().toISOString(),
            },
          ],
        });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        events: state.events,
        participants: state.participants,
        registrations: state.registrations,
        checkIns: state.checkIns,
        notifications: state.notifications,
        blacklist: state.blacklist,
        feedbacks: state.feedbacks,
        tags: state.tags,
      }),
    }
  )
);
