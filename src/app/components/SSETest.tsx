import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SSETest() {
  const [events, setEvents] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/sse');

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('SSE Connection established');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents((prev) => [JSON.stringify(data, null, 2), ...prev]);
    };

    eventSource.onerror = () => {
      console.error('SSE Connection error');
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const simulateEvent = () => {
    // This is just for testing - in a real app, this would be triggered by backend events
    fetch('/api/sse/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test-event',
        message: 'Hello from server!',
      }),
    });
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>SSE Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={simulateEvent}>
            Simulate Event
          </Button>
          <div>
            <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
            <div className="mt-4 space-y-2">
              {events.map((event, index) => (
                <div key={index} className="bg-muted p-2 rounded">
                  <pre>{event}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
