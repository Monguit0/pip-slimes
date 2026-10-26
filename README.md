# Pip y los Slimes · online con servidor propio

Plataformas pixel art de 16 bits con juice, un jefe gigante y modo online: quien crea la sala es el
**villano** y hasta dos amigos juegan de **arquero** y **caballero** (si falta alguno, lo maneja un bot).

Una sola app de Node: sirve el juego (`index.html`) y reparte los mensajes del online por WebSocket (`/ws`).
Los jugadores intentan conectarse directo entre sí (WebRTC, el camino más rápido) y, si la red no lo permite,
el servidor lleva todo por WebSocket, así que siempre conecta. Los héroes ven abajo a la derecha el ping y el camino:
`DIR` = directo, `RLY` = por el relé de Cloudflare (ver abajo), `SRV` = por el servidor.

Cómo se reparte el trabajo:
- El villano corre la partida y manda una foto del mundo 30 veces por segundo, en binario: unos 250 bytes
  (hasta ~900 en la pelea con el jefe), así entra en un solo paquete. Partículas y sonidos viajan como eventos:
  cada pantalla los genera y los reproduce cuando su imagen llega a ese momento.
- Cada héroe se mueve, salta, dispara y rebota **al instante en su propia pantalla** y le avisa al villano dónde está.
- **Lo que te pega en tu pantalla, te pega**: contacto con enemigos, hachazos, babas y flechas los detecta la pantalla
  del héroe y se los avisa al villano. El jefe y la lluvia de espadas los sigue decidiendo el villano.
- Si el villano cambia de pestaña, la partida sigue corriendo. Si su navegador se congela (por ejemplo, salió de la app
  en el celu), los héroes ven "ESPERANDO AL VILLANO".

## Ponerlo en internet (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Monguit0/pip-slimes)

1. Tocá el botón de arriba (o en render.com: New → Blueprint → elegí este repo). Render lee `render.yaml` y arma todo solo.
2. Cuando termine te da una URL (`https://pip-slimes-xxxx.onrender.com`): esa es la que pasás a tus amigos.
3. Cada vez que subas cambios a `main`, Render vuelve a publicar solo.

El plan gratuito duerme el servicio después de un rato sin visitas: la primera vez que alguien entra
puede tardar cerca de un minuto en despertar. Después anda normal.

### Relé gratis de Cloudflare (recomendado)
Algunas redes (sobre todo datos móviles) no dejan conectar directo. Con un relé TURN cercano esos jugadores no tienen
que pasar por el servidor de EE.UU. Cloudflare da 1.000 GB por mes gratis, que alcanza para cientos de horas de juego.
1. Entrá a dash.cloudflare.com (cuenta gratis) → **Realtime** (antes "Calls") → **TURN** → crear una clave.
2. Copiá el **Token ID** y el **API Token**.
3. En Render, en el servicio → **Environment**, agregá `CF_TURN_KEY_ID` (el Token ID) y `CF_TURN_API_TOKEN` (el API Token) y guardá.
Listo: el servidor reparte credenciales temporales en `/ice` y los navegadores usan el relé solo cuando no pueden ir directo.
Las claves nunca llegan al navegador.

## Jugar
1. Abrí la URL, bajá a **Online**, poné tu nombre y tocá **Crear sala**: sos el villano.
2. Tocá **Copiar link** y pasáselo a tus amigos (o diles el código de 4 letras).
3. Cuando estén, **Empezar partida**.

## Probarlo en tu compu
    npm install
    npm start
Abrí http://localhost:3000 en dos pestañas: en una "Crear sala", en la otra "Unirme" con el código.

Para ver cómo se siente con mala conexión: `LAG_MS=150 npm start` agrega 150 ms de ida y vuelta a todo lo que
pasa por el servidor (el camino directo entre navegadores no se ve afectado).

## Si preferís dejar el juego en Netlify
Subí solo `index.html` a Netlify y poné la dirección del servidor en `index.html`, en la línea
`var SERVER = '';`, por ejemplo `var SERVER = 'wss://algo.onrender.com/ws';`.
