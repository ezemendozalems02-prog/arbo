import { useCallback, useEffect, useState } from 'react'

const KEY = 'arbo_cart_v1'
const DELIVERY_FEE = 1500 // DEMO — costo de delivery de ejemplo

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useCart() {
  const [items, setItems] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* storage unavailable */ }
  }, [items])

  const addItem = useCallback((product) => {
    setItems(prev => {
      const found = prev.find(i => i.id === product.id)
      if (found) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 }]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const increaseQuantity = useCallback((id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i))
  }, [])

  const decreaseQuantity = useCallback((id) => {
    setItems(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
      .filter(i => i.qty > 0))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return { items, addItem, removeItem, increaseQuantity, decreaseQuantity, clearCart, itemCount, subtotal, DELIVERY_FEE }
}
