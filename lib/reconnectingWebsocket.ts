export type MessageHandler = (ev: MessageEvent) => void;
export type OpenHandler = () => void;
export type CloseHandler = (ev?: CloseEvent) => void;
export type ErrorHandler = (ev?: Event) => void;

export default class ReconnectingWebSocket {
  private url: string;
  private ws: WebSocket | null = null;
  private queue: string[] = [];
  private reconnectDelay = 1000;
  private shouldReconnect = true;
  private reconnectTimer: number | null = null;

  // public event handlers users can set
  public onopen?: OpenHandler;
  public onmessage?: MessageHandler;
  public onclose?: CloseHandler;
  public onerror?: ErrorHandler;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);
  } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      // flush queued messages
      while (this.queue.length && this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(this.queue.shift()!);
  } catch {
          // if send fails, re-queue and break
          this.queue.unshift(this.queue.shift()!);
          break;
        }
      }
      this.reconnectDelay = 1000;
      if (this.onopen) this.onopen();
    };

    this.ws.onmessage = (ev) => {
      if (this.onmessage) this.onmessage(ev);
    };

    this.ws.onclose = (ev) => {
      if (this.onclose) this.onclose(ev);
      if (this.shouldReconnect) this.scheduleReconnect();
    };

    this.ws.onerror = (ev) => {
      if (this.onerror) this.onerror(ev);
      // close socket to trigger reconnect flow
      try { this.ws?.close(); } catch {}
    };
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) return;
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectDelay = Math.min(30000, Math.round(this.reconnectDelay * 1.5));
      this.connect();
    }, this.reconnectDelay) as unknown as number;
  }

  send(payload: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(payload);
        return;
    } catch {
        // fallthrough to queue
      }
    }
    // queue if not open
    this.queue.push(payload);
  }

  close() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    try { this.ws?.close(); } catch {}
    this.ws = null;
  }

  // expose readyState similar to WebSocket
  get readyState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }
}
