# A Tale of Friends & Foes · online con servidor propio

*Be the hero… or be their doom. To be a hero, or not to be.*

Plataformas pixel art de 16 bits con juice, un jefe gigante y modo online: quien crea la sala es el
**villano** y hasta cuatro amigos juegan de **arquero**, **caballero**, **bárbaro** y **mago** (si falta alguno, lo maneja un bot,
y cualquiera puede tomarlo desde el panel de la sala con **Jugar con este** / **Cambiar a este**, incluso en plena partida).

Una sola app de Node: sirve el juego (`index.html`) y reparte los mensajes del online por WebSocket (`/ws`).
Los jugadores intentan conectarse directo entre sí (WebRTC, el camino más rápido) y, si la red no lo permite,
el servidor lleva todo por WebSocket, así que siempre conecta. Los héroes ven abajo a la derecha el ping y el camino:
`DIR` = directo, `RLY` = por el relé de Cloudflare (ver abajo), `SRV` = por el servidor.

Cómo se reparte el trabajo:
- El villano corre la partida y manda una foto del mundo 60 veces por segundo, en binario: unos 250 bytes
  (hasta ~900 en la pelea con el jefe), así entra en un solo paquete. Partículas y sonidos viajan como eventos:
  cada pantalla los genera y los reproduce cuando su imagen llega a ese momento.
- Cada héroe se mueve, salta, dispara y rebota **al instante en su propia pantalla** y le avisa al villano dónde está.
- **Lo que te pega en tu pantalla, te pega**: enemigos, hachazos, babas, flechas y todos los ataques de los jefes
  (choque, embestida, tajo o zarpazo, salto aplastante, ondas, lluvia de espadas o de rocas, pinchos) los detecta la pantalla del héroe y se los
  avisa al villano. Los pisotones, también.
- Si el villano cambia de pestaña, la partida sigue corriendo. Si su navegador se congela (por ejemplo, salió de la app
  en el celu), los héroes ven "ESPERANDO AL VILLANO".

## Slimes en 32 bits
Los slimes (verde, rojo, tóxico y de hielo) están redibujados con luz 3D: degradado de gelatina, brillo, luz rebotada
en el borde y burbujas adentro, en los píxeles HD del remaster. Respiran y parpadean, entrecierran los ojos al cargar,
abren la boca al escupir, ponen cara de `> <` cuando les pegás y se aplastan al reventar. Se ven en la campaña, en el
modo villano (también online) y en la pantalla de título. La hoja sale de las herramientas de PixelForge
(`export_game_slimes.py`) y va incrustada en `index.html`.

## Nivel 2 · El Bosque Oscuro
Después de elegir el modo, el menú pregunta el **nivel** (*El Reino*, *El Bosque*, *La Montaña* o *El Barco*; la tecla `N`
también lo cambia) y vale para todos los modos: la campaña arranca directo en ese nivel, en **Jefe** sos su jefe y en
**Villano**/**Online**/**Sillón** la partida empieza ahí. Se recuerda para la próxima vez.
Al vencer al Mega Caballero la aventura sigue: una noche de luna roja en el bosque (Linde del bosque, Bosque oscuro,
Ciénaga de raíces) y al final la cueva del **Campeón**, un lobo gigante todo negro. Al empezar el nivel se vuelve a
elegir carta (se suman a las que ya tenías).
- **Murciélago del villano**: vuela con una barra de aguante (arriba de él). Se gasta en el aire, mucho más rápido
  si está fuera del alcance de los héroes, y se recarga posado en el piso o una plataforma (`abajo` para posarse). Si se
  agota cae y tiene que descansar hasta la mitad para volver a volar.
- **Enemigos nuevos**: **slimes tóxicos** (si te tocan o te escupen, te envenenan: perdés vida de a poco hasta que se
  pasa), **murciélagos** que vuelan y se tiran en picada, y **lobeznos** que corren y te muerden de un salto.
- **Trampas**: pinchos en el suelo que asoman (aviso) y salen cada pocos segundos. Del cielo caen ramas en vez de flechas.
- **El Campeón**: zarpazo, salto aplastante con ondas, **embestida** rapidísima de pared a pared (en la furia, ida y
  vuelta), **bolas de fuego** que escupe apuntándote (tres en abanico en la furia; el parry del caballero se las
  devuelve) y un **aullido** que hace caer rocas del techo de la cueva. Se le pega pisándole el lomo.
