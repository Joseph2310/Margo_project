import type { Conversation, MessageKind } from '../types/business';

export interface SendMessagePayload {
  conversationId?: string;
  content: string;
  kind: MessageKind;
  anonymous: boolean;
}

export interface ConversationsService {
  getConversations(): Promise<Conversation[]>;
  sendMessage(payload: SendMessagePayload): Promise<void>;
  deleteConversation(conversationId: string): Promise<void>;
  blockServant(conversationId: string): Promise<void>;
}
