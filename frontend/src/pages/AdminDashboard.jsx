import React, { useState, useEffect } from 'react';
import AdminService from '../services/admin.service';
import { Link } from 'react-router-dom';
import { Users, Activity, DollarSign, Clock, List, TrendingUp, PlusSquare, LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                AdminService.getAllUsers(),
                AdminService.getSystemStats()
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
        } catch (err) {
            setError('Failed to fetch admin data.');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (id, currentStatus) => {
        try {
            await AdminService.setUserStatus(id, !currentStatus);
            setUsers(users.map(u => u.id === id ? { ...u, active: !currentStatus } : u));
        } catch (err) {
            alert('Failed to update user status.');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <div className="loading-spinner"></div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>System overview and management.</p>
            </div>

            {/* Analytic Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Total Users', val: stats?.totalUsers || 0, icon: <Users size={20} />, color: '#4f46e5' },
                    { label: 'Total Artworks', val: stats?.totalArtworks || 0, icon: <Activity size={20} />, color: '#0d9488' },
                    { label: 'Total Sales', val: stats?.totalSales || 0, icon: <LayoutDashboard size={20} />, color: '#d97706' },
                    { label: 'Total Revenue', val: `Rs.${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign size={20} />, color: '#059669' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: `${s.color}10`, padding: '12px', borderRadius: '6px', color: s.color }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{s.val}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <Link to="/upload" className="btn btn-primary" style={{ padding: '2rem', flexDirection: 'column', height: 'auto', borderRadius: '8px' }}>
                    <PlusSquare size={32} style={{ marginBottom: '1rem' }} />
                    <span style={{ fontSize: '1.1rem' }}>Upload Artwork</span>
                </Link>

                <Link to="/admin/inventory" className="btn btn-outline" style={{ padding: '2rem', flexDirection: 'column', height: 'auto', borderRadius: '8px' }}>
                    <List size={32} style={{ marginBottom: '1rem' }} />
                    <span style={{ fontSize: '1.1rem' }}>Manage Inventory</span>
                </Link>

                <Link to="/admin/offers" className="btn btn-outline" style={{ padding: '2rem', flexDirection: 'column', height: 'auto', borderRadius: '8px' }}>
                    <TrendingUp size={32} style={{ marginBottom: '1rem' }} />
                    <span style={{ fontSize: '1.1rem' }}>Offer Management</span>
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* User List */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} /> User Management
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem' }}>Username</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600' }}>{u.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: u.active ? '#ccfbf1' : '#fee2e2',
                                                color: u.active ? '#0d9488' : '#dc2626'
                                            }}>
                                                {u.active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => toggleUserStatus(u.id, u.active)}
                                                className="btn btn-outline"
                                                style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                            >
                                                {u.active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Logs */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} /> Recent Logs
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                            stats.recentLogs.map(log => (
                                <div key={log.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)' }}>{log.action}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>{log.details}</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No logs available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
