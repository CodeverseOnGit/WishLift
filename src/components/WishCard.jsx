import { Link } from 'react-router-dom'
import './WishCard.css'

const CATEGORY_EMOJIS = {
  Education: '📚', Health: '❤️', Business: '💼', Family: '👨‍👩‍👧',
  Travel: '✈️', Emergency: '🚨', Community: '🌍', Other: '⭐'
}

function daysAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export default function WishCard({ wish }) {
  const { id, title, category, location, description, image_url, created_at, status, users } = wish

  return (
    <Link to={`/wish/${id}`} className="wish-card">
      <div className="wish-card-image">
        {image_url
          ? <img src={image_url} alt={title} loading="lazy" />
          : <div className="wish-card-placeholder">{CATEGORY_EMOJIS[category] || '⭐'}</div>
        }
        <span className={`wish-status-badge ${status === 'Fulfilled' ? 'fulfilled' : status === 'In Progress' ? 'progress' : 'open'}`}>
          {status}
        </span>
      </div>
      <div className="wish-card-body">
        <div className="wish-card-meta">
          <span className="wish-category">{CATEGORY_EMOJIS[category]} {category}</span>
          {location && <span className="wish-location">📍 {location}</span>}
        </div>
        <h3 className="wish-card-title">{title}</h3>
        <p className="wish-card-desc">{description}</p>
        <div className="wish-card-footer">
          <div className="wish-card-author">
            <div className="author-avatar">
              {users?.avatar_url
                ? <img src={users.avatar_url} alt={users.name} />
                : <div className="author-avatar-placeholder">{users?.name?.[0]?.toUpperCase() || '?'}</div>
              }
            </div>
            <span>{users?.name}</span>
          </div>
          <span className="wish-days">{daysAgo(created_at)}</span>
        </div>
      </div>
    </Link>
  )
}
