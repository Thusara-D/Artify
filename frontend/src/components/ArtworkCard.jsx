import React, { useState } from 'react';
import { ShoppingCart, Info, AlertTriangle, Sparkles, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OfferService from '../services/offer.service';
import { useCart } from '../context/CartContext';

const ArtworkCard = ({ artwork }) => {
    const { user, isCustomer } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [offerPrice, setOfferPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!isCustomer) return;

        addToCart(artwork);
        navigate('/cart');
    };

    const stockStatus = artwork.stockStatus || (artwork.stockQuantity <= 0 ? 'Out of Stock' : artwork.stockQuantity <= artwork.minStockThreshold ? 'Low Stock' : 'Available');

    const getStatusStyle = () => {
        if (stockStatus === 'Out of Stock') return { background: '#fee2e2', color: '#dc2626' };
        if (stockStatus === 'Low Stock') return { background: '#fef3c7', color: '#d97706' };
        return { background: '#ccfbf1', color: '#0d9488' };
    };

    const handleMakeOffer = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!isCustomer) {
            alert('Only customers can make offers.');
            return;
        }

        if (!offerPrice || parseFloat(offerPrice) <= 0) {
            alert('Please enter a valid offer price.');
            return;
        }

        try {
            setLoading(true);
            const artistId = artwork.artist?.id || artwork.artistId;

            if (!artistId) {
                alert('Artist information is missing for this artwork. Cannot place bid.');
                return;
            }

            const offerData = {
                artwork: { id: artwork.id },
                customer: { id: user.id },
                artist: { id: artistId },
                offeringPrice: parseFloat(offerPrice),
                status: 'PENDING'
            };
            await OfferService.createOffer(offerData);
            alert('Your bid has been sent! Check "Bids" for updates.');
            setOfferPrice('');
        } catch (error) {
            console.error('Error making offer:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '100%',
            padding: '0'
        }}>
            {/* Image Container */}
            <div
                onClick={() => navigate(`/artwork/${artwork.id}`)}
                style={{ position: 'relative', height: '250px', width: '100%', overflow: 'hidden', cursor: 'pointer' }}
            >
                <img
                    src={artwork.imageUrl?.startsWith('http') ? artwork.imageUrl : `http://localhost:8080${artwork.imageUrl}`}
                    alt={artwork.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop'; }}
                />

                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    ...getStatusStyle()
                }}>
                    {stockStatus === 'Low Stock' ? <AlertTriangle size={12} /> : <Sparkles size={12} />}
                    {stockStatus}
                </div>
            </div>

            {/* Content Group */}
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3
                            onClick={() => navigate(`/artwork/${artwork.id}`)}
                            style={{ fontSize: '1.1rem', margin: 0, fontWeight: '700', color: 'var(--text-main)', cursor: 'pointer' }}
                        >
                            {artwork.title}
                        </h3>
                        <div style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: 'var(--primary)',
                        }}>
                            Rs.{artwork.price}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <span className="badge">{artwork.category}</span>
                    </div>
                </div>

                {(isCustomer || !user) && (
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '1rem',
                        background: '#f9fafb',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <input
                            type="number"
                            placeholder="Bid Rs."
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.85rem'
                            }}
                        />
                        <button
                            onClick={handleMakeOffer}
                            disabled={loading || stockStatus === 'Out of Stock'}
                            className="btn btn-primary"
                            style={{ padding: '8px 15px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            {loading ? '...' : <><Send size={12} /> Bid</>}
                        </button>
                    </div>
                )}

                {/* Final Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    {(isCustomer || !user) && (
                        <button
                            onClick={handleAddToCart}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '10px' }}
                            disabled={stockStatus === 'Out of Stock'}
                        >
                            <ShoppingCart size={16} /> Add to Cart
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`/artwork/${artwork.id}`)}
                        className="btn btn-outline"
                        style={{ padding: '10px' }}
                    >
                        <Info size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArtworkCard;
