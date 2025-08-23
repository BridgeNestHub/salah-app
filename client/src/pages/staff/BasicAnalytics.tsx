import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const StaffBasicAnalytics: React.FC = () => {
  const [notification, setNotification] = useState<string | null>(null);
  const [stats] = useState([
    { label: 'My Events Created', value: '12', change: '+3 this month', color: '#4f46e5' },
    { label: 'Support Tickets Handled', value: '45', change: '+8 this week', color: '#059669' },
    { label: 'Content Items Added', value: '23', change: '+5 this month', color: '#dc2626' },
    { label: 'Mosques Verified', value: '8', change: '+2 this week', color: '#ea580c' }
  ]);

  const [myActivity] = useState([
    { action: 'Approved mosque submission', item: 'Al-Noor Islamic Center', time: '2 hours ago' },
    { action: 'Created new event', item: 'Friday Prayer Gathering', time: '1 day ago' },
    { action: 'Added Hadith content', item: 'Importance of Prayer', time: '2 days ago' },
    { action: 'Resolved support ticket', item: 'Prayer time issue', time: '3 days ago' }
  ]);

  const [taskProgress] = useState([
    { task: 'Pending Mosque Reviews', completed: 3, total: 5 },
    { task: 'Draft Content Items', completed: 7, total: 10 },
    { task: 'Open Support Tickets', completed: 12, total: 15 },
    { task: 'Scheduled Notifications', completed: 2, total: 3 }
  ]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const refreshData = () => {
    showNotification('Analytics data refreshed successfully!');
  };

  return (
    <div className="admin-layout-with-nav">
      <nav className="admin-sidebar">
        <div className="admin-nav-brand">
          <h2>🕌 Staff Panel</h2>
        </div>
        <ul className="admin-nav-menu">
          <li><Link to="/staff/dashboard" className="nav-link">📊 Dashboard</Link></li>
          <li><Link to="/staff/events" className="nav-link">📅 My Events</Link></li>
          <li><Link to="/staff/contact" className="nav-link">📧 Contact Support</Link></li>
          <li><Link to="/staff/mosques" className="nav-link">🕌 Mosque Verification</Link></li>
          <li><Link to="/staff/content" className="nav-link">📖 Content Management</Link></li>
          <li><Link to="/staff/notifications" className="nav-link">📢 Notifications</Link></li>
          <li><Link to="/staff/analytics" className="nav-link active">📊 Basic Analytics</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <div>
            <h1>My Analytics</h1>
            <p>View your performance and activity statistics</p>
          </div>
          <button onClick={refreshData} className="btn-modern btn-primary-modern">
            🔄 Refresh Data
          </button>
        </header>

        <main className="admin-main">
          <div className="analytics-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ '--stat-color': stat.color } as React.CSSProperties}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-change positive">{stat.change}</div>
              </div>
            ))}
          </div>

          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>My Task Progress</h3>
              <div className="task-progress">
                {taskProgress.map((task, index) => (
                  <div key={index} className="task-item">
                    <div className="task-info">
                      <span className="task-name">{task.task}</span>
                      <span className="task-count">{task.completed}/{task.total}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(task.completed / task.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <h3>Weekly Performance</h3>
              <div className="chart-placeholder">
                <div className="chart-bar" style={{ height: '70%' }}></div>
                <div className="chart-bar" style={{ height: '85%' }}></div>
                <div className="chart-bar" style={{ height: '60%' }}></div>
                <div className="chart-bar" style={{ height: '95%' }}></div>
                <div className="chart-bar" style={{ height: '80%' }}></div>
                <div className="chart-bar" style={{ height: '90%' }}></div>
                <div className="chart-bar" style={{ height: '75%' }}></div>
              </div>
              <div className="chart-labels">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            <div className="analytics-card">
              <h3>My Recent Activity</h3>
              <div className="activity-list">
                {myActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-content">
                      <strong>{activity.action}</strong>
                      <span>{activity.item}</span>
                    </div>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <Link to="/staff/events" className="quick-action-btn">
                  📅 Create Event
                </Link>
                <Link to="/staff/content" className="quick-action-btn">
                  📖 Add Content
                </Link>
                <Link to="/staff/mosques" className="quick-action-btn">
                  🕌 Review Mosques
                </Link>
                <Link to="/staff/notifications" className="quick-action-btn">
                  📢 Send Notification
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {notification && (
        <div className="custom-notification">
          <div className="notification-content">
            <span className="notification-icon">✅</span>
            <span className="notification-text">{notification}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBasicAnalytics;