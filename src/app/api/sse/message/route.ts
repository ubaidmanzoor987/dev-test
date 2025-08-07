// // src/app/api/sse/message/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { sseManager } from '@/lib/sse/SSEManager';
// import { getSession } from '@/features/auth';

// export async function POST(request: NextRequest) {
//   const session = await getSession();
//   if (!session?.user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const { clientId: requestClientId, event, data } = await request.json();
    
//     if (!requestClientId || !event) {
//       console.error('Missing required fields in request:', { clientId: requestClientId, event });
//       return NextResponse.json(
//         { error: 'clientId and event are required' },
//         { status: 400 }
//       );
//     }
    
//     console.log(`Sending message to client ${requestClientId}`, { event, data });
//     const success = sseManager.sendToClient(requestClientId, event, data);
    
//     if (!success) {
//       console.error(`Failed to send message to client ${requestClientId}. Client may be disconnected.`);
//       return NextResponse.json(
//         { 
//           error: 'Client not found or disconnected',
//           clientId: requestClientId,
//           activeClients: Array.from(sseManager.getClients())
//         },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error sending SSE message:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { sseManager } from '@/lib/sse/SSEManager';
import { getSession } from '@/features/auth';
import { getRedis } from '@/lib/redis';
import { RedisService } from '@/features/redis';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { clientId, data } = body;
  
  const redis = await getRedis();
  const redisService = new RedisService(redis);

  const message = JSON.stringify({
    id: Date.now().toString(),
    text: data.text,
    timestamp: new Date().toISOString(),
    senderName: data.senderName,
    senderId: data.senderId,
    isDirectMessage: data.isDirectMessage,
    recipientId: data.recipientId
  });
  console.log("client and data", {clientId, data});
  
  try {
    // if (clientId === 'broadcast') {
    //   // Send to global channel
    //   await redisService.publish(RedisService.getGlobalChannel(), message);
    //   console.log('Published to global channel');
    // } else {
    //   // Send to recipient's channel
    //   await redisService.publish(RedisService.getUserChannel(clientId), message);
    //   console.log('Published to recipient channel:', clientId);
      
    //   // Also send to sender's channel for their own UI
    //   await redisService.publish(RedisService.getUserChannel(session?.user?.id || ''), message);
    //   console.log('Published to sender channel:', session.user.id);
    // }

    if (clientId === 'broadcast') {
      // Send to global channel
      await redisService.publish(RedisService.getGlobalChannel(), message);
    } else {
      // Send to specific user's channel
      await redisService.publish(await RedisService.getSingleUserChannel(clientId), message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error publishing message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// src/app/api/sse/message/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { sseManager } from '@/lib/sse/SSEManager';
// import { getSession } from '@/features/auth';
// import { getRedis } from '@/lib/redis';
// import { RedisService } from '@/features/redis';

// export async function POST(request: NextRequest) {
//   const session = await getSession();
//   if (!session?.user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const { clientId: requestClientId, event, data } = await request.json();
    
//     if (!requestClientId || !event) {
//       console.error('Missing required fields in request:', { clientId: requestClientId, event });
//       return NextResponse.json(
//         { error: 'clientId and event are required' },
//         { status: 400 }
//       );
//     }

//     // Check Redis for active clients
//     const redis = await getRedis();
//     const redisService = new RedisService(redis);
//     const activeUsersData = await redisService.hGetAll('active_users');

//     // If broadcasting, send to all active clients
//     if (requestClientId === 'broadcast' && activeUsersData) {
//       Object.entries(activeUsersData).forEach(([userId, userData]) => {
//         const parsedData = JSON.parse(JSON.stringify(userData));
//         sseManager.sendToClient(parsedData.clientId, event, data);
//       });
//       return NextResponse.json({ success: true });
//     }

//     // For direct messages, check if target client exists in Redis
//     const targetExists = activeUsersData ? Object.values(activeUsersData).some(userData => {
//       const parsedData = JSON.parse(JSON.stringify(userData));
//       return parsedData.clientId === requestClientId;
//     }) : false;

//     if (!targetExists) {
//       return NextResponse.json(
//         { 
//           error: 'Client not found or disconnected',
//           clientId: requestClientId
//         },
//         { status: 404 }
//       );
//     }

//     // Send the message
//     const success = sseManager.sendToClient(requestClientId, event, data);
    
//     if (!success) {
//       console.error(`Failed to send message to client ${requestClientId}`);
//       return NextResponse.json(
//         { error: 'Failed to send message' },
//         { status: 500 }
//       );
//     }
    
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error sending SSE message:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }