import api from './api';

const placeOrder = (order) => {
    return api.post('/orders', order);
};

const getCustomerOrders = () => {
    return api.get('/orders/history');
};

const getAllOrders = () => {
    return api.get('/orders/all');
};

const getOrderById = (id) => {
    return api.get(`/orders/${id}`);
};

const confirmOrderAndGenerateShipment = (id, deliveryDate) => {
    let url = `/orders/${id}/confirm-shipment`;
    if (deliveryDate) {
        url += `?deliveryDate=${deliveryDate}`;
    }
    return api.put(url, {});
};

const updateOrderStatus = (id, status) => {
    return api.put(`/orders/${id}/status`, { status });
};

const updateShippingInfo = (id, address, phoneNumber) => {
    return api.put(`/orders/${id}/shipping-info`, { address, phoneNumber });
};

const cancelOrder = (id) => {
    return api.put(`/orders/${id}/cancel`, {});
};

const OrderService = {
    placeOrder,
    getCustomerOrders,
    getAllOrders,
    getOrderById,
    confirmOrderAndGenerateShipment,
    updateOrderStatus,
    updateShippingInfo,
    cancelOrder
};

export default OrderService;
