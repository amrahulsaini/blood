export default function Home() {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-content">
        <div className="coming-soon-header">
          <h1 className="coming-soon-title">
            <span className="blood-drop">💉</span>
            Aashayein
            <span className="blood-drop">❤️</span>
          </h1>
          <p className="coming-soon-subtitle">The Life Saviours</p>
        </div>
        
        <div className="coming-soon-message">
          <h2 className="announcement">Website Coming Soon!</h2>
          <p className="description">
            We're working hard to bring you an amazing platform to make blood donation easier and save lives together.
          </p>
          <div className="launch-text">
            <span className="pulse-dot"></span>
            Going Live Soon
          </div>
        </div>

        <div className="coming-soon-links">
          <a href="/donorentries" className="link-button donor-entries">
            Donor Entries Portal
          </a>
          <a href="/donorcertificates" className="link-button donor-certs">
            Generate Certificates
          </a>
        </div>

        <footer className="coming-soon-footer">
          <p>Every drop counts. Every life matters.</p>
          <p className="hashtags">#BloodDonation #SaveLives #Aashayein</p>
        </footer>
      </div>
    </div>
  );
}
