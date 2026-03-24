import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/wishlist/';

const getMyWishlist = () => {
    return axios.get(API_URL + 'my-list', { headers: authHeader() });
};

const addToWishlist = (artworkId) => {
    return axios.post(API_URL + `add/${artworkId}`, {}, { headers: authHeader() });
};

const removeFromWishlist = (wishlistId) => {
    return axios.delete(API_URL + `remove/${wishlistId}`, { headers: authHeader() });
};

const wishlistService = {
    getMyWishlist,
    addToWishlist,
    removeFromWishlist,
};

export default wishlistService;
