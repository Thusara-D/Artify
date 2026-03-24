import React, { useState } from 'react';
import StarRating from './StarRating';
import { Trash2, Edit, Check, X } from 'lucide-react';

const ReviewList = ({ reviews, user, isAdmin, isCustomer, onDelete, onUpdate }) => {
    const [editingId, setEditingId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');

    if (!reviews || reviews.length === 0) {
        return <p>No reviews yet. Be the first to share your thoughts!</p>;
    }

    const startEditing = (review) => {
        setEditingId(review.id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleSave = (id) => {
        onUpdate(id, editRating, editComment);
        setEditingId(null);
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    return (
        <div className="review-list">
            {reviews.map((review) => {
                const isOwner = user && user.id === review.user?.id;
                const canModify = isCustomer && isOwner;
                const canDelete = isAdmin || canModify;
                const isEditing = editingId === review.id;

                return (
                    <div key={review.id} className="review-card" style={{
                        borderBottom: '1px solid #eee',
                        padding: '1.5rem 0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong>{review.user?.username || 'Buyer'}</strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {isEditing ? (
                                    <StarRating rating={editRating} setRating={setEditRating} />
                                ) : (
                                    <StarRating rating={review.rating} readOnly />
                                )}

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => handleSave(review.id)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }} title="Save"><Check size={18} /></button>
                                            <button onClick={cancelEditing} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Cancel"><X size={18} /></button>
                                        </>
                                    ) : (
                                        <>
                                            {canModify && (
                                                <button onClick={() => startEditing(review)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => onDelete(review.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {isEditing ? (
                            <textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', minHeight: '60px' }}
                            />
                        ) : (
                            <p style={{ margin: 0, color: '#444' }}>{review.comment}</p>
                        )}
                        {review.imageUrl && !isEditing && (
                            <div className="review-image">
                                <img
                                    src={`http://localhost:8080${review.imageUrl}`}
                                    alt="Buyer photo"
                                    style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '0.5rem', border: '1px solid #eee' }}
                                />
                            </div>
                        )}
                        <small style={{ color: '#888' }}>
                            {new Date(review.createdAt).toLocaleDateString()}
                        </small>
                    </div>
                );
            })}
        </div>
    );
};

export default ReviewList;
