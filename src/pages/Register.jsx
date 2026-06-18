import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authService } from '../services/auth'
import './Auth.css'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: searchParams.get('role') || 'helper'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')
    try {
      await authService.register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-logo">✨ WishLift</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join a community of generosity</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              className="form-input"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {/* Role selector */}
          <div className="form-group">
            <label className="form-label">I want to</label>
            <div className="role-selector">
              <label className={`role-option ${form.role === 'helper' ? 'selected' : ''}`}>
                <input type="radio" name="role" value="helper" checked={form.role === 'helper'} onChange={handleChange} />
                <div className="role-icon">🤝</div>
                <div className="role-text">
                  <div className="role-title">Help Others</div>
                  <div className="role-desc">Browse and support wishes</div>
                </div>
              </label>
              <label className={`role-option ${form.role === 'recipient' ? 'selected' : ''}`}>
                <input type="radio" name="role" value="recipient" checked={form.role === 'recipient'} onChange={handleChange} />
                <div className="role-icon">🌟</div>
                <div className="role-text">
                  <div className="role-title">Share a Wish</div>
                  <div className="role-desc">Post your goal or need</div>
                </div>
              </label>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
