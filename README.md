# Boceto Kiosko · POC de métricas

Sitio estático para demo de sesiones HCM y GCA.

## Publicación

Los archivos están en la raíz para el despliegue estático de Vercel. Cada push a `main` en el repositorio conectado activa un nuevo despliegue de producción. El dashboard carga `log.json` desde la misma raíz.

## Archivos

- `index.html`: menú de juegos y captura de ID.
- `app.js` / `styles.css`: juegos HCM (Snake) y GCA (Conecta 4), temporizador de sesión y JSON mostrado al cierre.
- `dashboard.html` / `dashboard.js`: resumen mensual por zona, usuarios, sesiones, duración y registros recientes.
- `log.json`: 360 registros sintéticos distribuidos entre agosto y noviembre de 2026.
- `zonaVslocation.json`: catálogo de zonas y regiones recibido para la POC.

## Registro de sesiones

El formato de cada registro usa timestamps ISO 8601 UTC y `sessionTimeSeconds` (entero en segundos). `log.json` es una semilla de demostración. Por ser un sitio estático, el navegador no puede escribir las nuevas sesiones al archivo publicado; estas se muestran como JSON al finalizar el juego. Para conservar actividad real se necesita un endpoint y almacenamiento persistente.

La zona inicial es `MXL01`; se configura en `app.js` y en el rótulo del menú.
