export type SSEPayload = {
  /** The type of the event being sent */
  type: string;
  /** Additional data payload */
  data?: Record<string, unknown>;
  /** Timestamp of when the event was sent */
  timestamp: string;
  /** Optional metadata about the event */
  meta?: Record<string, unknown>;
};

export type SSEClient = {
  /** Unique identifier for the client */
  id: string;
  /** Controller for managing the stream */
  controller: ReadableStreamDefaultController;
  /** Last heartbeat timestamp */
  lastHeartbeat: number;
  /** Optional user ID if authenticated */
  userId?: string;
  /** Optional session ID */
  sessionId?: string;
  /** Optional metadata about the client */
  metadata?: Record<string, unknown>;
};

export type SSEEvent = {
  /** The type of SSE event */
  type: string;
  /** The payload being sent */
  payload: SSEPayload;
  /** Optional target client ID */
  targetClientId?: string;
  /** Optional target user ID */
  targetUserId?: string;
  /** Optional target session ID */
  targetSessionId?: string;
};

export type SSEConfig = {
  /** Heartbeat interval in milliseconds */
  heartbeatInterval: number;
  /** Maximum idle time before disconnecting */
  maxIdleTime: number;
  /** Maximum number of clients */
  maxClients: number;
  /** Optional logger function */
  logger?: (message: string, level: 'info' | 'error' | 'debug') => void;
};

export type SSEManager = {
  /** Connect a new client */
  connect: (userId?: string, sessionId?: string, metadata?: Record<string, unknown>) => SSEClient;
  /** Disconnect a client by ID */
  disconnect: (clientId: string) => void;
  /** Send an event to a specific client */
  sendToClient: (clientId: string, event: SSEEvent) => void;
  /** Send an event to all clients */
  broadcast: (event: SSEEvent) => void;
  /** Send an event to all clients of a specific user */
  sendToUser: (userId: string, event: SSEEvent) => void;
  /** Send an event to all clients of a specific session */
  sendToSession: (sessionId: string, event: SSEEvent) => void;
  /** Get client count */
  getClientCount: () => number;
  /** Get all connected clients */
  getClients: () => SSEClient[];
  /** Get client by ID */
  getClient: (clientId: string) => SSEClient | null;
};
