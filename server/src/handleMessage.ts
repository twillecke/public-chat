import { Server } from "ws";
import { Message, MESSAGE_TYPES } from "./main.js";

export default function handleIncomingMessage(
  ws: Server,
  message: Message,
  database: Message[],
): void {
  const handlerMap: Record<MESSAGE_TYPES, (ws: Server, message: Message, database: Message[]) => void> = {
    [MESSAGE_TYPES.TEXT]: handleTypeText,
    [MESSAGE_TYPES.TYPING_STATUS]: handleTypeTypingStatus,
    [MESSAGE_TYPES.ALL_MESSAGES]: (ws, message) => { },
    [MESSAGE_TYPES.ERROR]: (ws, message) => { },
  };
  const handler = handlerMap[message.type];
  if (handler) handler(ws, message, database);
}

function handleTypeText(ws: Server, message: Message, database: Message[]): void {
  console.log(`[TEXT] Username: ${message.payload.username}, Timestamp: ${message.payload.timestamp}`);
  const newMessage: Message = {
    type: MESSAGE_TYPES.TEXT,
    payload: {
      id: crypto.randomUUID(),
      body: message.payload.body,
      username: message.payload.username,
      timestamp: new Date().toISOString(),
    },
  };
  database.push(newMessage);
  broadcastMessage(ws, newMessage);
}

function handleTypeTypingStatus(
  ws: Server,
  message: Message,
): void {
  console.log(`[TYPING_STATUS] Username: ${message.payload.username}, Is Typing: ${message.payload.isTyping}`);
  const typingStatus: Message = {
    type: MESSAGE_TYPES.TYPING_STATUS,
    payload: {
      isTyping: message.payload.isTyping,
      username: message.payload.username,
    },
  };
  broadcastMessage(ws, typingStatus);
}

function broadcastMessage(
  ws: Server,
  message: Message,
): void {
  ws.clients.forEach((client: any) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}