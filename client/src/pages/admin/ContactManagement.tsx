import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  response?: string;
}

const AdminContactManagement: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/contact/submissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      setSubmissions(data.data.submissions || []);
      setError(null);
    } catch (err) {
      setError('Failed to load contact submissions');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: ContactSubmission['status']) => {
    try {
      const response = await fetch(`/api/admin/contact/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setSubmissions(submissions.map(sub => 
          sub._id === id ? { ...sub, status } : sub
        ));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAssign = async (id: string, assignedTo: string) => {
    try {
      const response = await fetch(`/api/admin/contact/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: 'in-progress' })
      });
      
      if (response.ok) {
        setSubmissions(submissions.map(sub => 
          sub._id === id ? { ...sub, assignedTo, status: 'in-progress' } : sub
        ));
      }
    } catch (err) {
      console.error('Error assigning submission:', err);
    }
  };

  const handleResponse = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/contact/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      
      if (response.ok) {
        setSubmissions(submissions.map(sub => 
          sub._id === id ? { ...sub, response: responseText, status: 'resolved' } : sub
        ));
        setResponseText('');
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error('Error sending response:', err);
    }
  };

  const filteredSubmissions = filterStatus === 'all' 
    ? submissions 
    : submissions.filter(sub => sub.status === filterStatus);

  if (loading) {
    return (
      <div className="admin-layout-with-nav">
        <div className="admin-content">
          <div className="loading-spinner">Loading contact submissions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout-with-nav">
        <div className="admin-content">
          <div className="error-message">{error}</div>
          <button onClick={fetchSubmissions} className="btn-modern btn-primary-modern">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-with-nav">
      <nav className="admin-sidebar">
        <div className="admin-nav-brand">
          <h2>🕌 Admin Panel</h2>
        </div>
        <ul className="admin-nav-menu">
          <li><Link to="/admin/dashboard" className="nav-link">📊 Dashboard</Link></li>
          <li><Link to="/admin/events" className="nav-link">📅 Events Management</Link></li>
          <li><Link to="/admin/contact" className="nav-link active">📧 Contact Submissions</Link></li>
          <li><Link to="/admin/users" className="nav-link">👥 User Management</Link></li>
          <li><Link to="/admin/staff" className="nav-link">👨💼 Staff Management</Link></li>
          <li><Link to="/admin/analytics" className="nav-link">📊 Analytics</Link></li>
          <li><Link to="/admin/settings" className="nav-link">⚙️ System Settings</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <h1>Contact Management</h1>
          <p>View and respond to user inquiries and feedback</p>
        </header>

        <main className="admin-main">


        <div className="action-bar">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="modern-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="contact-grid">
          {filteredSubmissions.length === 0 ? (
            <div className="no-submissions">
              <p>No contact submissions found.</p>
            </div>
          ) : (
            filteredSubmissions.map(submission => (
            <div key={submission._id} className="contact-card">
              <div className="contact-header">
                <div className="contact-info">
                  <h3>{submission.name}</h3>
                  <p>{submission.email}</p>
                </div>
                <div className="contact-actions">
                  <select 
                    value={submission.status}
                    onChange={(e) => handleStatusChange(submission._id, e.target.value as any)}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              
              <div className="contact-content">
                <h4>{submission.subject}</h4>
                <p className="contact-message">{submission.message}</p>
                
                <div className="contact-meta">
                  <span>📅 {new Date(submission.createdAt).toLocaleDateString()}</span>
                  <span className={`status-badge ${submission.status}`}>{submission.status}</span>
                  {submission.assignedTo && <span>👤 Assigned to: {submission.assignedTo}</span>}
                </div>

                {submission.response && (
                  <div className="response-section">
                    <strong>Response:</strong>
                    <p>{submission.response}</p>
                  </div>
                )}

                <div className="contact-actions-bottom">
                  <select 
                    onChange={(e) => handleAssign(submission._id, e.target.value)}
                    className="assign-select"
                  >
                    <option value="">Assign to...</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff User">Staff User</option>
                    <option value="Support Team">Support Team</option>
                  </select>
                  
                  <button 
                    onClick={() => setSelectedSubmission(submission)}
                    className="btn-modern btn-primary-modern"
                  >
                    Respond
                  </button>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </main>
      </div>

      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Respond to {selectedSubmission.name}</h3>
            <div className="original-message">
              <strong>Original Message:</strong>
              <p>{selectedSubmission.message}</p>
            </div>
            <textarea
              placeholder="Type your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={5}
            />
            <div className="modal-buttons">
              <button 
                onClick={() => handleResponse(selectedSubmission._id)}
                className="btn-modern btn-primary-modern"
              >
                Send Response
              </button>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="btn-modern btn-secondary-modern"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactManagement;