import { useState, useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import InputField from './InputField'
import { fetchAIResponse } from '../api/onboardingBuddyApi'

const WELCOME_MESSAGE = {
  id: crypto.randomUUID(),
  sender: 'assistant',
  text: "👋 Welcome! I'm your AI Onboarding Buddy. I'm here to help you navigate your first days at IBM SkillsBuild. What would you like to know?",
  timestamp: new Date().toISOString(),
}

const CONNECTION_ERROR_TEXT =
  "I'm sorry, I'm having trouble connecting to the server right now. Please check your connection and try again."

function buildUserMessage(text) {
  return {
    id: crypto.randomUUID(),
    sender: 'user',
    text,
    timestamp: new Date().toISOString(),
  }
}

function buildErrorMessage() {
  return {
    id: crypto.randomUUID(),
    sender: 'assistant',
    isError: true,
    text: CONNECTION_ERROR_TEXT,
    timestamp: new Date().toISOString(),
  }
}

export default function ChatWindow() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [isTyping, setIsTyping] = useState(false)
  const messageListBottomRef = useRef(null)

  useEffect(() => {
    messageListBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const appendMessage = (newMessage) => {
    setMessages((previousMessages) => [...previousMessages, newMessage])
  }

  const handleUserMessageSubmit = async (messageText) => {
    appendMessage(buildUserMessage(messageText))
    setIsTyping(true)

    try {
      const assistantResponse = await fetchAIResponse(messageText)
      appendMessage(assistantResponse)
    } catch (error) {
      console.error('[ChatWindow] fetchAIResponse failed:', error)
      appendMessage(buildErrorMessage())
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="chat-window">
      <header className="chat-header">
        <div className="chat-header-avatar">AI</div>
        <div className="chat-header-info">
          <span className="chat-header-name">Onboarding Buddy</span>
          <span className="chat-header-status">
            <span className={`status-dot ${isTyping ? 'status-dot--typing' : ''}`} />
            {isTyping ? 'Typing…' : 'Online'}
          </span>
        </div>
      </header>

      <div className="message-list">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && (
          <div className="typing-indicator" aria-label="Onboarding Buddy is typing">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={messageListBottomRef} />
      </div>

      <InputField onSubmit={handleUserMessageSubmit} isDisabled={isTyping} />
    </div>
  )
}