- **Villano y online**: si los héroes vencen al Mega Caballero, el villano tiene revancha en el bosque: maneja a los
  bichos nuevos y, en la guarida, al Campeón. Los héroes caídos vuelven con media vida y todos eligen carta de nuevo.

## Nivel 3 · La Montaña Helada
Después del Campeón se sube a la montaña (Falda nevada, Glaciar, Cumbre helada) con nieve, aurora y carámbanos que
caen. Al final, en su cueva de hielo, espera el **Yeti**.
- **Enemigos nuevos** (todos con aviso antes de atacar, y un golpe les corta el ataque):
  - **Slime de hielo**: se infla y **escupe una baba helada** en arco que te **ralentiza**.
  - **Muñeco de nieve**: se arrastra hacia vos, toma aire (`!`) y suelta un **aliento helado** en **cono** hacia
    adelante que lastima y enfría a todos los que agarre (mientras sopla puede girar y barrer).
  - **Pingüino**: camina bamboleándose, se agacha (`!`) y se tira **de panza** a toda velocidad por el piso.
  - **Espíritu helado**: flota a tu costado, junta frío (un aro que se cierra) y explota en una **onda helada**
    alrededor; después se esfuma y reaparece en otro lado.
  - **Lobo blanco**, más rápido que los lobeznos. Los pinchos del piso son de hielo.
- **Frío**: andás más lento un rato. Se nota en el héroe (tinte celeste y escarcha), con un *¡LENTO!* y, en tu
  pantalla, con los bordes congelados.
- En villano/online podés manejar a todos: el muñeco sopla el cono con ataque (y camina lento mientras sopla), el
  pingüino se tira de panza, y el espíritu vuela (salto sube) y con ataque suelta la onda y parpadea hacia adelante.
- **El Yeti**: manotazo, salto con ondas, **rodada** hecho bola de nieve de pared a pared, **avalancha** de rocas de
  hielo (algunas quedan como obstáculos) y **bolas de nieve** gigantes (tres en la furia). En la última furia llama a
  dos lobos blancos y su rodada deja hielo filoso en el piso. Al morir se derrite en nieve.
- En villano/online, si los héroes vencen al Campeón, la revancha es en la montaña y el villano maneja al Yeti.

## Nivel 4 · El Barco Pirata
Después del Yeti se baja al mar: **El Muelle**, **La Cubierta** y **Los Mástiles** de un barco pirata, de noche y con
tormenta (lluvia en diagonal, relámpagos que iluminan la pantalla, faroles que se mecen, olas, un faro y barcos lejanos).
Desde el cielo caen **balas de cañón** con aviso y de la cubierta saltan **tablones con clavos**. Al final, en la proa,
sale del mar el **Kraken**.
- **Bichos nuevos** (todos avisan antes de atacar y un golpe les corta el ataque):
  - **Cangrejo**: camina de costado, abre las pinzas (`!`, chasquido) y se lanza de costado en un **tijeretazo**.
  - **Pirata**: guarda distancia y **apunta**: una mira roja que titila cada vez más rápido y un pitido; después
    dispara una **bala rápida y recta**. Se esquiva saltando, y el escudo la frena (con parry vuelve y le pega a los bichos).
  - **Pez globo**: anda a los saltitos; si te acercás **se infla** (le asoman las púas) y revienta en **8 púas** que
    salen para todos lados.
  - **Gaviota**: vuela alto, se pone encima tuyo, suelta un **huevo-bomba** que explota al tocar algo y baja en picada
    (ahí es cuando la podés alcanzar).
- **El Kraken**: un pulpo gigante dibujado por partes (manto, ojo de rendija y seis tentáculos que se mueven todo el
  tiempo). Ataques: **latigazo** (un tentáculo largo barre el piso adelante: saltalo), **salto** con ondas,
  **chorro** (se estira y cruza la cubierta a toda velocidad soltando tinta), **tentáculos** que salen de la cubierta
  donde burbujea (siempre queda un hueco libre) y **tinta**: escupe gotas en arco que te **manchan la pantalla**, te
  **frenan** y dejan **charcos** que lastiman y frenan. En la furia tira cinco gotas; en la última furia llama a dos
  cangrejos y su chorro deja tinta. Al morir se hunde en el mar.
