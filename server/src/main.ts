import { WebSocketServer } from "ws";
import * as dotenv from "dotenv";
import { authenticate } from "./Authentication.js";
import { mockMessages } from "./mockedMessages.js";

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
	CONNECTION = "connection",
	MESSAGE = "message",
	ERROR = "error",
	CLOSE = "close",
}

export enum MESSAGE_TYPES {
	ERROR = "error",
	TEXT = "text",
	TYPING_STATUS = "typing_status",
	ALL_MESSAGES = "all_messages",
}

export type AllMessages = {
	type: MESSAGE_TYPES.ALL_MESSAGES;
	payload: {
		messages: Message[];
	};
};

export type Message = {
	type: MESSAGE_TYPES;
	payload: {
		id?: string; // Optional, for text messages
		body?: string;
		isTyping?: boolean;
		username?: string;
		timestamp?: string;
	};
};

const memoryDabase: Message[] = mockMessages;

const PORT = Number(process.env.PORT);
const wsServer = new WebSocketServer({ port: PORT });

console.log(`Server is running on port ${PORT}`);

wsServer.on(EVENTS.CONNECTION, (ws, req) => {
	console.log("New client connected, sending current messages");
	ws.send(
		JSON.stringify({
			type: MESSAGE_TYPES.ALL_MESSAGES,
			payload: { messages: memoryDabase },
		}),
	);

	ws.on(EVENTS.MESSAGE, (message) => {
		try {
			const data: Message = JSON.parse(message.toString());
			console.log("Received message:", data);

			if (data.type === MESSAGE_TYPES.TEXT) {
				console.log("Received text message:", data.payload.body);
				const newMessage: Message = {
					type: MESSAGE_TYPES.TEXT,
					payload: {
						id: crypto.randomUUID(), // Generate a unique ID for the message
						body: data.payload.body,
						username: data.payload.username,
						timestamp: new Date().toISOString(),
					},
				};
				memoryDabase.push(newMessage);
				wsServer.clients.forEach((client) => {
					if (client.readyState === client.OPEN) {
						client.send(
							JSON.stringify({
								type: MESSAGE_TYPES.TEXT,
								payload: newMessage.payload,
							}),
						);
					}
				});
			}
			if (data.type === MESSAGE_TYPES.TYPING_STATUS) {
				console.log("Received typing status:", data.payload.isTyping);
				const typingStatus: Message = {
					type: MESSAGE_TYPES.TYPING_STATUS,
					payload: {
						isTyping: data.payload.isTyping,
						username: data.payload.username,
					},
				};
				wsServer.clients.forEach((client) => {
					if (client.readyState === client.OPEN) {
						client.send(JSON.stringify(typingStatus));
					}
				});
			}
		} catch (error) {
			console.error("Error parsing message:", error);
		}
	});
});

wsServer.on(EVENTS.ERROR, (error) => {
	console.error("WebSocket error:", error);
});

wsServer.on(EVENTS.CLOSE, () => {
	console.log("WebSocket server closed");
});
