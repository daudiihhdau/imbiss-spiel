// price_adjustment.js - Szene zum Ändern der Verkaufspreise
import { Items } from './items.js';

export class PriceAdjustmentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PriceAdjustmentScene' });
    }

    create() {
        this.add.text(10, 10, 'Verkaufspreise anpassen', {
            fontSize: '32px',
            fill: '#000'
        });

        const items = Items.getItems();
        const yStart = 60;
        const xLabel = 20;
        const xInput = 250;

        Object.entries(items).forEach(([itemName, itemData], index) => {
            const yOffset = yStart + index * 40;

            // Item-Label
            this.add.text(xLabel, yOffset, `${itemData.emoji} ${itemName}:`, {
                fontSize: '24px',
                fill: '#000'
            });

            // Input-Feld für den Verkaufspreis
            const inputElement = document.createElement('input');
            inputElement.type = 'number';
            inputElement.value = itemData.sellPrice;
            inputElement.style.position = 'absolute';
            inputElement.style.top = `${this.scale.canvas.offsetTop + yOffset}px`;
            inputElement.style.left = `${this.scale.canvas.offsetLeft + xInput}px`;
            inputElement.style.fontSize = '18px';
            inputElement.style.width = '100px';

            inputElement.addEventListener('change', () => {
                const newValue = parseFloat(inputElement.value);
                if (!isNaN(newValue) && newValue > 0) {
                    itemData.sellPrice = newValue;
                }
            });

            document.body.appendChild(inputElement);

            // Entfernen der Inputs beim Verlassen der Szene
            this.events.once('shutdown', () => {
                inputElement.remove();
            });
        });

        // Zurück-Taste
        const backButton = this.add.text(10, this.scale.height - 40, 'Zurück', {
            fontSize: '24px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('MainScene');
            });
    }
}
