import { EventEmitter } from "node:events";
import { Agent, WebSocket } from "undici";
import type { NotificationMessage } from "./notification";

export interface NotificationSocketOptions {
    /** Absolute path to the internal API unix socket. Defaults to `/var/run/cycle/api/api.sock`. */
    socketPath?: string;
    /** Auth token sent as the `x-cycle-token` header. Defaults to `process.env.CYCLE_API_TOKEN`. */
    token?: string;
    /** Reconnect automatically after an unexpected close. Defaults to `true`. */
    reconnect?: boolean;
    /** Base delay (ms) for exponential reconnect backoff. Defaults to `1000`. */
    reconnectBaseDelayMs?: number;
    /** Max delay (ms) for reconnect backoff. Defaults to `30000`. */
    reconnectMaxDelayMs?: number;
    /** Extra headers merged into the upgrade request. */
    headers?: Record<string, string>;
}

export interface NotificationSocketEventMap<T> {
    open: [];
    notification: [notification: T];
    raw: [data: string];
    error: [error: Error];
    close: [code: number, reason: string];
    reconnecting: [attempt: number, delayMs: number];
}

export interface NotificationSocket<T = NotificationMessage> {
    on<E extends keyof NotificationSocketEventMap<T>>(
        event: E,
        listener: (...args: NotificationSocketEventMap<T>[E]) => void,
    ): this;
    once<E extends keyof NotificationSocketEventMap<T>>(
        event: E,
        listener: (...args: NotificationSocketEventMap<T>[E]) => void,
    ): this;
    off<E extends keyof NotificationSocketEventMap<T>>(
        event: E,
        listener: (...args: NotificationSocketEventMap<T>[E]) => void,
    ): this;
    emit<E extends keyof NotificationSocketEventMap<T>>(
        event: E,
        ...args: NotificationSocketEventMap<T>[E]
    ): boolean;
}

/**
 * Connects to the internal API's one-way notification pipeline over the
 * local unix socket and re-emits each message as a typed event.
 *
 * @example
 * const sock = connectNotifications();
 * sock.on("notification", (n) => console.log(n.metadata.event, n.text));
 * sock.on("error", (err) => console.error(err));
 * // later...
 * sock.close();
 */
export class NotificationSocket<T = NotificationMessage> extends EventEmitter {
    private ws: WebSocket | null = null;
    private dispatcher: Agent | null = null;
    private closedByUser = false;
    private reconnectAttempts = 0;
    private reconnectTimer: NodeJS.Timeout | null = null;

    private readonly socketPath: string;
    private readonly path: string;
    private readonly host: string;
    private readonly token: string | undefined;
    private readonly autoReconnect: boolean;
    private readonly baseDelayMs: number;
    private readonly maxDelayMs: number;
    private readonly extraHeaders: Record<string, string>;

    constructor(options: NotificationSocketOptions = {}) {
        super();
        this.socketPath = options.socketPath ?? "/var/run/cycle/api/api.sock";
        this.path = "/v1/notifications";
        this.host = "unix";
        this.token = options.token ?? process.env.CYCLE_API_TOKEN;
        this.autoReconnect = options.reconnect ?? true;
        this.baseDelayMs = options.reconnectBaseDelayMs ?? 1_000;
        this.maxDelayMs = options.reconnectMaxDelayMs ?? 30_000;
        this.extraHeaders = options.headers ?? {};
    }

    connect(): this {
        if (this.ws) {
            return this;
        }

        this.closedByUser = false;

        const dispatcher = new Agent({
            connect: { socketPath: this.socketPath },
        });
        this.dispatcher = dispatcher;

        const headers: Record<string, string> = { ...this.extraHeaders };
        if (this.token) {
            headers["x-cycle-token"] = this.token;
        }

        const url = `ws://${this.host}${this.path}`;
        const ws = new WebSocket(url, { dispatcher, headers });
        this.ws = ws;

        ws.addEventListener("open", () => {
            this.reconnectAttempts = 0;
            this.emit("open");
        });

        ws.addEventListener("message", (ev) => {
            if (typeof ev.data !== "string") {
                this.emit(
                    "error",
                    new Error("received non-text notification frame"),
                );
                return;
            }

            const text = ev.data;
            this.emit("raw", text);

            let parsed: T;
            try {
                parsed = JSON.parse(text) as T;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : String(err);
                this.emit(
                    "error",
                    new Error(`failed to parse notification: ${message}`),
                );
                return;
            }

            this.emit("notification", parsed);
        });

        ws.addEventListener("error", (ev) => {
            const cause = (ev as { error?: unknown }).error;
            if (cause instanceof Error) {
                this.emit("error", cause);
                return;
            }
            this.emit("error", new Error("websocket error"));
        });

        ws.addEventListener("close", (ev) => {
            this.cleanupSocket();
            this.emit("close", ev.code, ev.reason);

            if (this.autoReconnect && !this.closedByUser) {
                this.scheduleReconnect();
            }
        });

        return this;
    }

    close(): void {
        this.closedByUser = true;

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            this.ws.close();
        }

        this.cleanupSocket();
    }

    get connected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    private cleanupSocket(): void {
        this.ws = null;

        if (this.dispatcher) {
            this.dispatcher.destroy().catch(() => undefined);
            this.dispatcher = null;
        }
    }

    private scheduleReconnect(): void {
        const attempt = ++this.reconnectAttempts;
        const delayMs = Math.min(
            this.baseDelayMs * 2 ** (attempt - 1),
            this.maxDelayMs,
        );

        this.emit("reconnecting", attempt, delayMs);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (!this.closedByUser) {
                this.connect();
            }
        }, delayMs);

        this.reconnectTimer.unref();
    }
}

export function connectNotifications<T = NotificationMessage>(
    options?: NotificationSocketOptions,
): NotificationSocket<T> {
    return new NotificationSocket<T>(options).connect();
}
