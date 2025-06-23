

export default function MessageFrame({
  messages,
  isExternalTyping
}: {
  messages: any[];
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
                  new Date(
                    message.payload.timestamp,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                }
                {" ~ "}
              </span>
              < b > {message.payload.username} </b>:{" "}
              {message.payload.body}
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
