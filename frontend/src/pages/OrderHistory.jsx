import React, { useState, useEffect } from 'react';
import OrderService from '../services/order.service';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, MapPin, Phone, CreditCard, Hash, Clock, AlertCircle, Truck, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAdmin } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = isAdmin
                    ? await OrderService.getAllOrders()
                    : await OrderService.getCustomerOrders();
                setOrders(res.data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                if (err.response?.status === 401) {
                    setError('Your session has expired. Please log out and log back in.');
                } else {
                    setError('Failed to load orders. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [isAdmin]);

    const handleConfirmShipment = async (orderId) => {
        // Suggest a date 5 days from now
        const defaultDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const dateInput = window.prompt("Enter estimated delivery date (YYYY-MM-DD):", defaultDate);
        if (dateInput === null) return; // User cancelled

        try {
            await OrderService.confirmOrderAndGenerateShipment(orderId, dateInput);
            // Refresh orders
            const res = isAdmin
                ? await OrderService.getAllOrders()
                : await OrderService.getCustomerOrders();
            setOrders(res.data);
        } catch (err) {
            console.error('Error confirming shipment:', err);
            const errorMsg = typeof err.response?.data === 'string' ? err.response.data : 'Failed to confirm shipment. Please try again.';
            alert(errorMsg);
        }
    };

    const handleUpdateStatus = async (orderId, currentStatus) => {
        const statuses = ['PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
        const statusPrompt = window.prompt(`Enter new status:\nOptions: ${statuses.join(', ')}`, currentStatus);

        if (!statusPrompt) return;

        const newStatus = statusPrompt.trim().toUpperCase();
        if (!statuses.includes(newStatus)) {
            alert('Invalid status. Please enter one of the listed options.');
            return;
        }

        try {
            await OrderService.updateOrderStatus(orderId, newStatus);
            const res = isAdmin ? await OrderService.getAllOrders() : await OrderService.getCustomerOrders();
            setOrders(res.data);
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleEditShipping = async (order) => {
        if (!order.shippingDetails) return;

        const newAddress = window.prompt("Edit Address:", order.shippingDetails.address);
        if (newAddress === null) return;

        const newPhone = window.prompt("Edit Phone Number:", order.shippingDetails.phoneNumber);
        if (newPhone === null) return;

        try {
            await OrderService.updateShippingInfo(order.id, newAddress, newPhone);
            const res = isAdmin ? await OrderService.getAllOrders() : await OrderService.getCustomerOrders();
            setOrders(res.data);
            alert('Shipping info updated successfully!');
        } catch (err) {
            console.error('Error updating shipping details:', err);
            alert(err.response?.data || 'Failed to update shipping details.');
        }
    };

    const handleCancelOrder = async (orderId) => {
        const confirmCancel = window.confirm("Are you sure you want to CANCEL this shipment? This will restore stock items and cannot be undone.");
        if (!confirmCancel) return;

        try {
            await OrderService.cancelOrder(orderId);
            const res = isAdmin ? await OrderService.getAllOrders() : await OrderService.getCustomerOrders();
            setOrders(res.data);
            alert('Order successfully cancelled and stock restored.');
        } catch (err) {
            console.error('Error cancelling order:', err);
            alert(err.response?.data || 'Failed to cancel the order. It may have already shipped.');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PAID': return { background: '#dcfce7', color: '#16a34a' };
            case 'CONFIRMED': return { background: '#fef08a', color: '#854d0e' };
            case 'PROCESSING': return { background: '#fef3c7', color: '#d97706' };
            case 'SHIPPED': return { background: '#e0e7ff', color: '#4f46e5' };
            case 'OUT_FOR_DELIVERY': return { background: '#cffafe', color: '#0891b2' };
            case 'DELIVERED': return { background: '#ccfbf1', color: '#0d9488' };
            default: return { background: '#fee2e2', color: '#dc2626' };
        }
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        </div>
    );

    if (error) return (
        <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem' }}>Order History</h1>
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <AlertCircle size={40} color="#dc2626" style={{ marginBottom: '1rem' }} />
                <h2 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Session Expired</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
                <Link to="/login" className="btn btn-primary">Go to Login</Link>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Order History</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    {isAdmin ? 'Management view of all transactions.' : 'Your history of artwork acquisitions.'}
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="card" style={{ padding: '5rem', textAlign: 'center' }}>
                    <Package size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                    <h2>No orders yet</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Start your collection to see history here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.id} className="card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.3rem' }}><Hash size={12} /> ORDER #</div>
                                    <div style={{ fontWeight: '700' }}>{order.id}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.3rem' }}><Calendar size={12} /> DATE</div>
                                    <div>{new Date(order.orderDate).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.3rem' }}><Clock size={12} /> STATUS</div>
                                    <span style={{
                                        padding: '2px 10px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        ...getStatusStyle(order.status)
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>DELIVERY FEE</div>
                                        <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                                            {order.deliveryFee ? `Rs.${order.deliveryFee.toFixed(2)}` : 'Rs.0.00'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.3rem' }}><CreditCard size={12} /> TOTAL</div>
                                        <div style={{ fontWeight: '800', color: 'var(--primary)' }}>Rs.{order.totalAmount?.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Artworks</h4>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {order.items?.map(item => (
                                            <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                {item.artwork && (
                                                    <>
                                                        <img
                                                            src={item.artwork.imageUrl?.startsWith('http') ? item.artwork.imageUrl : `http://localhost:8080${item.artwork.imageUrl}`}
                                                            alt={item.artwork.title}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.artwork.title}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × Rs.{item.price}</div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Details</h4>
                                        {isAdmin && !['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) && (
                                            <button
                                                onClick={() => handleEditShipping(order)}
                                                className="btn btn-outline"
                                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', display: 'flex', gap: '4px', alignItems: 'center' }}
                                                title="Edit Address and Phone before Dispatch"
                                            >
                                                <Edit size={12} /> Edit
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.85rem' }}>
                                        {order.shippingDetails?.address && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <MapPin size={14} color="var(--text-muted)" />
                                                <div style={{ color: 'var(--text-muted)' }}>{order.shippingDetails.address}</div>
                                            </div>
                                        )}
                                        {order.shippingDetails?.phoneNumber && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <Phone size={14} color="var(--text-muted)" />
                                                <div style={{ color: 'var(--text-muted)' }}>{order.shippingDetails.phoneNumber}</div>
                                            </div>
                                        )}
                                        {order.shippingDetails?.estimatedDeliveryDate && (
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem', padding: '0.5rem', background: '#f0f9ff', borderRadius: '4px' }}>
                                                <Truck size={14} color="#0284c7" />
                                                <div style={{ color: '#0284c7', fontWeight: '600', fontSize: '0.8rem' }}>
                                                    Est. Delivery: {new Date(order.shippingDetails.estimatedDeliveryDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )}

                                        {isAdmin && (
                                            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                                                {order.status === 'PAID' && (
                                                    <button
                                                        onClick={() => handleConfirmShipment(order.id)}
                                                        className="btn btn-primary"
                                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                                                    >
                                                        Confirm & Generate Shipment
                                                    </button>
                                                )}
                                                {order.status !== 'PAID' && order.status !== 'CANCELLED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, order.status)}
                                                        className="btn btn-outline"
                                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', background: '#f8fafc' }}
                                                    >
                                                        Update Status
                                                    </button>
                                                )}
                                                {order.status !== 'SHIPPED' && order.status !== 'OUT_FOR_DELIVERY' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    >
                                                        Cancel Shipment
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {isAdmin && order.user && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '4px' }}>
                                                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)' }}>CUSTOMER</div>
                                                <div style={{ fontWeight: '600' }}>{order.user.username}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user.email}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