- En villano/online se manejan todos: el cangrejo con ataque hace el tijeretazo, el pirata apunta y dispara, el pez
  globo se infla, y la gaviota vuela (salto sube, abajo baja) y con ataque suelta la bomba. Si los héroes vencen al
  Yeti, la revancha es en el barco y el villano maneja al Kraken (`X` latigazo, `Espacio` salto, `Z` chorro,
  `V` tentáculos, `Shift` tinta). En el modo jefe también podés ser el Kraken (elegí el nivel 4).

## Experiencia y evoluciones
Monedas, enemigos y jefes dan **experiencia** (barra dorada debajo de la energía). Al llenarla el héroe **evoluciona**
y queda así toda la partida. En villano/online la experiencia es del equipo y evolucionan los cuatro juntos. Si arrancás
en el nivel 2 ya tenés media barra, y en el nivel 3 empezás evolucionado.
- **Cazador** (arquero): ballesta que tira **dos flechas seguidas** y mantiene el dash. Con `C` (o `E`, o el botón
  *Veneno*) prende el **veneno**: mientras está prendido gasta energía y sus flechas envenenan; el enemigo pierde vida
  cada un ratito durante 3 segundos y cada flecha envenenada vuelve a arrancar el contador.
- **Paladín** (caballero): espada más larga (más alcance) y su **parry manda una onda que cura** a los aliados cerca
  (en la campaña, un corazón).
- **Warlord** (bárbaro): **martillo** más grande y con más alcance. En **furia**, su golpe cargado **aturde** a los
  enemigos (también al jefe), y la furia **acelera los golpes** suyos y de los aliados cerca (el aro rojo).
- **Nigromante** (mago): capucha y cara de calavera; su bola de fuego pasa a ser verde. Con `C` (o `E`, o el botón
  *Huesos*, cuesta media barra de energía) **invoca dos esqueletos aliados al azar**: pueden salir dos de hacha, dos de
  arco o uno de cada uno. Salen de la tierra a sus costados, buscan al enemigo más cercano (los de hacha van al cuerpo a
  cuerpo, los arqueros guardan distancia y disparan), siguen a su dueño entre zonas y duran 15 segundos o hasta que los
  rompan (4 golpes). Si invocás de nuevo, los viejos se deshacen y salen dos nuevos.

## Jefes
- **El jefe que maneja una persona** (Jefe, Villano, Online) tiene menos vida que antes: 42 el Mega Caballero y 50 el
  Campeón. Antes de entrar a pelear con él, en Villano/Online los héroes se curan del todo y los caídos vuelven con sus cartas.
- **Presentación**: franjas de cine y una placa con el nombre cuando entran. El Campeón primero se asoma: dos ojos
  rojos en la oscuridad de la cueva, y después salta.
- **Tres fases**: a la mitad de vida se enfurecen y al 25% viene la **última furia**. El Mega Caballero pierde el casco
  y pelea más rápido; el Campeón llama a dos lobeznos y su embestida deja fuego en el piso.
- **Combos**: enfurecidos, encadenan ataques sin descanso (por ejemplo embestida → lluvia de espadas, o embestida →
  bola de fuego, salto → tajo).
- **La arena cambia**: algunas rocas del aullido quedan en el piso como obstáculos (se pueden pisar, frenan al que
  camina y se rompen a golpes o solas al rato). Si el lobo embiste contra una, se la pega y queda aturdido. Las bolas
  de fuego que tocan el piso lo dejan ardiendo un rato.
- **Muertes**: el Mega Caballero explota y su espada queda clavada en el piso; el Campeón se desploma y se deshace en humo.
- **Combos del jefe que manejás vos** (Jefe, Villano, Online), solo con la mitad de la vida o menos: si apretás otro ataque mientras el jefe se recupera del
  anterior (o apenas termina), sale sin pausa y suma **COMBO x2, x3…**: desde el x2 el aviso dura la mitad y los golpes
  directos (tajo/zarpazo, salto, embestida) sacan uno más. El contador aparece al lado de los ataques.
- En modo villano/online, el jefe que maneja el villano también tiene su última furia (recargas aún más rápidas; el
  lobo deja fuego al embestir).

