import { createContext, useContext, useReducer, useEffect } from 'react';

// ==================== Initial State ====================
const STORAGE_KEY = 'shopping_cart';

const getInitialState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
  }
  return {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  };
};

const initialState = getInitialState();

// ==================== Reducer ====================
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        item => item.productId === action.payload.productId
      );
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
      const updatedItems = state.items
        .map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        )
        .filter(item => item.quantity > 0);
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: updatedItems, totalItems, totalPrice };
    }

    case 'CLEAR_CART':
      return { items: [], totalItems: 0, totalPrice: 0 };

    default:
      return state;
  }
};

// ==================== Context ====================
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // ✅ Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ✅ Actions
  const addItem = (product) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product._id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image_url || '',
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
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
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