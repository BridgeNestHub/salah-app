import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'premium' | 'banned';
  joinDate: string;
  lastActive: string;
  location: string;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      role: 'user',
      joinDate: '2024-01-15',
      lastActive: '2024-01-18',
      location: 'New York, USA'
    },
    {
      id: '2',
      name: 'Fatima Ali',
      email: 'fatima@example.com',
      role: 'premium',
      joinDate: '2024-01-10',
      lastActive: '2024-01-17',
      location: 'London, UK'
    }
  ]);

  const [filterRole, setFilterRole] = useState<string>('all');

  const handleRoleChange = (id: string, role: User['role']) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, role } : user
    ));
    alert(`User role updated to ${role}`);
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (window.confirm(`Are you sure you want to delete ${user?.name}?`)) {
      setUsers(users.filter(user => user.id !== id));
      alert('User deleted successfully');
    }
  };

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(user => user.role === filterRole);

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
          <li><Link to="/admin/users" className="nav-link active">👥 User Management</Link></li>
          <li><Link to="/admin/staff" className="nav-link">👨💼 Staff Management</Link></li>
          <li><Link to="/admin/analytics" className="nav-link">📊 Analytics</Link></li>
          <li><Link to="/admin/settings" className="nav-link">⚙️ System Settings</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <h1>User Management</h1>
          <p>Manage user accounts and permissions</p>
        </header>

        <main className="admin-main">
          <div className="action-bar">
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="modern-select"
            >
              <option value="all">All Users</option>
              <option value="user">Regular Users</option>
              <option value="premium">Premium Users</option>
              <option value="banned">Banned Users</option>
            </select>
          </div>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Join Date</th>
                  <th>Last Active</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="premium">Premium</option>
                        <option value="banned">Banned</option>
                      </select>
                    </td>
                    <td>{user.joinDate}</td>
                    <td>{user.lastActive}</td>
                    <td>{user.location}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn-delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUserManagement;