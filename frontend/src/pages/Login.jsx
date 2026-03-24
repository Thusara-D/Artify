import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, Sparkles, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '85vh',
            position: 'relative'
        }}>
            {/* Background Decoration */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: `radial-gradient(circle at center, transparent 0%, var(--bg-dark) 80%), url('/abstract_bg_pattern_1772222661883.png')`,
                backgroundSize: 'cover',
                opacity: 0.1,
                zIndex: -1
            }}></div>

            <div className="glow-orb" style={{ top: '20%', left: '20%', opacity: 0.2 }}></div>

            <div className="glass fade-in" style={{
                width: '100%',
                maxWidth: '450px',
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
                        <ShieldCheck size={40} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.8rem', letterSpacing: '-0.03em' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Authorize your entry to the gallery.</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 77, 77, 0.1)',
                        border: '1px solid rgba(255, 77, 77, 0.2)',
                        color: '#ff4d4d',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.8rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Curator ID"
                                style={{ width: '100%', padding: '16px 16px 16px 50px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secret Key</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '16px 16px 16px 50px' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1rem' }} disabled={loading}>
                        {loading ? <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div> : <><LogIn size={20} /> Access Gallery</>}
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        New to the collection? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '800' }}>Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
