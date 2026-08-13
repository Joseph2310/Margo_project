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
}

export interface DailyReading {
  id: string;
  date: string;
  reference: string;
  title: string;
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
}

export type SenderKind = 'beneficiary' | 'servant';
export type MessageKind = 'text' | 'image' | 'voice';

export interface ConversationMessage {
  id: string;
  sender: SenderKind;
  senderName: string;
  kind: MessageKind;
  content: string;
}

export interface Conversation {
  id: string;
  servantName: string;
  preview: string;
  messages: ConversationMessage[];
}

export interface SuggestionPayload {
  generalSuggestion: string;
  lessonSuggestion: string;
  hymnSuggestion: string;
  hymnRating: number;
  anonymous: boolean;
}
