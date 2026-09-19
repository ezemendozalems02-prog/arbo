# ARBO OS — FASE 10: LIMITACIONES CONOCIDAS
## Delimitación de Alcance

### 1. Ausencia de Hardware Físico en el Entorno Virtual
El entorno de desarrollo y ejecución de Antigravity no cuenta con una impresora térmica física USB o de red conectada.
El protocolo ESC/POS, el formateo de bytes de corte y la lógica del puente local han sido verificados mediante pruebas unitarias exhaustivas con mock adapter.

### 2. Autenticación en Modo Desconectado
No se permite el inicio de sesión o creación de nuevas cuentas de usuario cuando el dispositivo no tiene acceso a internet. La resiliencia offline aplica exclusivamente a sesiones que ya estaban previamente autenticadas.
