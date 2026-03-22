import api from './api';

const register = (username, email, password, address, phone, roles) => {
    return api.post('/auth/signup', {
        username,
        email,
        password,
        address,
        phone,
        role: roles
    });
};

const login = (username, password) => {
    return api
        .post('/auth/signin', {
            username,
            password,
        })
        .then((response) => {
            if (response.data.accessToken) {
                const userData = { ...response.data, token: response.data.accessToken };
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const AuthService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default AuthService;
