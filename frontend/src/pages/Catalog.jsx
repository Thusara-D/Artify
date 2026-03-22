import React, { useState, useEffect } from 'react';
import ArtworkService from '../services/artwork.service';
import ArtworkCard from '../components/ArtworkCard';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const Catalog = () => {
    const [artworks, setArtworks] = useState([]);
    const [filteredArtworks, setFilteredArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const { user, isCustomer } = useAuth();

    const categories = ['All', 'Painting', 'Sculpture', 'Digital', 'Photography', 'Sketch'];

    useEffect(() => {
        fetchArtworks();
    }, []);

    const fetchArtworks = async () => {
        try {
            const res = await ArtworkService.getAllArtworks();
            setArtworks(res.data);
            setFilteredArtworks(res.data);
        } catch (err) {
            console.error('Error fetching artworks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = artworks;

        // Search filter
        if (searchQuery) {
            result = result.filter(art =>
                art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                art.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'All') {
            result = result.filter(art => art.category === selectedCategory);
        }

        // Sorting
        if (sortBy === 'price-low') {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            result = [...result].sort((a, b) => b.price - a.price);
        }

        setFilteredArtworks(result);
    }, [searchQuery, selectedCategory, sortBy, artworks]);

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Art Gallery</h1>
                <p style={{ color: 'var(--text-muted)' }}>Browse our collection of hand-crafted masterpieces.</p>
            </div>

            {/* Filters & Search Bar */}
            <div style={{
                padding: '1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
                background: '#f9fafb',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
            }}>
                <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search artworks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 40px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{ padding: '10px', width: 'auto' }}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <SlidersHorizontal size={16} />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: '10px', width: 'auto' }}
                        >
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Artworks Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                </div>
            ) : filteredArtworks.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {filteredArtworks.map(art => (
                        <ArtworkCard key={art.id} artwork={art} />
                    ))}
                </div>
            ) : (
                <div className="card" style={{ padding: '5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No artworks found matching your criteria.</p>
                    <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="btn btn-outline">Clear All Filters</button>
                </div>
            )}
        </div>
    );
};

export default Catalog;
