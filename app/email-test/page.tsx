'use client';

import { useState } from 'react';
import styles from './email-test.module.css';

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestEmail = async () => {
    if (!testEmail) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/test-email?email=${encodeURIComponent(testEmail)}`);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error + (data.details ? ': ' + data.details : ''));
      }
    } catch (err: any) {
      setError('Failed to connect to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>📧 Email Configuration Test</h1>
        <p className={styles.subtitle}>Test the Brevo SMTP email functionality</p>

        <div className={styles.formGroup}>
          <label htmlFor="testEmail" className={styles.label}>
            Test Email Address:
          </label>
          <input
            type="email"
            id="testEmail"
            className={styles.input}
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>

        <button
          onClick={handleTestEmail}
          disabled={loading}
          className={styles.button}
        >
          {loading ? 'Sending Test Email...' : '📤 Send Test Email'}
        </button>

        {error && (
          <div className={styles.errorBox}>
            <h3>❌ Error</h3>
            <pre>{error}</pre>
          </div>
        )}

        {result && (
          <div className={styles.successBox}>
            <h3>✅ Email Sent Successfully!</h3>
            <div className={styles.details}>
              <p><strong>Message ID:</strong> {result.details?.messageId}</p>
              <p><strong>Sent To:</strong> {result.details?.sentTo}</p>
              
              <h4>SMTP Configuration:</h4>
              <ul>
                <li><strong>Host:</strong> {result.details?.smtpConfig?.host}</li>
                <li><strong>Port:</strong> {result.details?.smtpConfig?.port}</li>
                <li><strong>User:</strong> {result.details?.smtpConfig?.user}</li>
                <li><strong>From:</strong> {result.details?.smtpConfig?.from}</li>
              </ul>
            </div>
          </div>
        )}

        <div className={styles.infoBox}>
          <h3>ℹ️ How to Use</h3>
          <ol>
            <li>Enter your email address in the field above</li>
            <li>Click "Send Test Email" button</li>
            <li>Check your inbox (and spam folder) for the test email</li>
            <li>If you receive the email, the configuration is working correctly!</li>
          </ol>
        </div>

        <div className={styles.noticeBox}>
          <h3>📝 Current Configuration</h3>
          <p>The email system is using Brevo SMTP service with the credentials configured in .env.local</p>
          <ul>
            <li>Host: smtp-relay.brevo.com</li>
            <li>Port: 587</li>
            <li>From: info@thelifesaviours.org</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
