import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
                <div style={{ background: '#f1f5f9', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                    <ShoppingCart size={40} color="var(--text-muted)" />
                </div>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Your cart is <span style={{ color: 'var(--primary)' }}>empty</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>Looks like you haven't added any masterpieces yet.</p>
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
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Shopping <span style={{ color: 'var(--primary)' }}>Cart</span></h1>
                    <p style={{ color: 'var(--text-muted)' }}>Review your selection before checkout.</p>
                </div>
                <Link to="/catalog" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 'bold' }}>
                    <ArrowLeft size={18} /> Continue Shopping
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr', gap: '3rem', alignItems: 'start' }}>
                <div className="glass" style={{ padding: '2rem', background: 'white' }}>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 150px 150px 50px', gap: '1.5rem', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                            <img src={item.imageUrl?.startsWith('http') ? item.imageUrl : `http://localhost:8080${item.imageUrl}`}
                                alt={item.title}
                                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '15px' }} />

                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{item.title}</h3>
                                <p style={{ margin: '5px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.category}</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn" style={{ padding: '6px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <Minus size={14} />
                                </button>
                                <span style={{ fontWeight: '800', fontSize: '1.1rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.stockQuantity)} className="btn" style={{ padding: '6px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)', textAlign: 'right' }}>
                                Rs.{(item.price * item.quantity).toFixed(2)}
                            </div>

                            <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--secondary)'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="glass" style={{ padding: '2.5rem', background: 'var(--text-main)', color: 'white' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Order Summary</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', opacity: 0.8 }}>
                        <span>Subtotal</span>
                        <span>Rs.{cartTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', opacity: 0.8 }}>
                        <span>Shipping</span>
                        <span style={{ color: '#4ade80', fontWeight: 'bold' }}>FREE</span>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total</span>
                        <span style={{ fontSize: '2.5rem', fontWeight: '900' }}>Rs.{cartTotal.toFixed(2)}</span>
                    </div>

                    <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ width: '100%', padding: '20px', fontSize: '1.1rem', borderRadius: '20px' }}>
                        Proceed to Checkout <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
