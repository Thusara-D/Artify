import React, { useState, useEffect } from 'react';
import OfferService from '../services/offer.service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Clock, Package, Info, CheckCircle2, XCircle, Timer, ShoppingBag, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MyOffers = () => {
    const { user } = useAuth();
    const { addToCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMyOffers();
        }
    }, [user]);

    const fetchMyOffers = async () => {
        try {
            setLoading(true);
            const response = await OfferService.getMyOffers();
            setOffers(response.data);
        } catch (err) {
            console.error('Error fetching my offers:', err);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log out and log back in.');
            } else {
                setError('Failed to load bids. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCheckoutOffer = (offer) => {
        clearCart();
        const artworkForCheckout = {
            ...offer.artwork,
            price: offer.offeringPrice,
            isOffer: true,
            offerId: offer.id
        };
        addToCart(artworkForCheckout);
        navigate('/cart');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ACCEPTED': return <CheckCircle2 size={20} color="#0d9488" />;
            case 'REJECTED': return <XCircle size={20} color="#dc2626" />;
            default: return <Timer size={20} color="#d97706" />;
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <div className="loading-spinner"></div>
        </div>
    );

    if (error) return (
        <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem' }}>My Bids</h1>
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <AlertCircle size={40} color="#dc2626" style={{ marginBottom: '1rem' }} />
                <h2 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Session Expired</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
                <Link to="/login" className="btn btn-primary">Go to Login</Link>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>My Bids</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track your artwork negotiations.</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {offers.map((offer) => (
                    <div key={offer.id} className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <div style={{ width: '120px', height: '120px', borderRadius: '6px', overflow: 'hidden' }}>
                                <img
                                    src={offer.artwork?.imageUrl?.startsWith('http') ? offer.artwork.imageUrl : `http://localhost:8080${offer.artwork?.imageUrl}`}
                                    alt={offer.artwork?.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{offer.artwork?.title}</h2>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Package size={14} /> Retail: Rs.{offer.artwork?.price?.toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>YOUR BID</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>Rs.{offer.offeringPrice?.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    background: '#f9fafb',
                                    borderRadius: '6px',
                                    marginBottom: '1rem',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    {getStatusIcon(offer.status)}
                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{offer.status}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Clock size={14} /> {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString() : ''}
                                    </div>
                                    {offer.status === 'ACCEPTED' && (
                                        <button
                                            onClick={() => handleCheckoutOffer(offer)}
                                            className="btn btn-primary"
                                            style={{ padding: '8px 20px' }}
                                        >
                                            <ShoppingBag size={16} /> Checkout
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {offers.length === 0 && (
                    <div className="card" style={{ padding: '5rem', textAlign: 'center' }}>
                        <Info size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                        <h2>No bidding history</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your price negotiations will appear here.</p>
                        <Link to="/catalog" className="btn btn-primary">Browse Artworks</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOffers;
