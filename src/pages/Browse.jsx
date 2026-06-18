import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { wishesService } from '../services/wishes'
import WishCard from '../components/WishCard'
import './Browse.css'

const CATEGORIES = ['Education', 'Health', 'Business', 'Family', 'Travel', 'Emergency', 'Community', 'Other']

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [wishes, setWishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''

  const fetchWishes = useCallback(async (reset = false) => {
    const currentPage = reset ? 0 : page
    if (reset) setLoading(true); else setLoadingMore(true)
    try {
      const data = await wishesService.getWishes({ category, search, page: currentPage })
      if (reset) setWishes(data); else setWishes(prev => [...prev, ...data])
      setHasMore(data.length === 12)
      if (!reset) setPage(p => p + 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category, search, page])

  useEffect(() => {
    setPage(0)
    fetchWishes(true)
  }, [category, search])

  function setCategory(cat) {
    const params = new URLSearchParams(searchParams)
    if (cat) params.set('category', cat); else params.delete('category')
    setSearchParams(params)
  }

  function handleSearch(e) {
    e.preventDefault()
    const val = e.target.search.value.trim()
    const params = new URLSearchParams(searchParams)
    if (val) params.set('search', val); else params.delete('search')
    setSearchParams(params)
  }

  return (
    <div className="browse-page">
      <div className="container">
        <div className="browse-header">
          <h1 className="page-title">Browse Wishes</h1>
          <p className="page-subtitle">Discover stories and find where your help can make a difference</p>
        </div>

        {/* Search */}
        <form className="search-bar" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            name="search"
            className="search-input"
            placeholder="Search wishes by title..."
            defaultValue={search}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {/* Category filters */}
        <div className="category-filters">
          <button
            className={`filter-btn ${!category ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="browse-loading">
            <div className="spinner spinner-dark" />
            <p>Finding wishes...</p>
          </div>
        ) : wishes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌱</div>
            <h3>No wishes found</h3>
            <p>{search || category ? 'Try a different search or category.' : 'Be the first to post a wish!'}</p>
          </div>
        ) : (
          <>
            <div className="browse-results-info">
              Showing {wishes.length} wish{wishes.length !== 1 ? 'es' : ''}
              {category ? ` in ${category}` : ''}
              {search ? ` for "${search}"` : ''}
            </div>
            <div className="browse-grid">
              {wishes.map((wish, i) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                >
                  <WishCard wish={wish} />
                </motion.div>
              ))}
            </div>
            {hasMore && (
              <div className="load-more">
                <button
                  className="btn btn-ghost btn-lg"
                  onClick={() => fetchWishes(false)}
                  disabled={loadingMore}
                >
                  {loadingMore ? <><span className="spinner spinner-dark" /> Loading...</> : 'Load More Wishes'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
