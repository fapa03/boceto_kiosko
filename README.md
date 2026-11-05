# Boceto Kiosko · POC de métricas

La ruta raíz (`/`) abre directamente el menú kiosko original. Al elegir HCM, GCA o una opción dentro de sus tarjetas, se solicita el ID y después inicia Tic Tac Toe. El ID se guarda solo en la sesión del navegador; no se usa autenticación.

El juego muestra el temporizador en vivo. Al ganar, perder, empatar o terminar la sesión, conserva el último tiempo en la pantalla de cierre.

El dashboard está en `/dashboard/` y carga el archivo raíz `log.json`. La POC usa archivos estáticos y Vercel los publica desde la raíz del repositorio. Cada push a `main` despliega cambios si la integración Git de Vercel está habilitada.

`log.json` contiene 360 registros sintéticos de agosto a noviembre de 2026. Las nuevas partidas no se guardan en el archivo publicado: un sitio estático no puede escribir al repositorio. Para persistencia real se requiere un endpoint y almacenamiento.
