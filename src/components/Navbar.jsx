import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/auth'
import './Navbar.css'

export default function Navbar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await authService.logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">WishLift</span>
        </Link>

        <div className="navbar-links">
          <Link to="/browse" className={`nav-link ${isActive('/browse') ? 'active' : ''}`}>Browse Wishes</Link>
          {user && profile?.role === 'recipient' && (
            <Link to="/create-wish" className={`nav-link ${isActive('/create-wish') ? 'active' : ''}`}>Post a Wish</Link>
          )}
          {user && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
              <Link to="/messages" className={`nav-link ${isActive('/messages') ? 'active' : ''}`}>Messages</Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <button className="user-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.name} className="user-avatar" />
                  : <div className="user-avatar-placeholder">{profile?.name?.[0]?.toUpperCase() || '?'}</div>
                }
                <span className="user-name-nav">{profile?.name}</span>
                <span>▾</span>
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{profile?.name}</div>
                    <div className="dropdown-role">{profile?.role === 'recipient' ? '🌟 Recipient' : '🤝 Helper'}</div>
                  </div>
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link to="/messages" className="dropdown-item" onClick={() => setMenuOpen(false)}>Messages</Link>
                  {profile?.role === 'recipient' && (
                    <Link to="/create-wish" className="dropdown-item" onClick={() => setMenuOpen(false)}>Post a Wish</Link>
                  )}
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-nav">
          <Link to="/browse" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>Browse Wishes</Link>
          {user && profile?.role === 'recipient' && (
            <Link to="/create-wish" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>Post a Wish</Link>
          )}
          {user ? (
            <>
              <Link to="/dashboard" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/messages" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>Messages</Link>
              <button className="mobile-nav-item mobile-logout" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="mobile-nav-item mobile-register" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
