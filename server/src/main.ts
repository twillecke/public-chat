import { WebSocketServer } from 'ws';
import * as dotenv from 'dotenv';
import { authenticate } from './Authentication.js';

dotenv.config();

type Success<T> = {
  success: true;
  value: T;
};

// A type to represent a failure outcome
type Failure = {
  success: false;
  error: { message: string };
};

// A union of the two, this is our Result type
export type Result<T> = Success<T> | Failure;

enum EVENTS {
  CONNECTION = 'connection',
  MESSAGE = 'message',
  ERROR = 'error',
  CLOSE = 'close',
}

enum MESSAGE_TYPES {
  ERROR = 'error',
  TEXT = 'text',
  TYPING_STATUS = 'typing_status',
}

type Message = {
  type: MESSAGE_TYPES;
  payload: {
    body?: string;
    isTyping?: boolean;
  };
}

const PORT = Number(process.env.PORT);
const wsServer = new WebSocketServer({ port: PORT });

console.log(`Server is running on port ${PORT}`);

wsServer.on(EVENTS.CONNECTION, (ws, req) => {
  const authResult = authenticate(req);
  if (!authResult.success) {
    console.error(`Authentication failed: ${authResult.error.message}`);
    ws.send(JSON.stringify({
      type: MESSAGE_TYPES.ERROR,
      payload: { body: `Unauthorized: ${authResult.error.message}` }
    }));
    ws.terminate();
    return; // Stop processing
  }

  ws.on(EVENTS.MESSAGE, (message) => {
    try {
      const data: Message = JSON.parse(message.toString());
      console.log('Received message:', data);

      if (data.type === MESSAGE_TYPES.TEXT) {
        console.log('Received text message:', data.payload.body);
      }
      if (data.type === MESSAGE_TYPES.TYPING_STATUS) {
        console.log('Received typing status:', data.payload.isTyping);
      }

    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
});

wsServer.on(EVENTS.ERROR, (error) => {
  console.error('WebSocket error:', error);
});

wsServer.on(EVENTS.CLOSE, () => {
  console.log('WebSocket server closed');
});

