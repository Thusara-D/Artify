import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/wishlist/';

const getUserFolders = () => {
    return axios.get(API_URL + 'folders', { headers: authHeader() });
};

const createFolder = (name) => {
    return axios.post(API_URL + 'folders', { name }, { headers: authHeader() });
};

const deleteFolder = (folderId) => {
    return axios.delete(API_URL + 'folders/' + folderId, { headers: authHeader() });
};

const addItemToFolder = (folderId, artworkId) => {
    return axios.post(API_URL + `folders/${folderId}/add/${artworkId}`, {}, { headers: authHeader() });
};

const removeItemFromFolder = (itemId) => {
    return axios.delete(API_URL + 'items/' + itemId, { headers: authHeader() });
};

const moveItem = (itemId, targetFolderId) => {
    return axios.put(API_URL + `items/${itemId}/move/${targetFolderId}`, {}, { headers: authHeader() });
};

const WishlistService = {
    getUserFolders,
    createFolder,
    deleteFolder,
    addItemToFolder,
    removeItemFromFolder,
    moveItem,
};

export default WishlistService;
