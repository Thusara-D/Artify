import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import './index.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import ArtworkUpload from './pages/ArtworkUpload';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Inventory from './pages/Inventory';
import OfferManagement from './pages/OfferManagement';
import MyOffers from './pages/MyOffers';
import EditArtwork from './pages/EditArtwork';
import ProtectedRoute from './components/ProtectedRoute';

import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import ArtworkDetail from './pages/ArtworkDetail';
import InteriorVisualizer from './pages/InteriorVisualizer';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="container" style={{ padding: '2rem 0', minHeight: '80vh' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/artwork/:id" element={<ArtworkDetail />} />
                <Route path="/visualizer/:id" element={<InteriorVisualizer />} />

                <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
                  <Route path="/upload" element={<ArtworkUpload />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/inventory" element={<Inventory />} />
                  <Route path="/admin/offers" element={<OfferManagement />} />
                  <Route path="/admin/orders" element={<OrderHistory />} />
                  <Route path="/edit-art/:id" element={<EditArtwork />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['ROLE_CUSTOMER']} />}>
                  <Route path="/my-offers" element={<MyOffers />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                </Route>

                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
