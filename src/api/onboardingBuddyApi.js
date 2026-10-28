const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`

const ONBOARDING_SYSTEM_CONTEXT =
  'You are a helpful AI Onboarding Buddy for IBM SkillsBuild. ' +
  'Your role is to assist new hires with questions about their first days, company tools, benefits, and workplace culture. ' +
  'Keep responses concise, friendly, and professional. Use bullet points when listing multiple items.'

const USE_MOCK_RESPONSES = false
const MOCK_RESPONSE_DELAY_MS = 1400

const FALLBACK_RESPONSE_BANK = [
  "Great question! IBM SkillsBuild offers a wide range of free courses to help you ramp up. I'd suggest starting with the 'Getting Started at IBM' learning path.",
  "Your manager will typically schedule a 1-on-1 within your first week. Make sure to come prepared with your initial questions!",
  "You can find your benefits enrollment portal through the HR Connect dashboard. The enrollment window is usually open for 30 days after your start date.",
  "IBM uses Slack and Webex for team communication. Check your welcome email for workspace invite links.",
  "The IBM intranet (w3) is your go-to hub for internal news, tools, and org charts. You can access it at w3.ibm.com.",
  "For IT support, raise a ticket through the ServiceNow portal. Most hardware issues are resolved within 24 hours.",
  "Your IBM ID grants you access to most internal tools. If you're locked out, the IT Help Desk can reset it immediately.",
  "Don't forget to set up your IBM Security Verify (MFA) app — it's required for accessing all internal systems remotely.",
]

async function fetchMockResponse(userMessage) {
  await new Promise((resolve) => setTimeout(resolve, MOCK_RESPONSE_DELAY_MS))

  const normalizedInput = userMessage.toLowerCase()
  const keywordMatch = FALLBACK_RESPONSE_BANK.find((response) =>
    normalizedInput.split(' ').some((word) => word.length > 4 && response.toLowerCase().includes(word))
  )

  return keywordMatch ?? "That's a great question! I'm still expanding my knowledge base. For now, please reach out to your manager or the HR team directly."
}

const GEMINI_REQUEST_BODY = (userMessage) => JSON.stringify({
  system_instruction: {
    parts: [{ text: ONBOARDING_SYSTEM_CONTEXT }],
  },
  contents: [
    {
      parts: [{ text: userMessage }],
    },
  ],
})

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])
const MAX_RETRY_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 1000

async function fetchGeminiResponse(userMessage) {
  let lastError

  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      const backoffDelay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)
      await new Promise((resolve) => setTimeout(resolve, backoffDelay))
    }

    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: GEMINI_REQUEST_BODY(userMessage),
    })

    if (response.ok) {
      const responseData = await response.json()
      return responseData.candidates?.[0]?.content?.parts?.[0]?.text
    }

    const isRetryable = RETRYABLE_STATUS_CODES.has(response.status)
    lastError = new Error(`Gemini API request failed with status ${response.status}: ${response.statusText}`)

    if (!isRetryable) throw lastError
  }

  throw lastError
}

export async function fetchAIResponse(userMessage) {
  const responseText = USE_MOCK_RESPONSES
    ? await fetchMockResponse(userMessage)
    : await fetchGeminiResponse(userMessage)

  return {
    id: crypto.randomUUID(),
    sender: 'assistant',
    text: responseText ?? "I received an empty response. Please try again.",
    timestamp: new Date().toISOString(),
  }
}
