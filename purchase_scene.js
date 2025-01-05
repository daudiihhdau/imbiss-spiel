import { ImbissSoftware } from './inventory_management.js';

function removeAllInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.remove());
    console.log('Alle DOM-Input-Elemente wurden entfernt.');
}

export class PurchaseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PurchaseScene' });
        this.imbissSoftware = ImbissSoftware.getInstance();
    }

    create() {
        removeAllInputs(); // Entfernt alle vorherigen Input-Elemente

        this.add.text(10, 10, 'Produkte kaufen', {
            fontSize: '16px',
            fill: '#000'
        });

        // Tabellenkopf
        const tableStartX = 20;
        const tableStartY = 60;
        const rowHeight = 40;
        const columnWidths = [80, 150, 150, 100, 150]; // Breite für Emoji, Großhandel Bestand, Preis, Input und Eigenes Lager

        this.add.text(tableStartX, tableStartY, 'Produkt', { fontSize: '16px', fill: '#fff' });
        this.add.text(tableStartX + columnWidths[0], tableStartY, 'Vorhanden (Großhandel)', { fontSize: '16px', fill: '#fff' });
        this.add.text(tableStartX + columnWidths[0] + columnWidths[1], tableStartY, 'Preis (€)', { fontSize: '16px', fill: '#fff' });
        this.add.text(tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2], tableStartY, 'Menge', { fontSize: '16px', fill: '#fff' });
        this.add.text(tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], tableStartY, 'Auf Lager', { fontSize: '16px', fill: '#fff' });

        const items = this.imbissSoftware.getCurrentStock().sort((a, b) => a.name.localeCompare(b.name));

        this.inputs = {};
        this.inputElements = [];

        items.forEach((item, index) => {
            const yOffset = tableStartY + (index + 1) * rowHeight;
            const randomUnits = Math.floor(Math.random() * 50) + 1; // Zufällige Anzahl für Großhandel Bestand

            // Emoji-Spalte
            this.add.text(tableStartX, yOffset, `${item.emoji}`, {
                fontSize: '16px',
                fill: '#fff'
            });

            // Großhandel Bestand-Spalte
            this.add.text(tableStartX + columnWidths[0], yOffset, `${randomUnits}`, {
                fontSize: '16px',
                fill: '#fff'
            });

            // Preis-Spalte (Zufällig generiert für Simulation des Einkaufspreises)
            const randomPrice = (Math.random() * 5 + 1).toFixed(2);
            this.add.text(tableStartX + columnWidths[0] + columnWidths[1], yOffset, `${randomPrice}`, {
                fontSize: '16px',
                fill: '#fff'
            });

            // Eingabefeld-Spalte
            const inputElement = document.createElement('input');
            inputElement.type = 'number';
            inputElement.value = '0';
            inputElement.name = `buy_${item.name}`;
            inputElement.min = '0';
            inputElement.max = randomUnits.toString();
            inputElement.step = '1';
            inputElement.style.position = 'absolute';
            inputElement.style.top = `${this.scale.canvas.offsetTop + yOffset}px`;
            inputElement.style.left = `${this.scale.canvas.offsetLeft + tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2]}px`;
            inputElement.style.fontSize = '16px';
            inputElement.style.width = '60px';

            document.body.appendChild(inputElement);
            this.inputs[item.name] = { inputElement, randomUnits, randomPrice };
            this.inputElements.push(inputElement);

            // Eigenes Lager-Spalte
            this.add.text(tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], yOffset, `${item.stock}`, {
                fontSize: '16px',
                fill: '#fff'
            });
        });

        this.inputElements.forEach((input, idx) => {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Tab') {
                    event.preventDefault();
                    const nextIdx = (idx + 1) % this.inputElements.length;
                    this.inputElements[nextIdx].focus();
                }
            });
        });

        this.add.text(10, this.scale.height - 50, 'Preise festlegen', {
            fontSize: '16px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.cleanupScene();
            this.scene.stop('PurchaseScene');
            this.scene.start('PriceAdjustmentScene');
        });

        this.add.text(200, this.scale.height - 50, 'Kaufen', {
            fontSize: '16px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.purchaseItems();
        });

        this.events.once('shutdown', () => {
            this.cleanupScene();
        });
    }

    purchaseItems() {
        try {
            Object.entries(this.inputs).forEach(([name, { inputElement, randomUnits, randomPrice }]) => {
                const quantity = parseInt(inputElement.value, 10);

                if (!isNaN(quantity) && quantity > 0 && quantity <= randomUnits) {
                    this.imbissSoftware.addPurchase(name, quantity, parseFloat(randomPrice));
                    console.log(`Gekauft: ${quantity} x ${name} zu je ${randomPrice} €.`);
                } else {
                    console.warn(`Ungültige Menge für ${name} ignoriert.`);
                }
            });

            const successText = this.add.text(10, this.scale.height - 100, 'Einkauf erfolgreich!', {
                fontSize: '16px',
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
            console.error(`Fehler beim Einkauf: ${error.message}`);
        }
    }

    cleanupScene() {
        removeAllInputs(); // Entfernt alle Input-Elemente aus dem DOM
        this.inputs = {};
        this.inputElements = [];
        console.log('PurchaseScene erfolgreich aufgeräumt.');
    }
}
