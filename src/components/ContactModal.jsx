import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { messagesService } from '../services/messages'

export default function ContactModal({ wish, onClose }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [message, setMessage] = useState("Hi, I'd like to learn more and see how I can help.")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setLoading(true)
    setError('')
    try {
      await messagesService.sendContactRequest(wish.id, user.id, wish.user_id, message)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            {sent ? '✅ Request Sent!' : '🤝 Send Contact Request'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {sent ? (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              Your request has been sent to <strong>{wish.users?.name}</strong>. If they accept, you'll gain access to a private conversation.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Reaching out for:
              </p>
              <p style={{ fontWeight: '600', color: 'var(--text)' }}>{wish.title}</p>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Message (optional)</label>
              <textarea
                className="form-input"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="Introduce yourself and explain how you'd like to help..."
              />
            </div>
            {error && <p className="form-error" style={{ marginBottom: '12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? <><span className="spinner" /> Sending...</> : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
