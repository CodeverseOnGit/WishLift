import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { wishesService } from '../services/wishes'
import './CreateWish.css'

const CATEGORIES = ['Education', 'Health', 'Business', 'Family', 'Travel', 'Emergency', 'Community', 'Other']

export default function CreateWish() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', category: '', description: '', location: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  if (profile?.role !== 'recipient') {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
        <h2>Only recipients can post wishes</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Create a recipient account to share your wish.</p>
      </div>
    )
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.category) errs.category = 'Category is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (form.description.length > 1000) errs.description = 'Max 1000 characters'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const wish = await wishesService.createWish({ userId: user.id, ...form, imageFile })
      navigate(`/wish/${wish.id}`)
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to create wish. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const charCount = form.description.length

  return (
    <div className="create-wish-page">
      <div className="container">
        <motion.div
          className="create-wish-card card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="create-wish-header">
            <h1 className="page-title">Share Your Wish</h1>
            <p className="page-subtitle">Tell your story and let helpers find you</p>
          </div>

          <form onSubmit={handleSubmit} className="create-wish-form">
            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">Photo (optional)</label>
              <div className="image-upload-area" onClick={() => document.getElementById('image-input').click()}>
                {imagePreview
                  ? <img src={imagePreview} alt="Preview" className="image-preview" />
                  : (
                    <div className="image-upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span>Click to upload a photo</span>
                      <span className="upload-hint">JPG, PNG, GIF up to 5MB</span>
                    </div>
                  )
                }
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  style={{ display: 'none' }}
                />
              </div>
              {imagePreview && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: '8px', alignSelf: 'flex-start' }}
                  onClick={() => { setImageFile(null); setImagePreview(null) }}>
                  Remove Photo
                </button>
              )}
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">Wish Title *</label>
              <input
                id="title"
                name="title"
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g. Help me get a laptop for college"
                value={form.title}
                onChange={handleChange}
                maxLength={100}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                className={`form-input ${errors.category ? 'input-error' : ''}`}
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="location">Location (optional)</label>
              <input
                id="location"
                name="location"
                className="form-input"
                placeholder="e.g. New York, USA"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">Your Story *</label>
              <textarea
                id="description"
                name="description"
                className={`form-input ${errors.description ? 'input-error' : ''}`}
                placeholder="Share your story. What do you need, why does it matter, and what will it help you achieve?"
                value={form.description}
                onChange={handleChange}
                rows={6}
                maxLength={1000}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {errors.description
                  ? <span className="form-error">{errors.description}</span>
                  : <span />
                }
                <span style={{ fontSize: '0.8rem', color: charCount > 900 ? 'var(--warning)' : 'var(--text-light)' }}>
                  {charCount}/1000
                </span>
              </div>
            </div>

            {errors.submit && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                {errors.submit}
              </div>
            )}

            <div className="create-wish-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" /> Posting Wish...</> : '✨ Post Your Wish'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
