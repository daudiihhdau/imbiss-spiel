import { World } from './world.js';
// import { ImbissSoftware } from './InventoryManagement.js';
import { game } from './game.js';

let inputs = {}; // Inputs global initialisieren

// Kaufvorgang
function purchaseItems(inputs) {
    try {
        let totalCost = 0;

        Object.entries(inputs).forEach(([name, { inputElement, randomUnits, randomPrice }]) => {
            const quantity = parseInt(inputElement.value, 10);

            if (!isNaN(quantity) && quantity > 0 && quantity <= randomUnits) {
                totalCost += quantity * parseFloat(randomPrice);
            }
        });

        if (totalCost > World.getInstance().getWealth()) {
            alert(`Fehler: Die Einkaufskosten (${totalCost.toFixed(2)} €) übersteigen dein Budget (${World.getInstance().getWealth()} €).`);
            return;
        }

        Object.entries(inputs).forEach(([name, { inputElement, randomUnits, randomPrice }]) => {
            const quantity = parseInt(inputElement.value, 10);

            if (!isNaN(quantity) && quantity > 0 && quantity <= randomUnits) {
                // ImbissSoftware.getInstance().addPurchase(name, quantity, parseFloat(randomPrice));
                console.log(`Gekauft: ${quantity} x ${name} zu je ${randomPrice} €.`);
            }
        });

        // Budget aktualisieren
        World.getInstance().addWealth(totalCost * -1);

        // Erfolgsnachricht anzeigen
        const successMessage = document.createElement('p');
        successMessage.textContent = 'Einkauf erfolgreich!';
        successMessage.classList.add('success-message');
        document.getElementById('html-content').appendChild(successMessage);

        setTimeout(() => successMessage.remove(), 3000);

        updateBudgetDisplay();

    } catch (error) {
        console.error(`Fehler beim Einkauf: ${error.message}`);
    }
}

function updateBudgetDisplay() {
    const budgetDisplay = document.getElementById('budget-display');
    const currentCost = calculateCurrentCost(inputs);

    budgetDisplay.textContent = `Budget: ${World.getInstance().getWealth().toFixed(2)} €, Einkaufskosten: ${currentCost.toFixed(2)} €, Differenz: ${(World.getInstance().getWealth() - currentCost).toFixed(2)} €`;
}

function calculateCurrentCost(inputs) {
    return Object.values(inputs).reduce((total, { inputElement, randomPrice }) => {
        const quantity = parseInt(inputElement.value, 10);
        return total + (!isNaN(quantity) ? quantity * parseFloat(randomPrice) : 0);
    }, 0);
}

World.getInstance().events.subscribe('load_purchase_scene', () => {
    game.scene.stop();
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('html-content').style.display = 'block';

    const container = document.getElementById('html-content');
    container.innerHTML = ''; // Reset content

    inputs = {}; // Inputs hier erneut initialisieren

    // Titel hinzufügen
    const header = document.createElement('h1');
    header.textContent = 'Wareneinkauf';
    header.classList.add('fun-header');
    container.appendChild(header);

    // Budget-Anzeige hinzufügen
    const budgetDisplay = document.createElement('p');
    budgetDisplay.id = 'budget-display';
    budgetDisplay.classList.add('budget-display');
    container.appendChild(budgetDisplay);
    updateBudgetDisplay();

    // Tabelle erstellen
    const table = document.createElement('table');
    table.classList.add('table');

    // Tabellenkopf
    const headerRow = document.createElement('tr');
    ['Produkt', 'Preis (€)', 'Im Lager', 'Im Verkauf', 'Bestellung'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Produkte abrufen und Tabelle ausfüllen
    // const items = ImbissSoftware.getInstance().getCurrentStock().sort((a, b) => a.name.localeCompare(b.name));

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

        // Eigenes Lager
        const ownStockCell = document.createElement('td');
        ownStockCell.textContent = item.stock;
        row.appendChild(ownStockCell);

        // Großhandel Bestand
        const stockCell = document.createElement('td');
        stockCell.textContent = randomUnits;
        row.appendChild(stockCell);

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
            updateBudgetDisplay();
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
        World.getInstance().events.emit('load_pricelist_scene');
    });
    container.appendChild(adjustPricesButton);
});
