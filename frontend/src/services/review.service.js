import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/reviews/';

const getArtworkReviews = (artworkId) => {
    return axios.get(API_URL + 'artwork/' + artworkId, { headers: authHeader() });
};

const getAverageRating = (artworkId) => {
    return axios.get(API_URL + `artwork/${artworkId}/average`);
};

const postReview = (artworkId, rating, comment, imageFile) => {
    const formData = new FormData();
    formData.append('artworkId', artworkId);
    formData.append('rating', rating);
    formData.append('comment', comment);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    return axios.post(API_URL + 'post', formData, {
        headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
        },
    });
};

const ReviewService = {
    getArtworkReviews,
    getAverageRating,
    postReview,
};

export default ReviewService;
