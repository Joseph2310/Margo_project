import { chatRealtimeService } from '../src/services/chatRealtimeService';

class FakeWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  readonly send = jest.fn();
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(readonly url: string) {
    FakeWebSocket.instances.push(this);
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  receive(event: object) {
    this.onmessage?.({ data: JSON.stringify(event) });
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  }

  loseConnection() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  }
}

describe('chatRealtimeService', () => {
  const nativeWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    jest.useFakeTimers();
    chatRealtimeService.disconnect();
    FakeWebSocket.instances = [];
    globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  });

  afterEach(() => {
    chatRealtimeService.disconnect();
    globalThis.WebSocket = nativeWebSocket;
    jest.useRealTimers();
  });

  test('authenticates, receives events, and reconnects after disconnection', () => {
    const listener = jest.fn();
    const unsubscribe = chatRealtimeService.subscribe(listener);
    chatRealtimeService.connect('access-token');

    const first = FakeWebSocket.instances[0];
    expect(first).toBeDefined();
    first?.open();
    expect(first?.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'authenticate', accessToken: 'access-token' }),
    );

    first?.receive({
      type: 'chat.connected',
      data: { connectedAt: '2026-08-22T12:00:00Z' },
    });
    expect(chatRealtimeService.getState()).toBe('connected');
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'chat.connected' }),
    );

    first?.loseConnection();
    expect(chatRealtimeService.getState()).toBe('reconnecting');
    jest.advanceTimersByTime(1_000);
    expect(FakeWebSocket.instances).toHaveLength(2);
    unsubscribe();
  });
});
