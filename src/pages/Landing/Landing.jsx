import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext/ThemeContext';
import { withErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import './Landing.css';
import Footer from '../../components/Footer/Footer';

function Landing({ setShowNavbar }) {
  const { theme } = useTheme();

  // Hide navbar when this component mounts
  useEffect(() => {
    setShowNavbar(false);
    return () => setShowNavbar(true); // Show navbar when unmounting
  }, [setShowNavbar]);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Take Control of Your Credit and Expenses with CreditSetu</h1>
          <p>Track multiple credit cards, log every transaction, and bridge the gap to better money management.</p>
          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-lg">Sign Up Free</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-content">
            <img
              src={`/assets/hero-${theme}.svg`}
              alt="CreditSetu - Bridge to better finance"
              className="hero-illustration"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `/assets/hero-light.svg`;
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2>Why CreditSetu?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon multiple-card-icon"></div>
            <h3>Multiple Card Management</h3>
            <p>All your credit cards in one place—no more juggling multiple apps.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon categories-icon"></div>
            <h3>Custom Categories</h3>
            <p>Label transactions exactly how you want, from 'Family' to 'Friends' to 'Rent.'</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon tracking-icon"></div>
            <h3>Monthly Expense Tracking</h3>
            <p>Track cash spends too, for a full picture of your daily expenses.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon reminder-icon"></div>
            <h3>Bill Reminders & Insights</h3>
            <p>Never miss a due date and get upcoming visual analytics to stay on top of your spending.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign Up & Verify 📝</h3>
            <p>Get started in seconds! Just enter your name, email, country, and password, then verify your email to secure your account.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Personalize Your Categories 🎯</h3>
            <p>Make tracking expenses effortless! Create custom spending categories that match your lifestyle—whether it’s dining, shopping, or travel.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Add Cards & Cash 💳💰</h3>
            <p>Simply enter your credit card details or set up a cash tracker to log daily spends. No bank linking required—just pure expense tracking, your way! In the future, if users find it helpful, we may explore secure bank integration for an even smoother experience.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Log Transactions in a Tap ⚡</h3>
            <p>Quickly add expenses and assign them to your categories—no more guessing where your money went!</p>
          </div>
          <div className="step">
            <div className="step-number">5</div>
            <h3>Track, Analyze & Optimize 📊</h3>
            <p>Get real-time insights on your spending habits. Make smarter financial decisions with an interactive dashboard that keeps you in control.</p>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="pain-points">
        <h2>Common Finance Challenges & Smart Solutions</h2>
        <div className="pain-solution-grid">

          <div className="pain-solution">
            <div className="pain">
              <h3>💸 Overspending</h3>
              <p>Struggling to keep track of expenses across multiple cards and cash?</p>
            </div>
            <div className="solution">
              <h3>✅ Solution</h3>
              <p>One <strong>consolidated dashboard</strong> showing all your spending in real-time.</p>
            </div>
          </div>

          <div className="pain-solution">
            <div className="pain">
              <h3>⏳ Missed Due Dates</h3>
              <p>Forgetting payment deadlines and getting hit with late fees?</p>
            </div>
            <div className="solution">
              <h3>✅ Solution</h3>
              <p><strong>Automated bill reminders</strong> and payment tracking for each card.</p>
            </div>
          </div>

          <div className="pain-solution">
            <div className="pain">
              <h3>📉 Lack of Clarity</h3>
              <p>Wondering where your money disappears each month?</p>
            </div>
            <div className="solution">
              <h3>✅ Solution</h3>
              <p><strong>Smart categorization & visual charts</strong> breaking down your spending.</p>
            </div>
          </div>

          <div className="pain-solution">
            <div className="pain">
              <h3>📊 Credit Utilization Confusion</h3>
              <p>Not sure how much <strong>available credit</strong> you have versus what’s used?</p>
            </div>
            <div className="solution">
              <h3>✅ Solution</h3>
              <p>Live tracking of <strong>Available Credit vs. Real-time Available Credit</strong> across all cards.</p>
            </div>
          </div>

          <div className="pain-solution">
            <div className="pain">
              <h3>🛑 Unexpected Expenses</h3>
              <p>Sudden big payments disrupting your budget?</p>
            </div>
            <div className="solution">
              <h3>✅ Solution</h3>
              <p><strong>Planned budgeting tools & alerts</strong> to stay ahead of big expenses.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Security Section */}
      <section className="security">
        <h2>Your Financial Data is Safe With Us</h2>
        <div className="security-features">
          <div className="security-feature">
            <div className="security-icon">🔒</div>
            <h3>End-to-End Encryption</h3>
            <p>Your financial data is protected with industry-standard encryption.</p>
          </div>
          <div className="security-feature">
            <div className="security-icon">🛡️</div>
            <h3>No Banking Details Required</h3>
            <p>We don't connect to your bank. You control what information you share.</p>
          </div>
          <div className="security-feature">
            <div className="security-icon">👤</div>
            <h3>Privacy First</h3>
            <p>Your data is never sold, shared, or analyzed for marketing purposes.</p>
          </div>
        </div>
      </section>

      {/* PWA Section */}
      <section className="pwa-feature">
        <h2>Use CreditSetu Anywhere</h2>
        <div className="pwa-content">
          <div className="pwa-text">
            <h3>📱 Install Our App</h3>
            <p>Add CreditSetu to your home screen for quick access. No app store needed!</p>
            <ul className="pwa-benefits">
              <li>✅ Works offline for essential features</li>
              <li>✅ Fast loading and responsive design</li>
              <li>✅ Automatic updates - always current</li>
              <li>✅ Save storage space compared to traditional apps</li>
              <li>✅ Cross-platform: Works on iOS and Android</li>
            </ul>
          </div>
          <div className="pwa-image">
            <img
              src={`/assets/pwa-demo-${theme}.svg`}
              alt="CreditSetu PWA"
              className="pwa-illustration"
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <div className="cta-wrapper">
          <h2>Ready to Take Control of Your Finances?</h2>
          <p className="cta-subtext">💡 Stay on top of your finances. Start tracking smarter today!</p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-button primary">Create Free Account</Link>
            <Link to="/login" className="cta-button secondary">Sign In</Link>
          </div>
          <div className="future-message">
            <p>⭐ Join our growing community of smart financial managers</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default withErrorBoundary(Landing);
