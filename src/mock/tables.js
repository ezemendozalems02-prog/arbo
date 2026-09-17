// Mesas del salón — semilla inicial. El estado en vivo (ocupada, orden
// asociada, etc.) lo mantiene src/context/POSContext.jsx, que arranca desde
// esta lista y persiste sus cambios en localStorage — este archivo nunca se
// muta directamente.
export const TABLE_STATUSES = ['libre', 'ocupada', 'reservada', 'pago_pendiente']
export const TABLE_STATUS_LABELS = {
  libre: 'Libre',
  ocupada: 'Ocupada',
  reservada: 'Reservada',
  pago_pendiente: 'Pago pendiente',
}
export const TABLE_ZONES = ['interior', 'ventana', 'exterior']

export const INITIAL_TABLES = [
  { id: 't1', number: 1, zone: 'interior', capacity: 2 },
  { id: 't2', number: 2, zone: 'interior', capacity: 2 },
  { id: 't3', number: 3, zone: 'interior', capacity: 4 },
  { id: 't4', number: 4, zone: 'interior', capacity: 4 },
  { id: 't5', number: 5, zone: 'ventana', capacity: 2 },
  { id: 't6', number: 6, zone: 'ventana', capacity: 4 },
  { id: 't7', number: 7, zone: 'ventana', capacity: 4 },
  { id: 't8', number: 8, zone: 'interior', capacity: 6 },
  { id: 't9', number: 9, zone: 'exterior', capacity: 4 },
  { id: 't10', number: 10, zone: 'exterior', capacity: 4 },
  { id: 't11', number: 11, zone: 'exterior', capacity: 2 },
  { id: 't12', number: 12, zone: 'exterior', capacity: 6 },
  { id: 't13', number: 13, zone: 'interior', capacity: 2 },
  { id: 't14', number: 14, zone: 'ventana', capacity: 4 },
].map(t => ({ ...t, status: 'libre', orderId: null }))
