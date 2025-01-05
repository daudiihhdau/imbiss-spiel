import { ImbissSoftware } from './inventory_management.js';

function removeAllInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.remove());
    console.log('Alle DOM-Input-Elemente wurden entfernt.');
}

export class PriceAdjustmentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PriceAdjustmentScene' });
        this.imbissSoftware = ImbissSoftware.getInstance(); // Singleton-Instanz der Warenwirtschaft
        this.updatedPrices = {}; // Temporäre Speicherung der neuen Preise
    }

    create() {
        removeAllInputs(); // Entfernt alle vorherigen Input-Elemente

        this.add.text(10, 10, 'Verkaufspreise anpassen', {
            fontSize: '24px',
            fill: '#000'
        });

        const items = this.imbissSoftware.getCurrentStock().sort((a, b) => a.name.localeCompare(b.name));
        const yStart = 60;
        const xLabel = 20;
        const xInput = 300;
        const xDetails = 500;

        this.inputs = {};
        this.inputElements = [];

        items.forEach((item, index) => {
            const yOffset = yStart + index * 50;

            this.add.text(xLabel, yOffset, `${item.emoji} ${item.name}:`, {
                fontSize: '24px',
                fill: '#fff'
            });

            const inputElement = document.createElement('input');
            inputElement.type = 'number';
            inputElement.name = `price_${item.name}`;
            inputElement.value = item.sellPrice || 0;
            inputElement.min = '0.01';
            inputElement.step = '0.01';
            inputElement.style.position = 'absolute';
            inputElement.style.top = `${this.scale.canvas.offsetTop + yOffset}px`;
            inputElement.style.left = `${this.scale.canvas.offsetLeft + xInput}px`;
            inputElement.style.fontSize = '18px';
            inputElement.style.width = '100px';

            document.body.appendChild(inputElement);
            this.inputs[item.name] = inputElement;
            this.inputElements.push(inputElement);

            this.add.text(xDetails, yOffset, `Lager: ${item.stock}`, {
                fontSize: '24px',
                fill: '#fff'
            });

            // Hinzufügen von Feedback, wenn der Preis geändert wird
            inputElement.addEventListener('input', () => {
                inputElement.style.backgroundColor = '#d4edda'; // Grün für geänderte Preise
            });
        });

        // Tab-Navigation zwischen den Eingabefeldern
        this.inputElements.forEach((input, idx) => {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Tab') {
                    event.preventDefault();
                    const nextIdx = (idx + 1) % this.inputElements.length;
                    this.inputElements[nextIdx].focus();
                }
            });
        });

        this.add.text(10, this.scale.height - 50, 'Zurück', {
            fontSize: '24px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.cleanupScene(); // Bereinige die aktuelle Szene
            this.scene.stop('PriceAdjustmentScene'); // Beende die PriceAdjustmentScene
            this.scene.start('MainScene'); // Starte die MainScene
        });

        this.add.text(200, this.scale.height - 50, 'Preise setzen', {
            fontSize: '24px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.applyAllPrices(items);
        });

        this.events.once('shutdown', () => {
            this.cleanupScene();
        });
    }

    applyAllPrices(items) {
        try {
            items.forEach(item => {
                const inputElement = this.inputs[item.name];
                const newPrice = parseFloat(inputElement.value);

                if (!isNaN(newPrice) && newPrice > 0) {
                    this.imbissSoftware.updateSellPrice(item.name, newPrice);
                    console.log(`Preis für ${item.name} auf ${newPrice} € gesetzt.`);
                    inputElement.style.borderColor = ''; // Entfernt Fehleranzeige
                } else {
                    console.warn(`Ungültiger Preis für ${item.name} ignoriert.`);
                    inputElement.style.borderColor = 'red'; // Markiert ungültige Preise
                }
            });

            const successText = this.add.text(10, this.scale.height - 100, 'Preise erfolgreich aktualisiert!', {
                fontSize: '20px',
                fill: '#0f0'
            });
            this.tweens.add({
                targets: successText,
                alpha: 0,
                delay: 2000,
                duration: 1000,
                onComplete: () => successText.destroy()
            });

        } catch (error) {
            console.error(`Fehler beim Übergeben der Preise: ${error.message}`);
        }
    }

    cleanupScene() {
        removeAllInputs(); // Entfernt alle Input-Elemente aus dem DOM
        this.inputs = {};
        this.inputElements.forEach(input => {
            input.removeEventListener('keydown', this.handleTabNavigation); // Entferne Event-Listener
        });
        this.inputElements = [];
        console.log('PriceAdjustmentScene erfolgreich aufgeräumt.');
    }
}
