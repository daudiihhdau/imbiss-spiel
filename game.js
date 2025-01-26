import { World } from './world.js';
import { MainScene } from './MainScene.js';
import './purchase_scene.js';
// import './price_adjustment.js';
// import './daily_summarize.js';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    scene: [] // MainScene], // Alle Szenen in der Liste
};

const game = new Phaser.Game(config);

World.getInstance().events.emit('load_purchase_scene');

export { game };