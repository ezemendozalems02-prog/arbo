import { ORDER_STATUS_LABELS } from '../../mock/orders'
import Badge from '../ui/Badge'

// Estado de pedido -> tono del sistema (color + ícono + texto).
const STATUS_TONE = {
  recibido: 'pending',
  aceptado: 'info',
  en_preparacion: 'processing',
  listo: 'warning',
  enviado: 'info',
  entregado: 'completed',
  cancelado: 'danger',
}

export default function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{ORDER_STATUS_LABELS[status] ?? status}</Badge>
}
