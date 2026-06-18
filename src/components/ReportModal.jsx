import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { wishesService } from '../services/wishes'

const REASONS = ['Fraud', 'Spam', 'Harassment', 'Other']

export default function ReportModal({ wishId, onClose }) {
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason) return
    setLoading(true)
    try {
      await wishesService.reportWish(wishId, user.id, reason)
      setSent(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{sent ? '✅ Reported' : '🚩 Report Wish'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {sent ? (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Thank you for helping keep WishLift safe. We'll review this wish.</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Why are you reporting this wish? Your report is anonymous.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {REASONS.map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', border: `1.5px solid ${reason === r ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', background: reason === r ? 'var(--primary-light)' : 'white' }}>
                  <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: 'var(--primary)' }} />
                  {r}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-danger" style={{ flex: 2 }} disabled={!reason || loading}>
                {loading ? <span className="spinner" /> : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
