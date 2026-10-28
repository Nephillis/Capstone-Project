import ChatWindow from './components/ChatWindow'
import './styles/App.css'

export default function App() {
  return (
    <div className="app-layout">
      <header className="app-top-bar">
        <span className="app-top-bar-logo">IBM</span>
        <span className="app-top-bar-title">SkillsBuild · AI Onboarding Buddy</span>
      </header>
      <main className="app-main">
        <ChatWindow />
      </main>
    </div>
  )
}
