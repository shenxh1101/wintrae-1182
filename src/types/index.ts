export type EventStatus = 'draft' | 'published' | 'registration_open' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type RegistrationStatus = 'pending' | 'confirmed' | 'waitlist' | 'cancelled' | 'checked_in' | 'no_show';
export type NotificationType = 'sms' | 'in_app' | 'email';
export type NotificationStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type CheckInMethod = 'qr_code' | 'manual' | 'walk_in';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'tel' | 'email';
  required: boolean;
  options?: string[];
  placeholder?: string;
  sortOrder: number;
}

export interface BookClubEvent {
  id: string;
  title: string;
  description: string;
  bookTitle?: string;
  bookAuthor?: string;
  coverImage?: string;
  status: EventStatus;
  startTime: string;
  endTime: string;
  location: string;
  maxCapacity: number;
  waitlistCapacity: number;
  currentConfirmed: number;
  currentWaitlist: number;
  cancelDeadlineHours: number;
  cancellationFeePercent: number;
  autoPromoteWaitlist: boolean;
  formFields: FormField[];
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  tags: string[];
  totalRegistrations: number;
  totalCheckIns: number;
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  participantId: string;
  status: RegistrationStatus;
  waitlistPosition?: number;
  signInCode: string;
  registrationFee?: number;
  customFields: Record<string, string>;
  registeredAt: string;
  cancelledAt?: string;
  cancelReason?: string;
  cancelFeeApplied?: boolean;
  cancelFeeAmount?: number;
  promotedFromWaitlistAt?: string;
}

export interface CheckInRecord {
  id: string;
  registrationId: string;
  eventId: string;
  participantId: string;
  checkedInAt: string;
  checkInMethod: CheckInMethod;
  operatorId?: string;
  codeUsed?: string;
}

export interface Notification {
  id: string;
  eventId?: string;
  type: NotificationType;
  title: string;
  content: string;
  templateId?: string;
  recipientFilters: {
    statuses?: RegistrationStatus[];
    tags?: string[];
  };
  scheduledAt?: string;
  status: NotificationStatus;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  sentAt?: string;
}

export interface BlacklistEntry {
  id: string;
  participantId: string;
  phone?: string;
  reason: string;
  blockedAt: string;
  expiresAt?: string;
  blockedBy: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  participantId: string;
  registrationId?: string;
  rating: number;
  content: string;
  keywords: string[];
  tags?: string[];
  suggestions?: string;
  wouldRecommend?: boolean;
  submittedAt: string;
}

export interface ParticipantTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  participantCount: number;
}
