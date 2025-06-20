import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState<any[]>([])
  const [textInput, setTextInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080')
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'all_messages') {
        setMessages(data.payload.messages)
      }
    }
    ws.onopen = () => {
      console.log('Connected to server')
    }
    ws.onclose = () => {
      console.log('Disconnected from server')
    }
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }, [])

  useEffect(() => {
    if (isTyping) console.log('isTyping')
    else console.log('stopped typing')
  }, [isTyping])

  const handleSendMessage = () => {
    if (textInput.length === 0 || isTextOnlyWhitespace(textInput)) return
    // setMessages([...messages, { id: messages.length + 1, payload: { body: textInput, username: 'John Doe', timestamp: new Date().toLocaleTimeString().split(':')[0] + ':' + new Date().toLocaleTimeString().split(':')[1] } }])
    setTextInput('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value)
    if (e.target.value.length > 0) setIsTyping(true)
    else setIsTyping(false)
  }

  const isTextOnlyWhitespace = (text: string) => text.trim() === ''

  const handleButtonDisabled = () => textInput.length === 0 || isTextOnlyWhitespace(textInput)

  return (
    <>
      <h1>Public Chat</h1>
      {/* <div>
        <input type="text" placeholder="Enter your username" />
        <button>Enter</button>
      </div> */}
      <div className="chat-container">
        <div className="message-frame">
          <div>
            {messages.map((message) => (
              <div key={message.payload.id}>
                <p>
                  <span>{new Date(message.payload.timestamp).toLocaleTimeString()} ~ </span><b>{message.payload.username}</b>: {message.payload.body}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter your message"
            value={textInput}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage()
              }
            }}
          />
          <button onClick={handleSendMessage} disabled={handleButtonDisabled()}>Send</button>
        </div>
      </div>
    </>
  )
}

export default App
