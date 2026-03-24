import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Palette, ShieldCheck, ArrowRight, MousePointer2, Sparkles } from 'lucide-react';
import ArtworkCard from '../components/ArtworkCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // Passing userId triggers personalized rule-based affinities.
                // If not passed (guest), it triggers fallback trending rules.
                const userIdParam = user?.id ? `?userId=${user.id}` : '';
                const response = await api.get(`/artworks/recommendations${userIdParam}`);
                setRecommendations(response.data);
            } catch (err) {
                console.error("Failed to load recommendations", err);
            } finally {
                setLoading(false);
            }
        };

        // Attempt fetch on mount or user login state change
        fetchRecommendations();
    }, [user?.id]);

    return (
        <div style={{ padding: '2rem 0' }}>
            {/* Hero Section */}
            <section style={{
                background: '#f9fafb',
                padding: '5rem 2rem',
                textAlign: 'center',
                borderRadius: '8px',
                marginBottom: '4rem',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        color: 'var(--text-main)',
                        lineHeight: 1.2
                    }}>
                        Discover and Collect <br />
                        Unique Original Art
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--text-muted)',
                        marginBottom: '2.5rem',
                        lineHeight: 1.6
                    }}>
                        A marketplace for hand-crafted masterpieces.
                        Direct connections between artists and collectors.
                    </p>
                    <Link to="/catalog" className="btn btn-primary" style={{ padding: '12px 30px' }}>
                        Browse Gallery <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Recommendations Section */}
            {!loading && recommendations.length > 0 && (
                <section style={{ marginBottom: '5rem' }} className="reveal-up">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                        <Sparkles color="var(--primary)" size={32} />
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Custom Curated For <span style={{ color: 'var(--primary)' }}>You</span></h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        {user ? "Personalized recommendations using Category and Artist Affinity rules based on your collecting history." : "Discover trending masterpieces hand-picked for new collectors."}
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}>
                        {recommendations.slice(0, 4).map(art => (
                            <ArtworkCard key={art.id} artwork={art} />
                        ))}
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '4rem'
            }}>
                {[
                    { title: 'Artist Direct', desc: 'Connect directly with visionaries globally.', icon: <Palette size={24} /> },
                    { title: 'Authenticity', desc: 'Original works with verified digital provenance.', icon: <ShieldCheck size={24} /> },
                    { title: 'Price Bidding', desc: 'Negotiate the price for the artwork you love.', icon: <MousePointer2 size={24} /> }
                ].map((item, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center' }}>
                        <div style={{
                            color: 'var(--primary)',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            {item.icon}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{item.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{item.desc}</p>
                    </div>
                ))}
            </section>

            {/* Simple Call to Action */}
            <section style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Become an Artify Member</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                    Join our community to start collecting art and supporting creators.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/register" className="btn btn-primary">Sign Up</Link>
                    <Link to="/login" className="btn btn-outline">Log In</Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
