import { NextRequest, NextResponse } from 'next/server';
import { sseManager } from '@/lib/sse/SSEManager';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/features/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
  
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
      
        const activeClients = sseManager.getActiveClients();
        const userStatus = sseManager.getActiveClient(session.user.id);
        
        return NextResponse.json({
          clients: activeClients,
          userStatus
        });
    } catch (error) {
      console.error('Error sending SSE message:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }