window.realnames = !0;
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
window.ghostCells = [];
window.ghostCells = [{
    'x': 0,
    'y': 0,
    'size': 0,
    'mass': 0,
}];
window.botr = false;
window.isBotRunning = false; // Nueva variable para rastrear si los bots están activos

// Estilos personalizados para mejorar la UI
const customStyles = `
.muzza-gui {
    width: 200px;
    position: fixed;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    padding: 10px;
    font-family: sans-serif;
    color: #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.muzza-gui-header {
    text-align: center;
    font-size: 16px;
    margin-bottom: 8px;
}

.muzza-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 14px;
}

.control-btn {
    background: #007BFF;
    color: #fff;
    border: none;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    width: 100%;
}
.control-btn:hover {
    background: #0056b3;
}
.control-btn.red {
    background: #dc3545;
}
.control-btn.green {
    background: #28a745;
}

.key-button {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    background: #f0f0f0;
    cursor: pointer;
    text-align: center;
    font-size: 12px;
}
`;

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: customStyles }));

class GUI {
    constructor(t) {
        this.socket = t;
        this.player = this.socket.player;
        this.body = document.getElementsByTagName("body")[0];
        
        // Inyectar estilos personalizados
        const styleElement = document.createElement('style');
        styleElement.textContent = customStyles;
        document.head.appendChild(styleElement);
        
        this.divs = {
            maindiv: document.createElement("div"),
            header: document.createElement("div"),
            data: document.createElement("div"),
            rows: {
                bots: document.createElement("row"),
                botsControl: document.createElement("row"), // Nueva fila para el botón de control
                eject: document.createElement("row"),
                split: document.createElement("row"),
                splitX2: document.createElement("row"),
                splitX4: document.createElement("row"),
                botgamemode: document.createElement("row"),
                botdestination: document.createElement("row"),
                vshield: document.createElement("row"),
                botspec: document.createElement("row"),
                massbots: document.createElement("row"),
                endtime: document.createElement("row"),
                startStop: document.createElement("row"),
                botnum: document.createElement("row"),
            }
        };
        
        this.inputs = {
            eject: document.createElement("input"),
            split: document.createElement("input"),
            splitX2: document.createElement("input"),
            splitX4: document.createElement("input"),
            botgamemode: document.createElement("input"),
            botdestination: document.createElement("input"),
            vShield: document.createElement("input"),
            botspec: document.createElement("input"),
            massbots: document.createElement("input"),
            startStop: document.createElement("input")
        };
        
        this.initialized = !1;
        this.rowsinit = !1;
        this.initialize();
    }
    
    initialize() {
        window.currentServer = '';
        setInterval(function(){
            if (window.CurrentServerPlaying != null && window.currentServer != window.CurrentServerPlaying) {
                window.startbot = false;
                window.CurrentServerPlaying = window.currentServer;
            }
        }, 70);
        
        try {
            var thot = this;
            window.app.on("spawn", (tab) => {   
                window.isdead = false;
                console.log("Client spawned");
                window.botr = true;
            });
            
            window.app.on("death", () => {
                window.isdead = true;
            });
            
            // Configurar el contenedor principal
            this.divs.maindiv.setAttribute("class", "muzza-gui");
            
            // Añadir encabezado
            this.divs.header.setAttribute("class", "muzza-gui-header");
            this.divs.header.textContent = "AgarBot Control Panel";
            this.divs.maindiv.appendChild(this.divs.header);
            
            // Configurar área de datos
            this.divs.data.setAttribute("class", "data");
            this.divs.maindiv.appendChild(this.divs.data);

            // Configurar inputs
            for (const t of Object.keys(this.inputs)) {
                this.inputs[t].setAttribute("id", t);
                this.inputs[t].setAttribute("maxlength", "1");
                this.inputs[t].setAttribute("class", "key-button");
            }

            // Configurar filas
            for (const t of Object.keys(this.divs.rows)) {
                this.divs.rows[t].setAttribute("class", "muzza-row");
                this.divs.data.appendChild(this.divs.rows[t]);
                
                if (t !== "botnum" && t !== "endtime" && t !== "botsControl") {
                    let e = document.createElement("hr");
                    e.setAttribute("id", t);
                    e.setAttribute("style", "visibility: hidden;width: 0%;margin: 0;border-color: green;");
                    this.divs.data.appendChild(e);
                }
            }
            
            // Añadir el div principal al body
            this.body.appendChild(this.divs.maindiv);
            this.initialized = !0;
            
            setTimeout(() => {
                this.updateRows();
            }, 1000);
        } catch (t) {
            throw new Error(t);
        }
    }
    
