import { PriceAdjustmentScene } from './price_adjustment.js';
import { PurchaseScene } from './purchase_scene.js';
import { MainScene } from './main_scene.js';
import { DailySummaryScene } from './daily_summarize.js';
import { ImbissSoftware } from './inventory_management.js'; // Importiere Warenwirtschaft

// Singleton-Instanz initialisieren
const inventory = ImbissSoftware.getInstance();

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
    scene: [PurchaseScene, PriceAdjustmentScene, MainScene, DailySummaryScene], // Alle Szenen in der Liste
};

const game = new Phaser.Game(config);

// Starte nur die PriceAdjustmentScene beim Spielstart
game.scene.start('PurchaseScene');
