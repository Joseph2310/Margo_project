export interface BeneficiaryProfile {
  id: string;
  name: string;
  birthDate: string;
  stage: string;
  address: string;
  phone: string;
  whatsapp: string;
  school: string;
  classSaintName: string;
  confessionFather?: string;
  talents: string[];
  email: string;
  points: number;
  attendanceQrValue: string;
  avatarUri?: string;
}

export interface BeneficiaryEvent {
  id: string;
  name: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  icon: string;
  startsAt: string;
  endsAt: string;
}

export interface DailyReading {
  id: string;
  date: string;
  reference: string;
  title: string;
  content?: string;
}

export interface SpiritualActivity {
  id: string;
  title: string;
  points?: number;
  description?: string;
}

export interface ReflectionLesson {
  id: string;
  date: string;
  title: string;
  points: string[];
  exercise: string;
  exercisePoints?: number;
  completed: boolean;
}

export interface QuestionCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export interface QuestionAnswer {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
}

export interface KnowMeQuestion {
  id: string;
  label: string;
  askedAt: string;
  isToday?: boolean;
  points: number;
  answered: boolean;
}

export type SenderKind = 'beneficiary' | 'servant';
export type MessageKind = 'text' | 'image' | 'voice';
export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read';
export type ConversationKind = 'direct' | 'house';

export interface ConversationMessage {
  id: string;
  sender: SenderKind;
  senderName: string;
  kind: MessageKind;
  content: string;
  createdAt: string;
  isMine: boolean;
  status: MessageDeliveryStatus;
  deliveredAt: string | null;
  readAt: string | null;
}

export interface Conversation {
  id: string;
  servantName: string;
  preview: string;
  messages: ConversationMessage[];
  status: 'active' | 'blocked' | 'deleted';
  kind: ConversationKind;
}

export interface SuggestionPayload {
  generalSuggestion: string;
  lessonSuggestion: string;
  hymnSuggestion: string;
  hymnRating: number;
  anonymous: boolean;
}

export interface HomeDashboard {
  profile: BeneficiaryProfile;
  upcomingEvents: BeneficiaryEvent[];
  dailyReading?: DailyReading;
  questionCategories: QuestionCategory[];
  knowMeQuestions: KnowMeQuestion[];
}

export interface RetreatSubmissionPayload {
  activityIds: string[];
  reflection?: string;
}

export interface QuestionProposalResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
}

export interface SendMessagePayload {
  conversationId?: string;
  content: string;
  kind: MessageKind;
  anonymous: boolean;
}

export interface SendMessageResponse {
  conversationId: string;
  message: ConversationMessage;
}

export interface MarkConversationReadResponse {
  updatedCount: number;
}

export interface SuggestionResponse {
  id: string;
  message: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}
