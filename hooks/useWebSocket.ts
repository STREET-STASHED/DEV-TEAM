import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  shouldReconnect?: boolean;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

const defaultOptions: Required<WebSocketOptions> = {
  url: '',
  protocols: [],
  onOpen: () => {},
  onMessage: () => {},
  onClose: () => {},
  onError: () => {},
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  shouldReconnect: true,
};

export function useWebSocket(options: WebSocketOptions) {
  const config = { ...defaultOptions, ...options };
  
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(config.shouldReconnect);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      wsRef.current = new WebSocket(config.url, config.protocols);

      wsRef.current.onopen = (event) => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        }));
        reconnectAttemptsRef.current = 0;
        config.onOpen(event);
      };

      wsRef.current.onmessage = (event) => {
        config.onMessage(event);
      };

      wsRef.current.onclose = (event) => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
        config.onClose(event);

        // Attempt to reconnect if not a clean close and shouldReconnect is true
        if (
          !event.wasClean &&
          shouldReconnectRef.current &&
          reconnectAttemptsRef.current < config.maxReconnectAttempts
        ) {
          reconnectTimeoutRef.current = setTimeout(
            () => {
              reconnectAttemptsRef.current++;
              setState(prev => ({
                ...prev,
                reconnectAttempts: reconnectAttemptsRef.current,
              }));
              connect();
            },
            config.reconnectInterval
          );
        }
      };

      wsRef.current.onerror = (event) => {
        setState(prev => ({
          ...prev,
          error: 'WebSocket error occurred',
          isConnecting: false,
        }));
        config.onError(event);
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect',
        isConnecting: false,
      }));
    }
  }, [config]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0,
    }));
    reconnectAttemptsRef.current = 0;
  }, []);

  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    } else {
      throw new Error('WebSocket is not connected');
    }
  }, []);

  const sendJson = useCallback((data: any) => {
    send(JSON.stringify(data));
  }, [send]);

  // Update shouldReconnect when options change
  useEffect(() => {
    shouldReconnectRef.current = config.shouldReconnect;
  }, [config.shouldReconnect]);

  // Connect on mount
  useEffect(() => {
    if (config.url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [config.url, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    send,
    sendJson,
    ws: wsRef.current,
  };
}
