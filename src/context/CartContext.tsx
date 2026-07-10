import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { CartItem, OrderMode } from '../types';

interface CartState {
  items: CartItem[];
  mode: OrderMode | null;
  tableNumber: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { menuItemId: string; variantIndex?: number } }
  | { type: 'UPDATE_QTY'; payload: { menuItemId: string; variantIndex?: number; quantity: number } }
  | { type: 'UPDATE_COMMENT'; payload: { menuItemId: string; variantIndex?: number; comment: string } }
  | { type: 'SET_CUSTOMER'; payload: { name: string; phone: string; address?: string } }
  | { type: 'CLEAR' }
  | { type: 'SET_MODE'; payload: OrderMode }
  | { type: 'SET_TABLE'; payload: string };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItemId, variantIndex } = action.payload;
      const existing = state.items.find(
        i => i.menuItemId === menuItemId && i.variantIndex === variantIndex
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.menuItemId === menuItemId && i.variantIndex === variantIndex
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          i => !(i.menuItemId === action.payload.menuItemId && i.variantIndex === action.payload.variantIndex)
        ),
      };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.menuItemId === action.payload.menuItemId && i.variantIndex === action.payload.variantIndex
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    case 'UPDATE_COMMENT':
      return {
        ...state,
        items: state.items.map(i =>
          i.menuItemId === action.payload.menuItemId && i.variantIndex === action.payload.variantIndex
            ? { ...i, comment: action.payload.comment }
            : i
        ),
      };

    case 'SET_CUSTOMER':
      return {
        ...state,
        customerName: action.payload.name,
        customerPhone: action.payload.phone,
        customerAddress: action.payload.address || state.customerAddress,
      };

    case 'CLEAR':
      return { ...state, items: [] };

    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_TABLE':
      return { ...state, tableNumber: action.payload };
    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  mode: null,
  tableNumber: null,
  customerName: '',
  customerPhone: '',
  customerAddress: '',
};

const CartContext = createContext<{
  state: CartState;
  dispatch: Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
