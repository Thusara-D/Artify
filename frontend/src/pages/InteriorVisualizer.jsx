import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, FabricImage } from 'fabric';
import { ArrowLeft, Upload, Download, Maximize2, Move, RotateCcw, Image as ImageIcon } from 'lucide-react';
import ArtworkService from '../services/artwork.service';

const InteriorVisualizer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [roomUploaded, setRoomUploaded] = useState(false);

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const res = await ArtworkService.getArtworkById(id);
                setArtwork(res.data);
            } catch (err) {
                console.error('Error fetching artwork:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchArtwork();
    }, [id]);

    useEffect(() => {
        if (!canvasRef.current || fabricRef.current) return;

        // Initialize Fabric Canvas (Version 7 syntax)
        const canvas = new Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: '#f1f5f9'
        });

        fabricRef.current = canvas;

        return () => {
            canvas.dispose();
            fabricRef.current = null;
        };
    }, [loading]);

    const handleRoomUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (f) => {
            const data = f.target.result;

            // Background image handling in Fabric 7
            const img = await FabricImage.fromURL(data);

            const canvas = fabricRef.current;
            if (!canvas || !img) return;

            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            const imgWidth = img.width;
            const imgHeight = img.height;

            const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);

            img.set({
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                selectable: false,
                evented: false,
                name: 'background'
            });

            canvas.clear();
            canvas.add(img);
            canvas.sendObjectToBack(img);
            canvas.renderAll();
            setRoomUploaded(true);

            // Add artwork automatically if it exists
            if (artwork) addArtworkOverlay();
        };
        reader.readAsDataURL(file);
    };

    const addArtworkOverlay = async () => {
        if (!artwork || !fabricRef.current) return;

        const canvas = fabricRef.current;
        const imageUrl = artwork.imageUrl?.startsWith('http')
            ? artwork.imageUrl
            : `http://localhost:8080${artwork.imageUrl}`;

        try {
            const artImg = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });

            // Set initial size (Very small to ensure it fits and can be scaled up)
            const initialScale = 0.08;
            artImg.scale(initialScale);
            artImg.set({
                originX: 'center',
                originY: 'center',
                left: canvas.width / 2,
                top: canvas.height / 2,
                cornerColor: 'var(--primary)',
                cornerSize: 12,
                transparentCorners: false,
                borderColor: 'var(--primary)',
                borderScaleFactor: 2,
                padding: 5
            });

            canvas.add(artImg);
            canvas.setActiveObject(artImg);
            canvas.renderAll();
        } catch (err) {
            console.error('Failed to load artwork onto canvas:', err);
        }
    };

    const handleDownload = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1
        });

        const link = document.createElement('a');
        link.download = `art-visualization-${id}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="text-center py-5">Connecting to gallery...</div>;

    return (
        <div className="fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
                <ArrowLeft size={18} /> Back to Details
            </button>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: 0 }}>Wall <span style={{ color: 'var(--primary)' }}>Visualizer</span></h1>
                <p style={{ color: 'var(--text-muted)' }}>Visualize "{artwork?.title}" in your own space.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
                <div className="glass" style={{ padding: '1rem', borderRadius: '24px', position: 'relative', overflow: 'hidden', background: '#e2e8f0' }}>
                    <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', borderRadius: '16px' }} />

                    {!roomUploaded && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(5px)' }}>
                            <ImageIcon size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#475569', fontWeight: 'bold' }}>Step 1: Upload a photo of your room</p>
                            <label className="btn btn-primary" style={{ cursor: 'pointer', marginTop: '1rem' }}>
                                <Upload size={18} /> Upload Room Photo
                                <input type="file" hidden onChange={handleRoomUpload} accept="image/*" />
                            </label>
                        </div>
                    )}
                </div>

                <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '800' }}>Instructions</h3>
                    <ul style={{ padding: 0, listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}><Upload size={16} /> 1. Upload your wall/room photo</li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}><Move size={16} /> 2. Drag the art to your wall</li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}><Maximize2 size={16} /> 3. Resize to match scale</li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}><Download size={16} /> 4. Save your preview</li>
                    </ul>

                    <div style={{ marginTop: '3rem', display: 'grid', gap: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleDownload}
                            disabled={!roomUploaded}
                            style={{ width: '100%', padding: '15px' }}
                        >
                            <Download size={18} /> Download Preview
                        </button>

                        <button
                            className="btn btn-outline"
                            onClick={() => window.location.reload()}
                            style={{ width: '100%', padding: '15px' }}
                        >
                            <RotateCcw size={18} /> Reset Canvas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteriorVisualizer;
