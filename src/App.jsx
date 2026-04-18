import React, { useState } from 'react';
import './App.css';

function App() {
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Parse emails: split by comma, newline -> trim -> filter empty chunks
    const emailList = emails.split(/[\n,]+/).map(e => e.trim()).filter(e => e !== '');
    
    if (emailList.length === 0) {
      setStatus({ type: 'error', message: 'Please enter at least one valid email address.' });
      return;
    }

    if (emailList.length > 150) {
      setStatus({ type: 'error', message: `You have entered ${emailList.length} emails. Maximum allowed is 150.` });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:5000/api/send-bulk-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emailList,
          subject,
          body
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      setStatus({ type: 'success', message: `Success! ${data.message}` });
      setEmails('');
      setSubject('');
      setBody('');
      
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>BulkMailer</h1>
        <p>Send emails to up to 150 recipients instantly.</p>
      </div>

      <div className="card">
        {status.message && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="emails">Recipients (up to 150)</label>
            <textarea
              id="emails"
              className="form-control"
              placeholder="Enter email addresses separated by commas or new lines..."
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              required
              rows={4}
            />
            <span className="info-text">
              Current count: {emails.split(/[\n,]+/).map(e => e.trim()).filter(e => e !== '').length} / 150
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              className="form-control"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Message</label>
            <textarea
              id="body"
              className="form-control"
              placeholder="Type your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={6}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loader"></span>
                Sending...
              </>
            ) : (
              'Send Emails'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
