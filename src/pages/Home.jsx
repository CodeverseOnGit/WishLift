import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { wishesService } from '../services/wishes'
import WishCard from '../components/WishCard'
import './Home.css'

const EXAMPLES = [
  { icon: '🎓', text: 'A student needs a laptop to finish their degree' },
  { icon: '🎨', text: 'An artist wants supplies to pursue their passion' },
  { icon: '👨‍👩‍👧', text: 'A family needs help after an unexpected setback' },
  { icon: '💡', text: 'Someone wants to launch a small business' },
  { icon: '🌍', text: 'A community project needs support to come alive' },
]

const STEPS = [
  { step: '1', title: 'Post a Wish', desc: 'Describe a goal, dream, challenge, or need.', icon: '✏️' },
  { step: '2', title: 'Get Discovered', desc: 'Helpers browse and discover your story.', icon: '🔍' },
  { step: '3', title: 'Connect', desc: 'Interested helpers send a contact request.', icon: '🤝' },
  { step: '4', title: 'Make It Happen', desc: 'Coordinate directly and bring the wish to life.', icon: '🌟' },
]

const CATEGORIES = [
  { name: 'Education', emoji: '📚' }, { name: 'Health', emoji: '❤️' },
  { name: 'Business', emoji: '💼' }, { name: 'Family', emoji: '👨‍👩‍👧' },
  { name: 'Travel', emoji: '✈️' }, { name: 'Emergency', emoji: '🚨' },
  { name: 'Community', emoji: '🌍' }, { name: 'Other', emoji: '⭐' },
]

export default function Home() {
  const [featuredWishes, setFeaturedWishes] = useState([])
  const [loadingWishes, setLoadingWishes] = useState(true)

  useEffect(() => {
    wishesService.getWishes({ limit: 6 })
      .then(setFeaturedWishes)
      .catch(console.error)
      .finally(() => setLoadingWishes(false))
  }, [])

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">✨ A community of generosity</div>
            <h1 className="hero-headline">
              People post goals,<br />needs, or dreams.<br />
              <span className="hero-highlight">Others choose to help.</span>
            </h1>
            <p className="hero-sub">
              A community where generosity meets opportunity. Discover stories, connect with people, and help make wishes come true.
            </p>
            <div className="hero-btns">
              <Link to="/browse" className="btn btn-primary btn-lg">Browse Wishes</Link>
              <Link to="/register" className="btn btn-outline btn-lg">Share Your Wish</Link>
            </div>
          </motion.div>

          <motion.div
            className="hero-examples"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {EXAMPLES.map((ex, i) => (
              <motion.div
                key={i}
                className="hero-example-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <span className="example-icon">{ex.icon}</span>
                <span className="example-text">{ex.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How WishLift Works</h2>
            <p className="section-sub">Four simple steps to make wishes come true</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                className="step-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="step-icon">{s.icon}</div>
                <div className="step-number">Step {s.step}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Wishes */}
      <section className="featured-wishes">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Wishes</h2>
            <p className="section-sub">Real people, real stories — discover who you can help today</p>
          </div>
          {loadingWishes ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
            </div>
          ) : featuredWishes.length > 0 ? (
            <>
              <div className="wishes-grid">
                {featuredWishes.map(wish => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <WishCard wish={wish} />
                  </motion.div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Link to="/browse" className="btn btn-outline btn-lg">See All Wishes</Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🌱</div>
              <h3>No wishes yet</h3>
              <p>Be the first to share a wish or check back soon!</p>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: '16px' }}>Share Your Wish</Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse by Category</h2>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/browse?category=${cat.name}`} className="category-card">
                <span className="category-emoji">{cat.emoji}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to make a difference?</h2>
            <p>Join thousands of people who are giving and receiving help every day.</p>
            <div className="cta-btns">
              <Link to="/register?role=helper" className="btn btn-secondary btn-lg">Become a Helper</Link>
              <Link to="/register?role=recipient" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>Share Your Wish</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
