import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, AmazonProduct } from '@/integrations/amazon-uae/types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shippingTotal: number;
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: AmazonProduct; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  addItem: (product: AmazonProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { product, quantity }];
      }
      
      return calculateTotals(newItems);
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload.productId);
      return calculateTotals(newItems);
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.product.id !== productId);
        return calculateTotals(newItems);
      }
      
      const newItems = state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      return calculateTotals(newItems);
    }
    
    case 'CLEAR_CART':
      return calculateTotals([]);
    
    case 'LOAD_CART':
      return calculateTotals(action.payload);
    
    default:
      return state;
  }
};

const calculateTotals = (items: CartItem[]): CartState => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingTotal = items.reduce((sum, item) => sum + (item.product.shipping_cost * item.quantity), 0);
  const total = subtotal + shippingTotal;
  
  return {
    items,
    totalItems,
    subtotal,
    shippingTotal,
    total
  };
};

export const AmazonCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    subtotal: 0,
    shippingTotal: 0,
    total: 0
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('amazon-cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('amazon-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (product: AmazonProduct, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useAmazonCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useAmazonCart must be used within an AmazonCartProvider');
  }
  return context;
};
