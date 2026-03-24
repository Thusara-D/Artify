import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArtworkService from '../services/artwork.service';
import { useAuth } from '../context/AuthContext';
import { Upload, DollarSign, Package, Tag, Layers, Image as ImageIcon, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EditArtwork = () => {
    const { id } = useParams();
    const [artwork, setArtwork] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Painting',
        tags: '',
        stockQuantity: 1,
        minStockThreshold: 0
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchArtwork();
    }, [id]);

    const fetchArtwork = async () => {
        try {
            const response = await ArtworkService.getArtworkById(id);
            const data = response.data;
            setArtwork({
                title: data.title,
                description: data.description,
                price: data.price,
                category: data.category,
                tags: data.tags ? data.tags.join(', ') : '',
                stockQuantity: data.stockQuantity,
                minStockThreshold: data.minStockThreshold
            });
            setPreviewUrl(data.imageUrl ? `http://localhost:8080${data.imageUrl}` : null);
        } catch (error) {
            console.error('Error fetching artwork:', error);
            setError('Failed to fetch artwork details.');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setArtwork(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const price = parseFloat(artwork.price);
        const stockQuantity = parseInt(artwork.stockQuantity);
        const minStockThreshold = parseInt(artwork.minStockThreshold);

        if (price <= 0) {
            setError('Price must be greater than zero.');
            setLoading(false);
            return;
        }

        if (stockQuantity <= 0) {
            setError('Stock quantity must be greater than zero.');
            setLoading(false);
            return;
        }

        if (minStockThreshold >= stockQuantity) {
            setError('Min stock threshold must be less than the stock quantity.');
            setLoading(false);
            return;
        }

        try {
            // If there's a new file, we might need a separate endpoint for multipart update 
            // OR we just use JSON if only text fields changed.
            // For now, let's assume simple JSON update for text fields.
            // In a real app, you'd handle file upload in update too.

            const tagsArray = typeof artwork.tags === 'string'
                ? artwork.tags.split(',').map(tag => tag.trim()).filter(t => t !== '')
                : artwork.tags;

            const updateData = {
                ...artwork,
                price: price,
                tags: tagsArray,
                stockQuantity: stockQuantity,
                minStockThreshold: minStockThreshold
            };

            await ArtworkService.updateArtwork(id, updateData);
            navigate('/admin/inventory');
        } catch (err) {
            console.error('Update error:', err);
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Unknown error';
            setError('Failed to update artwork: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="text-center py-5">Loading artwork details...</div>;

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <Link to="/admin/inventory" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <ArrowLeft size={18} /> Back to Inventory
                </Link>
            </div>

            <div className="glass" style={{ padding: '3rem', background: 'rgba(255, 255, 255, 0.95)', color: 'var(--text-main)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-main)' }}>Edit <span style={{ color: 'var(--primary)' }}>Artwork</span></h1>

                {error && <div style={{ color: 'var(--error)', background: 'rgba(255, 77, 77, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Title</label>
                        <input name="title" value={artwork.title} onChange={handleChange} required className="glass" style={{ width: '100%', padding: '12px', background: 'white', color: 'var(--text-main)', border: '1px solid #e2e8f0' }} />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Description</label>
                        <textarea name="description" value={artwork.description} onChange={handleChange} rows="4" className="glass" style={{ width: '100%', padding: '12px', background: 'white', color: 'var(--text-main)', border: '1px solid #e2e8f0', resize: 'vertical' }} />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Current Image</label>
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '300px', border: '1px solid var(--glass-border)', background: '#f8fafc' }}>
                            <img
                                src={previewUrl?.startsWith('http') ? previewUrl : `http://localhost:8080${previewUrl}`}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop'; }}
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Image updates are not supported in edit mode yet. Delete and re-upload if you need a new image.</p>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Price (Rs.)</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-main)', fontWeight: 'bold' }}>Rs.</span>
                            <input name="price" type="number" step="0.01" value={artwork.price} onChange={handleChange} required className="glass" style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'white', color: 'var(--text-main)', border: '1px solid #e2e8f0' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Category</label>
                        <select name="category" value={artwork.category} onChange={handleChange} className="glass" style={{ width: '100%', padding: '12px', background: 'white', color: 'var(--text-main)', border: '1px solid #e2e8f0' }}>
                            <option value="Painting">Painting</option>
                            <option value="Sculpture">Sculpture</option>
                            <option value="Digital">Digital</option>
                            <option value="Photography">Photography</option>
                            <option value="Sketch">Sketch</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Tags (comma separated)</label>
                        <div style={{ position: 'relative' }}>
                            <Tag size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-main)' }} />
                            <input name="tags" value={artwork.tags} onChange={handleChange} placeholder="abstract, vibrant, modern" className="glass" style={{ width: '100%', padding: '12px 12px 12px 32px', background: 'white', color: 'var(--text-main)', border: '1px solid #e2e8f0' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Stock Quantity</label>
                        <div style={{ position: 'relative' }}>
                            <Package size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-main)' }} />
                            <input name="stockQuantity" type="number" value={artwork.stockQuantity} onChange={handleChange} required className="glass" style={{ width: '100%', padding: '12px 12px 12px 32px', background: 'white', color: 'var(--text-main)', border: '1px solid #e2e8f0' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Min Stock Threshold</label>
                        <div style={{ position: 'relative' }}>
                            <Layers size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-main)' }} />
                            <input name="minStockThreshold" type="number" value={artwork.minStockThreshold} onChange={handleChange} required className="glass" style={{ width: '100%', padding: '12px 12px 12px 32px', background: 'white', color: 'var(--text-main)', border: '1px solid #e2e8f0' }} />
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
                            {loading ? 'Saving Changes...' : 'Update Artwork'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditArtwork;
