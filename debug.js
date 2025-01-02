// debug.js - Debug-Modus

import { Items } from './items.js';

export function setupDebug(scene) {
    const debugBackground = scene.add.rectangle(
        scene.scale.width / 2, scene.scale.height / 2,
        600, 300,
        0x000000,
        0.8
    ).setOrigin(0.5).setVisible(false);

    const debugText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2, '', {
        fontSize: '16px',
        fill: '#fff',
        align: 'left',
        wordWrap: { width: 580 }
    }).setOrigin(0.5).setVisible(false);

    let debugVisible = false;

    scene.input.keyboard.on('keydown-SPACE', () => {
        debugVisible = !debugVisible;
        debugBackground.setVisible(debugVisible);
        debugText.setVisible(debugVisible);

        if (debugVisible) {
            updateDebugText();

            const padding = 20;
            debugBackground.setSize(debugText.width + padding, debugText.height + padding); // Hintergrund mit Rand
        }
    });

    function updateDebugText() {
        const items = Items.getItems();
        const debugLines = Object.entries(items).map(
            ([key, item]) => `${item.emoji}: Lager: ${item.stock}, Verkaufspreis: €${item.sellPrice.toFixed(2)}, Einkaufspreis: €${item.purchasePrice.toFixed(2)}`
        );
        debugText.setText(debugLines.join('\n'));
    }

    // Aktualisiere Debug-Text, wenn etwas geändert wird
    scene.events.on('update-debug', updateDebugText);
}
