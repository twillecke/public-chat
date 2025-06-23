import { useEffect, useState } from "react";
import "./App.css";
import useWebSocket from "react-use-websocket";

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
		if (lastJsonMessage) {
			const message = lastJsonMessage as any;
			if (message.type === "all_messages") {
				setMessages(message.payload.messages);
			} else if (message.type === "text") {
				setMessages((prevMessages) => [...prevMessages, message]);
			} else if (message.type === "typing_status") {
				console.log(
					"Received typing status:",
					message.payload.isTyping,
				);
				if (message.payload.username === username) return;
				setIsExternalTyping(message.payload.isTyping);
			}
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
					<div>
						{messages.map((message) => (
							<div key={message.payload.id}>
								<p>
									<span>
										{/* time stamp must be hour and minute only */}
										{new Date(
											message.payload.timestamp,
										).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
											hour12: false,
										})}
										{" ~ "}
									</span>
									<b>{message.payload.username}</b>:{" "}
									{message.payload.body}
								</p>
							</div>
						))}
						{isExternalTyping && (
							<span className="is-typing">...</span>
						)}
					</div>
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
