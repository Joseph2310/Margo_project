import type { ConversationMessage, MessageDeliveryStatus } from './business';

export type ChatConnectionState =
  'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface ChatConnectedEvent {
  type: 'chat.connected';
  data: { connectedAt: string };
}

export interface MessageCreatedEvent {
  type: 'message.created';
  data: { conversationId: string; message: ConversationMessage };
}

export interface MessageStatusEvent {
  type: 'message.status';
  data: {
    conversationId: string;
    messageId: string;
    status: MessageDeliveryStatus;
    deliveredAt: string | null;
    readAt: string | null;
  };
}

export interface ChatErrorEvent {
  type: 'chat.error';
  data: { code: string; message: string; fieldErrors?: Record<string, string> };
}

export interface PongEvent {
  type: 'pong';
  data: { timestamp: string };
}

export type ChatServerEvent =
  | ChatConnectedEvent
  | MessageCreatedEvent
  | MessageStatusEvent
  | ChatErrorEvent
  | PongEvent;
