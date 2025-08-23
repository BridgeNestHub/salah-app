import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminAnalytics: React.FC = () => {
  const [notification, setNotification] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '3,247', change: '+15%', color: '#4f46e5' },
    { label: 'Active Events', value: '28', change: '+22%', color: '#059669' },
    { label: 'Monthly Prayers', value: '18,756', change: '+21%', color: '#dc2626' },
    { label: 'Support Tickets', value: '67', change: '-25%', color: '#ea580c' }
  ]);

  const [prayerStats, setPrayerStats] = useState([
    { name: 'Fajr', usage: 89 },
    { name: 'Dhuhr', usage: 94 },
    { name: 'Asr', usage: 82 },
    { name: 'Maghrib', usage: 97 },
    { name: 'Isha', usage: 91 }
  ]);

  const [recentActivity, setRecentActivity] = React.useState([
    { action: 'New user registration', user: 'Ahmed Hassan', time: '2 minutes ago' },
    { action: 'Event created', user: 'Staff User', time: '15 minutes ago' },
    { action: 'Support ticket resolved', user: 'Admin', time: '1 hour ago' },
    { action: 'Prayer time updated', user: 'System', time: '2 hours ago' }
  ]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const refreshData = () => {
    // Simulate real data refresh
    setStats([
      { label: 'Total Users', value: (3247 + Math.floor(Math.random() * 50)).toLocaleString(), change: `+${12 + Math.floor(Math.random() * 8)}%`, color: '#4f46e5' },
      { label: 'Active Events', value: (28 + Math.floor(Math.random() * 10)).toString(), change: `+${15 + Math.floor(Math.random() * 15)}%`, color: '#059669' },
      { label: 'Monthly Prayers', value: (18756 + Math.floor(Math.random() * 500)).toLocaleString(), change: `+${18 + Math.floor(Math.random() * 10)}%`, color: '#dc2626' },
      { label: 'Support Tickets', value: (67 - Math.floor(Math.random() * 20)).toString(), change: `-${20 + Math.floor(Math.random() * 10)}%`, color: '#ea580c' }
    ]);
    
    setPrayerStats([
      { name: 'Fajr', usage: 85 + Math.floor(Math.random() * 10) },
      { name: 'Dhuhr', usage: 90 + Math.floor(Math.random() * 8) },
      { name: 'Asr', usage: 78 + Math.floor(Math.random() * 12) },
      { name: 'Maghrib', usage: 95 + Math.floor(Math.random() * 5) },
      { name: 'Isha', usage: 88 + Math.floor(Math.random() * 10) }
    ]);

    const newActivity = {
      action: 'Analytics data refreshed',
      user: 'Admin',
      time: new Date().toLocaleTimeString()
    };
    setRecentActivity([newActivity, ...recentActivity.slice(0, 3)]);
    showNotification('Analytics data refreshed successfully!');
  };

  return (
    <div className="admin-layout-with-nav">
      <nav className="admin-sidebar">
        <div className="admin-nav-brand">
          <h2>🕌 Admin Panel</h2>
        </div>
        <ul className="admin-nav-menu">
          <li><Link to="/admin/dashboard" className="nav-link">📊 Dashboard</Link></li>
          <li><Link to="/admin/events" className="nav-link">📅 Events Management</Link></li>
          <li><Link to="/admin/contact" className="nav-link">📧 Contact Submissions</Link></li>
          <li><Link to="/admin/users" className="nav-link">👥 User Management</Link></li>
          <li><Link to="/admin/staff" className="nav-link">👨💼 Staff Management</Link></li>
          <li><Link to="/admin/analytics" className="nav-link active">📊 Analytics</Link></li>
          <li><Link to="/admin/settings" className="nav-link">⚙️ System Settings</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <div>
            <h1>Analytics</h1>
            <p>View system analytics and usage reports</p>
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
                <div className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>User Growth</h3>
              <div className="chart-placeholder">
                <div className="chart-bar" style={{ height: '60%' }}></div>
                <div className="chart-bar" style={{ height: '80%' }}></div>
                <div className="chart-bar" style={{ height: '45%' }}></div>
                <div className="chart-bar" style={{ height: '90%' }}></div>
                <div className="chart-bar" style={{ height: '75%' }}></div>
              </div>
              <p>Monthly user registrations trending upward</p>
            </div>

            <div className="analytics-card">
              <h3>Prayer Times Usage</h3>
              <div className="usage-stats">
                {prayerStats.map((prayer, index) => (
                  <div key={index} className="usage-item">
                    <span>{prayer.name}</span>
                    <div className="usage-bar">
                      <div className="usage-fill" style={{ width: `${prayer.usage}%` }}></div>
                    </div>
                    <span>{prayer.usage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-content">
                      <strong>{activity.action}</strong>
                      <span>by {activity.user}</span>
                    </div>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                ))}
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

export default AdminAnalytics;