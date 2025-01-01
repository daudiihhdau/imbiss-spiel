// game.js - Hauptspiel
import { PriceAdjustmentScene } from './price_adjustment.js';
import { MainScene } from './main_scene.js';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [PriceAdjustmentScene, MainScene] // Startet mit der Preisänderung
};

const game = new Phaser.Game(config);
