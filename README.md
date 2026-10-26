# Pip y los Slimes · online con servidor propio

Plataformas pixel art de 16 bits con juice, un jefe gigante y modo online: quien crea la sala es el
**villano** y hasta dos amigos juegan de **arquero** y **caballero** (si falta alguno, lo maneja un bot).

Una sola app de Node: sirve el juego (`index.html`) y reparte los mensajes del online por WebSocket (`/ws`).
Los jugadores intentan conectarse directo entre sí (WebRTC, el camino más rápido) y, si la red no lo permite,
el servidor lleva todo por WebSocket, así que siempre conecta. Los héroes ven abajo a la derecha el ping y el camino:
`DIR` = directo, `SRV` = por el servidor.

Cada héroe se mueve, salta y ataca **al instante en su propia pantalla** y le avisa al villano dónde está.
Los golpes y rebotes los sigue decidiendo el villano, que es quien corre la partida.

## Ponerlo en internet (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Monguit0/pip-slimes)

1. Tocá el botón de arriba (o en render.com: New → Blueprint → elegí este repo). Render lee `render.yaml` y arma todo solo.
2. Cuando termine te da una URL (`https://pip-slimes-xxxx.onrender.com`): esa es la que pasás a tus amigos.
3. Cada vez que subas cambios a `main`, Render vuelve a publicar solo.

El plan gratuito duerme el servicio después de un rato sin visitas: la primera vez que alguien entra
puede tardar cerca de un minuto en despertar. Después anda normal.

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
