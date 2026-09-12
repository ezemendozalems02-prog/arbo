import { createContext, useContext, useState } from 'react'
import { useCart } from '../hooks/useCart'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const cart = useCart()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  return (
    <CartContext.Provider value={{ ...cart, drawerOpen, setDrawerOpen, checkoutOpen, setCheckoutOpen }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook vive junto a su Provider a propósito
export function useCartContext() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext debe usarse dentro de <CartProvider>')
  return ctx
}
