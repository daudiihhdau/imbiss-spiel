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
        successMessage.style.color = 'green';
        document.getElementById('html-content').appendChild(successMessage);

        setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
        console.error(`Fehler beim Einkauf: ${error.message}`);
    }
}

World.getInstance().events.subscribe('load_purchase_scene', () => {
    console.log('ssss')
    game.scene.stop();
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('html-content').style.display = 'block';

    const container = document.getElementById('html-content');
    container.innerHTML = ''; // Reset content

    const inputs = []

    // Titel hinzufügen
    const header = document.createElement('h1');
    header.textContent = 'Produkte kaufen';
    container.appendChild(header);

    // Tabelle erstellen
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '20px';

    // Tabellenkopf
    const headerRow = document.createElement('tr');
    ['Produkt', 'Vorhanden (Großhandel)', 'Preis (€)', 'Menge', 'Auf Lager'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f4f4f4';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Produkte abrufen und Tabelle ausfüllen
    const items = ImbissSoftware.getInstance().getCurrentStock().sort((a, b) => a.name.localeCompare(b.name));

    items.forEach(item => {
        const randomUnits = Math.floor(Math.random() * 50) + 1; // Zufälliger Großhandel-Bestand
        const randomPrice = (Math.random() * 5 + 1).toFixed(2); // Zufälliger Preis

        const row = document.createElement('tr');

        // Produkt-Emoji und Name
        const productCell = document.createElement('td');
        productCell.textContent = `${item.emoji} ${item.name}`;
        productCell.style.border = '1px solid #ddd';
        productCell.style.padding = '8px';
        row.appendChild(productCell);

        // Großhandel Bestand
        const stockCell = document.createElement('td');
        stockCell.textContent = randomUnits;
        stockCell.style.border = '1px solid #ddd';
        stockCell.style.padding = '8px';
        row.appendChild(stockCell);

        // Preis
        const priceCell = document.createElement('td');
        priceCell.textContent = randomPrice;
        priceCell.style.border = '1px solid #ddd';
        priceCell.style.padding = '8px';
        row.appendChild(priceCell);

        // Eingabefeld für Menge
        const inputCell = document.createElement('td');
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.value = '0';
        inputElement.min = '0';
        inputElement.max = randomUnits.toString();
        inputElement.step = '1';
        inputElement.style.width = '60px';
        inputElement.style.padding = '5px';
        inputCell.appendChild(inputElement);
        inputCell.style.border = '1px solid #ddd';
        inputCell.style.padding = '8px';
        row.appendChild(inputCell);

        // Eigenes Lager
        const ownStockCell = document.createElement('td');
        ownStockCell.textContent = item.stock;
        ownStockCell.style.border = '1px solid #ddd';
        ownStockCell.style.padding = '8px';
        row.appendChild(ownStockCell);

        // Speichere die Eingabe für die Verarbeitung
        inputs[item.name] = { inputElement, randomUnits, randomPrice };

        table.appendChild(row);
    });

    container.appendChild(table);

    // Button "Kaufen"
    const buyButton = document.createElement('button');
    buyButton.textContent = 'Kaufen';
    buyButton.style.marginTop = '20px';
    buyButton.style.padding = '10px 20px';
    buyButton.style.fontSize = '16px';
    buyButton.addEventListener('click', () => purchaseItems());
    container.appendChild(buyButton);

    // Button "Preise festlegen"
    const adjustPricesButton = document.createElement('button');
    adjustPricesButton.textContent = 'Preise festlegen';
    adjustPricesButton.style.marginTop = '20px';
    adjustPricesButton.style.marginLeft = '10px';
    adjustPricesButton.style.padding = '10px 20px';
    adjustPricesButton.style.fontSize = '16px';
    adjustPricesButton.addEventListener('click', () => {
        this.cleanupScene();
        // Hier könnte ein Szenenwechsel stattfinden
        console.log('Wechsel zu Preisfestlegungsszene');
    });
    container.appendChild(adjustPricesButton);
});