    updateBar() {
        if (this.socket.Transmitter.status.initialized) {
            if (window.sliderValue) {
                if (this.player.decoded.currentBots > window.sliderValue) {
                    this.player.decoded.currentBots = window.sliderValue;
                }
                this.player.decoded.botsMax = window.sliderValue;
            }
            
            const t = this.player.decoded.currentBots / this.player.decoded.botsMax * 100;
            
            // Crear la barra de progreso si no existe
            if (!document.getElementById("botsProgressBar")) {
                const progressContainer = document.createElement("div");
                progressContainer.className = "progress-bar-container";
                
                const progressBar = document.createElement("div");
                progressBar.className = "progress-bar";
                progressBar.id = "botsProgressBar";
                progressBar.style.width = t + "%";
                
                progressContainer.appendChild(progressBar);
                this.divs.rows.bots.appendChild(progressContainer);
            } else {
                document.getElementById("botsProgressBar").style.width = t + "%";
            }
        }
    }
    
    calculateTime() {
        const t = new Date;
        var e = new Date(this.player.decoded.expire) - t;
        if (window.playingtime){
            window.expiretime--;
            e = window.expiretime*1000;
        }
        var d = Math.floor(e / 86400000),
            s = Math.floor(e % 864e5 / 36e5),
            i = Math.floor(e % 36e5 / 6e4),
            o = Math.floor(e % 6e4 / 1e3);
            
        if (e < 0) {
            this.divs.rows.endtime.innerHTML = "<span class='status-indicator status-inactive'>Expired/No Plan!</span>";
        } else {
            this.divs.rows.endtime.innerHTML = `<span class='status-indicator'>Time Left: ${d}d ${s}h ${i}m ${o}s</span>`;
        }
    }
    
    getBotMode() {
        const t = this.socket.Transmitter.status.initialized,
              e = this.socket.Transmitter.status.botmode;
        return t ? 0 === e ? "Normal" : 1 === e ? "Farmer" : 2 === e ? "Normal" : 10 === e ? "Farmer" : 1337 === e ? "No AI" : void 0 : "Not connected!";
    }
    
    getvShieldMode() {
        const t = this.socket.Transmitter.status.initialized,
              e = this.socket.Transmitter.status.vshield;
        return t ? e ? "<span class='status-active'>Active</span>" : "<span class='status-inactive'>Disabled</span>" : "Not connected!";
    }
    
    getmassbots() {
        const t = this.socket.Transmitter.status.initialized,
              e = this.socket.Transmitter.status.massbots;
        return t ? e ? "<span class='status-active'>Active</span>" : "<span class='status-inactive'>Disabled</span>" : "Not connected!";
    }    
    
    getbotspec() {
        const t = this.socket.Transmitter.status.initialized,
              e = this.socket.Transmitter.status.botspec;
        return t ? e ? "<span class='status-active'>Active</span>" : "<span class='status-inactive'>Disabled</span>" : "Not connected!";
    }    
    
    getbotdestinationMode() {
        const t = this.socket.Transmitter.status.initialized,
              e = this.socket.Transmitter.status.botdestination;
        return t ? e ? "Cell" : "Mouse" : "Not connected!";
    }
    
    // toggleBots unchanged but now works with properly injected button
    toggleBots() {
        window.isBotRunning = !window.isBotRunning;
        window.startbot = window.isBotRunning;
        const btn = document.getElementById("botControlBtn");
        if (window.isBotRunning) {
            btn.textContent = "Stop Bots";
            btn.className = "control-btn red";
            this.socket.Transmitter.sendSpawn();
        } else {
            btn.textContent = "Start Bots";
            btn.className = "control-btn green";
        }
    }
    
