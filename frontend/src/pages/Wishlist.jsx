import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { Trash2, Heart, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, moveToCart } = useWishlist();

    if (wishlist.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
                <div style={{ background: '#f1f5f9', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                    <Heart size={40} color="var(--text-muted)" />
                </div>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Your wishlist is <span style={{ color: 'var(--primary)' }}>empty</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>Save items you love here to easily find them later.</p>
                <Link to="/catalog" className="btn btn-primary" style={{ padding: '18px 40px' }}>
                    Explore Gallery <ArrowRight size={20} />
                </Link>
            </div>
        );
    }

    return (
        <div className="reveal-up">
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>My <span style={{ color: 'var(--primary)' }}>Wishlist</span></h1>
                    <p style={{ color: 'var(--text-muted)' }}>Keep track of your favorite artworks.</p>
                </div>
                <Link to="/catalog" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 'bold' }}>
                    <ArrowLeft size={18} /> Continue Shopping
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {wishlist.map(item => (
                    <div key={item.id} className="glass" style={{ padding: '1.5rem', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <img src={item.artwork.imageUrl?.startsWith('http') ? item.artwork.imageUrl : `http://localhost:8080${item.artwork.imageUrl}`}
                                alt={item.artwork.title}
                                style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '15px' }} />
                            <button
                                onClick={() => removeFromWishlist(item.id)}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', color: '#ef4444', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{item.artwork.title}</h3>
                                <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}>
                                    Rs.{item.artwork.price.toFixed(2)}
                                </span>
                            </div>
                            <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.artwork.category}</p>
                        </div>

                        <button onClick={() => moveToCart(item)} className="btn btn-primary" style={{ width: '100%', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <ShoppingCart size={18} /> Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
