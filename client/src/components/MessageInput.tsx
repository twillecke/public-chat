export default function MessageInput({
  textInput,
  handleInputChange,
  handleSendMessage,
}: {
  textInput: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
}) {

  const handleButtonDisabled = () =>
    textInput.trim().length === 0;

  return (
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
  );
}
