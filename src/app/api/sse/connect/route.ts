// src/app/api/sse/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sseManager } from '@/lib/sse/SSEManager';
import { getSession } from '@/features/auth';
import { getRedis } from '@/lib/redis';
import { RedisService } from '@/features/redis';

const HEARTBEAT_INTERVAL = 50000;

export const dynamic = 'force-dynamic';

// export async function GET(request: NextRequest) {
//   // Check authentication
//   const session = await getSession();
//   if (!session?.user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }
//   if (!session?.user?.id) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   // Get or generate client ID
//   const clientId = `client-${session.user.id}`;
  
//   // Store user session in Redis
//   const redis = await getRedis();
//   const redisService = new RedisService(redis);
  
//   await redisService.hSet(
//     'active_users',
//     session.user.id,
//     JSON.stringify({
//       clientId,
//       userId: session.user.id,
//       userName: session.user.name,
//       lastActive: Date.now()
//     })
//   );

//   // Register client with SSE manager
//   await sseManager.setUserClient(session.user.id, clientId);

//   // Create a new response stream
//   const stream = new ReadableStream({
//     start(controller) {
//       let heartbeatInterval: NodeJS.Timeout;
//       let isActive = true;

//       const send = (data: string) => {
//         if (!isActive) return;
//         try {
//           controller.enqueue(new TextEncoder().encode(data));
//         } catch (error) {
//           console.error('Error sending SSE data:', error);
//           cleanup();
//         }
//       };

//       const sendHeartbeat = () => {
//         if (!isActive) return;
//         try {
//           const heartbeat = {
//             type: 'heartbeat',
//             timestamp: new Date().toISOString()
//           };
//           send(`event: heartbeat\ndata: ${JSON.stringify(heartbeat)}\n\n`);
//         } catch (error) {
//           console.error('Error sending heartbeat:', error);
//         }
//       };

//       const close = () => {
//         if (!isActive) return;
//         isActive = false;
//         try {
//           send(`event: close\ndata: ${JSON.stringify({ 
//             message: 'Connection closed',
//             timestamp: new Date().toISOString() 
//           })}\n\n`);
//           try {
//           controller.close();
//         } catch (_) {
//           /* controller already closed */
//         }
//         } catch (error) {
//           console.error('Error closing SSE connection:', error);
//         }
//       };

//       heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
//       if (!session?.user) {
//         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//       }
//       if (!session?.user?.id) {
//         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//       }
//       const userChannel = RedisService.getUserChannel(session.user.id);
//       redisService.subscribe(userChannel, (message) => {
//         send(`event: message\ndata: ${message}\n\n`);
//       });

//       const globalChannel = RedisService.getGlobalChannel();
//       redisService.subscribe(globalChannel, (message) => {
//         send(`event: message\ndata: ${message}\n\n`);
//       });
      
//       sseManager.addClient(clientId, send, close);
//       send(`event: connected\ndata: ${JSON.stringify({ 
//         clientId, 
//         userId: session?.user?.id,
//         timestamp: new Date().toISOString(),
//         heartbeatInterval: HEARTBEAT_INTERVAL
//       })}\n\n`);

//       const handleClose = () => {
//         cleanup();
//       };

//       const cleanup = async () => {
//         if (!isActive) return;
//         isActive = false;
        
//         if (heartbeatInterval) {
//           clearInterval(heartbeatInterval);
//         }
        
//         request.signal.removeEventListener('abort', handleClose);
        
//         if (!session?.user) {
//           return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//         }
//         if (!session?.user?.id) {
//           return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//         }

//         // Remove from Redis and SSE manager
//         const redis = await getRedis();
//         const redisService = new RedisService(redis);

//         await redisService.hDel('active_users', session.user.id);
//         sseManager.removeClient(clientId);
        
//         close();
//       };

//       if (request.signal) {
//         request.signal.addEventListener('abort', handleClose);
//       }

//       return cleanup;
//     },
//     cancel() {
//       // sseManager.removeClient(clientId);
//     },
//   });

//   const headers = new Headers({
//     'Content-Type': 'text/event-stream',
//     'Cache-Control': 'no-cache, no-transform',
//     'Connection': 'keep-alive',
//     'X-Accel-Buffering': 'no',
//     'X-Client-ID': clientId,
//     'Access-Control-Expose-Headers': 'X-Client-ID',
//   });

//   return new NextResponse(stream, { headers });
// }

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = `client-${session.user.id}`;
  const redis = await getRedis();
  const redisService = new RedisService(redis);
  const sessionUserId = session.user.id;
  // Store user session in Redis
  await redisService.hSet(
    'active_users',
    sessionUserId,
    JSON.stringify({
      clientId,
      userId: session.user.id,
      userName: session.user.name,
      lastActive: Date.now()
    })
  );

  const stream = new ReadableStream({
    async start(controller) {
      let heartbeatInterval: NodeJS.Timeout;
      let isActive = true;

      const send = (data: string) => {
        if (!isActive) return;
        try {
          controller.enqueue(new TextEncoder().encode(data));
        } catch (error) {
          console.error('Error sending SSE data:', error);
          cleanup();
        }
      };

      // Handle Redis messages
      const handleMessage = (message?: string) => {
          if (typeof message !== 'string') return;
        try {
          send(`event: message\ndata: ${message}\n\n`);
        } catch (error) {
          console.error('Error handling Redis message:', error);
        }
      };

      // Subscribe to channels
      const userChannel = await RedisService.getUserChannel(sessionUserId);
      const globalChannel = RedisService.getGlobalChannel();

      Promise.all([
        redisService.subscribe(userChannel, handleMessage),
        redisService.subscribe(globalChannel, handleMessage)
      ]).catch(error => {
        console.error('Error setting up Redis subscriptions:', error);
      });

      // Send initial connection event
      send(`event: connected\ndata: ${JSON.stringify({ 
        clientId,
        userId: sessionUserId,
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Setup heartbeat
      heartbeatInterval = setInterval(() => {
        send(`event: heartbeat\ndata: ${JSON.stringify({ 
          timestamp: new Date().toISOString() 
        })}\n\n`);
      }, HEARTBEAT_INTERVAL);

      const cleanup = async () => {
        if (!isActive) return;
        isActive = false;

        clearInterval(heartbeatInterval);
        
        // Unsubscribe from Redis channels
        await redisService.unsubscribe(userChannel);
        await redisService.unsubscribe(globalChannel);
        
        // Remove from active users
        await redisService.hDel('active_users', sessionUserId);
        
        send(`event: close\ndata: ${JSON.stringify({ 
          message: 'Connection closed',
          timestamp: new Date().toISOString() 
        })}\n\n`);
        
        try {
          controller.close();
        } catch (_) {
          /* controller already closed */
        }
      };

      request.signal.addEventListener('abort', cleanup);
      return cleanup;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}