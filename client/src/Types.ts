export type Message = {
  type: MESSAGE_TYPES;
  payload: {
    id?: string; // Optional, for text messages
    body?: string;
    isTyping?: boolean;
    username?: string;
    timestamp?: string;
    messages?: Message[]; // For all_messages type
  };
};

export const EVENTS = {
  CONNECTION: "connection",
  MESSAGE: "message",
  ERROR: "error",
  CLOSE: "close",
} as const;
export type EVENTS = typeof EVENTS[keyof typeof EVENTS];

export const MESSAGE_TYPES = {
  ERROR: "error",
  TEXT: "text",
  TYPING_STATUS: "typing_status",
  ALL_MESSAGES: "all_messages",
} as const;

export type MESSAGE_TYPES = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

export type AllMessages = {
  type: typeof MESSAGE_TYPES.ALL_MESSAGES;
  payload: {
    messages: Message[];
  };
};