## Música
Es una sola canción que cambia de ánimo según lo que pasa: tranquila y sin batería en el título, sin melodía mientras
se eligen cartas, un poco más rápida y en otro tono en cada zona, solo tambores cuando entra el jefe, a toda velocidad
cuando se enfurece, más grave y apagada en el bosque, todavía más rápida contra el Campeón, lenta y apagada en la derrota, y como bajo el agua cuando estás en peligro (te queda poca vida).
Los cambios entran a tiempo, cada medio compás. Si tocás los controles de la placa de música, mandás vos hasta la
próxima partida.

## Habilidades de los héroes
Todos tienen **doble salto**: apretá salto otra vez en el aire para un segundo impulso (uno por salto, se recupera al
tocar el piso). Corta la carga del arquero. Los bots también lo usan para esquivar, y online sale al instante en tu pantalla.
Cada héroe tiene un medidor de energía (la barrita celeste) que se gasta con su especial y se recarga solo de a poco.
- **Arquero · dash** (`Shift` o `V`, o el botón *Dash*): sale disparado hacia adelante y por un instante es intangible,
  así que atraviesa enemigos, flechas y espadas sin recibir daño. Un dash en el aire hasta volver a pisar el suelo.
- **Caballero · escudo** (mantené `Shift` o `V`, o el botón *Escudo*): mientras lo sostenés no recibe daño, camina
  más lento y no ataca. Gasta energía mientras está levantado y bastante más con cada golpe que frena; si se vacía, se rompe.
  **Parry:** si lo levantás justo antes del golpe (un quinto de segundo), no gasta nada (te devuelve un poco), el enemigo
  queda aturdido unos segundos (también el Mega Caballero) y los proyectiles vuelven: flechas, babas, espadas que caen
  y ondas del jefe le pegan a los enemigos. Mientras dure el aturdimiento, cada golpe del caballero a ese enemigo es crítico.
  Además el parry suelta una **onda de choque** que empuja hacia atrás y aturde un ratito a todos los enemigos cerca, y el
  caballero queda **inmune 1,5 segundos** (brilla dorado): así no pasa que paró a uno y otro le pegó enseguida. Funciona
  igual en campaña, modo jefe y online.
- **Ataques cargados** (mantené `X` y soltá cuando brille): el arquero tira un flechazo que atraviesa a todos los enemigos
  y pega más fuerte (mientras carga no se puede mover; saltar cancela la carga). El caballero hace un espadazo con más
  alcance y daño que además rompe babas, flechas, espadas que caen y ondas del jefe.

- **Mago** (botón *Mago*): pega con el **bastón** (corto, 1 de daño, y cargado un bastonazo de fuego que rompe proyectiles).
  Su especial (`Shift` o `V`, o el botón *Fuego*) es la **bola de fuego** (un poco menos de un tercio de la energía):
  sale derecho, explota al tocar un enemigo, el jefe, una pared o el piso, pega 2 al que toca y 1 a todos alrededor, y
  **quema**: los que agarra la explosión pierden 1 de vida cada 0,8 segundos durante 2,4 segundos (se ven las llamitas).
  Juice: fogonazo en el orbe del bastón, estela de brasas, luz, anillos, chispas, humo, temblor y un golpe grave.
  En villano y online el equipo pasa a ser de cuatro (el mago tiene 7 de vida) y en el modo jefe también llegan magos.
- **Bárbaro** (`5` o el botón *Bárbaro*): más rápido que el caballero, hachazos lentos pero fuertes.
  Su especial es la **furia**: unos segundos de más daño, y cuanto menos vida tenga al activarla, más fuerte
  (de x1,15 con la vida llena a x1,6 casi muerto). Su ataque cargado es un **hachazo circular**: el hacha gira
  alrededor de la cintura como un hula hula y golpea adelante y atrás dos veces.

## Cartas
Al empezar la partida cada héroe elige 1 carta entre 3 (con las flechas y ataque o salto, o tocándola) y el villano
elige una por cada héroe. Duran toda la partida. En la campaña también elige tu héroe; en el online el juego espera
a que todos elijan (como mucho 30 segundos) y los bots eligen solos.
- Héroes: más vida, +1 de daño (arco reforzado, espada afilada, hacha pesada), poción que te cura al bajar de la mitad,
  energía más rápida, botas ligeras, carga rápida, y cartas propias: flecha triple y paso fantasma (arquero),
  escudo liviano (caballero), sangre caliente y remolino (bárbaro), gran bola y brasas eternas (mago).
