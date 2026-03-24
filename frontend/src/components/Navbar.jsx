import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ShoppingCart, Sparkles, PlusSquare, LayoutDashboard, LogOut, User, Gavel, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { user, logout, isAdmin, isCustomer } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: '0',
            zIndex: 1000,
            background: 'white',
            borderBottom: '1px solid var(--border-color)'
        }}>
            <Link to="/" style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Sparkles size={20} />
                </div>
                ARTIFY
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/catalog" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Gallery</Link>

                {isAdmin && (
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link to="/upload" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            <PlusSquare size={16} /> Add
                        </Link>
                        <Link to="/admin/orders" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            <ShoppingBag size={16} /> Sales
                        </Link>
                        <Link to="/admin/offers" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            <Gavel size={16} /> Offers
                        </Link>
                        <Link to="/admin" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                    </div>
                )}

                {isCustomer && (
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Link to="/wishlist" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            <Heart size={16} /> Wishlist
                        </Link>
                        <Link to="/orders" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Orders</Link>
                        <Link to="/my-offers" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            <Gavel size={16} /> Bids
                        </Link>
                        <Link to="/cart" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', position: 'relative' }}>
                            <ShoppingCart size={18} />
                            {cartCount > 0 && (
                                <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: 'var(--secondary)', color: 'white', fontSize: '0.7rem', minWidth: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', padding: '0 4px' }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Link to="/profile" style={{
                                padding: '6px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--text-main)',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                background: '#f3f4f6',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}>
                                <span>{user.username}</span>
                            </Link>
                            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', color: 'var(--text-muted)' }}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', alignSelf: 'center' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Join</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
