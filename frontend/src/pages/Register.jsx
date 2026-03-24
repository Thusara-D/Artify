import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, MapPin, Phone, CheckCircle2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        address: '',
        phone: '',
        role: ['ROLE_CUSTOMER']
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Phone number validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError('Phone number must be exactly 10 digits.');
            return;
        }

        setLoading(true);
        try {
            await register(
                formData.username,
                formData.email,
                formData.password,
                formData.address,
                formData.phone,
                ['customer']
            );
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="glass fade-in" style={{ textAlign: 'center', padding: '4rem', maxWidth: '500px' }}>
                    <div style={{ color: '#50e3c2', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <CheckCircle2 size={64} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Welcome Aboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your legacy begins here. Redirecting to the secure entry...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '85vh',
            padding: '4rem 0',
            position: 'relative'
        }}>
            {/* Background Decoration */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: `radial-gradient(circle at bottom right, transparent 0%, var(--bg-dark) 80%), url('/abstract_bg_pattern_1772222661883.png')`,
                backgroundSize: 'cover',
                opacity: 0.1,
                zIndex: -1
            }}></div>

            <div className="glass fade-in" style={{
                width: '100%',
                maxWidth: '600px',
                padding: '3.5rem',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1.2rem',
                        background: 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '20px',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        color: 'var(--primary)'
                    }}>
                        <UserPlus size={40} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.8rem', letterSpacing: '-0.03em' }}>Create Identity</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Join the elite circle of art curators and enthusiasts.</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 77, 77, 0.1)',
                        border: '1px solid rgba(255, 77, 77, 0.2)',
                        color: '#ff4d4d',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '2.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input name="username" value={formData.username} onChange={handleChange} required placeholder="Username" style={{ width: '100%', padding: '14px 14px 14px 45px' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="10-digit number" maxLength="10" style={{ width: '100%', padding: '14px 14px 14px 45px' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="email@example.com" style={{ width: '100%', padding: '14px 14px 14px 45px' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Physical Address</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input name="address" value={formData.address} onChange={handleChange} placeholder="Billing address" style={{ width: '100%', padding: '14px 14px 14px 45px' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secret Key</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" style={{ width: '100%', padding: '14px 14px 14px 45px' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.1rem' }} disabled={loading}>
                        {loading ? <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div> : 'Establish Account'}
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Already a member? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '800' }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
