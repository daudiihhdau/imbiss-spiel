// debug.js - Debugging-Funktionen

import { Items } from './items.js';

export function setupDebug(scene) {
    const debugText = scene.add.text(scene.scale.width - 10, scene.scale.height - 10, "", {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 },
        align: 'right'
    }).setOrigin(1, 1).setVisible(false);

    // Umschalten der Sichtbarkeit bei Leertaste
    scene.input.keyboard.on('keydown-SPACE', () => {
        debugText.setVisible(!debugText.visible);
        if (debugText.visible) {
            updateDebugDisplay(debugText);
        }
    });

    // Ereignis hören und Debug-Text aktualisieren
    scene.events.on('updateDebug', () => {
        if (debugText.visible) {
            updateDebugDisplay(debugText);
        }
    });
}

function updateDebugDisplay(debugText) {
    const items = Items.getItems();
    const stockInfo = Object.entries(items)
        .map(([name, { emoji, stock, sellPrice }]) => {
            const displayEmoji = stock > 0 ? emoji : `⚫${emoji}`;
            return `${displayEmoji} ${name}: ${stock} Stück, €${sellPrice.toFixed(2)}`;
        })
        .join('\n');

    debugText.setText(stockInfo);
}
