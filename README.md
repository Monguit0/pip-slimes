# Pip y los Slimes · online con servidor propio

Una sola app de Node: sirve el juego (`index.html`) y reparte los mensajes del online por WebSocket (`/ws`).
Los jugadores intentan conectarse directo entre sí (WebRTC, el camino más rápido) y, si la red no lo permite,
el servidor lleva todo por WebSocket, así que siempre conecta. Los héroes ven abajo a la derecha el ping y el camino:
`DIR` = directo, `SRV` = por el servidor.

## Probarlo en tu compu
    npm install
    npm start
Abrí http://localhost:3000 en dos pestañas: en una "Crear sala", en la otra "Unirme" con el código.

## Ponerlo en internet (Render, como ejemplo)
1. Subí esta carpeta a un repositorio de GitHub.
2. En render.com: New → Web Service → elegí el repo.
3. Build command: `npm install` · Start command: `npm start`
4. Cuando termine te da una URL (`https://algo.onrender.com`): esa es la que pasás a tus amigos.
Sirve igual en Railway, Fly.io o cualquier VPS con Node 18+. Revisá el plan gratuito vigente de cada uno:
los gratuitos suelen dormir el servicio sin uso y la primera conexión tarda en despertarlo.

## Si preferís dejar el juego en Netlify
Subí solo `index.html` a Netlify y poné la dirección del servidor en `index.html`, en la línea
`var SERVER = '';`, por ejemplo `var SERVER = 'wss://algo.onrender.com/ws';`.
