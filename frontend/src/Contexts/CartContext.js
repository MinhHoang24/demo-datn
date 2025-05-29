import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const addToCart = (item) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                        : cartItem
                );
            } else {
                const newPrice = item.old_price * (1 - item.selectedVariant.sale / 100);
                return [...prevCart, { ...item, quantity: item.quantity || 1 ,newPrice}];
            }
        });
    };

    const removeFromCart = (item) => {
        setCart((prevCart) => {
            return prevCart.filter(cartItem => cartItem.id !== item.id);
        });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart,selectedItems, setSelectedItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;