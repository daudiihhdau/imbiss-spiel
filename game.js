import { World } from './World.js';
import { MainScene } from './MainScene.js';
import './purchase_scene.js';
import './price_adjustment.js';
// import './daily_summarize.js';

let game;

// global available
window.screenSize = {
    width: window.innerWidth,
    height: window.innerHeight
};

console.log("window.screenSize existiert:", window.screenSize);

const config = {
    type: Phaser.AUTO,
    width: window.screenSize.width,
    height: window.screenSize.height,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    scene: [MainScene] // Hier werden die Szenen bekannt gemacht.
};

// Funktion, um das Spiel manuell zu starten
function startGame() {
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('html-content').style.display = 'none';

    if (!game) {
        game = new Phaser.Game(config);
        console.log('Spiel wurde gestartet.');
    } else {
        console.log('Spiel läuft bereits.');
    }
}

// Funktion, um das Spiel zu stoppen
function stopGame() {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('html-content').style.display = 'block';

    if (game) {
        game.destroy(true); // Zerstört das Phaser-Spielobjekt und bereinigt Ressourcen.
        game = null;
        console.log('Spiel wurde gestoppt.');
    } else {
        console.log('Kein Spiel läuft, das gestoppt werden könnte.');
    }
}

// Beispiel: Ereignisgesteuerter Start und Stopp
World.getInstance().events.subscribe('start_game', startGame);
World.getInstance().events.subscribe('stop_game', stopGame);

World.getInstance().events.emit('load_purchase_scene');


export { game };
