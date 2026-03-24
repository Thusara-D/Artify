import React, { useState, useEffect } from 'react';
import ArtworkService from '../services/artwork.service';
import { Plus, Edit, Trash2, Package, Tag, DollarSign, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Inventory = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');

    useEffect(() => {
        fetchArtworks();
    }, []);

    const fetchArtworks = async () => {
        try {
            setLoading(true);
            const response = await ArtworkService.getAllArtworks();
            setArtworks(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this artwork?')) {
            try {
                await ArtworkService.deleteArtwork(id);
                setArtworks(artworks.filter(art => art.id !== id));
            } catch (error) {
                console.error('Error deleting artwork:', error);
                alert('Failed to delete artwork.');
            }
        }
    };

    const categories = ['All', ...new Set(artworks.map(art => art.category))];

    const filteredArtworks = artworks.filter(art => {
        const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            art.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || art.category === categoryFilter;

        let matchesStock = true;
        if (stockFilter === 'Available') matchesStock = art.stockQuantity > art.minStockThreshold;
        if (stockFilter === 'Low Stock') matchesStock = art.stockQuantity > 0 && art.stockQuantity <= art.minStockThreshold;
        if (stockFilter === 'Out of Stock') matchesStock = art.stockQuantity <= 0;

        return matchesSearch && matchesCategory && matchesStock;
    });

    const getStockBadge = (art) => {
        if (art.stockQuantity <= 0) return <span className="badge" style={{ background: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d' }}>Out of Stock</span>;
        if (art.stockQuantity <= art.minStockThreshold) return <span className="badge" style={{ background: 'rgba(255, 165, 0, 0.2)', color: '#ffa500' }}>Low Stock</span>;
        return <span className="badge" style={{ background: 'rgba(80, 227, 194, 0.2)', color: '#50e3c2' }}>Available</span>;
    };

    return (
        <div className="container py-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Inventory <span style={{ color: 'var(--primary)' }}>Management</span></h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor and manage your artwork stock and details.</p>
                </div>
                <Link to="/upload" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> Add New Art
                </Link>
            </div>

            {/* Filters */}
            <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search artworks..."
                        style={{ width: '100%', padding: '12px 12px 12px 40px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={18} className="text-muted" />
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '10px' }}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={18} className="text-muted" />
                    <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} style={{ padding: '10px' }}>
                        <option value="All">All Stock Levels</option>
                        <option value="Available">Available</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="loading-spinner"></div>
                    <p>Loading inventory...</p>
                </div>
            ) : (
                <div className="glass" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1.2rem' }}>Artwork</th>
                                <th style={{ padding: '1.2rem' }}>Category</th>
                                <th style={{ padding: '1.2rem' }}>Price</th>
                                <th style={{ padding: '1.2rem' }}>Stock</th>
                                <th style={{ padding: '1.2rem' }}>Status</th>
                                <th style={{ padding: '1.2rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredArtworks.map((art) => (
                                <tr key={art.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img
                                                src={art.imageUrl ? `http://localhost:8080${art.imageUrl}` : 'https://via.placeholder.com/50'}
                                                alt={art.title}
                                                style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                                            />
                                            <div style={{ fontWeight: '500' }}>{art.title}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                                            <Tag size={14} /> {art.category}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                        Rs.{art.price}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '1.1rem',
                                                color: art.stockQuantity <= art.minStockThreshold ? '#ffa500' : 'inherit'
                                            }}>
                                                {art.stockQuantity}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ min: {art.minStockThreshold}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {getStockBadge(art)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Link to={`/edit-art/${art.id}`} className="btn btn-outline" style={{ padding: '8px', borderRadius: '8px' }}>
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(art.id)}
                                                className="btn btn-outline"
                                                style={{ padding: '8px', borderRadius: '8px', color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.3)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredArtworks.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No artworks found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Inventory;
