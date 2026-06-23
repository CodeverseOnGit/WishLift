import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">✨ WishLift</div>
          <p className="footer-tagline">People post goals, needs, or dreams.<br />Others choose to help.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <div className="footer-col-title">Platform</div>
            <Link to="/browse" className="footer-link">Browse Wishes</Link>
            <Link to="/register" className="footer-link">Share Your Wish</Link>
            <Link to="/register" className="footer-link">Become a Helper</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Account</div>
            <Link to="/login" className="footer-link">Sign In</Link>
            <Link to="/register" className="footer-link">Create Account</Link>
            <Link to="/dashboard" className="footer-link">Dashboard</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/delete-account" className="footer-link">Delete My Account</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Codeverse. Built with generosity in mind.</p>
        </div>
      </div>
    </footer>
  )
}
