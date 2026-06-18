import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { wishesService } from '../services/wishes'
import { messagesService } from '../services/messages'
import WishCard from '../components/WishCard'
import './Dashboard.css'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isRecipient = profile?.role === 'recipient'
  const [wishes, setWishes] = useState([])
  const [savedWishes, setSavedWishes] = useState([])
  const [contactRequests, setContactRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('wishes')

  useEffect(() => {
    if (!user || !profile) return
    Promise.all([
      isRecipient ? wishesService.getUserWishes(user.id) : wishesService.getSavedWishes(user.id),
      messagesService.getContactRequests(user.id, profile.role)
    ]).then(([w, cr]) => {
      if (isRecipient) setWishes(w); else setSavedWishes(w)
      setContactRequests(cr)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [user, profile])

  async function handleRequest(requestId, status) {
    try {
      await messagesService.updateContactRequest(requestId, status)
      setContactRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r))
      if (status === 'Accepted') navigate('/messages')
    } catch (err) { console.error(err) }
  }

  async function deleteWish(wishId) {
    if (!confirm('Delete this wish?')) return
    try {
      await wishesService.deleteWish(wishId)
      setWishes(prev => prev.filter(w => w.id !== wishId))
    } catch (err) { console.error(err) }
  }

  const pendingRequests = contactRequests.filter(r => r.status === 'Pending')

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-dark" />
    </div>
  )

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Welcome back, {profile?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">{isRecipient ? 'Manage your wishes and contact requests' : 'Track the wishes you\'re supporting'}</p>
          </div>
          {isRecipient && (
            <Link to="/create-wish" className="btn btn-primary">+ Post a Wish</Link>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {isRecipient ? (
            <>
              <StatCard icon="🌟" label="My Wishes" value={wishes.length} color="blue" />
              <StatCard icon="📬" label="Pending Requests" value={pendingRequests.length} color="yellow" />
              <StatCard icon="✅" label="Fulfilled" value={wishes.filter(w => w.status === 'Fulfilled').length} color="green" />
              <StatCard icon="🔄" label="In Progress" value={wishes.filter(w => w.status === 'In Progress').length} color="gray" />
            </>
          ) : (
            <>
              <StatCard icon="📌" label="Saved Wishes" value={savedWishes.length} color="blue" />
              <StatCard icon="📬" label="Pending Requests" value={pendingRequests.length} color="yellow" />
              <StatCard icon="🤝" label="Total Requests" value={contactRequests.length} color="green" />
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button className={`tab-btn ${activeTab === 'wishes' ? 'active' : ''}`} onClick={() => setActiveTab('wishes')}>
            {isRecipient ? '🌟 My Wishes' : '📌 Saved Wishes'}
          </button>
          <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            📬 Requests {pendingRequests.length > 0 && <span className="tab-badge">{pendingRequests.length}</span>}
          </button>
        </div>

        {/* Tab: Wishes */}
        {activeTab === 'wishes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {(isRecipient ? wishes : savedWishes).length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">{isRecipient ? '🌱' : '📌'}</div>
                <h3>{isRecipient ? 'No wishes yet' : 'No saved wishes'}</h3>
                <p>{isRecipient ? 'Post your first wish and start connecting with helpers.' : 'Browse wishes and save the ones you want to help with.'}</p>
                <Link to={isRecipient ? '/create-wish' : '/browse'} className="btn btn-primary" style={{ marginTop: '16px' }}>
                  {isRecipient ? 'Post a Wish' : 'Browse Wishes'}
                </Link>
              </div>
            ) : (
              <div className="dashboard-wishes-grid">
                {(isRecipient ? wishes : savedWishes).map(wish => (
                  <div key={wish.id} className="dashboard-wish-item">
                    <WishCard wish={wish} />
                    {isRecipient && (
                      <div className="wish-item-actions">
                        <Link to={`/wish/${wish.id}`} className="btn btn-ghost btn-sm">Edit Status</Link>
                        <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}
                          onClick={() => deleteWish(wish.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab: Requests */}
        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {contactRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📬</div>
                <h3>No requests yet</h3>
                <p>{isRecipient ? 'When helpers reach out, their requests appear here.' : 'Your contact requests to wish owners appear here.'}</p>
              </div>
            ) : (
              <div className="requests-list">
                {contactRequests.map(req => (
                  <div key={req.id} className="request-card card">
                    <div className="request-wish-info">
                      {req.wishes?.image_url && (
                        <img src={req.wishes.image_url} alt={req.wishes?.title} className="request-wish-img" />
                      )}
                      <div>
                        <Link to={`/wish/${req.wish_id}`} className="request-wish-title">{req.wishes?.title}</Link>
                        <div className="request-helper-name">
                          {isRecipient
                            ? <>From: <strong>{req.users?.name}</strong></>
                            : <>Wish by recipient</>
                          }
                        </div>
                        {req.message && <p className="request-message">"{req.message}"</p>}
                      </div>
                    </div>
                    <div className="request-card-footer">
                      <span className={`badge ${req.status === 'Pending' ? 'badge-yellow' : req.status === 'Accepted' ? 'badge-green' : 'badge-gray'}`}>
                        {req.status}
                      </span>
                      {isRecipient && req.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleRequest(req.id, 'Declined')}>Decline</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleRequest(req.id, 'Accepted')}>Accept & Chat</button>
                        </div>
                      )}
                      {req.status === 'Accepted' && (
                        <Link to="/messages" className="btn btn-primary btn-sm">Open Chat</Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
