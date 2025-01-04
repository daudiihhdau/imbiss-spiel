import { ImbissSoftware } from './inventory_management.js'; // Importiere Warenwirtschaft

export class PriceAdjustmentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PriceAdjustmentScene' });
        this.imbissSoftware = ImbissSoftware.getInstance(); // Singleton-Instanz der Warenwirtschaft
        this.updatedPrices = {}; // Temporäre Speicherung der neuen Preise
    }

    create() {
        this.add.text(10, 10, 'Verkaufspreise anpassen', {
            fontSize: '24px', // Einheitliche Schriftgröße
            fill: '#000'
        });

        const items = this.imbissSoftware.getCurrentStock().sort((a, b) => a.name.localeCompare(b.name));
        const yStart = 60;
        const xLabel = 20;
        const xInput = 300; // Platz rechts neben dem Produktnamen
        const xDetails = 500;

        // Initialisierung der Eingabefelder
        this.inputs = {}; // Speicherung der Input-Felder nach Produktname

        items.forEach((item, index) => {
            const yOffset = yStart + index * 50; // Abstand zwischen Zeilen

            // Produktname mit Emoji anzeigen
            this.add.text(xLabel, yOffset, `${item.emoji} ${item.name}:`, {
                fontSize: '24px', // Einheitliche Schriftgröße
                fill: '#fff' // Weiße Schrift für Lesbarkeit
            });

            // Input-Feld für den Verkaufspreis
            const inputElement = document.createElement('input');
            inputElement.type = 'number';
            inputElement.name = `price_${item.name}`; // Name des Inputs für das Produkt
            inputElement.value = item.sellPrice || 0; // Standardpreis
            inputElement.min = '0.01';
            inputElement.step = '0.01';
            inputElement.style.position = 'absolute';
            inputElement.style.top = `${this.scale.canvas.offsetTop + yOffset}px`;
            inputElement.style.left = `${this.scale.canvas.offsetLeft + xInput}px`;
            inputElement.style.fontSize = '18px';
            inputElement.style.width = '100px';

            // Hinzufügen des Input-Feldes zur Speicherung
            document.body.appendChild(inputElement);
            this.inputs[item.name] = inputElement;

            // Weißer Text für Lagerbestand
            this.add.text(xDetails, yOffset, `Lager: ${item.stock}`, {
                fontSize: '24px', // Einheitliche Schriftgröße
                fill: '#fff'
            });
        });

        // Zurück-Taste
        this.add.text(10, this.scale.height - 50, 'Zurück', {
            fontSize: '24px', // Einheitliche Schriftgröße
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('MainScene');
        });

        // Button "Preise setzen"
        this.add.text(200, this.scale.height - 50, 'Preise setzen', {
            fontSize: '24px', // Einheitliche Schriftgröße
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.applyAllPrices(items);
        });

        // Eingabefelder entfernen, wenn die Szene verlassen wird
        this.events.once('shutdown', () => {
            Object.values(this.inputs).forEach(input => input.remove());
        });
    }

    applyAllPrices(items) {
        try {
            items.forEach(item => {
                // Holen des neuen Preises aus dem entsprechenden Input-Feld
                const inputElement = this.inputs[item.name];
                const newPrice = parseFloat(inputElement.value);

                if (!isNaN(newPrice) && newPrice > 0) {
                    // Übergeben des neuen Preises an den Manager
                    this.imbissSoftware.updateSellPrice(item.name, newPrice);
                    console.log(`Preis für ${item.name} auf ${newPrice} € gesetzt.`);
                } else {
                    console.warn(`Ungültiger Preis für ${item.name} ignoriert.`);
                }
            });

            console.log('Alle Preise erfolgreich an den InventoryManager übergeben.');
        } catch (error) {
            console.error(`Fehler beim Übergeben der Preise: ${error.message}`);
        }
    }
}
