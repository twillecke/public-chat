export default function UsernameInput({
  usernameInput,
  setUsernameInput,
  setUsername,
}: {
  usernameInput: string;
  setUsernameInput: (value: string) => void;
  setUsername: (value: string) => void;
}) {
  const handleButtonDisabled = () =>
    usernameInput.trim().length === 0;

  return (
    <div className="input-container">
      <input
        type="text"
        placeholder="Enter a username to start chatting"
        value={usernameInput}
        onChange={(e) => setUsernameInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (usernameInput.trim().length === 0) return;
            const username = usernameInput.trim();
            setUsername(username);
            setUsernameInput("");
          }
        }}
      />
      <button
        onClick={() => {
          if (usernameInput.trim().length === 0) return;
          const username = usernameInput.trim();
          setUsername(username);
          setUsernameInput("");
        }}
        disabled={handleButtonDisabled()}
      >
        Start
      </button>
    </div>
  );
}