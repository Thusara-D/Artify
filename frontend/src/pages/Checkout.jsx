import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import OrderService from '../services/order.service';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Phone, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


// Initialize Stripe with Publishable Key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51TDbUz22ZCvOON3CI146C9CZGl4MM3G2t1m9eKc8pU7JTM3z3etUwrXCMM0wpAa2OAym8n9bHtblwR6yTgg3v3sN00hgLtOI6c");

const CheckoutComponent = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);
    const [reservationExpired, setReservationExpired] = useState(false);
    const [orderSnapshot, setOrderSnapshot] = useState(null);

    useEffect(() => {
        if (cart.length === 0) return;

        let interval;
        const initReservation = async () => {
            try {
                const payload = {
                    items: cart.map(item => ({
                        artwork: { id: item.id },
                        quantity: item.quantity
                    }))
                };
                const res = await api.post('/reservations/create', payload);
                const expiresAt = new Date(res.data.expiresAt).getTime();

                interval = setInterval(() => {
                    const now = new Date().getTime();
                    const distance = expiresAt - now;
                    if (distance <= 0) {
                        clearInterval(interval);
                        setTimeLeft('00:00');
                        setReservationExpired(true);
                    } else {
                        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                    }
                }, 1000);
            } catch (err) {
                console.error("Failed to create reservation", err);
                const errorMessage = err.response?.data?.message || err.response?.data || err.message || "Failed to reserve items.";
                setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
            }
        };

        initReservation();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (reservationExpired) {
            alert("Your 10-minute hold on these items has expired. You will be redirected to the cart.");
            navigate('/cart');
        }
    }, [reservationExpired, navigate]);

    const [details, setDetails] = useState({
        shippingAddress: user?.address || '',
        phoneNumber: user?.phone || '',
        paymentMethod: 'Credit Card (Stripe)'
    });

    const deliveryFee = 500; // Static Rs. 500 delivery fee
    const finalTotal = cartTotal + deliveryFee;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!stripe || !elements) {
            setLoading(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        try {
            // Fetch clientSecret from backend
            const response = await api.post('/payment/create-payment-intent', { amount: finalTotal });
            const paymentData = response.data;

            if (paymentData.clientSecret) {
                // Confirm payment
                const paymentResult = await stripe.confirmCardPayment(paymentData.clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: user?.name || 'Guest',
                            phone: details.phoneNumber
                        }
                    }
                });

                if (paymentResult.error) {
                    setError(paymentResult.error.message);
                    setLoading(false);
                    return;
                }
            } else {
                setError('Failed to initialize payment gateway properly.');
                setLoading(false);
                return;
            }

            // Upon successful Stripe payment, register the order
            const orderData = {
                shippingDetails: {
                    address: details.shippingAddress,
                    phoneNumber: details.phoneNumber,
                    paymentMethod: 'Stripe',
                    cardNumber: '**** **** **** ****' // Sensitive data handled by Stripe
                },
                items: cart.map(item => ({
                    artwork: { id: item.id },
                    quantity: item.quantity,
                    price: item.price
                })),
                deliveryFee: deliveryFee
            };

            await OrderService.placeOrder(orderData);
            setOrderSnapshot({
                shippingDetails: orderData.shippingDetails,
                items: cart.map(item => ({ ...item })),
                deliveryFee: deliveryFee,
                subtotal: cartTotal
            });
            clearCart();
            setSuccess(true);
        } catch (err) {
            console.error("Payment error:", err);
            const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Failed to place order. Connection issue.';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    const generateInvoicePDF = () => {
        if (!orderSnapshot) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // #10b981
        doc.text('ArtSelling Invoice', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 32);
        doc.text(`Name: ${user?.name || 'Guest'}`, 14, 38);
        doc.text(`Phone: ${orderSnapshot.shippingDetails.phoneNumber}`, 14, 44);
        doc.text(`Shipping Address: ${orderSnapshot.shippingDetails.address}`, 14, 50);

        // Table
        const tableColumn = ["Item", "Quantity", "Price (Rs)", "Total (Rs)"];
        const tableRows = [];

        orderSnapshot.items.forEach(item => {
            const itemData = [
                item.title,
                item.quantity,
                parseFloat(item.price).toFixed(2),
                (item.price * item.quantity).toFixed(2)
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            startY: 60,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] },
        });

        // Footer Totals
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60;
        doc.setFontSize(12);
        doc.setTextColor(0);

        doc.text(`Subtotal: Rs. ${orderSnapshot.subtotal.toFixed(2)}`, 14, finalY + 10);
        doc.text(`Delivery Fee: Rs. ${orderSnapshot.deliveryFee.toFixed(2)}`, 14, finalY + 18);

        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text(`Total Amount: Rs. ${(orderSnapshot.subtotal + orderSnapshot.deliveryFee).toFixed(2)}`, 14, finalY + 28);

        // Save
        doc.save(`Invoice_${new Date().getTime()}.pdf`);
    };

    if (success) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }} className="reveal-up">
                <div className="glass" style={{ padding: '6rem 4rem', textAlign: 'center', background: 'white', maxWidth: '600px', borderRadius: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.08)' }}>
                    <div style={{ width: '120px', height: '120px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>
                        <CheckCircle size={60} color="#10b981" />
                    </div>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                        Payment <span style={{ color: '#10b981' }}>Successful!</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.7', marginBottom: '3rem' }}>
                        Thank you for your acquisition. Your payment was verified securely by Stripe.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={generateInvoicePDF} className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '1.1rem', borderRadius: '25px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)' }}>
                            Generate Invoice PDF
                        </button>
                        <button onClick={() => navigate('/orders')} className="btn btn-secondary" style={{ padding: '15px 30px', fontSize: '1.1rem', borderRadius: '25px', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', background: '#f1f5f9', border: 'none', color: 'var(--text-main)', fontWeight: 'bold' }}>
                            View Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="reveal-up">
            <div style={{ marginBottom: '3rem' }}>
                <button type="button" onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
                    <ArrowLeft size={18} /> Back to Cart
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Finalize <span style={{ color: 'var(--primary)' }}>Checkout</span></h1>
                    {timeLeft && !success && (
                        <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)' }}>
                            <span>⏳ Hold expires in:</span>
                            <span>{timeLeft}</span>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr', gap: '3rem', alignItems: 'start' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
                    {/* Shipping Section */}
                    <div className="glass" style={{ padding: '3rem', background: 'white' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Truck color="var(--primary)" /> Shipping Details
                        </h2>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Delivery Address</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                                    <textarea name="shippingAddress" value={details.shippingAddress} onChange={handleChange} required rows="3"
                                        style={{ width: '100%', padding: '14px 14px 14px 44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '15px' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Active Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input name="phoneNumber" value={details.phoneNumber} onChange={handleChange} required
                                        style={{ width: '100%', padding: '14px 14px 14px 44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '15px' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="glass" style={{ padding: '3rem', background: 'white' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CreditCard color="var(--primary)" /> Secure Payment (Stripe Test)
                        </h2>
                        <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '15px' }}>
                            <CardElement options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                    invalid: {
                                        color: '#9e2146',
                                    },
                                },
                            }} />
                        </div>
                    </div>

                    {error && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--secondary)', padding: '1rem', borderRadius: '12px', fontWeight: 'bold' }}>{error}</div>}

                    <button type="submit" disabled={loading || !stripe || reservationExpired} className="btn btn-primary" style={{ padding: '22px', fontSize: '1.2rem', borderRadius: '25px', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)' }}>
                        {loading ? 'Processing Payment...' : reservationExpired ? 'Reservation Expired' : `Complete Payment - Rs.${finalTotal.toFixed(2)}`}
                    </button>
                </form>

                <div className="glass" style={{ padding: '2rem', background: 'white' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order Review</h2>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity} × Rs.{item.price}</div>
                            </div>
                            <div style={{ fontWeight: '800' }}>Rs.{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', color: 'var(--text-muted)' }}>
                        <span>Subtotal</span>
                        <span>Rs.{cartTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        <span>Delivery Fee</span>
                        <span>Rs.{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px dashed #e2e8f0', fontSize: '1.4rem' }}>
                        <span style={{ fontWeight: 'bold' }}>Total</span>
                        <span style={{ fontWeight: '900', color: 'var(--primary)' }}>Rs.{finalTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Checkout = () => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutComponent />
        </Elements>
    );
};

export default Checkout;
