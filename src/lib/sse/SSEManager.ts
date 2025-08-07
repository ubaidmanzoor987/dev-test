import { PrismaClient } from '@prisma/client'
import { getRedis } from '../redis';
import { RedisService } from '@/features/redis';

type Client = {
  id: string;
  send: (data: string) => void;
  close: () => void;
  lastActivity: number;
};

type EventHandler = (data: any) => void;

interface ClientInfo {
  id: string;
  userId: string;
  lastActivity: number;
}

export class SSEManager {
  private static instance: SSEManager;
  private clients: Map<string, Client> = new Map();
  private userClientMap: Map<string, string> = new Map(); // Add this line - maps userId to clientId
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout;
  private readonly HEARTBEAT_INTERVAL = 50000; // 5 seconds
  private readonly CLIENT_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly prisma: PrismaClient; // Properly type prisma

  private constructor() {
    // Start heartbeat
    this.prisma = new PrismaClient({
      log: ['error', 'warn']
    });

    this.prisma.$connect()
      .then(() => console.log('SSEManager connected to database'))
      .catch((error: any) => console.error('Failed to connect to database:', error));
    
    this.heartbeatInterval = setInterval(() => {
      this.sendToAll('heartbeat', { timestamp: new Date().toISOString() });
      // this.cleanupInactiveClients();
    }, this.HEARTBEAT_INTERVAL);

    // Handle process cleanup
    if (typeof process !== 'undefined') {
      process.on('SIGTERM', () => this.cleanup());
      process.on('SIGINT', () => this.cleanup());
    }
  }

  public isUserActive(userId: string): boolean {
    const clientId = this.userClientMap.get(userId);
    if (!clientId) return false;
    
    const client = this.clients.get(clientId);
    if (!client) return false;

    const now = Date.now();
    return now - client.lastActivity < this.CLIENT_TIMEOUT;
  }


  public static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  public async setUserClient(userId: string, clientId: string) {
    // Remove any existing mapping for this user
    const existingClientId = this.userClientMap.get(userId);
    
    this.userClientMap.set(userId, clientId);
    console.log('Updated user-client mapping:', {
      userId,
      clientId,
      currentMappings: Array.from(this.userClientMap.entries())
    });
  }

  public getUserClientId(userId: string): string | undefined {
    return this.userClientMap.get(userId);
  }

  public addClient(clientId: string, send: (data: string) => void, close: () => void): void {
    
    this.clients.set(clientId, {
      id: clientId,
      send,
      close,
      lastActivity: Date.now()
    });
    
    // Log all client IDs for debugging
    console.log(`Client ${clientId} connected. Active clients:`, Array.from(this.clients.keys()));
  }



  public getActiveClients(): ClientInfo[] {
    // Use userClientMap to get active clients
    const clients = Array.from(this.userClientMap.entries()).map(([userId, clientId]) => ({
      id: clientId,
      userId: userId,
      lastActivity: this.clients.get(clientId)?.lastActivity || Date.now()
    }));
    console.log('Active clients:', {
      userClientMap: Array.from(this.userClientMap.entries()),
      clients: Array.from(this.clients.entries()),
      returnedClients: clients
    });
    return clients;
  }

  public getActiveClient(userId: string): any | null {
    // Debug logs
    console.log('Current state:', {
      userClientMap: Array.from(this.userClientMap.entries()),
      clients: Array.from(this.clients.keys()),
      requestedUserId: userId
    });
  
    const clientId = this.userClientMap.get(userId);
    console.log('Found clientId for userId:', userId, clientId);
    
    if (!clientId) {
      console.log('No client ID found for user:', userId);
      return null;
    }
  
    const client = this.clients.get(clientId);
    console.log('Found client:', client);
    
    const isActive = this.isUserActive(userId);
    console.log('Is user active:', isActive);
  
    // If we have a clientId but no client, it means the connection was lost
    if (!client) {
      // Cleanup the stale mapping
      return null;
    }
  
    return {
      id: clientId,
      userId: userId,
      lastActivity: client.lastActivity,
      isActive
    };
  }
  

  // public sendToClient(clientId: string, event: string, data: any): boolean {
  //   if (!clientId) {
  //     console.error('Cannot send message: clientId is empty');
  //     return false;
  //   }

  //   // First check if this is a user ID and get the corresponding client ID
  //   const actualClientId = this.userClientMap.get(clientId) || clientId;
    
  //   console.log(`Attempting to send to client ${actualClientId}`);
  //   console.log('Active mappings:', Array.from(this.userClientMap.entries()));
    
  //   const client = this.clients.get(actualClientId);
  //   if (!client) {
  //     console.error(`Client ${actualClientId} not found. Active clients:`, Array.from(this.clients.keys()));
  //     return false;
  //   }

  //   try {
  //     const message = this.formatMessage(event, data);
  //     client.send(message);
  //     client.lastActivity = Date.now();
  //     return true;
  //   } catch (error) {
  //     console.error(`Error sending to client ${actualClientId}:`, error);
  //     return false;
  //   }
  // }

