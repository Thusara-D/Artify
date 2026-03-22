import api from './api';

const getAllArtworks = () => {
    return api.get('/artworks');
};

const getArtworkById = (id) => {
    return api.get(`/artworks/${id}`);
};

const createArtwork = (formData) => {
    return api.post('/artworks', formData);
};

const updateArtwork = (id, artwork) => {
    return api.put(`/artworks/${id}`, artwork);
};

const deleteArtwork = (id) => {
    return api.delete(`/artworks/${id}`);
};

const searchArtworks = (keyword) => {
    return api.get(`/artworks/search?keyword=${keyword}`);
};

const getLowStockAlerts = () => {
    return api.get('/artworks/low-stock');
};

const ArtworkService = {
    getAllArtworks,
    getArtworkById,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    searchArtworks,
    getLowStockAlerts,
};

export default ArtworkService;
