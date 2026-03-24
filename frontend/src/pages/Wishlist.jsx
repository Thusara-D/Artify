import React, { useState, useEffect } from 'react';
import WishlistService from '../services/wishlist.service';
import ArtworkCard from '../components/ArtworkCard';

const Wishlist = () => {//connd
    const [folders, setFolders] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [activeFolderId, setActiveFolderId] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadFolders();
    }, []);

    const loadFolders = () => {
        WishlistService.getUserFolders()
            .then((res) => {
                setFolders(res.data);
                if (res.data.length > 0 && !activeFolderId) {
                    setActiveFolderId(res.data[0].id);
                }
            })
            .catch((err) => setMessage("Failed to load wishlist folders"));
    };

    const handleCreateFolder = (e) => {
        e.preventDefault();
        if (!newFolderName) return;
        WishlistService.createFolder(newFolderName)
            .then(() => {
                setNewFolderName('');
                loadFolders();
            })
            .catch(() => setMessage("Error creating folder"));
    };

    const handleDeleteFolder = (id) => {
        if (window.confirm("Are you sure you want to delete this folder?")) {
            WishlistService.deleteFolder(id)
                .then(() => loadFolders())
                .catch(() => setMessage("Error deleting folder"));
        }
    };

    const handleRemoveItem = (itemId) => {
        WishlistService.removeItemFromFolder(itemId)
            .then(() => loadFolders())
            .catch(() => setMessage("Error removing item"));
    };

    const activeFolder = folders.find(f => f.id === activeFolderId);

    return (
        <div className="wishlist-page">
            <h1 style={{ marginBottom: '2rem', borderBottom: '2px solid #333', paddingBottom: '0.5rem' }}>My Wishlist</h1>

            {message && <div className="alert alert-info">{message}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
                <aside className="folders-sidebar">
                    <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Folders</h3>
                        <form onSubmit={handleCreateFolder} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                placeholder="New folder..."
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                            <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>+</button>
                        </form>

                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {folders.map(folder => (
                                <li key={folder.id} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setActiveFolderId(folder.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: activeFolderId === folder.id ? 'bold' : 'normal',
                                            color: activeFolderId === folder.id ? '#000' : '#666',
                                            textAlign: 'left',
                                            flex: 1
                                        }}
                                    >
                                        📁 {folder.name} ({folder.items?.length || 0})
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFolder(folder.id)}
                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        🗑️
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <section className="folder-content">
                    {activeFolder ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.8rem' }}>{activeFolder.name}</h2>
                                <span style={{ color: '#888' }}>{activeFolder.items?.length || 0} items</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                                {activeFolder.items?.map(item => (
                                    <div key={item.id} style={{ position: 'relative' }}>
                                        <ArtworkCard artwork={item.artwork} />
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'rgba(255,255,255,0.9)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '30px',
                                                height: '30px',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                zIndex: 10
                                            }}
                                            title="Remove from wishlist"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {(!activeFolder.items || activeFolder.items.length === 0) && (
                                    <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#999', padding: '4rem 0' }}>
                                        This folder is empty. Browse the catalog to add items!
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#999' }}>
                            <p>Select a folder or create a new one to get started.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Wishlist;
