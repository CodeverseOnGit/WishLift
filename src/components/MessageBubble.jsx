import './MessageBubble.css'

export default function MessageBubble({ message, isOwn }) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`bubble-wrapper ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && message.users && (
        <div className="bubble-avatar">
          {message.users.avatar_url
            ? <img src={message.users.avatar_url} alt={message.users.name} />
            : <div className="bubble-avatar-placeholder">{message.users.name?.[0]?.toUpperCase()}</div>
          }
        </div>
      )}
      <div className={`bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
        <p>{message.message}</p>
        <span className="bubble-time">{time} {isOwn && (message.read ? '✓✓' : '✓')}</span>
      </div>
    </div>
  )
}
