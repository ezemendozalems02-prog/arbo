// No hay autenticación real todavía (Fase 3, bloque 30): las acciones que
// necesitan "usuario responsable" (crear/tomar/completar/cancelar una
// comanda) usan este usuario simulado único. El día que haya login real,
// solo este archivo deja de usarse — los campos createdBy/startedBy/etc.
// en las comandas ya están preparados para recibir el usuario real.
export const CURRENT_STAFF_NAME = 'Valentina (mozo)'
