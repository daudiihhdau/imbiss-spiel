import { ImbissSoftware } from './inventory_management.js'; // Importiere Warenwirtschaft

export class PriceAdjustmentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PriceAdjustmentScene' });
        this.imbissSoftware = ImbissSoftware.getInstance(); // Singleton-Instanz der Warenwirtschaft
    }

    create() {
        this.add.text(10, 10, 'Verkaufspreise anpassen', {
            fontSize: '32px',
            fill: '#000'
        });

        const items = this.imbissSoftware.getCurrentStock(); // Abrufen der Lagerbestände aus der Warenwirtschaft
        const yStart = 60;
        const xLabel = 20;
        const xInput = 250;
        const xDetails = 400;

        items.forEach((item, index) => {
            const yOffset = yStart + index * 40;

            // Item-Label
            this.add.text(xLabel, yOffset, `${item.emoji} ${item.name}:`, {
                fontSize: '24px',
                fill: '#000'
            });

            // Input-Feld für den Verkaufspreis
            const inputElement = document.createElement('input');
            inputElement.type = 'number';
            inputElement.value = item.sellPrice || 0; // Standardpreis, falls nicht gesetzt
            inputElement.style.position = 'absolute';
            inputElement.style.top = `${this.scale.canvas.offsetTop + yOffset}px`;
            inputElement.style.left = `${this.scale.canvas.offsetLeft + xInput}px`;
            inputElement.style.fontSize = '18px';
            inputElement.style.width = '100px';

            inputElement.addEventListener('change', () => {
                const newValue = parseFloat(inputElement.value);
                if (!isNaN(newValue) && newValue > 0) {
                    try {
                        this.imbissSoftware.updateSellPrice(item.name, newValue); // Verkaufspreis aktualisieren
                    } catch (error) {
                        console.log(`Fehler bei der Preisänderung: ${error.message}`);
                    }
                }
            });

            document.body.appendChild(inputElement);

            // Weißer Text für Anzahl im Lager
            this.add.text(xDetails, yOffset, `Lager: ${item.stock}`, {
                fontSize: '20px',
                fill: '#fff'
            });

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
