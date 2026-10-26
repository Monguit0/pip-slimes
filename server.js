// Servidor de salas de "Pip y los Slimes": sirve el juego y reenvía mensajes entre el villano (host) y los héroes (guests).
// No simula nada: solo mantiene el estado de "presence" de cada jugador y lo reparte.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
// Para probar cómo se siente con mala conexión: LAG_MS=120 npm start (solo afecta lo que pasa por el servidor).
const LAG = Math.max(0, +process.env.LAG_MS || 0);
const MAX_ROOMS = 500, MAX_GUESTS = 8, MAX_MSG_PER_SEC = 150;
const INDEX = path.join(__dirname, 'index.html');
const STATIC = { '/portada.jpg': 'image/jpeg' };
const rooms = new Map(); // codigo -> { host, hostPres, guests: Map(id -> { ws, pres }) }

// Relé (TURN) de Cloudflare para cuando dos jugadores no se pueden conectar directo.
// Se activa poniendo CF_TURN_KEY_ID y CF_TURN_API_TOKEN en las variables de entorno (ver README).
const CF_KEY = process.env.CF_TURN_KEY_ID || '', CF_TOKEN = process.env.CF_TURN_API_TOKEN || '';
const STUN_ONLY = { iceServers: [{ urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] }], turn: false };
let iceCache = null, iceAt = 0;
async function iceServers() {
  if (!CF_KEY || !CF_TOKEN) return STUN_ONLY;
  if (iceCache && Date.now() - iceAt < 60 * 60 * 1000) return iceCache;
  const r = await fetch('https://rtc.live.cloudflare.com/v1/turn/keys/' + encodeURIComponent(CF_KEY) + '/credentials/generate-ice-servers', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + CF_TOKEN, 'content-type': 'application/json' },
    body: JSON.stringify({ ttl: 6 * 3600 }),
    signal: AbortSignal.timeout(4000)
  });
  if (!r.ok) throw new Error('cloudflare ' + r.status);
  const j = await r.json();
  if (!Array.isArray(j.iceServers)) throw new Error('respuesta rara');
  iceCache = { iceServers: j.iceServers, turn: true }; iceAt = Date.now();
  return iceCache;
}

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/health') { res.writeHead(200, { 'content-type': 'text/plain', 'access-control-allow-origin': '*' }); res.end('ok'); return; }
  if (url === '/ice') {
    const reply = j => { res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'no-store' }); res.end(JSON.stringify(j)); };
    iceServers().then(reply, e => { console.error('TURN:', e.message); reply(STUN_ONLY); });
    return;
  }
  // imágenes que usa la página (la portada)
  if (STATIC[url]) {
    fs.readFile(path.join(__dirname, url.slice(1)), (e, buf) => {
      if (e) { res.writeHead(404); res.end('no encontrado'); return; }
      res.writeHead(200, { 'content-type': STATIC[url], 'cache-control': 'public, max-age=86400' }); res.end(buf);
    });
    return;
  }
  if (url === '/' || url === '/index.html') {
    fs.readFile(INDEX, (e, buf) => {
      if (e) { res.writeHead(500); res.end('falta index.html'); return; }
      const head = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'vary': 'accept-encoding' };
      // comprimida pesa unas 4 veces menos: el juego carga más rápido en el celu
      if (/\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
        zlib.gzip(buf, (err, gz) => {
          if (err) { res.writeHead(200, head); res.end(buf); return; }
          res.writeHead(200, Object.assign(head, { 'content-encoding': 'gzip' })); res.end(gz);
        });
      } else { res.writeHead(200, head); res.end(buf); }
    });
    return;
  }
  res.writeHead(404); res.end('no encontrado');
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 64 * 1024 });
const sendNow = (ws, o) => { if (ws.readyState === 1) ws.send(JSON.stringify(o)); };
const send = LAG ? (ws, o) => setTimeout(sendNow, LAG / 2, ws, o) : sendNow;
const merge = (obj, patch) => { for (const k in patch) { if (patch[k] === null || patch[k] === undefined) delete obj[k]; else obj[k] = patch[k]; } };
const newId = () => 'g' + Math.random().toString(36).slice(2, 8);

