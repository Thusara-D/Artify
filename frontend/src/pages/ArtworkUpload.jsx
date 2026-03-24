import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtworkService from '../services/artwork.service';
import { useAuth } from '../context/AuthContext';
import { Upload, DollarSign, Package, Tag, Layers, Image as ImageIcon, X, Sparkles, Wand2 } from 'lucide-react';

const ArtworkUpload = () => {
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
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

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

    const removeImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select an artwork image to upload.');
            return;
        }

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
            const formData = new FormData();
            formData.append('title', artwork.title);
            formData.append('description', artwork.description);
            formData.append('price', price);
            formData.append('category', artwork.category);
            formData.append('tags', artwork.tags);
            formData.append('stockQuantity', stockQuantity);
            formData.append('minStockThreshold', minStockThreshold);
            formData.append('image', selectedFile);
            formData.append('artistId', user.id.toString());

            await ArtworkService.createArtwork(formData);
            navigate('/catalog');
        } catch (err) {
            console.error('Upload error:', err);
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Unknown error';
            setError('Failed to upload artwork: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reveal-up" style={{ maxWidth: '1000px', margin: '3rem auto' }}>
            <div className="glass" style={{
                padding: '4rem',
                background: 'white',
                border: 'none',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1.2rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '24px',
                        color: 'var(--primary)',
                        marginBottom: '1.5rem'
                    }}>
                        <Wand2 size={40} />
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.05em' }}>
                        Establish <span style={{ color: 'var(--primary)' }}>Masterpiece</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500' }}>Bring your creative vision into the public ecosystem.</p>
                </div>

                {error && <div style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '15px', borderRadius: '16px', marginBottom: '2.5rem', fontWeight: '700', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Art Title</label>
                        <input name="title" value={artwork.title} onChange={handleChange} required placeholder="Name of your creation" style={{ width: '100%', padding: '16px 24px' }} />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visual Narrative</label>
                        <textarea name="description" value={artwork.description} onChange={handleChange} rows="5" placeholder="Story behind the brushstrokes..." style={{ width: '100%', padding: '16px 24px', resize: 'vertical' }} />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Artwork Asset</label>
                        {!previewUrl ? (
                            <div
                                style={{
                                    border: '3px dashed #e2e8f0',
                                    borderRadius: '30px',
                                    padding: '5rem 2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: '#f8fafc',
                                    transition: '0.4s'
                                }}
                                onClick={() => document.getElementById('file-upload').click()}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#eff6ff'; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                            >
                                <ImageIcon size={64} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>Drop your masterpiece here</h3>
                                <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Select a high-resolution PNG or JPG asset</p>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        ) : (
                            <div style={{ position: 'relative', borderRadius: '30px', overflow: 'hidden', height: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--secondary)', border: 'none', borderRadius: '50%', padding: '12px', cursor: 'pointer', color: 'white', display: 'flex' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value (Rs.)</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>Rs.</span>
                            <input name="price" type="number" step="0.01" value={artwork.price} onChange={handleChange} required placeholder="0.00" style={{ width: '100%', padding: '16px 16px 16px 60px' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Classification</label>
                        <select name="category" value={artwork.category} onChange={handleChange} style={{ width: '100%', padding: '16px 24px' }}>
                            <option value="Painting">Painting</option>
                            <option value="Sculpture">Sculpture</option>
                            <option value="Digital">Digital</option>
                            <option value="Photography">Photography</option>
                            <option value="Sketch">Sketch</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Artistic Tags</label>
                        <div style={{ position: 'relative' }}>
                            <Tag size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input name="tags" value={artwork.tags} onChange={handleChange} placeholder="vibrant, oil, abstract..." style={{ width: '100%', padding: '16px 16px 16px 50px' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock Reserve</label>
                        <div style={{ position: 'relative' }}>
                            <Package size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input name="stockQuantity" type="number" value={artwork.stockQuantity} onChange={handleChange} required style={{ width: '100%', padding: '16px 16px 16px 50px' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Critical Alert Limit</label>
                        <div style={{ position: 'relative' }}>
                            <Layers size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input name="minStockThreshold" type="number" value={artwork.minStockThreshold} onChange={handleChange} required style={{ width: '100%', padding: '16px 16px 16px 50px' }} />
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '24px', fontSize: '1.2rem' }} disabled={loading}>
                            {loading ? <div className="loading-spinner" style={{ width: '30px', height: '30px' }}></div> : <><Sparkles size={24} /> Publish Masterpiece</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArtworkUpload;
