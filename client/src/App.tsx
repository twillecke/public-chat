import { useEffect, useState } from "react";
import "./App.css";
import useWebSocket from "react-use-websocket";
import MessageFrame from "./MessageFrame";

const WS_URL = import.meta.env.VITE_WS_URL;

function App() {
	const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
		share: false,
		shouldReconnect: () => true,
	});

	const [messages, setMessages] = useState<any[]>([]);
	const [textInput, setTextInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [isExternalTyping, setIsExternalTyping] = useState(false);
	const [username, setUsername] = useState("");
	const [usernameInput, setUsernameInput] = useState("");

	useEffect(() => {
		if (!lastJsonMessage) return;
		const { type, payload } = lastJsonMessage as any;
		switch (type) {
			case "all_messages":
				setMessages(payload.messages);
				break;
			case "text":
				setMessages((prevMessages) => [...prevMessages, lastJsonMessage]);
				break;
			case "typing_status":
				if (payload.username !== username) {
					setIsExternalTyping(payload.isTyping);
				}
				break;
			default:
				break;
		}
	}, [lastJsonMessage]);

	useEffect(() => {
		if (isTyping) {
			console.log("isTyping");
			sendJsonMessage({
				type: "typing_status",
				payload: {
					isTyping: true,
					username: username,
				},
			});
			return;
		}
		if (!isTyping) {
			console.log("stopped typing");
			sendJsonMessage({
				type: "typing_status",
				payload: {
					isTyping: false,
					username: username,
				},
			});
		}
	}, [isTyping]);

	const handleSendMessage = () => {
		if (textInput.length === 0 || isTextOnlyWhitespace(textInput)) return;
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

	const isTextOnlyWhitespace = (text: string) => text.trim() === "";

	const handleButtonDisabled = () =>
		textInput.length === 0 || isTextOnlyWhitespace(textInput);

	return (
		<>
			<h1>Public Chat</h1>
			<div className="chat-container">
				<div className="message-frame">
					<MessageFrame messages={messages} isExternalTyping={isExternalTyping} />
				</div>
				{username && (
					<div className="input-container">
						<input
							type="text"
							placeholder="Enter your message"
							value={textInput}
							onChange={handleInputChange}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSendMessage();
								}
							}}
						/>
						<button
							onClick={handleSendMessage}
							disabled={handleButtonDisabled()}
						>
							Send
						</button>
					</div>
				)}

				{!username && (
					<div className="input-container">
						<input
							type="text"
							placeholder="Enter a username to start chatting"
							value={usernameInput}
							onChange={(e) => setUsernameInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									if (usernameInput.length === 0) return;
									if (isTextOnlyWhitespace(usernameInput))
										return;
									const username = usernameInput.trim();
									setUsername(username);
									setUsernameInput("");
								}
							}}
						/>
						<button
							onClick={() => {
								if (usernameInput.length === 0) return;
								if (isTextOnlyWhitespace(usernameInput)) return;
								const username = usernameInput.trim();
								setUsername(username);
								setUsernameInput("");
							}}
						>
							Start
						</button>
					</div>
				)}
			</div>
		</>
	);
}

export default App;
