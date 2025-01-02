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
            debug: false,
        },
    },
    scene: [PriceAdjustmentScene, MainScene],
};

const game = new Phaser.Game(config);

// Übergang von PriceAdjustment zu MainScene
game.scene.start('PriceAdjustmentScene');