  public async sendToClient(clientId: string, event: string, data: any): Promise<boolean> {
    if (!clientId) {
      console.error('Cannot send message: clientId is empty');
      return false;
    }
  
    // Check Redis for client mapping if not in local map
    if (this.clients.size === 0) {
      const redis = await getRedis();
      const redisService = new RedisService(redis);
      const activeUsersData = await redisService.hGetAll('active_users');
      
      if (activeUsersData) {
        Object.entries(activeUsersData).forEach(([userId, userData]) => {
          const parsedData = JSON.parse(JSON.stringify(userData));
          // Recreate the client connection
          this.addClient(parsedData.clientId, 
            (data: string) => console.log('Message sent:', data),
            () => console.log('Connection closed')
          );
        });
      }
    }
  
    const actualClientId = this.userClientMap.get(clientId) || clientId;
    const client = this.clients.get(actualClientId);
    
    if (!client) {
      console.error(`Client ${actualClientId} not found`);
      return false;
    }
  
    try {
      const message = this.formatMessage(event, data);
      console.log("message to be sent", message);
      
      client.send(message);
      client.lastActivity = Date.now();
      console.log("after message sent", client, client.lastActivity);
      
      return true;
    } catch (error) {
      console.error(`Error sending to client ${actualClientId}:`, error);
      return false;
    }
  }

  public sendToAll(event: string, data: any, filter?: (client: Client) => boolean): void {
    const message = this.formatMessage(event, data);
    console.log(`Sending to all clients (${this.userClientMap.size} users) ${this.userClientMap}:`, { event, data });
    
    // Use userClientMap to ensure we send to all connected users
    this.userClientMap.forEach((clientId, userId) => {
      try {
        const client = this.clients.get(clientId);
        if (client && (!filter || filter(client))) {
          client.send(message);
          client.lastActivity = Date.now();
          console.log(`Sent to user ${userId} (client ${clientId})`);
        }
      } catch (error) {
        console.error(`Error sending to user ${userId} (client ${clientId}):`, error);
      }
    });

    // If this is a heartbeat, also send clients update
    if (event === 'heartbeat') {
      const clientsUpdate = this.formatMessage('clients_update', {
        clients: this.getActiveClients()
      });
      
      this.userClientMap.forEach((clientId, userId) => {
        try {
          const client = this.clients.get(clientId);
          if (client) {
            client.send(clientsUpdate);
          }
        } catch (error) {
          console.error(`Error sending clients update to user ${userId}:`, error);
        }
      });
    }
  }

  public getClients(): string[] {
    return Array.from(this.clients.keys());
  }

  public broadcast(event: string, data: any): void {
    const message = this.formatMessage(event, data);
    console.log(`Broadcasting to ${this.clients.size} clients:`, message);

    // Create a copy of client IDs to avoid modification during iteration
    const clientIds = this.getClients();
    clientIds.forEach(clientId => {
      try {
        const client = this.clients.get(clientId);
        if (client) {
          client.send(message);
          client.lastActivity = Date.now();
        }
      } catch (error) {
        console.error(`Error broadcasting to client ${clientId}:`, error);
      }
    });
  }

  public on(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    const handlers = this.eventHandlers.get(event)!;
    handlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  private formatMessage(event: string, data: any): string {
    const eventData = typeof data === 'string' ? data : JSON.stringify(data);
    return `event: ${event}\ndata: ${eventData}\n\n`;
  }

  private cleanupInactiveClients(): void {
    const now = Date.now();
    const inactiveClients: string[] = [];

    this.userClientMap.forEach((clientId, userId) => {
      const client = this.clients.get(clientId);
      if (!client || now - client.lastActivity > this.CLIENT_TIMEOUT) {
        inactiveClients.push(clientId);
      }
    });

    inactiveClients.forEach((clientId) => {
      console.log(`Removing inactive client: ${clientId}`);
    });
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  private async cleanup(): Promise<void> {
    try {
      const redis = await getRedis();
      const redisService = new RedisService(redis);
  
      // Remove all clients from Redis that are being cleaned up
      for (const [userId] of this.userClientMap) {
        await redisService.hDel('active_users', userId);
      }
  
      // Clear local maps
      this.clients.clear();
      this.userClientMap.clear();
      
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
      
      this.eventHandlers.clear();
      console.log('SSE Manager cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
  
  public async removeClient(clientId: string): Promise<void> {
    try {
      // Find the userId associated with this clientId
      let userIdToRemove: string | undefined;
      for (const [userId, cId] of this.userClientMap.entries()) {
        if (cId === clientId) {
          userIdToRemove = userId;
          break;
        }
      }
  
      if (userIdToRemove) {
        const redis = await getRedis();
        const redisService = new RedisService(redis);
        await redisService.hDel('active_users', userIdToRemove);
        this.userClientMap.delete(userIdToRemove);
      }
  
      this.clients.delete(clientId);
      console.log(`Client ${clientId} removed`);
    } catch (error) {
      console.error('Error removing client:', error);
    }
  }
}

export const sseManager = SSEManager.getInstance();
