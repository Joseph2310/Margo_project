import { CHAT_WEBSOCKET_URL } from '../config/environment';
import type { ChatConnectionState, ChatServerEvent } from '../types/realtime';

type EventListener = (event: ChatServerEvent) => void;
type StateListener = (state: ChatConnectionState) => void;

const RECONNECT_DELAYS = [1_000, 2_000, 4_000, 8_000, 15_000] as const;
const HEARTBEAT_INTERVAL = 25_000;

class ChatRealtimeService {
  private socket?: WebSocket;
  private accessToken?: string;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private reconnectAttempt = 0;
  private stopped = true;
  private authenticationFailed = false;
  private state: ChatConnectionState = 'disconnected';
  private readonly eventListeners = new Set<EventListener>();
  private readonly stateListeners = new Set<StateListener>();

  getState(): ChatConnectionState {
    return this.state;
  }

  subscribe(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  subscribeToState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  connect(accessToken: string): void {
    if (
      this.accessToken === accessToken &&
      (this.socket?.readyState === WebSocket.OPEN ||
        this.socket?.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    this.closeSocket();
    this.accessToken = accessToken;
    this.stopped = false;
    this.authenticationFailed = false;
    this.reconnectAttempt = 0;
    this.openSocket();
  }

  reconnect(): void {
    if (!this.accessToken) return;
    this.closeSocket();
    this.stopped = false;
    this.authenticationFailed = false;
    this.reconnectAttempt = 0;
    this.openSocket();
  }

  disconnect(): void {
    this.stopped = true;
    this.authenticationFailed = false;
    this.reconnectAttempt = 0;
    this.closeSocket();
    this.setState('disconnected');
  }

  private openSocket(): void {
    if (this.stopped || !this.accessToken) return;
    this.clearReconnectTimer();
    this.setState(this.reconnectAttempt ? 'reconnecting' : 'connecting');

    const socket = new WebSocket(CHAT_WEBSOCKET_URL);
    this.socket = socket;

    socket.onopen = () => {
      if (this.socket !== socket || !this.accessToken) return;
      socket.send(
        JSON.stringify({ type: 'authenticate', accessToken: this.accessToken }),
      );
    };
    socket.onmessage = message => {
      if (this.socket !== socket || typeof message.data !== 'string') return;
      const event = this.parseEvent(message.data);
      if (!event) return;
      if (event.type === 'chat.connected') {
        this.reconnectAttempt = 0;
        this.setState('connected');
        this.startHeartbeat(socket);
      } else if (event.type === 'chat.error') {
        if (
          event.data.code === 'invalid_token' ||
          event.data.code === 'invalid_token_type' ||
          event.data.code === 'account_unavailable' ||
          event.data.code === 'authentication_required'
        ) {
          this.authenticationFailed = true;
          this.setState('error');
        }
      }
      this.eventListeners.forEach(listener => listener(event));
    };
    socket.onerror = () => {
      if (this.socket === socket) this.setState('error');
    };
    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.socket = undefined;
      this.stopHeartbeat();
      if (this.stopped || this.authenticationFailed) {
        this.setState(this.authenticationFailed ? 'error' : 'disconnected');
        return;
      }
      this.scheduleReconnect();
    };
  }

  private parseEvent(raw: string): ChatServerEvent | undefined {
    try {
      const event = JSON.parse(raw) as Partial<ChatServerEvent>;
      return typeof event.type === 'string' && event.data
        ? (event as ChatServerEvent)
        : undefined;
    } catch {
      return undefined;
    }
  }

  private scheduleReconnect(): void {
    const index = Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1);
    const delay = RECONNECT_DELAYS[index] ?? RECONNECT_DELAYS[0];
    this.reconnectAttempt += 1;
    this.setState('reconnecting');
    this.reconnectTimer = setTimeout(() => this.openSocket(), delay);
  }

  private startHeartbeat(socket: WebSocket): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket === socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = undefined;
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
  }

  private closeSocket(): void {
    this.clearReconnectTimer();
    this.stopHeartbeat();
    const socket = this.socket;
    this.socket = undefined;
    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      socket.close();
    }
  }

  private setState(state: ChatConnectionState): void {
    if (this.state === state) return;
    this.state = state;
    this.stateListeners.forEach(listener => listener(state));
  }
}

export const chatRealtimeService = new ChatRealtimeService();
