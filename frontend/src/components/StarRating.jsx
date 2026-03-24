import React from 'react';

const StarRating = ({ rating, setRating, readOnly = false }) => {
    return (
        <div className="star-rating" style={{ display: 'flex', gap: '4px', fontSize: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => !readOnly && setRating(star)}
                    style={{
                        cursor: readOnly ? 'default' : 'pointer',
                        color: star <= rating ? '#ffc107' : '#e4e5e9',
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;
