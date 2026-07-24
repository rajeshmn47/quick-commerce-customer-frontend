import { createContext, useContext, useReducer } from 'react';

// Define initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Reducer functions
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      let updatedItems;
      if (existingItem) {
        updatedItems = state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: updatedItems, totalItems, totalPrice };
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.productId !== action.payload);
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: updatedItems, totalItems, totalPrice };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: updatedItems, totalItems, totalPrice };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

// Create Context
const CartContext = createContext();

// Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (product) => {
    console.log(product, "product");
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product._id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image_url || '',
        // store_id: product.store_id, // We can add store ID later
      },
    });
  };

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = () => useContext(CartContext);