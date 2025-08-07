import { NextRequest, NextResponse } from 'next/server';
import { sseManager } from '@/lib/sse/SSEManager';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/features/auth';

// How often to send heartbeat messages (in milliseconds)
const HEARTBEAT_INTERVAL = 50000; // 5 seconds

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log("get route called");
  
  // Check authentication
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Get or generate client ID
  const clientId = `client-${session.user.id}`; // Add the 'client-' prefix
  await sseManager.setUserClient(session.user.id, clientId);

  // Create a new response stream
  const stream = new ReadableStream({
    start(controller) {
      let heartbeatInterval: NodeJS.Timeout;
      let isActive = true;

      // Function to send data to the client
      const send = (data: string) => {
        if (!isActive) return;
        try {
          controller.enqueue(new TextEncoder().encode(data));
        } catch (error) {
          console.error('Error sending SSE data:', error);
          cleanup();
        }
      };

      // Function to send a heartbeat
      const sendHeartbeat = () => {
        if (!isActive) return;
        try {
          const heartbeat = {
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          };
          send(`event: heartbeat\ndata: ${JSON.stringify(heartbeat)}\n\n`);
        } catch (error) {
          console.error('Error sending heartbeat:', error);
        }
      };

      // Function to close the connection
      const close = () => {
        if (!isActive) return;
        isActive = false;
        try {
          // Send a final message before closing
          send(`event: close\ndata: ${JSON.stringify({ 
            message: 'Connection closed',
            timestamp: new Date().toISOString() 
          })}\n\n`);
          
          // Close the controller
          controller.close();
        } catch (error) {
          console.error('Error closing SSE connection:', error);
        }
      };

      // Add client to the manager
      // sseManager.addClient(clientId, send, close);
      // console.log("Add client-1:", clientId, sseManager);
      // Start the heartbeat
      heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

      // Send initial connection message
      send(`event: connected\ndata: ${JSON.stringify({ 
        clientId, 
        userId: session?.user?.id,
        timestamp: new Date().toISOString(),
        heartbeatInterval: HEARTBEAT_INTERVAL
      })}\n\n`);

      // Handle client disconnection
      const handleClose = () => {
        cleanup();
      };

      // Cleanup function
      const cleanup = () => {
        if (!isActive) return;
        isActive = false;
        
        // Clear the heartbeat interval
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
        
        // Remove event listeners
        request.signal.removeEventListener('abort', handleClose);
        
        // Remove client from manager
        // sseManager.removeClient(clientId);
        
        // Close the connection
        close();
      };

      // Set up abort handler
      if (request.signal) {
        request.signal.addEventListener('abort', handleClose);
      }

      // Return cleanup function to be called when the stream is closed
      return cleanup;
    },
    cancel() {
      // Cleanup when the client disconnects
      // sseManager.removeClient(clientId);
    },
  });

  // Set appropriate headers for SSE
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'X-Client-ID': clientId,
    'Access-Control-Expose-Headers': 'X-Client-ID',
  });

  // Create a single headers object with all required values
  const responseHeaders = new Headers(headers);
  // Ensure buffering is disabled for SSE
  responseHeaders.set('X-Accel-Buffering', 'no');
  
  return new NextResponse(stream, { 
    headers: responseHeaders
  });
}

// Helper function to send messages to a specific client
export async function POST(request: NextRequest) {
  try {
    const { clientId: requestClientId, event, data } = await request.json();
    
    if (!requestClientId || !event) {
      console.error('Missing required fields in request:', { clientId: requestClientId, event });
      return NextResponse.json(
        { error: 'clientId and event are required' },
        { status: 400 }
      );
    }
    
    console.log(`Sending message to client ${requestClientId}`, { event, data });
    const success = sseManager.sendToClient(requestClientId, event, data);
    
    if (!success) {
      console.error(`Failed to send message to client ${requestClientId}. Client may be disconnected.`);
      return NextResponse.json(
        { 
          error: 'Client not found or disconnected',
          clientId: requestClientId,
          activeClients: Array.from(sseManager.getClients())
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending SSE message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
