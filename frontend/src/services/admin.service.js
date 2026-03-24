import api from './api';

const getAllUsers = () => {
    return api.get('/admin/users');
};

const setUserStatus = (id, active) => {
    return api.put(`/admin/users/${id}/status?active=${active}`);
};

const getSystemStats = () => {
    return api.get('/admin/stats');
};

const getActivityLogs = () => {
    return api.get('/admin/logs');
};

const AdminService = {
    getAllUsers,
    setUserStatus,
    getSystemStats,
    getActivityLogs,
};

export default AdminService;
