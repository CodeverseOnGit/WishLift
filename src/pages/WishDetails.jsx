import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { wishesService } from '../services/wishes'
import ContactModal from '../components/ContactModal'
import ReportModal from '../components/ReportModal'
import './WishDetails.css'

const CATEGORY_EMOJIS = {
  Education: '📚', Health: '❤️', Business: '💼', Family: '👨‍👩‍👧',
  Travel: '✈️', Emergency: '🚨', Community: '🌍', Other: '⭐'
}

export default function WishDetails() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [wish, setWish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [saved, setSaved] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    wishesService.getWishById(id)
      .then(setWish)
      .catch(() => navigate('/browse'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusUpdate(status) {
    setUpdatingStatus(true)
    try {
      const updated = await wishesService.updateWishStatus(id, status)
      setWish(prev => ({ ...prev, status: updated.status }))
    } catch (err) { console.error(err) }
    finally { setUpdatingStatus(false) }
  }

  async function toggleSave() {
    if (!user) { navigate('/login'); return }
    try {
      if (saved) { await wishesService.unsaveWish(user.id, id); setSaved(false) }
      else { await wishesService.saveWish(user.id, id); setSaved(true) }
    } catch (err) { console.error(err) }
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-dark" />
    </div>
  )

  if (!wish) return null

  const isOwner = user?.id === wish.user_id
  const isHelper = profile?.role === 'helper'
  const createdAt = new Date(wish.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="wish-details-page">
      <div className="container">
        <Link to="/browse" className="back-link">← Back to Browse</Link>

        <div className="wish-details-grid">
          {/* Left: Image + info */}
          <motion.div
            className="wish-details-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="wish-details-image">
              {wish.image_url
                ? <img src={wish.image_url} alt={wish.title} />
                : <div className="wish-details-placeholder">{CATEGORY_EMOJIS[wish.category] || '⭐'}</div>
              }
              <span className={`wish-status-badge ${wish.status === 'Fulfilled' ? 'fulfilled' : wish.status === 'In Progress' ? 'progress' : 'open'}`}>
                {wish.status}
              </span>
            </div>

            {/* Creator card */}
            <div className="creator-card card">
              <h3 className="creator-card-title">Posted by</h3>
              <div className="creator-info">
                <div className="creator-avatar">
                  {wish.users?.avatar_url
                    ? <img src={wish.users.avatar_url} alt={wish.users.name} />
                    : <div className="creator-avatar-placeholder">{wish.users?.name?.[0]?.toUpperCase()}</div>
                  }
                </div>
                <div>
                  <div className="creator-name">{wish.users?.name}</div>
                  {wish.users?.bio && <p className="creator-bio">{wish.users.bio}</p>}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Details */}
          <motion.div
            className="wish-details-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="wish-details-meta">
              <span className="wish-category-badge">{CATEGORY_EMOJIS[wish.category]} {wish.category}</span>
              {wish.location && <span className="wish-location-badge">📍 {wish.location}</span>}
              <span className="wish-date-badge">📅 {createdAt}</span>
            </div>

            <h1 className="wish-details-title">{wish.title}</h1>

            <div className="wish-details-description">
              <h3>The Story</h3>
              <p>{wish.description}</p>
            </div>

            {/* Actions */}
            <div className="wish-actions">
              {isOwner ? (
                <div className="owner-actions">
                  <h4>Manage Your Wish</h4>
                  <div className="status-btns">
                    {['Open', 'In Progress', 'Fulfilled'].map(s => (
                      <button
                        key={s}
                        className={`btn ${wish.status === s ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => handleStatusUpdate(s)}
                        disabled={updatingStatus || wish.status === s}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {wish.status === 'Open' && (
                    <button
                      className="btn btn-primary btn-lg help-btn"
                      onClick={() => user ? setShowContact(true) : navigate('/login')}
                    >
                      🤝 I Want To Help
                    </button>
                  )}
                  {wish.status !== 'Open' && (
                    <div className="wish-closed-notice">
                      {wish.status === 'Fulfilled'
                        ? '✅ This wish has been fulfilled. Thank you to everyone who helped!'
                        : '🔄 This wish is currently in progress.'}
                    </div>
                  )}
                  {isHelper && (
                    <button className="btn btn-ghost btn-sm" onClick={toggleSave}>
                      {saved ? '🔖 Saved' : '📌 Save Wish'}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Report */}
            {user && !isOwner && (
              <button className="report-btn" onClick={() => setShowReport(true)}>
                🚩 Report this wish
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {showContact && <ContactModal wish={wish} onClose={() => setShowContact(false)} />}
      {showReport && <ReportModal wishId={wish.id} onClose={() => setShowReport(false)} />}
    </div>
  )
}
