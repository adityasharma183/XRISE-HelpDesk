import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocketServerUrl(): string {
  const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (!rawApiUrl) {
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
  }
  // If rawApiUrl ends with /api, strip it for Socket.IO root server connection
  return rawApiUrl.replace(/\/api$/, '');
}

export function getAuthToken(): string | null {
  try {
    const rawStorage = localStorage.getItem('auth-storage');
    if (rawStorage) {
      const parsed = JSON.parse(rawStorage);
      return parsed?.state?.token || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function getSocket(): Socket {
  if (!socket) {
    const url = getSocketServerUrl();
    const token = getAuthToken();

    socket = io(url, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to real-time server:', socket?.id);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket.IO] Real-time connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from server:', reason);
    });
  }

  // Refresh auth token if user logged in after socket initialization
  const currentToken = getAuthToken();
  if (currentToken && socket.auth && typeof socket.auth === 'object') {
    (socket.auth as any).token = currentToken;
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
