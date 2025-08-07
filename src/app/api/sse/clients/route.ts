// src/app/api/sse/clients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { RedisService } from '@/features/redis';
import { getSession } from '@/features/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redis = await getRedis();
    const redisService = new RedisService(redis);
    
    // Get all active users from Redis
    const activeUsersData = await redisService.hGetAll('active_users');
    
    if (!activeUsersData) {
      return NextResponse.json({ 
        clients: [],
        userStatus: null 
      });
    }

    // Parse the Redis data and convert to Client objects
    const clients = Object.entries(activeUsersData).map(([userId, userData]: any) => {
        console.log("userData-1", userData);
        
      const parsedData = JSON.parse(userData);
      console.log("parsedData-1", parsedData, parsedData.clientId, userData.clientId, parsedData.lastActive);
      return {
        id: parsedData.clientId || userData.clientId,
        userId: userId,
        userName: parsedData.userName || userData.userName,
        isActive: true,
        lastActive: parsedData.lastActive || userData.lastActive
      };
    });

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
// Get current user's status
    const currentUserData = activeUsersData[session.user.id];
    console.log("log:currentUserData", currentUserData);
    const userStatus = currentUserData ? {
      ...JSON.parse(currentUserData),
      isActive: true
    } : null;
    console.log("log:userStatus", {currentUserData, clients, userStatus});
    return NextResponse.json({
      clients,
      userStatus
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}