import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Send, ArrowLeft, ShieldCheck, Truck, Sparkles, Tag, Layers, User, Maximize2, Heart, Star
} from 'lucide-react';
import ArtworkService from '../services/artwork.service';
import OfferService from '../services/offer.service';
import ReviewService from '../services/review.service';
import WishlistService from '../services/wishlist.service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';

const ArtworkDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isCustomer } = useAuth();
    const { addToCart } = useCart();

    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [bidding, setBidding] = useState(false);

    // Review State
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewImage, setReviewImage] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);

    // Wishlist State
    const [folders, setFolders] = useState([]);
    const [showWishlistModal, setShowWishlistModal] = useState(false);

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const response = await ArtworkService.getArtworkById(id);
                setArtwork(response.data);
                fetchReviewsAndRating();
            } catch (err) {
                console.error('Error fetching artwork details:', err);
                setError('Masterpiece not found or connectivity issue.');
            } finally {
                setLoading(false);
            }
        };
        fetchArtwork();
        if (isCustomer) {
            loadFolders();
        }
    }, [id, isCustomer]);

    const fetchReviewsAndRating = async () => {
        try {
            const [reviewsRes, avgRes] = await Promise.all([
                ReviewService.getArtworkReviews(id),
                ReviewService.getAverageRating(id)
            ]);
            setReviews(reviewsRes.data);
            setAvgRating(avgRes.data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const loadFolders = async () => {
        try {
            const res = await WishlistService.getUserFolders();
            setFolders(res.data);
        } catch (err) {
            console.error('Error loading folders:', err);
        }
    };

    const handlePostReview = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        if (!reviewComment) { alert('Please enter a comment'); return; }

        setSubmittingReview(true);
        try {
            await ReviewService.postReview(id, reviewRating, reviewComment, reviewImage);
            setReviewComment('');
            setReviewImage(null);
            setReviewRating(5);
            fetchReviewsAndRating();
            alert('Review posted successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error posting review. Have you purchased this item?');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleAddToWishlist = async (folderId) => {
        try {
            await WishlistService.addItemToFolder(folderId, id);
            setShowWishlistModal(false);
            alert('Added to wishlist!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding to wishlist');
        }
    };

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!isCustomer) {
            alert('Admin accounts cannot purchase items.');
            return;
        }
        addToCart(artwork);
        navigate('/cart');
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
            setBidding(true);
            const offerData = {
                artwork: { id: artwork.id },
                customer: { id: user.id },
                artist: { id: artwork.artist?.id },
                offeringPrice: parseFloat(offerPrice),
                status: 'PENDING'
            };
            await OfferService.createOffer(offerData);
            alert('Your creative bid has been sent! Check "Bids" for updates.');
            setOfferPrice('');
        } catch (err) {
            console.error('Error making offer:', err);
            alert('Connectivity issue. Please try again.');
        } finally {
            setBidding(false);
        }
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>Unveiling the masterpiece...</p>
        </div>
    );

    if (error || !artwork) return (
        <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Artistic <span style={{ color: 'var(--secondary)' }}>Void</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>{error || 'This artwork does not exist in our gallery.'}</p>
            <button onClick={() => navigate('/catalog')} className="btn btn-primary" style={{ padding: '15px 40px' }}>
                <ArrowLeft size={20} /> Back to Gallery
            </button>
        </div>
    );

    const stockStatus = artwork.stockQuantity <= 0 ? 'Out of Stock' : artwork.stockQuantity <= artwork.minStockThreshold ? 'Low Stock' : 'Available';

    return (
        <div className="reveal-up" style={{ paddingBottom: '6rem' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '3rem',
                    fontSize: '1.1rem'
                }}
            >
                <ArrowLeft size={18} /> Return to Collections
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: '5rem', alignItems: 'start' }}>
                {/* Visual Section */}
                <div style={{ position: 'sticky', top: '100px' }}>
                    <div className="glass" style={{
                        padding: '1.5rem',
                        borderRadius: '40px',
                        background: 'white',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.08)',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={artwork.imageUrl?.startsWith('http') ? artwork.imageUrl : `http://localhost:8080${artwork.imageUrl}`}
                            alt={artwork.title}
                            style={{
                                width: '100%',
                                borderRadius: '30px',
                                display: 'block',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                            }}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop'; }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '30px', textAlign: 'center' }}>
                            <ShieldCheck size={30} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                            <h4 style={{ margin: '0 0 5px 0' }}>Authentic</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Certified original work</p>
                        </div>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '30px', textAlign: 'center' }}>
                            <Truck size={30} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
                            <h4 style={{ margin: '0 0 5px 0' }}>Secure Shipping</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Global art logistics</p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div>
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '8px 16px' }}>
                                <Sparkles size={14} /> {artwork.category}
                            </span>
                            <span className="badge" style={{
                                background: stockStatus === 'Out of Stock' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(20, 184, 166, 0.1)',
                                color: stockStatus === 'Out of Stock' ? 'var(--secondary)' : '#14b8a6',
                                padding: '8px 16px'
                            }}>
                                {stockStatus}
                            </span>
                        </div>

                        <h1 style={{ fontSize: '4.5rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1.1, marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
                            {artwork.title}
                        </h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)' }}>
                                Rs.{artwork.price?.toFixed(2)}
                            </div>
                            <div style={{ height: '40px', width: '1px', background: '#e2e8f0' }}></div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                Inclusive of all taxes
                            </div>
                        </div>

                        <p style={{ fontSize: '1.3rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '3rem' }}>
                            {artwork.description || "No description provided for this masterpiece. Let the visuals speak for themselves."}
                        </p>

                        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '45px', height: '45px', background: '#f1f5f9', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>VISIONARY ARTIST</div>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{artwork.artist?.username || 'Independent Creator'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '45px', height: '45px', background: '#f1f5f9', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Layers size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>AVAILABILITY</div>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{artwork.stockQuantity} Pieces Remaining</div>
                                </div>
                            </div>
                        </div>

                        {(isCustomer || !user) && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={stockStatus === 'Out of Stock'}
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '22px', fontSize: '1.2rem', borderRadius: '25px', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)' }}
                                    >
                                        <ShoppingCart size={22} /> Add to Collection
                                    </button>
                                    <button
                                        onClick={() => setShowWishlistModal(true)}
                                        className="btn btn-outline"
                                        style={{ padding: '22px', borderRadius: '25px', borderColor: '#eee' }}
                                        title="Add to Wishlist"
                                    >
                                        <Heart size={22} color="#ff4d4d" fill={showWishlistModal ? "#ff4d4d" : "none"} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '8px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                        <input
                                            type="number"
                                            placeholder="Bid Rs."
                                            value={offerPrice}
                                            onChange={(e) => setOfferPrice(e.target.value)}
                                            style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', fontWeight: '800', textAlign: 'center' }}
                                        />
                                        <button
                                            onClick={handleMakeOffer}
                                            disabled={bidding || stockStatus === 'Out of Stock'}
                                            className="btn"
                                            style={{ background: 'var(--text-main)', color: 'white', padding: '12px 25px', borderRadius: '15px' }}
                                        >
                                            {bidding ? '...' : <Send size={18} />}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/visualizer/${id}`)}
                                        className="btn btn-outline"
                                        style={{
                                            padding: '12px',
                                            borderRadius: '20px',
                                            color: 'var(--primary)',
                                            borderColor: 'var(--primary)',
                                            background: 'rgba(99, 102, 241, 0.05)',
                                            fontWeight: '800'
                                        }}
                                    >
                                        <Maximize2 size={20} /> Try on your Wall
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ paddingTop: '3rem', borderTop: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>Artwork Tags</h4>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {artwork.tags?.map((tag, idx) => (
                                <span key={idx} style={{ padding: '8px 20px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Tag size={14} /> {tag}
                                </span>
                            )) || <p style={{ color: 'var(--text-muted)' }}>No tags available</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="glass" style={{ marginTop: '5rem', padding: '3rem', borderRadius: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Buyer <span style={{ color: 'var(--primary)' }}>Reviews</span></h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '3rem', fontWeight: '900' }}>{avgRating.toFixed(1)}</div>
                            <div>
                                <StarRating rating={Math.round(avgRating)} readOnly />
                                <div style={{ color: 'var(--text-muted)' }}>Based on {reviews.length} feedback</div>
                            </div>
                        </div>
                    </div>
                    {isCustomer && (
                        <div style={{ maxWidth: '400px', width: '100%', background: '#f8fafc', padding: '2rem', borderRadius: '25px' }}>
                            <h4 style={{ marginBottom: '1.5rem' }}>Post a Review</h4>
                            <form onSubmit={handlePostReview}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Rating</label>
                                    <StarRating rating={reviewRating} setRating={setReviewRating} />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <textarea
                                        placeholder="Share your experience with this artwork..."
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', minHeight: '100px' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Add Photo (Optional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setReviewImage(e.target.files[0])}
                                        style={{ fontSize: '0.8rem' }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '12px' }}
                                >
                                    {submittingReview ? 'Posting...' : 'Post Masterpiece Review'}
                                </button>
                                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '1rem', textAlign: 'center' }}>
                                    Only buyers of this specific artwork can post reviews.
                                </p>
                            </form>
                        </div>
                    )}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '3rem' }}>
                    <ReviewList reviews={reviews} />
                </div>
            </div>

            {/* Wishlist Modal */}
            {showWishlistModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '30px', width: '400px', maxWidth: '90%', background: 'white' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Choose Folder</h3>
                        <div style={{ display: 'grid', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                            {folders.length > 0 ? folders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => handleAddToWishlist(folder.id)}
                                    style={{
                                        padding: '1rem', textAlign: 'left', background: '#f8fafc', border: '1px solid #eee',
                                        borderRadius: '15px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s'
                                    }}
                                >
                                    📁 {folder.name}
                                </button>
                            )) : (
                                <p style={{ textAlign: 'center', color: '#888' }}>You don't have any folders yet. Create one in your Wishlist page first!</p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                onClick={() => navigate('/wishlist')}
                                className="btn"
                                style={{ flex: 1, background: '#eee', color: '#333', padding: '10px' }}
                            >
                                Manage Folders
                            </button>
                            <button
                                onClick={() => setShowWishlistModal(false)}
                                className="btn"
                                style={{ flex: 1, background: '#333', color: '#fff', padding: '10px' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtworkDetail;