    onChange(t) {
        const e = t.target,
              s = t.data;
              
        if (!s) return this.updateRows();
        
        e === document.getElementById("eject") ? (this.socket.Hotkeys.keys.eject = s, this.socket.Hotkeys.setStorage("eject", s)) : 
        e === document.getElementById("split") ? (this.socket.Hotkeys.keys.split = s, this.socket.Hotkeys.setStorage("split", s)): 
        e === document.getElementById("splitX2") ? (this.socket.Hotkeys.keys.splitX2 = s, this.socket.Hotkeys.setStorage("splitX2", s)): 
        e === document.getElementById("splitX4") ? (this.socket.Hotkeys.keys.splitX4 = s, this.socket.Hotkeys.setStorage("splitX4", s)) : 
        e === document.getElementById("botgamemode") ? (this.socket.Hotkeys.keys.botmode = s, this.socket.Hotkeys.setStorage("botmode", s)) : 
        e === document.getElementById("botdestination") ? (this.socket.Hotkeys.keys.botdestination = s, this.socket.Hotkeys.setStorage("botdestination", s)) : 
        e === document.getElementById("botspec") ? (this.socket.Hotkeys.keys.botspec = s, this.socket.Hotkeys.setStorage("botspec", s)) :
        e === document.getElementById("massbots") ? (this.socket.Hotkeys.keys.massbots = s, this.socket.Hotkeys.setStorage("massbots", s)) :
        e === document.getElementById("vShield") ? (this.socket.Hotkeys.keys.vShield = s, this.socket.Hotkeys.setStorage("vShield", s)) : e === document.getElementById("vShield");
    }
    
    updateRows() {
        if (this.rowsinit) {
            document.getElementById("eject").value = this.socket.Hotkeys.keys.eject;
            document.getElementById("split").value = this.socket.Hotkeys.keys.split;
            document.getElementById("splitX2").value = this.socket.Hotkeys.keys.splitX2;
            document.getElementById("splitX4").value = this.socket.Hotkeys.keys.splitX4;
            document.getElementById("botgamemode").value = this.socket.Hotkeys.keys.botmode;
            document.getElementById("botdestination").value = this.socket.Hotkeys.keys.botdestination;
            document.getElementById("massbots").value = this.socket.Hotkeys.keys.massbots;
            document.getElementById("botspec").value = this.socket.Hotkeys.keys.botspec;
            document.getElementById("vShield").value = this.socket.Hotkeys.keys.vShield;
            
            document.getElementById("bot_mode_key").innerHTML = this.getBotMode();
            document.getElementById("vshield_mode_key").innerHTML = this.getvShieldMode();
            document.getElementById("massbots_mode_key").innerHTML = this.getmassbots();
            document.getElementById("botspec_mode_key").innerHTML = this.getbotspec();
            document.getElementById("botdestination_mode_key").innerHTML = this.getbotdestinationMode();
        } else {
            // STATUS section
            const statusHeader = document.createElement("div");
            statusHeader.className = "section-header";
            statusHeader.textContent = "STATUS";
            this.divs.data.insertBefore(statusHeader, this.divs.rows.bots);

            // Bots count
            this.divs.rows.bots.innerHTML = `<div>Bots: ${this.player.decoded.currentBots}/${this.player.decoded.botsMax}</div>`;

            // Start/Stop button
            this.divs.rows.botsControl.innerHTML = `<button id="botControlBtn" class="control-btn green">Start Bots</button>`;
            document.getElementById("botControlBtn").addEventListener("click", () => this.toggleBots());

            // HOTKEYS header
            const hotkeyHeader = document.createElement("div");
            hotkeyHeader.className = "section-header";
            hotkeyHeader.textContent = "HOTKEYS";
            this.divs.data.insertBefore(hotkeyHeader, this.divs.rows.eject);

            
            this.divs.rows.eject.innerHTML = "Eject: " + this.socket.GUI.inputs.eject.outerHTML;
            this.divs.rows.split.innerHTML = "Split: " + this.socket.GUI.inputs.split.outerHTML;
            this.divs.rows.splitX2.innerHTML = "Split X2: " + this.socket.GUI.inputs.splitX2.outerHTML;
            this.divs.rows.splitX4.innerHTML = "Split X4: " + this.socket.GUI.inputs.splitX4.outerHTML;
            
            // Sección de configuración de bots
            const configHeader = document.createElement("div");
            configHeader.className = "section-header";
            configHeader.textContent = "BOT SETTINGS";
            this.divs.data.insertBefore(configHeader, this.divs.rows.botgamemode);
            
            this.divs.rows.botgamemode.innerHTML = `Bot Mode: <span id="bot_mode_key">${this.getBotMode()}</span> ${this.socket.GUI.inputs.botgamemode.outerHTML}`;
            this.divs.rows.botdestination.innerHTML = `Target: <span id="botdestination_mode_key">${this.getbotdestinationMode()}</span> ${this.socket.GUI.inputs.botdestination.outerHTML}`;
            this.divs.rows.vshield.innerHTML = `vShield: <span id="vshield_mode_key">${this.getvShieldMode()}</span> ${this.socket.GUI.inputs.vShield.outerHTML}`;
            this.divs.rows.botspec.innerHTML = `SpecControl: <span id="botspec_mode_key">${this.getbotspec()}</span> ${this.socket.GUI.inputs.botspec.outerHTML}`;
            this.divs.rows.massbots.innerHTML = `Massbots: <span id="massbots_mode_key">${this.getmassbots()}</span> ${this.socket.GUI.inputs.massbots.outerHTML}`;
            
            // Slider para número de bots
            this.divs.rows.botnum.innerHTML = "<div class='slider-container' id='botnum'></div><div id='timerBtn'></div>";
            
            // Configuración de los inputs
            document.getElementById("eject").value = this.socket.Hotkeys.keys.eject;
            document.getElementById("split").value = this.socket.Hotkeys.keys.split;
            document.getElementById("splitX2").value = this.socket.Hotkeys.keys.splitX2;
            document.getElementById("splitX4").value = this.socket.Hotkeys.keys.splitX4;
            document.getElementById("botgamemode").value = this.socket.Hotkeys.keys.botmode;
            document.getElementById("botdestination").value = this.socket.Hotkeys.keys.botdestination;
            document.getElementById("botspec").value = this.socket.Hotkeys.keys.botspec;
            document.getElementById("massbots").value = this.socket.Hotkeys.keys.massbots;
            document.getElementById("vShield").value = this.socket.Hotkeys.keys.vShield;

            for (const t of Object.keys(this.inputs)) {
                this.inputs[t].setAttribute("id", t);
                this.inputs[t].setAttribute("maxlength", "1");
                this.inputs[t].setAttribute("class", "key-button");
                
                document.getElementById(this.inputs[t].id).addEventListener("input", t => this.onChange(t), !1);
                document.getElementById(this.inputs[t].id).onclick = t => {
                    t.target.select();
                };
            }
            
            this.rowsinit = true;
        }
    }
    