- Villano: slimes con más vida, flechas venenosas, hachas dobles, enemigos veloces, baba ácida, refuerzos,
  regeneración, armadura del jefe (+12 de vida) y jefe furioso.

En el online todo esto se decide en la pantalla de cada héroe, igual que los golpes: si en tu pantalla el escudo frenó
la flecha o tu espadazo rompió la baba, para el villano también.

## Ponerlo en internet (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Monguit0/pip-slimes)

1. Tocá el botón de arriba (o en render.com: New → Blueprint → elegí este repo). Render lee `render.yaml` y arma todo solo.
2. Cuando termine te da una URL (`https://pip-slimes-xxxx.onrender.com`): esa es la que pasás a tus amigos.
3. Cada vez que subas cambios a `main`, Render vuelve a publicar solo.

El plan gratuito duerme el servicio después de un rato sin visitas: la primera vez que alguien entra
puede tardar cerca de un minuto en despertar. Después anda normal.

### Relé de Cloudflare (opcional, cobra por uso)
Algunas redes (sobre todo datos móviles) no dejan conectar directo. Con un relé TURN cercano esos jugadores no tienen
que pasar por el servidor de EE.UU. Cloudflare da 1.000 GB por mes gratis (este juego usa como mucho ~115 MB por hora
por jugador relayado), pero **cobra lo que pase de ahí y no tiene tope**. Si no querés ese riesgo, no lo actives:
el juego funciona igual, solo que esos jugadores van por el servidor.
1. Entrá a dash.cloudflare.com (cuenta gratis) → **Realtime** (antes "Calls") → **TURN** → crear una clave.
2. Copiá el **Token ID** y el **API Token**.
3. En Render, en el servicio → **Environment**, agregá `CF_TURN_KEY_ID` (el Token ID) y `CF_TURN_API_TOKEN` (el API Token) y guardá.
Listo: el servidor reparte credenciales temporales en `/ice` y los navegadores usan el relé solo cuando no pueden ir directo.
Las claves nunca llegan al navegador.

## Menú
El menú vive en la misma pantalla del juego y va por pasos: primero el **modo** (*Campaña*, *Jefe*, *Villano*,
*Online* o *Sillón*), después el **nivel** y, en la campaña, el **héroe** (arquero, caballero, bárbaro o mago).
*← Volver* (o `Esc`, o `B` en el joystick) vuelve un paso. **Online** abre ahí mismo el panel de la sala: crear una
(sos el villano y elegís el nivel), entrar con el código de 4 letras o tocar una de las salas abiertas, el código
grande para pasar, los lugares de cada héroe y *Empezar partida*. Ya no hace falta bajar en la página.

## Joysticks y multijugador local (Sillón)
Cualquier joystick que el navegador reconozca (Xbox, PlayStation o genérico, por USB o Bluetooth) maneja el juego.
El navegador lo "ve" recién cuando apretás un botón con la página abierta.
- **Botones**: `A` saltar · `X` atacar (mantené para cargar) · `B` especial (dash, escudo, furia o bola de fuego) ·
  `Y` poder de la evolución (veneno o esqueletos) · `LB` lluvia y `RB` carga cuando sos el jefe · stick o cruceta para
  moverte (abajo + `A` baja de la plataforma; arriba sube volando con la gaviota o el murciélago) · `START` empieza.
- **En el menú**: ← → recorren los botones, ↑ ↓ pasan de la fila de niveles a la de modos, `A` aprieta y `START` empieza.
- **Sillón** (botón *Sillón*): el modo villano para jugar en la misma pantalla. Cada uno aprieta `A` (o `Espacio` en
  el teclado) para sumarse y elige lugar con ← →: el **villano** (teclado o joystick) y hasta **cuatro héroes**
  (arquero, caballero, bárbaro y mago); los lugares vacíos los maneja un bot. `B` o `Esc` para salir, `START` o `Enter`
  para arrancar. Cada héroe tiene su cartel (`J1`, `J2`…) y su energía en el panel; las cartas se eligen por turno
  (primero el villano y después cada joystick). La cámara sigue al grupo de héroes y al bicho del villano, el parry
  del caballero anda igual, y el joystick vibra cuando te pegan.

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
Subí `index.html` y `portada.jpg` a Netlify y poné la dirección del servidor en `index.html`, en la línea
`var SERVER = '';`, por ejemplo `var SERVER = 'wss://algo.onrender.com/ws';`.
