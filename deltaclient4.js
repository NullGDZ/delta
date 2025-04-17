window.realnames = true;
window.loadedBar = false;
window.loadedBarBots = false;
window.maxBotsS = 0;
window.botsDyn = 0;
window.feedButtonPressed = false;
window.isdead = true;
window.startbot = false;
window.CurrentServerPlaying = null;
window.playingtime = false;
window.kick = false;
window.ghostCells = [{ x: 0, y: 0, size: 0, mass: 0 }];

class GUI {
    constructor(socket) {
        this.socket = socket;
        this.player = this.socket.player;
        this.body = document.body;
        this.createUI();
        this.initialized = true;
        this.update();
    }

    createUI() {
        // Main container
        this.container = document.createElement('div');
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '50%',
            left: '0',
            transform: 'translate(0, -50%)',
            width: '200px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: '999'
        });

        // Start/Stop button
        this.startBtn = document.createElement('button');
        this.startBtn.textContent = 'Start Bots';
        Object.assign(this.startBtn.style, {
            width: '100%',
            padding: '8px',
            marginBottom: '12px',
            border: 'none',
            borderRadius: '4px',
            background: '#3498db',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
        });
        this.startBtn.onclick = () => {
            window.startbot = !window.startbot;
            this.startBtn.textContent = window.startbot ? 'Stop Bots' : 'Start Bots';
        };
        this.container.appendChild(this.startBtn);

        // Bot count display
        this.botCount = document.createElement('div');
        this.botCount.textContent = 'Bots: 0/0';
        Object.assign(this.botCount.style, {
            color: '#fff',
            marginBottom: '8px',
            fontSize: '14px'
        });
        this.container.appendChild(this.botCount);

        // Slider container
        this.sliderContainer = document.createElement('div');
        this.sliderContainer.id = 'botnum';
        this.container.appendChild(this.sliderContainer);

        this.body.appendChild(this.container);

        // Initialize noUiSlider once botsMax is known
        const initSlider = setInterval(() => {
            if (this.player.decoded && this.player.decoded.botsMax > 0 && !window.loadedBarBots) {
                window.loadedBarBots = true;
                noUiSlider.create(this.sliderContainer, {
                    start: this.player.decoded.botsMax,
                    step: 1,
                    range: { min: 0, max: this.player.decoded.botsMax },
                    tooltips: true
                });
                this.sliderContainer.noUiSlider.on('change', (values) => {
                    window.botsDyn = parseInt(values[0]);
                });
                clearInterval(initSlider);
            }
        }, 500);
    }

    update() {
        if (!this.initialized) return;
        this.botCount.textContent = `Bots: ${this.player.decoded.currentBots || 0}/${this.player.decoded.botsMax || 0}`;
        requestAnimationFrame(this.update.bind(this));
    }
}
class Transmitter {
    constructor(t) {
        this.socket = t, this.status = {
            initialized: !1,
            botdestination: 0,
            vshield: 0,
			botspec: 0,
			massbots: false,
            botmode: 0
        }
    }
    handshake(t, e) {
        let s = {};
        s.req = 1, s.ver = 3, this.socket.send(s);
		this.start();
    }
    start() {
        this.moveInterval = setInterval(() => {
            this.sendPosition()
        }, 50)
    }
    sendSplit() {
        console.log("sent split!"), this.socket.send({req:3, cmd: 'split'})
    }
    sendPosition() {
						if (app && app.unitManager && app.unitManager.activeUnit && app.unitManager.activeUnit.protocol_view.x && app.unitManager.activeUnit.protocol_view.y)
						{
						var gamePkt = {}; 
						gamePkt.coords = {mouse: {}, fence: {}, cell: {}, mod: 0};
						if (this.status.botdestination){
							gamePkt.coords.mouse.x = app.unitManager.activeUnit.protocol_view.x;
							gamePkt.coords.mouse.y = app.unitManager.activeUnit.protocol_view.y;
						}
						else{
							gamePkt.coords.mouse.x = app.stage.mouseWorldX; 
							gamePkt.coords.mouse.y = app.stage.mouseWorldY;
						}
						gamePkt.coords.fence.x = 0;
						gamePkt.coords.fence.y = 0;
						gamePkt.coords.cell.x = app.unitManager.activeUnit.protocol_view.x;
						gamePkt.coords.cell.y = app.unitManager.activeUnit.protocol_view.y;
						if (window.isdead)
						{
								gamePkt.ghostX = leaderboard.ghostCells[0].x;
								gamePkt.ghostY = leaderboard.ghostCells[0].y;
						}
						else if (leaderboard.ghostCells[0] && leaderboard.ghostCells[0].mass > app.unitManager.activeUnit.mass)
						{
							gamePkt.ghostX = leaderboard.ghostCells[0].x;
							gamePkt.ghostY = leaderboard.ghostCells[0].y;
						}
						else
						{
							gamePkt.ghostX = app.unitManager.activeUnit.protocol_view.x;
							gamePkt.ghostY = app.unitManager.activeUnit.protocol_view.y;
						}
						// if (application.master.playerNick !== undefined)gamePkt.clientname = application.master.playerNick;
						// else gamePkt.clientname = application.profiles.mainProfile._nick;
						gamePkt.clientname = app.unitManager.activeUnit.nick;
						gamePkt.coords.mod = this.status.botmode;//Mod 0
						gamePkt.coords.vmod = this.status.vshield;
						gamePkt.coords.botspec = this.status.botspec;
						gamePkt.coords.massbots = this.status.massbots;
						// try{
						gamePkt.botsDyn = parseInt(window.botsDyn.toString().replace(/\s+/g, ''));
						// }catch(err)
						// {
							// console.log(err);
							// gamePkt.botsDyn = 0;
						// }
						gamePkt.isdead = window.isdead;
						// gamePkt.partyWebSocket = window.currentServer.replace(":443", "/");
						gamePkt.partyWebSocket = app.server.ws.replace(":443", "/");
						gamePkt.feedButtonPressed = window.feedButtonPressed; //false / true
						// if (window.startbot){
							try{
								// console.log('[X]:'+gamePkt.coords.mouse.x+ '[Y]:'+gamePkt.coords.mouse.y);
							}catch(e)
							{
								console.log(e);
							}
							if (window.botr){
							this.socket.send({req : 2, data: gamePkt});
							}
						// }
						}
    }
    setBotMode() {
        this.setBotModeCode(), console.log("sent bot mode!");/*, this.socket.send(t)*/
    }
    vShield() {
        this.setvShieldCode(), console.log("sent vshield!");
    }
    botspec() {
        this.setbotspec(), console.log("sent botspec!");
    }
    massbots() {
        this.setmassbots(), console.log("sent massbots!");
    }		
    botdestination() {
		this.setbotdestination(), console.log("bot destination!");
		// buffer.botmode2 = this.setbotdestination(), console.log("sent vshield!")
        // buffer.botmode2 = this.setbotdestination(), console.log("sent vshield!")
    }
    setvShieldCode() {
        return 0 === this.status.vshield ? this.status.vshield = 1 : 1 === this.status.vshield && (this.status.vshield = 0), this.status.vshield
    }
    setbotspec() {
        return 0 === this.status.botspec ? this.status.botspec = 1 : 1 === this.status.botspec && (this.status.botspec = 0), this.status.botspec
    }
    setmassbots() {
        return false === this.status.massbots ? this.status.massbots = true : true === this.status.massbots && (this.status.massbots = false), this.status.massbots
    }	
    setbotdestination() {
        return 0 === this.status.botdestination ? this.status.botdestination = 1 : 1 === this.status.botdestination && (this.status.botdestination = 0), this.status.botdestination
    }
    setBotModeCode() {
		// if (this.status.botmode == 0) this.status.botmode = 1;
		// if (this.status.botmode == 1) this.status.botmode = 0;
		// return 
        return 0 === this.status.botmode ? this.status.botmode = 1 : 1 === this.status.botmode && (this.status.botmode = 0), this.status.botmode/* : 2 === this.status.botmode ? this.status.botmode = 10 : 10 === this.status.botmode ? this.status.botmode = 1337 : 1337 === this.status.botmode  && (this.status.botmode = 0), this.status.botmode*/
    }
}
class Reader {
    constructor(t) {
        this.socket = t, this.player = t.player
    }
    read(t) {
        const e = t.data;
		if (1 == JSON.parse(e).req)
		{
			window.kick = true;
			this.divs.rows.bots.innerHTML = `kicked refresh`;
		}
		if (2 == JSON.parse(e).req)
		{
			var parsed = JSON.parse(e);
			// if (parsed.botsMax > 0)
			// {
				// window.botr = true;	
			// }
			parsed.currentBots = 0;
			parsed.expire = parsed.expireTime;
			console.log('loaded',e);
			this.player.initialized = 1;
			this.player.decoded = parsed;
			if (this.player.decoded.playingtime)window.playingtime = true;
			window.expiretime = this.player.decoded.expire;
			window.expireTimeInt = setInterval(()=>{
				// console.log('Int');
						// console.log('Interval:'+t.expireTime);
				this.socket.GUI.calculateTime();
			},1000);
			this.socket.GUI.update();	
		}
		if (3 == JSON.parse(e).req)
		{
			var parsed = JSON.parse(e);
			parsed.currentBots = parsed.spawn; 
			if (this.player.decoded.botsMax === undefined) {
				this.player.decoded.botsMax = 0;
			}
			parsed.botsMax = parseInt(this.player.decoded.botsMax.toString().replace(/\s+/g, ''));
			window.botsDyn = parseInt(this.player.decoded.botsMax.toString().replace(/\s+/g, ''));
			// if (window.sliderValue)
			// {
				// if (parsed.spawn > window.sliderValue) 
				// {
					// parsed.spawn = window.sliderValue;
				// }
				// window.maxBots = window.sliderValue;
				if (window.botr){
					this.socket.send({req : 99, botdynv2: parseInt(window.botsDyn.toString().replace(/\s+/g, ''))});
				}
			// }
			parsed.expire = this.player.decoded.expire;
			this.player.decoded = parsed;
			// console.log(parsed);
			this.socket.GUI.update();
		}
        // 1339 === e && (this.player.isPremium = !0, this.player.PremiumType = 2), 1338 === e && (this.player.isPremium = !0, this.player.PremiumType = 1), 1337 === e && (this.player.PureFeeder = !0), 21 === e ? (this.player.initialized || (this.player.initialized = !0), this.player.initialized) : (this.player.decoded = JSON.parse(e), this.socket.GUI.update())
    }
}
class MoreBotsHotkeys {
    constructor(t) {
        this.socket = t, this.Transmitter = t.Transmitter, this.storagekey = "agarbotdelta35_hotkeys", this.keys = {
            eject: this.getStorage("eject"),
            split: this.getStorage("split"),
			splitX2: this.getStorage("splitX2"),
			splitX4: this.getStorage("splitX4"),
            botmode: this.getStorage("botmode"),
            botdestination: this.getStorage("botdestination"),
            vShield: this.getStorage("vShield"),
			botspec: this.getStorage("botspec"),
			massbots: this.getStorage("massbots"),
            startStop: this.getStorage("startStop")
        }, this.active = new Set, this.macro = null, this.keydown(), this.keyup()
    }
    keydown() {
        document.body.addEventListener("keydown", t => {
            const e = t.keyCode;
			if (document.getElementById('message-box').style.display == 'none'){
            if (!(8 === e || t.ctrlKey || t.shiftKey || t.altKey)) {
                if (e === this.getKey(this.keys.eject)) {
					window.feedButtonPressed = true;
                    if (this.isActive(this.keys.eject)) return;
                    this.active.add(this.keys.eject);
					window.feedButtonPressed = true;
					// , this.macro = setInterval(() => {
                        // this.socket.Transmitter.sendEject()
                    // }, 75)
                }
                if (e === this.getKey(this.keys.split)) {
                    if (this.isActive(this.keys.split)) return;
                    this.active.add(this.keys.split);
					this.socket.Transmitter.sendSplit()
                }
				if (e === this.getKey(this.keys.splitX2)) {
                    if (this.isActive(this.keys.splitX2)) return;
                    this.active.add(this.keys.splitX2);
					for(let i =  0; i < 2; i++) {
                        setTimeout(() => {
                            this.socket.Transmitter.sendSplit();
                        }, 40 * i);
                    }
                }
				if (e === this.getKey(this.keys.splitX4)) {
                    if (this.isActive(this.keys.splitX4)) return;
                    this.active.add(this.keys.splitX4);
					for(let i =  0; i < 4; i++) {
                        setTimeout(() => {
                            this.socket.Transmitter.sendSplit();
                        }, 40 * i);
                    }
                }				
                if (e === this.getKey(this.keys.botmode)) {
                    if (this.isActive(this.keys.botmode)) return;
                    this.active.add(this.keys.botmode), this.socket.Transmitter.setBotMode()
                }
                if (e === this.getKey(this.keys.vShield)) {
                    if (this.isActive(this.keys.vShield)) return;
                    this.active.add(this.keys.vShield), this.socket.Transmitter.vShield()
                }
				if (e === this.getKey(this.keys.botspec)) {
                    if (this.isActive(this.keys.botspec)) return;
                    this.active.add(this.keys.botspec), this.socket.Transmitter.botspec()
                }
				if (e === this.getKey(this.keys.massbots)) {
                    if (this.isActive(this.keys.massbots)) return;
                    this.active.add(this.keys.massbots), this.socket.Transmitter.massbots()
                }				
                if (e === this.getKey(this.keys.botdestination)) {
                    if (this.isActive(this.keys.botdestination)) return;
                    this.active.add(this.keys.botdestination), this.socket.Transmitter.botdestination()
                }
            }
			}
        
        }), app.server.on("estabilished", t => {
			let serv = app.server.ws;
			// console.log(t.ws);
            this.socket.change(serv)
        })
    }
    keyup() {
        document.body.addEventListener("keyup", t => {
			if (document.getElementById('message-box').style.display == 'none'){
            const e = t.keyCode;
            8 === e || t.ctrlKey || t.shiftKey || t.altKey || (e === this.getKey(this.keys.eject) && (this.active.delete(this.keys.eject)), window.feedButtonPressed = false, e === this.getKey(this.keys.split) && this.active.delete(this.keys.split), e === this.getKey(this.keys.splitX2) && this.active.delete(this.keys.splitX2), e === this.getKey(this.keys.splitX4) && this.active.delete(this.keys.splitX4), e === this.getKey(this.keys.botmode) && this.active.delete(this.keys.botmode), e === this.getKey(this.keys.botdestination) && this.active.delete(this.keys.botdestination), e === this.getKey(this.keys.vShield) && this.active.delete(this.keys.vShield), e === this.getKey(this.keys.massbots) && this.active.delete(this.keys.massbots), e === this.getKey(this.keys.botspec) && this.active.delete(this.keys.botspec), this.socket.GUI.updateRows())
        }
		})
    }
    setStorage(t, e) {
        const s = JSON.parse(localStorage.getItem(this.storagekey));
        s[t] = e, localStorage.setItem(this.storagekey, JSON.stringify(s)), this.keys[t] = e.toUpperCase(), this.socket.GUI.updateRows()
    }
    getStorage(t) {
        return localStorage.hasOwnProperty(this.storagekey) || localStorage.setItem(this.storagekey, JSON.stringify({
            eject: "C",
            split: "X",
			splitX2: "E",
			splitX4: "R",
            botmode: "M",
            botdestination: "D",
            vShield: "V",
			botspec: "B",
			massbots: "P",
            startStop: "1"
        })), JSON.parse(localStorage.getItem(this.storagekey))[t]
    }
    isActive(t) {
        return this.active.has(t)
    }
    getKey(t) {
        return t.toUpperCase().charCodeAt()
    }
}
class AgarBot {
    constructor(t) {
        this.ip = "", this.ws = null, this.player = {
            isPremium: !1,
            PremiumType: 0,
            PureFeeder: !1,
            startTime: Date.now(),
            decoded: {},
            initialized: !1,
        }, this.GUI = new GUI(this), this.Reader = new Reader(this), this.Transmitter = new Transmitter(this), this.Hotkeys = new MoreBotsHotkeys(this), this.get = function(t, e) {
            let s = new XMLHttpRequest;
            s.open("GET", t), s.send(), s.onload = function() {
                200 != s.status ? lert("Response failed") : e(s.responseText)
            }, s.onerror = function() {
                alert("Request failed")
            }
        },
		this.connect("wss://gamesrv.agarbot.ovh:8443");
    }
    connect(t) {
		this.ip = "wss://gamesrv.agarbot.ovh";
		let reconnectDelay = 3000; 
		let maxRetries = 2;
		let attempt = 0;
		const connectWebSocket = () => {
			console.log(`[AGARBOT] Trying connect (${attempt + 1}/${maxRetries +1})...`);
			this.ws = new WebSocket(this.ip);

			this.ws.onopen = () => {
				attempt = 0;
				console.log("[AGARBOT] connected");
				this.onopen();
			};

			this.ws.onmessage = t => this.Reader.read(t);

			this.ws.onerror = () => {
				console.warn("[AGARBOT] Websocket error !");
			};

			this.ws.onclose = () => {
				console.warn("[AGARBOT] closed");
				window.playingtime = false;
				clearInterval(window.expireTimeInt);

				if (++attempt <= maxRetries && !window.kick) {
					console.log(`[AGARBOT] Reconnect in ${reconnectDelay / 3000} sec...`);
					setTimeout(connectWebSocket, reconnectDelay);
				} else {
					console.error("[AGARBOT] kicked or Too many fail.");
				}
			};
		};
		connectWebSocket();
    }
    onopen() {
		window.sliderValue = undefined;
        console.log("[AGARBOT] Authenticating to the server!"), this.Transmitter.handshake("220720", "Delta")
    }
    send(t) {
        this.ws && this.ip && 1 === this.ws.readyState && this.ws.send(JSON.stringify(t))
    }
    reset() {
        this.player = {
            isPremium: !1,
            PremiumType: 0,
            PureFeeder: !1,
            startTime: Date.now(),
            decoded: {
                currentBots: 0
            },
            initialized: !1
        }, this.Transmitter.status = {
            initialized: !1,
            vshield: 0,
			botspec: 0,
			massbots: false,
            botmode: 0,
            botdestination: 0
        }
    }
    change(serv) {
		// window.CurrentServerPlaying = null;
		console.log('#1 CHANGE SERVER TO '+serv+' OLD '+window.currentServer);
		if (window.currentServer != serv && serv){
		console.log('#2 CHANGE SERVER TO '+serv+' OLD '+window.currentServer);
		window.currentServer = serv;
			var gamePkt = {}; 
							gamePkt.coords = {mouse: {}, fence: {}, cell: {}, mod: 0};
							// console.log(this.status);
							try{
								if (this.status && this.status.botdestination){
									gamePkt.coords.mouse.x = app.unitManager.activeUnit.protocol_view.x;
									gamePkt.coords.mouse.y = app.unitManager.activeUnit.protocol_view.y;
								}
								else{
									gamePkt.coords.mouse.x = app.stage.mouseWorldX; 
									gamePkt.coords.mouse.y = app.stage.mouseWorldY; 
								}
							gamePkt.coords.fence.x = 0;
							gamePkt.coords.fence.y = 0;
							if (this.status){
							gamePkt.coords.cell.x = app.unitManager.activeUnit.protocol_view.x;
							gamePkt.coords.cell.y = app.unitManager.activeUnit.protocol_view.y;
							}else
							{
								gamePkt.coords.cell.x = 0;
								gamePkt.coords.cell.y = 0;
							}
							if (this.status){
								if (window.isdead)
								{
										gamePkt.ghostX = leaderboard.ghostCells[0].x;
										gamePkt.ghostY = leaderboard.ghostCells[0].y;
								}
								else if (leaderboard.ghostCells[0] && leaderboard.ghostCells[0].mass > app.unitManager.activeUnit.mass)
								{
									// if (leaderboard.ghostCells.length > 0 && 1 != app.unitManager.activeUnit?.client.playerPosition)
									gamePkt.ghostX = leaderboard.ghostCells[0].x;
									gamePkt.ghostY = leaderboard.ghostCells[0].y;							
								}
								else
								{
									gamePkt.ghostX = app.unitManager.activeUnit.protocol_view.x;
									gamePkt.ghostY = app.unitManager.activeUnit.protocol_view.y;
								}
							}else
							{
								gamePkt.ghostX = 0;
								gamePkt.ghostY = 0;
							}
							if (app && app.unitManager && app.unitManager.activeUnit)
							{
								gamePkt.clientname = app.unitManager.activeUnit.nick;
							}else
							{
								gamePkt.clientname = "";
							}
							// gamePkt.clientname = application.master.playerNick;
							if (this.status)
							{
								gamePkt.coords.mod = this.status.botmode;//Mod 0
								gamePkt.coords.vmod = this.status.vshield;//Mod 0
								gamePkt.coords.botspec = this.status.botspec;//Mod 0
								gamePkt.coords.massbots = this.status.massbots;//Mod 0
							}
							else
							{
								gamePkt.coords.mod = 1;//Mod 0
								gamePkt.coords.vmod = 0;//Mod 0
								gamePkt.coords.botspec = 0;//Mod 0
								gamePkt.coords.massbots = false;//Mod 0							
							}
							
							// gamePkt.partyWebSocket = window.currentServer.replace(":443", "/");
							gamePkt.partyWebSocket = app.server.ws.replace(":443", "/");
							// gamePkt.partyWebSocket = window.currentServer;
							gamePkt.feedButtonPressed = window.feedButtonPressed; //false / true
							this.ws.send(JSON.stringify({req : 2, data: gamePkt}));
							}catch(err){
								console.log(this);
								console.log(err);
							}
							// this.reset();
			/*this.ws && this.ws.close(), this.reset(), application.master.isAgario && this.connect("wss://gamesrv.agarbot.ovh:8443")*/
			window.botr = false;
		}
	}
}
let check = setInterval(() => {
	if (app !== undefined)
// if (document.readyState == "complete") {
		clearInterval(check);
		// setTimeout(() => {
			// console.log(document.getElementsByClassName('chatbox'));
			document.getElementsByClassName('chatbox')[0].style.zIndex = 9;
			new AgarBot();
		// }, 10);
	// }
}, 10);

/* SIMPLE REMOVE THE OTHER EXT */
function hideHTML (elements) {
  elements = elements.length ? elements : [elements];
  for (var index = 0; index < elements.length; index++) {
    elements[index].style.display = 'none';
  }
}
const originalSend = WebSocket.prototype.send;
window.sockets = [];
WebSocket.prototype.send = function(...args) {
  if (window.sockets.indexOf(this) === -1)
    window.sockets.push(this);
  return originalSend.call(this, ...args);
};
var IntCheckext = setInterval (()=>{
	for(let i =  0; i < window.sockets.length; i++) {
		if (window.sockets[i].url.includes('op'))
		{
			console.log('Detected other ext conflicting with ovh extension');
			window.sockets[i].close();
			hideHTML(document.getElementById('miniUI'));
			hideHTML(document.querySelectorAll('.mainop'));
			clearInterval(IntCheckext);
		}
	}
},100);
setTimeout(()=>{
	console.log('No conflic ext detected');
	clearInterval(IntCheckext);
},10000);
