import { useEffect } from 'react'
import './PrivacyPolicy.css'

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="privacy-page">
      <div className="container">
        <div className="privacy-content">
          <h1>Privacy Policy</h1>
          <p className="privacy-date">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section>
            <h2>1. Who We Are</h2>
            <p>WishLift ("we", "us", "our") is a community platform where individuals share goals, needs, and aspirations, and generous people choose to help. Our website is located at your domain here.</p>
          </section>

          <section>
            <h2>2. What Data We Collect</h2>
            <p>When you use WishLift, we collect the following information:</p>
            <ul>
              <li><strong>Account information</strong> — your name, email address, and chosen role (recipient or helper) when you register</li>
              <li><strong>Profile information</strong> — optional bio and profile photo you choose to upload</li>
              <li><strong>Wish content</strong> — titles, descriptions, photos, categories, and locations you provide when posting wishes</li>
              <li><strong>Messages</strong> — private messages exchanged between users through our platform</li>
              <li><strong>Usage data</strong> — pages visited and actions taken within the app, collected automatically</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>To create and manage your account</li>
              <li>To display your wishes to other users of the platform</li>
              <li>To facilitate contact requests and private conversations between users</li>
              <li>To allow you to manage and update your profile and wishes</li>
              <li>To maintain the safety and integrity of the platform</li>
            </ul>
          </section>

          <section>
            <h2>4. How We Store Your Data</h2>
            <p>Your data is stored securely using Supabase, a cloud database provider. All data is encrypted in transit using HTTPS. We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us.</p>
          </section>

          <section>
            <h2>5. Data Sharing</h2>
            <p>We do not sell your personal data to third parties. We do not share your data with advertisers. The following limited sharing occurs as part of normal platform operation:</p>
            <ul>
              <li><strong>Other users</strong> — your name, profile photo, and wish content are visible to other registered users of the platform</li>
              <li><strong>Service providers</strong> — Supabase (database and storage), used solely to operate the platform</li>
            </ul>
          </section>

          <section>
            <h2>6. Payments</h2>
            <p>WishLift does not process any payments. All financial arrangements between helpers and recipients are made directly between those individuals outside of our platform. We have no visibility into or responsibility for any such transactions.</p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
            </ul>
            <p>To exercise any of these rights, contact us at the email address below.</p>
          </section>

          <section>
            <h2>8. Cookies</h2>
            <p>We use essential cookies only — specifically the authentication session cookie required to keep you logged in. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>
            <p>WishLift is intended for users aged 18 and over. We do not knowingly collect data from anyone under 18. If you believe a minor has registered, please contact us immediately.</p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify registered users of any significant changes by email. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2>11. Contact Us</h2>
            <p>For any privacy-related questions or requests, contact us at:<br />
            <strong>support@wishlift.app</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}