    update() {
        if (this.initialized) {
            this.updateBar();
            
            var thot = this;
            var c = document.getElementById("botnum");
            
            if (window.sliderValue) {
                if (this.player.decoded.currentBots > window.sliderValue) {
                    this.player.decoded.currentBots = window.sliderValue;
                }
                this.player.decoded.botsMax = window.sliderValue;
            }
            
            this.divs.rows.bots.innerHTML = `<div>Bots: ${this.player.decoded.currentBots}/${500===this.player.decoded.botsMax?0:this.player.decoded.botsMax}</div>`;
            
            // Añadir la barra de progreso nuevamente después de actualizar el texto
            this.updateBar();

            if (!window.loadedBar) {
                window.loadedBar = true;
                var that = this;
                let BotsDetected = setInterval(() => {
                    if (this.player.decoded.botsMax != 0 && !window.loadedBarBots) {
                        window.maxBotsS = this.player.decoded.botsMax;
                        clearInterval(BotsDetected);
                        window.loadedBarBots = true;
                        var c = document.getElementById("botnum");
                        
                        // Crear slider solo si noUiSlider está disponible
                        if (typeof noUiSlider !== 'undefined') {
                            noUiSlider.create(c, {
                                start: 0, 
                                step: 1, 
                                range: {
                                    min: 0, 
                                    max: parseInt(this.player.decoded.botsMax)
                                },
                                format: wNumb({
                                    decimals: 0,
                                    thousand: '.',
                                    postfix: ' ',
                                }),
                                tooltips: true, 
                                direction: 'ltr'
                            });
                            
                            c.noUiSlider.set(parseInt(this.player.decoded.botsMax));
                            c.noUiSlider.on('change', function(values, handle) {
                                window.sliderValue = parseInt(c.noUiSlider.get().toString().replace(/\s+/g, ''));
                                
                                if ((window.maxBotsS < 200) && (Date.now() - window.lastTimeusedSlide < 20000)) {
                                    document.getElementById('botnum').style.display = "none";
                                    var alreadyrefresh2 = false;
                                    
                                    if (document.getElementById('timerBtn')) {
                                        document.getElementById('timerBtn').style.display = "block";
                                        var timeleft = 20;
                                        var downloadTimer = setInterval(function() {
                                            timeleft--;
                                            var hours = Math.floor(timeleft/3600);
                                            var minutes = Math.floor((timeleft % 3600)/60);
                                            var seconds = timeleft % 60;
                                            
                                            if (seconds < 10) {
                                                seconds = "0" + seconds; 
                                            }
                                            if (minutes < 10) {
                                                minutes = "0" + minutes;
                                            }
                                            
                                            document.getElementById('timerBtn').innerHTML = `<button class="control-btn red">${minutes}:${seconds}</button>`;
                                            
                                            if (timeleft <= 0) {
                                                clearInterval(downloadTimer);
                                                if (!alreadyrefresh2) {
                                                    alreadyrefresh2 = true;
                                                    document.getElementById('botnum').style.display = "block";
                                                    document.getElementById('timerBtn').style.display = "none";
                                                }
                                            }
                                        }, 1000);
                                    }
                                } else {
                                    window.lastTimeusedSlide = Date.now();
                                }
                                
                                console.log('onChange ' + thot.socket.ws.readyState, window.sliderValue);
                                window.botsDyn = parseInt(window.sliderValue.toString().replace(/\s+/g, ''));
                                if (window.botr) {
                                    thot.socket.send({req: 99, botdynv2: parseInt(window.sliderValue.toString().replace(/\s+/g, ''))});
                                }
                            });
                        } else {
                            // Si noUiSlider no está disponible, crear un control de entrada simple
                            c.innerHTML = `
                                <div style="display: flex; align-items: center;">
                                    <input type="range" min="0" max="${parseInt(this.player.decoded.botsMax)}" value="${parseInt(this.player.decoded.botsMax)}" style="width: 100%;" id="botRangeSlider">
                                    <span id="botSliderValue">${parseInt(this.player.decoded.botsMax)}</span>
                                </div>
                            `;
                            
                            document.getElementById('botRangeSlider').addEventListener('change', function() {
                                const value = parseInt(this.value);
                                window.sliderValue = value;
                                document.getElementById('botSliderValue').textContent = value;
                                
                                window.botsDyn = value;
                                if (window.botr) {
                                    thot.socket.send({req: 99, botdynv2: value});
                                }
                            });
                        }
                    }
                }, 1000);
            }
        }
    }
}

// El resto del código permanece igual pero con los cambios para integrar el nuevo botón de inicio/parada
class Transmitter {
    constructor(t) {
        this.socket = t;
        this.status = {
            initialized: !1,
            botdestination: 0,
            vshield: 0,
            botspec: 0,
            massbots: false,
            botmode: 0
        };
    }
    
    handshake(t, e) {
        let s = {};
        s.req = 1;
        s.ver = 3;
        this.socket.send(s);
        this.start();
    }
    
    start() {
        this.moveInterval = setInterval(() => {
            this.sendPosition();
        }, 50);
    }
    
    sendSpawn() {
        console.log("Spawning bots");
        this.socket.send({req: 8, cmd: 'spawn'});
    }
    
    sendSplit() {
        console.log("sent split!");
        this.socket.send({req: 3, cmd: 'split'});
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
        }), app.on("spawn", t => {
			// console.log('SPAWNED WITH AGARBOT ');
			this.Transmitter.status.initialized = 1;
			// console.log(this.socket.GUI.initialized);
			this.socket.GUI.initialized = 1;
			this.socket.GUI.updateRows();
			
			window.CurrentServerPlaying = window.currentServer;
			window.startbot = true;
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
