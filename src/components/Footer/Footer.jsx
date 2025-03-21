import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#" className="footer-link">About</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Contact</a>
        </div>
        <div className="footer-tagline">
          <p>CreditSetu – Bridging you to better money management.</p>
        </div>
        <div className="footer-copyright">
          <p>&copy; 2025 CreditSetu. All rights reserved.</p>
        </div>
        <div className="future-ready">
          <p>👉 We're constantly improving! If you need a feature, let us know.</p>
          <a href="mailto:support@creditsetu.in">support@creditsetu.in</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
