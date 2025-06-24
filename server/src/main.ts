import { WebSocketServer, WebSocket } from "ws";
import * as dotenv from "dotenv";
import { mockMessages } from "./mockedMessages.js";
import handleIncomingMessage from "./handleMessage.js";

dotenv.config();

type Success<T> = {
	success: true;
	value: T;
};

type Failure = {
	success: false;
	error: { message: string };
};

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
		id?: string;
		body?: string;
		isTyping?: boolean;
		username?: string;
		timestamp?: string;
	};
};

const memoryDatabase: Message[] = mockMessages;
const PORT = Number(process.env.PORT);
const wsServer = new WebSocketServer({ port: PORT });

console.log(`Server is running on port ${PORT}`);

wsServer.on(EVENTS.CONNECTION, (ws: WebSocket, req) => {
	console.log("New client connected, sending current messages");
	ws.send(
		JSON.stringify({
			type: MESSAGE_TYPES.ALL_MESSAGES,
			payload: { messages: memoryDatabase },
		}),
	);

	ws.on(EVENTS.MESSAGE, (message) => {
		try {
			const parsedMessage = JSON.parse(message.toString()) as Message;
			handleIncomingMessage(wsServer, parsedMessage, memoryDatabase);
		} catch (error) {
			console.error("Error parsing message:", error);
			ws.send(
				JSON.stringify({
					type: MESSAGE_TYPES.ERROR,
					payload: { message: "Invalid message format" },
				}),
			);
		}
	});
});

wsServer.on(EVENTS.ERROR, (error) => {
	console.error("WebSocket error:", error);
});

wsServer.on(EVENTS.CLOSE, () => {
	console.log("WebSocket server closed");
});
