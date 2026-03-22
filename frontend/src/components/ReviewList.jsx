import React from 'react';
import StarRating from './StarRating';

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return <p>No reviews yet. Be the first to share your thoughts!</p>;
    }

    return (
        <div className="review-list">
            {reviews.map((review) => (
                <div key={review.id} className="review-card" style={{
                    borderBottom: '1px solid #eee',
                    padding: '1.5rem 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{review.user?.username || 'Buyer'}</strong>
                        <StarRating rating={review.rating} readOnly />
                    </div>
                    <p style={{ margin: 0, color: '#444' }}>{review.comment}</p>
                    {review.imageUrl && (
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
            ))}
        </div>
    );
};

export default ReviewList;
