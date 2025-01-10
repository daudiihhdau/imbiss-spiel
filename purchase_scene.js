import { World } from './world.js';
import { ImbissSoftware } from './inventory_management.js';
import { game } from './game.js';

// Kaufvorgang
function purchaseItems(inputs) {
    try {
        Object.entries(inputs).forEach(([name, { inputElement, randomUnits, randomPrice }]) => {
            const quantity = parseInt(inputElement.value, 10);

            if (!isNaN(quantity) && quantity > 0 && quantity <= randomUnits) {
                ImbissSoftware.getInstance().addPurchase(name, quantity, parseFloat(randomPrice));
                console.log(`Gekauft: ${quantity} x ${name} zu je ${randomPrice} €.`);
            } else {
                console.warn(`Ungültige Menge für ${name} ignoriert.`);
            }
        });

        // Erfolgsnachricht anzeigen
        const successMessage = document.createElement('p');
        successMessage.textContent = 'Einkauf erfolgreich!';
        successMessage.classList.add('success-message');
        document.getElementById('html-content').appendChild(successMessage);

        setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
        console.error(`Fehler beim Einkauf: ${error.message}`);
    }
}

World.getInstance().events.subscribe('load_purchase_scene', () => {
    console.log('Lade Kaufszene');
    game.scene.stop();
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('html-content').style.display = 'block';

    const container = document.getElementById('html-content');
    container.innerHTML = ''; // Reset content

    const inputs = {}; // Korrekt initialisieren

    // Titel hinzufügen
    const header = document.createElement('h1');
    header.textContent = 'Wareneinkauf';
    header.classList.add('fun-header');
    container.appendChild(header);

    // Tabelle erstellen
    const table = document.createElement('table');
    table.classList.add('table');

    // Tabellenkopf
    const headerRow = document.createElement('tr');
    ['Produkt', 'Preis (€)', 'Vorhanden (Großhandel)', 'Auf Lager', 'Bestellung', ].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Produkte abrufen und Tabelle ausfüllen
    const items = ImbissSoftware.getInstance().getCurrentStock().sort((a, b) => a.name.localeCompare(b.name));

    items.forEach((item, index) => {
        const randomUnits = Math.floor(Math.random() * 50) + 1; // Zufälliger Großhandel-Bestand
        const randomPrice = (Math.random() * 5 + 1).toFixed(2); // Zufälliger Preis

        const row = document.createElement('tr');
        row.classList.add(index % 2 === 0 ? 'row-even' : 'row-odd');

        // Produkt-Emoji und Name
        const productCell = document.createElement('td');
        productCell.textContent = item.emoji + ' ' + item.name;
        row.appendChild(productCell);

        // Preis
        const priceCell = document.createElement('td');
        priceCell.textContent = randomPrice;
        row.appendChild(priceCell);

        // Großhandel Bestand
        const stockCell = document.createElement('td');
        stockCell.textContent = randomUnits;
        row.appendChild(stockCell);

        // Eigenes Lager
        const ownStockCell = document.createElement('td');
        ownStockCell.textContent = item.stock;
        row.appendChild(ownStockCell);

        // Eingabefeld für Menge
        const inputCell = document.createElement('td');
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.value = '0';
        inputElement.min = '0';
        inputElement.max = randomUnits.toString();
        inputElement.step = '1';

        // Eingabe validieren
        inputElement.addEventListener('input', (event) => {
            const value = parseInt(event.target.value, 10);
            if (isNaN(value) || value < 0 || value > randomUnits) {
                event.target.value = Math.min(Math.max(value, 0), randomUnits);
            }
        });

        inputCell.appendChild(inputElement);
        row.appendChild(inputCell);

        // Speichere die Eingabe für die Verarbeitung
        inputs[item.name] = { inputElement, randomUnits, randomPrice };

        table.appendChild(row);
    });

    container.appendChild(table);

    // Button "Kaufen"
    const buyButton = document.createElement('button');
    buyButton.textContent = 'Kaufen';
    buyButton.classList.add('btn-buy', 'btn-green');
    buyButton.addEventListener('click', () => purchaseItems(inputs)); // inputs korrekt übergeben
    container.appendChild(buyButton);

    // Button "Preise festlegen"
    const adjustPricesButton = document.createElement('button');
    adjustPricesButton.textContent = 'Preise festlegen';
    adjustPricesButton.classList.add('btn-adjust-prices', 'btn-blue');
    adjustPricesButton.addEventListener('click', () => {
        World.getInstance().cleanupScene();
        console.log('Wechsel zu Preisfestlegungsszene');
    });
    container.appendChild(adjustPricesButton);
});
