function renderTextWithLineBreaks(text) {
  return text.split('\n').map((line, index, lines) => (
    <span key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ))
}

export default function MessageBubble({ message }) {
  const isUserMessage = message.sender === 'user'
  const isErrorMessage = message.isError === true

  const formattedTimestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const bubbleModifier = isErrorMessage
    ? 'message-bubble--error'
    : isUserMessage
      ? 'message-bubble--user'
      : 'message-bubble--assistant'

  return (
    <div className={`message-row ${isUserMessage ? 'message-row--user' : 'message-row--assistant'}`}>
      <div className={`message-avatar ${isUserMessage ? 'message-avatar--user' : 'message-avatar--assistant'}`}>
        {isUserMessage ? 'You' : 'AI'}
      </div>

      <div className="message-bubble-group">
        <span className="message-sender-label">
          {isUserMessage ? 'You' : 'Onboarding Buddy'}
        </span>
        <div className={`message-bubble ${bubbleModifier}`}>
          {renderTextWithLineBreaks(message.text)}
        </div>
        <span className="message-timestamp">{formattedTimestamp}</span>
      </div>
    </div>
  )
}
