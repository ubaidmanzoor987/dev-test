import { useEffect, useRef, useCallback, useMemo } from 'react';

type EventHandler = (data: any) => void;

interface UseSSEReturn {
  clientId: string | null;
  isConnected: boolean;
  sendMessage: (event: string, data: any) => Promise<boolean>;
  disconnect: () => void;
}

interface UseSSEOptions {
  headers?: Record<string, string>;
  userId?: any
}


export function useSSE(
  url: string,
  onEvent?: (event: string, data: any) => void,
  onConnect?: (clientId: string) => void,
  onError?: (error: Event) => void,
  onDisconnect?: () => void,
  options: UseSSEOptions = {}
): UseSSEReturn {
  const eventSourceRef = useRef<EventSource | null>(null);
  const clientIdRef = useRef<string | null>(null);
  const isConnectedRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>(null);
  const eventHandlersRef = useRef<Map<string, EventHandler[]>>(new Map());

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 1000; // 1 second

  // Initialize client ID
  useEffect(() => {
    clientIdRef.current = `client-${options.userId}`;  // Add the 'client-' prefix
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [options.userId]); 
  useEffect(() => {
    clientIdRef.current = `client-${options.userId}`;  // Add the 'client-' prefix
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []); 

  // const connect = useCallback(() => {
  //   if (eventSourceRef.current) {
  //     console.log('SSE: Connection already exists, skipping new connection');
  //     return;
  //   }

  //   if (!clientIdRef.current) {
  //     console.error('SSE: No client ID available for connection');
  //     return;
  //   }

  //   console.log('SSE: Attempting to connect...');

  //   try {
  //     const headers = new Headers(options.headers);
  //     if (clientIdRef.current) {
  //       headers.set('X-Client-ID', clientIdRef.current);
  //     }

  //     const eventSource = new EventSource(
  //       `${url}?clientId=${encodeURIComponent(clientIdRef.current)}`,
  //       { 
  //         withCredentials: true 
  //       }
  //     );

  //     // ... rest of the connect implementation
  //   } catch (error) {
  //     console.error('SSE: Error creating connection:', error);
  //     if (onError) {
  //       onError(error as Event);
  //     }
  //   }
  // }, [url, onEvent, onConnect, onError, onDisconnect, options.headers]);

  const connect = useCallback(() => {
    console.log('Connecting with options:', options);
    console.log('Current clientId:', clientIdRef.current);
    if (!clientIdRef.current) {
      console.error('SSE: Cannot connect - client ID is not set');
      return;
    }
    if (eventSourceRef.current) {
      console.log('SSE: Connection exists:', eventSourceRef.current);
      return;
    }
  
    try {
      const srcUrl = `${url}?clientId=${encodeURIComponent(clientIdRef.current)}`;
      const eventSource = new EventSource(srcUrl, { withCredentials: true });
      eventSourceRef.current = eventSource;
      console.log('Created EventSource:', eventSource);
  
      eventSource.addEventListener('connected', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Connected event received:', data);
          clientIdRef.current = data.clientId;
          isConnectedRef.current = true;
          if (onConnect) {
            onConnect(data.clientId);
          }
          if (onEvent) {
            onEvent('connected', data);
          }
        } catch (error) {
          console.error('Error handling connected event:', error);
        }
      });
  
      eventSource.addEventListener('heartbeat', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Heartbeat received:', data);
          isConnectedRef.current = true;
          if (onEvent) {
            onEvent('heartbeat', data);
          }
        } catch (error) {
          console.error('Error handling heartbeat:', error);
        }
      });
  
      eventSource.addEventListener('clients_update', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Clients update received:', data);
          if (onEvent) {
            onEvent('clients_update', data);
          }
        } catch (error) {
          console.error('Error handling clients update:', error);
        }
      });

      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message received:', data);
          if (onEvent) {
            onEvent('message', data);
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      eventSource.onerror = (error) => {
        console.error('SSE: Connection error:', error);
        isConnectedRef.current = false;
        if (onError) onError(error);
      
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY * reconnectAttemptsRef.current);
        } else {
          console.warn('SSE: Max reconnect attempts reached');
        }
      };
    } catch (error) {
      console.error('Connection error:', error);
    }
  }, [url, options]);
  
  // Connect on mount only
  useEffect(() => {
    let isMounted = true;
    
    const setupConnection = () => {
      if (isMounted && !eventSourceRef.current) {
        connect();
      }
    };
    
    setupConnection();
    
    return () => {
      isMounted = false;
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // if (onDisconnect) {
      //   onDisconnect();
      // }
    };
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    // Only set the clientId if we have a userId
    if (options.userId) {
      clientIdRef.current = `client-${options.userId}`;
      console.log('Client ID set to:', clientIdRef.current);
    } else {
      console.error('No userId provided for SSE connection');
    }
  
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [options.userId]); 

  // Function to send a message to the server
  const sendMessage = useCallback(
    async (event: string, data: any): Promise<boolean> => {
      if (!clientIdRef.current) return false;
      console.log("send message", clientIdRef, clientIdRef.current, event, data);
      
      try {
        const response = await fetch('/api/sse/message', { // Updated endpoint
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId: clientIdRef.current,
            event,
            data,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    },
    []
  );

  // Function to disconnect from the SSE stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      isConnectedRef.current = false;
      
      if (onDisconnect) {
        onDisconnect();
      }
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, [onDisconnect]);

  // Function to add an event listener for a specific event type
  const addEventHandler = useCallback((eventType: string, handler: EventHandler) => {
    const handlers = eventHandlersRef.current.get(eventType) || [];
    handlers.push(handler);
    eventHandlersRef.current.set(eventType, handlers);

    // Return cleanup function
    return () => {
      const handlers = eventHandlersRef.current.get(eventType) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        eventHandlersRef.current.set(eventType, handlers);
      }
    };
  }, []);

  return useMemo(
    () => ({
      clientId: clientIdRef.current,
      isConnected: isConnectedRef.current,
      sendMessage,
      disconnect,
      addEventHandler,
    }),
    [sendMessage, disconnect, addEventHandler]
  );
}

export default useSSE;
