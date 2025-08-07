// src/app/(protected)/home/HomeClient.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSSE } from '@/hooks/useSSE';
import { handleSignOut } from '../../../features/auth/actions/sign-out';

interface HomeClientProps {
  userName: string | null | undefined;
  session: any
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  senderName?: string;
}

interface Client {
  id: string;
  userId: string;
  isActive: boolean;
  userName?: string;
}

export default function HomeClient({ userName, session }: HomeClientProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeClients, setActiveClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string>('');
  const [currentUserStatus, setCurrentUserStatus] = useState<Client | null>(null);
  const [isInitialConnectionMade, setIsInitialConnectionMade] = useState(false);

  useEffect(() => {
    setLoggedInUserId(session.user.id);
  }, [session.user.id]);

  // Function to fetch client status
  const fetchClientStatus = async () => {
    try {
      const response = await fetch('/api/sse/clients');
      if (response.ok) {
        const data = await response.json();
        setCurrentUserStatus(data.userStatus);
        setActiveClients(data.clients);
      }
    } catch (error) {
      console.error('Error fetching client status:', error);
    }
  };

  const { clientId, isConnected } = useSSE(
    '/api/sse/connect',
    (event, data) => {
      console.log('SSE event received:', event, data);
      if (event === 'message') {
        try {
          // Parse the message if it's a string
          const messageData = typeof data === 'string' ? JSON.parse(data) : data;
          console.log('Parsed message data:', messageData);
          
          setMessages(prev => [...prev, {
            id: messageData.id || Date.now().toString(),
            text: messageData.text || messageData.message,
            timestamp: messageData.timestamp || new Date().toLocaleTimeString(),
            senderName: messageData.senderName
          }]);
  
          // Show notification
          if (messageData.senderId !== loggedInUserId && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('New Message', {
              body: `${messageData.senderName}: ${messageData.text}`
            });
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
      } else if (event === 'clients_update') {
        fetchClientStatus();
      } else if (event === 'connected') {
        setIsInitialConnectionMade(true);
      }
    },
    undefined,
    undefined,
    {
      headers: {
        'X-User-ID': session.user.id
      },
      userId: session.user.id
    },
    { userId: session?.user?.id }
  );

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  // Fetch initial client status on connection
  useEffect(() => {
    if (isInitialConnectionMade) {
      fetchClientStatus();
    }
  }, [isInitialConnectionMade]);
console.log("messages in home", messages);

  // Periodic status updates
  useEffect(() => {
    if (isConnected) {
      const intervalId = setInterval(fetchClientStatus, 10000);
      return () => clearInterval(intervalId);
    }
  }, [isConnected]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !clientId) return;
    
    try {
      const targetUserId = selectedClient ? selectedClient.replace('client-', '') : 'broadcast';
    
      const messageData = {
        clientId: targetUserId, // This will be either a user ID or 'broadcast'
        event: 'message',
        data: { 
          id: Date.now().toString(),
          text: message,
          timestamp: new Date().toISOString(),
          senderId: loggedInUserId,
          senderName: userName,
          isDirectMessage: targetUserId !== 'broadcast',
          recipientId: targetUserId !== 'broadcast' ? targetUserId : undefined
        }
      };
      const response = await fetch('/api/sse/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMessages(prev => [...prev, {
        id: messageData.data.id,
        text: messageData.data.text,
        timestamp: new Date(messageData.data.timestamp).toLocaleTimeString(),
        senderName: `${messageData.data.senderName} (You)`,
        isDirectMessage: messageData.data.isDirectMessage
      }]);
  
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Connection Status */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">SSE Chat</h1>
          <div className="flex items-center space-x-4">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {currentUserStatus?.isActive ? 'Active' : 'Inactive'}
              {clientId && ` (${clientId.substring(0, 8)}...)`}
            </span>
            <button 
              onClick={handleSignOut} 
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Active Clients */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Active Clients ({activeClients.length})</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedClient(null)}
              className={`px-3 py-1 rounded transition-colors ${
                !selectedClient ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Broadcast
            </button>
            {activeClients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client.id)}
                className={`px-3 py-1 rounded flex items-center gap-2 transition-colors ${
                  selectedClient === client.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                disabled={client.userId === loggedInUserId}
              >
                <div className={`h-2 w-2 rounded-full ${client.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                {client.userId === loggedInUserId 
                  ? 'You' 
                  : client.userName || `User ${clientId && ` (${clientId.substring(0, 8)}...)`}`
                }
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="mb-6 h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center my-8">No messages yet. Send a message to start chatting!</p>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>{msg.senderName || `User ${msg.id.substring(0, 6)}`}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-gray-800">{msg.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Type your message... ${selectedClient ? '(Direct Message)' : '(Broadcast)'}`}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!isConnected}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isConnected 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}