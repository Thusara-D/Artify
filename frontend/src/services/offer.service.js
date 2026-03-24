import api from './api';

const createOffer = (offer) => {
    return api.post('/offers', offer);
};

const getAllOffers = () => {
    return api.get('/offers/all');
};

const getMyOffers = () => {
    return api.get('/offers/my');
};

const getArtistOffers = (artistId) => {
    return api.get(`/offers/artist/${artistId}`);
};

const updateOfferStatus = (id, status) => {
    return api.put(`/offers/${id}/status?status=${status}`);
};

const OfferService = {
    createOffer,
    getAllOffers,
    getMyOffers,
    getArtistOffers,
    updateOfferStatus,
};

export default OfferService;
