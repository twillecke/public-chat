import { useEffect } from "react";

type SendJsonMessage = (jsonMessage: {
  type: string;
  payload: {
    isTyping: boolean;
    username: string;
  };
}) => void;

/**
 * Custom hook to manage typing status notifications
 * 
 * @param isTyping - Boolean indicating if the user is currently typing
 * @param username - The current user's username
 * @param sendJsonMessage - Function to send WebSocket messages
 */
const useTypingStatus = (
  isTyping: boolean,
  username: string,
  sendJsonMessage: SendJsonMessage
) => {
  useEffect(() => {
    if (!username) return;
    sendJsonMessage({
      type: "typing_status",
      payload: {
        isTyping,
        username,
      },
    });
  }, [isTyping]);
};

export default useTypingStatus;