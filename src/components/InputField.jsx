import { useState, useRef, useEffect } from 'react'

const MAX_INPUT_LENGTH = 1000

export default function InputField({ onSubmit, isDisabled }) {
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef(null)

  const isSubmittable = inputValue.trim().length > 0 && !isDisabled

  const resetTextareaHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  useEffect(() => {
    resetTextareaHeight()
  }, [inputValue])

  const clearAndResetInput = () => {
    setInputValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const submitMessage = (event) => {
    event.preventDefault()
    const trimmedValue = inputValue.trim()
    if (!trimmedValue || isDisabled) return
    onSubmit(trimmedValue)
    clearAndResetInput()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      submitMessage(event)
    }
  }

  const handleInputChange = (event) => {
    if (event.target.value.length <= MAX_INPUT_LENGTH) {
      setInputValue(event.target.value)
    }
  }

  const remainingCharacters = MAX_INPUT_LENGTH - inputValue.length
  const isApproachingCharacterLimit = remainingCharacters <= 100

  return (
    <form className="input-field-form" onSubmit={submitMessage}>
      <div className="input-field-inner">
        <textarea
          ref={textareaRef}
          className="input-field-textarea"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask your Onboarding Buddy anything… (Shift+Enter for new line)"
          rows={1}
          disabled={isDisabled}
          aria-label="Chat message input"
          aria-describedby="char-count"
        />
        {isApproachingCharacterLimit && (
          <span
            id="char-count"
            className={`input-character-count ${remainingCharacters <= 20 ? 'input-character-count--critical' : ''}`}
          >
            {remainingCharacters}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="input-field-send-button"
        disabled={!isSubmittable}
        aria-label="Send message"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  )
}
