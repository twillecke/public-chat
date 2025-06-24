import { useState } from "react";
import "./App.css";
import useWebSocket from "react-use-websocket";
import MessageFrame from "./components/MessageFrame";
import UsernameInput from "./components/UsernameInput";
import MessageInput from "./components/MessageInput";
import useTypingStatus from "./hooks/useTypingStatus";
import useIncomingMessages from "./hooks/useIncomingMessages";
import type { Message } from "./Types";

const WS_URL = import.meta.env.VITE_WS_URL;

function App() {
	const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
		share: false,
		shouldReconnect: () => true,
	});

	const [messages, setMessages] = useState<Message[]>([]);
	const [textInput, setTextInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [isExternalTyping, setIsExternalTyping] = useState(false);
	const [username, setUsername] = useState("");
	const [usernameInput, setUsernameInput] = useState("");

	useIncomingMessages(
		lastJsonMessage,
		setMessages,
		setIsExternalTyping,
		username
	);

	useTypingStatus(isTyping, username, sendJsonMessage);

	const handleSendMessage = () => {
		if (textInput.trim().length === 0) return;
		sendJsonMessage({
			type: "text",
			payload: {
				body: textInput,
				username: username,
			},
		});
		setTextInput("");
		setIsTyping(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTextInput(e.target.value);
		if (e.target.value.length > 0) setIsTyping(true);
		else setIsTyping(false);
	};

	return (
		<>
			<h1>Public Chat</h1>
			<div className="chat-container">
				<div className="message-frame">
					<MessageFrame messages={messages} isExternalTyping={isExternalTyping} />
				</div>
				{username && (
					<MessageInput
						textInput={textInput}
						handleInputChange={handleInputChange}
						handleSendMessage={handleSendMessage}
					/>
				)}
				{!username && (
					<UsernameInput
						usernameInput={usernameInput}
						setUsernameInput={setUsernameInput}
						setUsername={setUsername}
					/>
				)}
			</div>
		</>
	);
}

export default App;
