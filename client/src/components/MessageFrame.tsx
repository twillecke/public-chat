import type { Message } from "../Types";
import { formatTimestamp } from "../Utils/Utils";


export default function MessageFrame({
  messages,
  isExternalTyping
}: {
  messages: Message[];
  isExternalTyping: boolean;
}) {
  return (
    <div>
      {
        messages.map((message) => (
          <div key={message.payload.id} >
            <p>
              <span>
                {
                  message?.payload.timestamp
                    ? formatTimestamp(message?.payload.timestamp)
                    : "Unknown time"
                }
                {" ~ "}
              </span>
              <b>{message?.payload.username}</b>:{" "}
              {message?.payload.body}
            </p>
          </div>
        ))
      }
      {
        isExternalTyping && (
          <span className="is-typing" >...</span>
        )
      }
    </div>
  )
}
