import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Initial data from localStorage
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('artify_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('artify_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (artwork) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === artwork.id);
            if (existingItem) {
                // Limit to stock quantity if available
                const newQuantity = Math.min(existingItem.quantity + 1, artwork.stockQuantity);
                return prevCart.map(item =>
                    item.id === artwork.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            }
            return [...prevCart, { ...artwork, quantity: 1 }];
        });
    };

    const removeFromCart = (artworkId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== artworkId));
    };

    const updateQuantity = (artworkId, quantity, stockLimit) => {
        if (quantity < 1) return;
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === artworkId
                    ? { ...item, quantity: Math.min(quantity, stockLimit) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('artify_cart');
    };

    // Calculate derived values
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
