import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import wishlistService from '../services/wishlist.service';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { user } = useAuth();
    const { addToCart } = useCart();

    useEffect(() => {
        if (user && user.roles.includes('ROLE_CUSTOMER')) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const response = await wishlistService.getMyWishlist();
            setWishlist(response.data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const addToWishlist = async (artwork) => {
        if (!user) {
            alert('Please login to add to wishlist');
            return;
        }
        try {
            const response = await wishlistService.addToWishlist(artwork.id);
            setWishlist(prev => [...prev, response.data]);
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            alert(error.response?.data?.message || 'Failed to add to wishlist');
        }
    };

    const removeFromWishlist = async (wishlistId) => {
        try {
            await wishlistService.removeFromWishlist(wishlistId);
            setWishlist(prev => prev.filter(item => item.id !== wishlistId));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const moveToCart = async (wishlistItem) => {
        try {
            addToCart(wishlistItem.artwork);
            await removeFromWishlist(wishlistItem.id);
        } catch (error) {
            console.error('Error moving to cart:', error);
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            moveToCart,
            fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
