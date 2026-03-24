import React, { useState, useEffect } from 'react';
import OfferService from '../services/offer.service';
import { Check, X, Clock, User, Package, AlertCircle } from 'lucide-react';

const OfferManagement = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const response = await OfferService.getAllOffers();
            setOffers(response.data);
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        const action = status === 'ACCEPTED' ? 'accept' : 'reject';
        if (window.confirm(`Are you sure you want to ${action} this offer?`)) {
            try {
                await OfferService.updateOfferStatus(id, status);
                setOffers(offers.map(off => off.id === id ? { ...off, status } : off));
            } catch (error) {
                console.error('Error updating offer:', error);
                alert('Failed to update offer status.');
            }
        }
    };

    const filteredOffers = filter === 'All' ? offers : offers.filter(off => off.status === filter);

    return (
        <div style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Offer Management</h1>
                <p style={{ color: 'var(--text-muted)' }}>Review customer price offers and negotiations.</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                {['PENDING', 'ACCEPTED', 'REJECTED', 'All'].map(f => (
                    <button
                        key={f}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {filteredOffers.map((offer) => (
                        <div key={offer.id} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <img
                                        src={offer.artwork.imageUrl ? `http://localhost:8080${offer.artwork.imageUrl}` : 'https://via.placeholder.com/80'}
                                        alt={offer.artwork.title}
                                        style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{offer.artwork.title}</h3>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Package size={12} /> Retail: Rs.{offer.artwork.price}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User size={12} /> From: {offer.customer.username}
                                        </div>
                                    </div>
                                </div>
                                <span className="badge" style={{
                                    background: offer.status === 'ACCEPTED' ? '#ccfbf1' : offer.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                                    color: offer.status === 'ACCEPTED' ? '#0d9488' : offer.status === 'REJECTED' ? '#dc2626' : '#d97706'
                                }}>
                                    {offer.status}
                                </span>
                            </div>

                            <div style={{
                                background: '#f9fafb',
                                padding: '1rem',
                                borderRadius: '6px',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid var(--border-color)'
                            }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Offered Price:</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>Rs.{offer.offeringPrice}</span>
                            </div>

                            {offer.status === 'PENDING' && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => handleUpdateStatus(offer.id, 'ACCEPTED')}
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '10px' }}
                                    >
                                        <Check size={16} /> Accept
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(offer.id, 'REJECTED')}
                                        className="btn btn-outline"
                                        style={{ flex: 1, padding: '10px', color: '#dc2626' }}
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                </div>
                            )}

                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                <Clock size={12} /> {new Date(offer.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}

                    {filteredOffers.length === 0 && (
                        <div className="card" style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center' }}>
                            <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <h2>No offers found</h2>
                            <p style={{ color: 'var(--text-muted)' }}>There are no offers in the {filter.toLowerCase()} category.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OfferManagement;
