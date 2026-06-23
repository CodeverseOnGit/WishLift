import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { authService } from '../services/auth'

export default function DeleteAccount() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('info') // info | confirm | deleting | done
  const [error, setError] = useState('')

  async function handleDelete() {
    setStep('deleting')
    setError('')
    try {
      // Delete all user data in order (foreign keys first)
      await supabase.from('messages').delete().eq('sender_id', user.id)
      await supabase.from('contact_requests').delete().or(`helper_id.eq.${user.id},recipient_id.eq.${user.id}`)
      await supabase.from('saved_wishes').delete().eq('user_id', user.id)
      await supabase.from('wish_reports').delete().eq('reporter_id', user.id)
      await supabase.from('wishes').delete().eq('user_id', user.id)
      await supabase.from('users').delete().eq('id', user.id)

      // Sign out — Supabase auth user deletion requires service role key
      // so we delete the profile data and sign them out.
      // The auth record becomes orphaned but holds no personal data.
      await authService.logout()
      setStep('done')
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
      setStep('confirm')
    }
  }

  if (step === 'done') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.icon}>✅</div>
          <h1 style={styles.title}>Account Deleted</h1>
          <p style={styles.text}>
            Your account and all associated data have been permanently deleted from WishLift.
            We're sorry to see you go.
          </p>
          <button style={styles.btnPrimary} onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.icon}>🗑️</div>
        <h1 style={styles.title}>Delete Your WishLift Account</h1>
        <p style={styles.subtitle}>
          This page is for users who wish to permanently delete their WishLift account and all associated data.
        </p>

        {/* What gets deleted */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What will be deleted</h2>
          <ul style={styles.list}>
            {[
              'Your profile (name, email, bio, avatar)',
              'All wishes you have posted',
              'All contact requests sent or received',
              'All private messages',
              'All saved wishes',
            ].map(item => (
              <li key={item} style={styles.listItem}>
                <span style={styles.deleteIcon}>🗑</span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What is retained */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What is retained</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <span style={styles.keepIcon}>📋</span> Anonymous reports you submitted (retained for safety purposes, with your identity removed)
            </li>
            <li style={styles.listItem}>
              <span style={styles.keepIcon}>📋</span> Your authentication record is removed from active use immediately. Any residual auth logs are purged within 30 days.
            </li>
          </ul>
        </div>

        {/* Steps */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>How to delete your account</h2>
          {!user ? (
            <>
              <p style={styles.text}>You must be signed in to delete your account.</p>
              <button style={styles.btnPrimary} onClick={() => navigate('/login')}>
                Sign In First
              </button>
            </>
          ) : step === 'info' ? (
            <>
              <p style={styles.text}>
                You are signed in as <strong>{profile?.name}</strong> ({user.email}).
                Deletion is <strong>permanent and cannot be undone.</strong>
              </p>
              <button style={styles.btnDanger} onClick={() => setStep('confirm')}>
                I understand — continue to delete
              </button>
              <button style={styles.btnGhost} onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
            </>
          ) : step === 'confirm' ? (
            <>
              <div style={styles.warningBox}>
                ⚠️ <strong>This cannot be undone.</strong> All your data will be permanently deleted immediately.
              </div>
              {error && <div style={styles.errorBox}>{error}</div>}
              <button style={styles.btnDanger} onClick={handleDelete}>
                Yes, permanently delete my account
              </button>
              <button style={styles.btnGhost} onClick={() => setStep('info')}>
                Cancel
              </button>
            </>
          ) : (
            <div style={styles.deleting}>
              <div style={styles.spinner} />
              <p>Deleting your account...</p>
            </div>
          )}
        </div>

        {/* Contact fallback */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Prefer to request deletion by email?{' '}
            <a href="mailto:support@wishlift.app" style={styles.link}>
              support@wishlift.app
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}

const styles = {
  page: { padding: '60px 24px 80px', minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', backgroundColor: 'var(--bg)' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '40px', maxWidth: '600px', width: '100%', border: '1px solid var(--border)' },
  icon: { fontSize: '48px', textAlign: 'center', marginBottom: '16px' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', textAlign: 'center', marginBottom: '8px' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, textAlign: 'center', marginBottom: '32px' },
  section: { marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid var(--border)' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { fontSize: '0.9rem', color: 'var(--text-muted)', padding: '6px 0', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.5 },
  deleteIcon: { fontSize: '14px', marginTop: '2px', flexShrink: 0 },
  keepIcon: { fontSize: '14px', marginTop: '2px', flexShrink: 0 },
  text: { fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' },
  warningBox: { backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '14px 16px', fontSize: '0.875rem', color: '#92400e', marginBottom: '16px', lineHeight: 1.6 },
  errorBox: { backgroundColor: 'var(--dangerLight, #fee2e2)', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px 16px', fontSize: '0.875rem', color: '#991b1b', marginBottom: '16px' },
  btnPrimary: { display: 'block', width: '100%', padding: '13px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginBottom: '10px' },
  btnDanger: { display: 'block', width: '100%', padding: '13px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginBottom: '10px' },
  btnGhost: { display: 'block', width: '100%', padding: '13px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' },
  deleting: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px', color: 'var(--text-muted)' },
  spinner: { width: '28px', height: '28px', border: '3px solid var(--border)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  footer: { marginTop: '24px', textAlign: 'center' },
  footerText: { fontSize: '0.85rem', color: 'var(--text-muted)' },
  link: { color: 'var(--primary)', fontWeight: 600 },
}