import axios from 'axios';

const API_URL = 'http://localhost:8080/api/users';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: 'Bearer ' + user.token };
    } else {
        return {};
    }
};

const getUserProfile = (id) => {
    return axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const updateUserProfile = (id, userDetails) => {
    return axios.put(`${API_URL}/${id}`, userDetails, { headers: getAuthHeader() });
};

const UserService = {
    getUserProfile,
    updateUserProfile,
};

export default UserService;
