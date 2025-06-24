import { useEffect } from "react";
import { MESSAGE_TYPES, type Message } from "../Types";

export default function useIncomingMessages(
  lastJsonMessage: any,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setIsExternalTyping: (isTyping: boolean) => void,
  username: string
) {
  useEffect(() => {
    if (!lastJsonMessage) return;
    const { type, payload } = lastJsonMessage as Message;
    const handlers: Record<string, () => void> = {
      [MESSAGE_TYPES.ALL_MESSAGES]: () => {
        setMessages(payload.messages ?? []);
      },
      [MESSAGE_TYPES.TEXT]: () => {
        setMessages((prevMessages: Message[]) => [...prevMessages, lastJsonMessage]);
      },
      [MESSAGE_TYPES.TYPING_STATUS]: () => {
        if (payload.username !== username) {
          setIsExternalTyping(payload.isTyping ?? false);
        }
      }
    };
    if (handlers[type]) handlers[type]();
  }, [lastJsonMessage]);
}