wss.on('connection', (ws, req) => {
  let q;
  try { q = new URL(req.url, 'http://x').searchParams; } catch (e) { ws.close(); return; }
  const code = String(q.get('room') || '').toLowerCase(), role = q.get('role');
  if (!/^[a-z]{4}$/.test(code) || (role !== 'host' && role !== 'guest')) { send(ws, { t: 'err', code: 'bad' }); ws.close(); return; }

  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  let room = rooms.get(code), me = null, count = 0;
  const tick = setInterval(() => { count = 0; }, 1000);

  if (role === 'host') {
    if (room) { send(ws, { t: 'err', code: 'taken' }); ws.close(); clearInterval(tick); return; }
    if (rooms.size >= MAX_ROOMS) { send(ws, { t: 'err', code: 'busy' }); ws.close(); clearInterval(tick); return; }
    room = { host: ws, hostPres: {}, guests: new Map() };
    rooms.set(code, room);
    send(ws, { t: 'hello', id: 'host' });
  } else {
    if (!room) { send(ws, { t: 'err', code: 'nohost' }); ws.close(); clearInterval(tick); return; }
    if (room.guests.size >= MAX_GUESTS) { send(ws, { t: 'err', code: 'full' }); ws.close(); clearInterval(tick); return; }
    me = { id: newId(), ws, pres: {} };
    room.guests.set(me.id, me);
    send(ws, { t: 'hello', id: me.id, host: 'host', full: room.hostPres });
    send(room.host, { t: 'join', id: me.id });
  }

  ws.on('message', (data) => {
    if (++count > MAX_MSG_PER_SEC) { ws.close(); return; }
    let m; try { m = JSON.parse(data); } catch (e) { return; }
    if (!m) return;
    // Señalización WebRTC: el servidor solo "presenta" a los jugadores para que se conecten directo.
    if (m.t === 'sig') {
      if (!m.d || typeof m.d !== 'object') return;
      if (role === 'guest') send(room.host, { t: 'sig', id: me.id, d: m.d });
      else { const g = room.guests.get(m.to); if (g) send(g.ws, { t: 'sig', id: 'host', d: m.d }); }
      return;
    }
    // Ping de punta a punta (héroe -> villano -> héroe) para medir el retraso real.
    if (m.t === 'ping' && role === 'guest') { send(room.host, { t: 'ping', id: me.id, ts: m.ts }); return; }
    if (m.t === 'pong' && role === 'host') { const g = room.guests.get(m.to); if (g) send(g.ws, { t: 'pong', ts: m.ts }); return; }
    if (m.t !== 'p' || !m.p || typeof m.p !== 'object') return;
    if (role === 'host') {
      // Mensaje dirigido (cuadros de partida para quienes todavía no tienen conexión directa): no se guarda.
      if (Array.isArray(m.to)) {
        for (const id of m.to) { const g = room.guests.get(id); if (g && g.ws.bufferedAmount < 64 * 1024) send(g.ws, { t: 'p', id: 'host', p: m.p }); }
        return;
      }
      merge(room.hostPres, m.p);
      const onlySnap = Object.keys(m.p).every(k => k === 's');
      for (const g of room.guests.values()) {
        if (onlySnap && g.ws.bufferedAmount > 64 * 1024) continue; // el cuadro viejo no sirve: se descarta si el cliente va atrasado
        send(g.ws, { t: 'p', id: 'host', p: m.p });
      }
    } else {
      merge(me.pres, m.p);
      send(room.host, { t: 'p', id: me.id, p: m.p });
    }
  });

  ws.on('close', () => {
    clearInterval(tick);
    if (role === 'host') {
      for (const g of room.guests.values()) { send(g.ws, { t: 'leave', id: 'host' }); g.ws.close(); }
      if (rooms.get(code) === room) rooms.delete(code);
    } else if (room.guests.delete(me.id)) {
      send(room.host, { t: 'leave', id: me.id });
    }
  });
  ws.on('error', () => {});
});

// Latido: los proxies de los hostings cortan conexiones calladas, y esto limpia las que quedaron muertas.
setInterval(() => {
  for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; try { ws.ping(); } catch (e) {} }
}, 25000);

server.listen(PORT, () => console.log('Pip y los Slimes en el puerto ' + PORT));
