import { World } from './world.js';
// import { ImbissSoftware } from './InventoryManagement.js';
import { game } from './game.js';

// Kaufvorgang
function applyAllPrices(items, inputs) {
    try {
        items.forEach(item => {
            const inputElement = inputs[item.name];
            const newPrice = parseFloat(inputElement.value);

            if (!isNaN(newPrice) && newPrice > 0) {
                // ImbissSoftware.getInstance().updateSellPrice(item.name, newPrice);
                console.log(`Preis für ${item.name} auf ${newPrice.toFixed(2)} € gesetzt.`);
                inputElement.style.borderColor = '';
            } else {
                console.warn(`Ungültiger Preis für ${item.name} ignoriert.`);
                inputElement.style.borderColor = 'red';
            }
        });

        // Erfolgsmeldung anzeigen
        const successMessage = document.createElement('p');
        successMessage.textContent = 'Preise erfolgreich aktualisiert!';
        successMessage.classList.add('success-message');
        document.getElementById('html-content').appendChild(successMessage);

        setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
        console.error(`Fehler beim Aktualisieren der Preise: ${error.message}`);
    }
}

World.getInstance().events.subscribe('load_pricelist_scene', () => {
    game.scene.stop();
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('html-content').style.display = 'block';

    const container = document.getElementById('html-content');
    container.innerHTML = ''; // Reset content
    
    // Titel hinzufügen
    const header = document.createElement('h1');
    header.textContent = 'Verkaufspreise anpassen';
    header.classList.add('fun-header');
    container.appendChild(header);

    // const items = ImbissSoftware.getInstance().getCurrentStock().sort((a, b) => a.name.localeCompare(b.name));
    const inputs = {}; // Eingabe-Elemente sammeln

    // Tabelle erstellen
    const table = document.createElement('table');
    table.classList.add('table');

    // Tabellenkopf
    const headerRow = document.createElement('tr');
    ['Produkt',  'Im Lager', 'Aktueller Preis (€)', 'Neuer Preis (€)'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Produkte abrufen und Tabelle ausfüllen
    items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.classList.add(index % 2 === 0 ? 'row-even' : 'row-odd');

        // Produkt-Name und Emoji
        const productCell = document.createElement('td');
        productCell.textContent = item.emoji + ' ' + item.name;
        row.appendChild(productCell);

        // Lagerbestand
        const stockCell = document.createElement('td');
        stockCell.textContent = item.stock;
        row.appendChild(stockCell);

        // Aktueller Preis
        const priceCell = document.createElement('td');
        priceCell.textContent = item.sellPrice ? item.sellPrice.toFixed(2) : '0.00';
        row.appendChild(priceCell);

        // Eingabefeld für neuen Preis
        const inputCell = document.createElement('td');
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.value = item.sellPrice || '0.00';
        inputElement.min = '0.01';
        inputElement.step = '0.01';
        inputElement.classList.add('price-input');

        // Eingabe validieren
        inputElement.addEventListener('input', () => {
            const value = parseFloat(inputElement.value);
            if (isNaN(value) || value <= 0) {
                inputElement.style.borderColor = 'red';
            } else {
                inputElement.style.borderColor = '';
            }
        });

        inputCell.appendChild(inputElement);
        row.appendChild(inputCell);

        // Speichere die Eingabe
        inputs[item.name] = inputElement;

        table.appendChild(row);
    });

    container.appendChild(table);

    // Button "Preise setzen"
    const setPricesButton = document.createElement('button');
    setPricesButton.textContent = 'Preise setzen';
    setPricesButton.classList.add('btn-save', 'btn-green');
    setPricesButton.addEventListener('click', () => {
        applyAllPrices(items, inputs);
    });
    container.appendChild(setPricesButton);

    // Button "Zurück"
    const backButton = document.createElement('button');
    backButton.textContent = 'Zurück';
    backButton.classList.add('btn-back', 'btn-blue');
    backButton.addEventListener('click', () => {
        game.scene.start('MainScene')
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('html-content').style.display = 'none';
    });
    container.appendChild(backButton);
});
