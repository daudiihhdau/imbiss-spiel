// import { ImbissSoftware } from './InventoryManagement.js';
import { World } from './world.js';
import { game } from './game.js';

// Funktion zur Erstellung von Tabellen
function createTable(headers, data, options = {}) {
    const { columnStyles = {}, rowStyles = {}, defaultCellStyle = {}, emptyMessage = "Keine Daten verfügbar" } = options;

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '20px';

    // Tabellenköpfe erstellen
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f4f4f4';
        th.style.textAlign = 'left';
        if (columnStyles[headerText]) {
            Object.assign(th.style, columnStyles[headerText]);
        }
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Tabelleninhalt hinzufügen
    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.textContent = emptyMessage;
        emptyCell.colSpan = headers.length;
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '8px';
        emptyCell.style.border = '1px solid #ddd';
        emptyRow.appendChild(emptyCell);
        table.appendChild(emptyRow);
    } else {
        data.forEach(rowData => {
            const row = document.createElement('tr');
            Object.assign(row.style, rowStyles);
            headers.forEach(headerText => {
                const td = document.createElement('td');
                td.textContent = rowData[headerText] || ''; // Füge Wert basierend auf Header hinzu
                td.style.border = '1px solid #ddd';
                td.style.padding = '8px';
                Object.assign(td.style, defaultCellStyle);
                if (columnStyles[headerText]) {
                    Object.assign(td.style, columnStyles[headerText]);
                }
                row.appendChild(td);
            });
            table.appendChild(row);
        });
    }

    return table;
}

// World.getInstance().events.subscribe('midnight', () => {
//     const imbissSoftware = ImbissSoftware.getInstance();
//     const stats = imbissSoftware.getStatistics('24h');
//     const revenuePerProduct = imbissSoftware.getRevenuePerProduct('24h');
//     const profit = imbissSoftware.calculateProfit('24h');
//     const currentStock = imbissSoftware.getCurrentStock();
//     const popularProducts = imbissSoftware.getMostPopularProducts('24h');

//     game.scene.stop();
//     document.getElementById('game-container').style.display = 'none';
//     document.getElementById('html-content').style.display = 'block';

//     const container = document.getElementById('html-content');
//     container.innerHTML = ''; // Reset content

//     // Tageszusammenfassung hinzufügen
//     const header = document.createElement('h1');
//     header.textContent = 'Tageszusammenfassung';
//     container.appendChild(header);

//     // Tagesgewinn
//     const dailyProfit = document.createElement('p');
//     dailyProfit.textContent = `Tagesgewinn: ${profit.toFixed(2)} €`;
//     container.appendChild(dailyProfit);

//     // Tagesumsatz
//     const dailyRevenue = document.createElement('p');
//     dailyRevenue.textContent = `Tagesumsatz: ${stats.salesStats.totalRevenue.toFixed(2)} €`;
//     container.appendChild(dailyRevenue);

//     // Durchschnittlicher Umsatz pro Stunde
//     const avgRevenuePerHour = stats.salesStats.totalRevenue / 24;
//     const hourlyRevenue = document.createElement('p');
//     hourlyRevenue.textContent = `Durchschnittlicher Umsatz pro Stunde: ${avgRevenuePerHour.toFixed(2)} €`;
//     container.appendChild(hourlyRevenue);

//     // Durchschnittlicher Umsatz pro Kunde
//     const avgRevenuePerCustomer = stats.salesStats.totalRevenue / stats.salesStats.totalItemsSold;
//     const customerRevenue = document.createElement('p');
//     customerRevenue.textContent = `Durchschnittlicher Umsatz pro Kunde: ${avgRevenuePerCustomer.toFixed(2)} €`;
//     container.appendChild(customerRevenue);

//     // Verhältnis von Verkäufen zu Einkäufen
//     const salesToPurchasesRatio = (stats.salesStats.totalRevenue / stats.purchaseStats.totalCost).toFixed(2);
//     const salesPurchases = document.createElement('p');
//     let ratioMessage = `Verhältnis von Verkäufen zu Einkäufen: ${salesToPurchasesRatio} `;

//     if (salesToPurchasesRatio > 1.5) {
//         ratioMessage += '🟢 Sehr gut';
//         salesPurchases.style.color = 'green';
//     } else if (salesToPurchasesRatio >= 1.0) {
//         ratioMessage += '🟡 Akzeptabel';
//         salesPurchases.style.color = 'orange';
//     } else {
//         ratioMessage += '🔴 Kritisch';
//         salesPurchases.style.color = 'red';
//     }

//     salesPurchases.textContent = ratioMessage;
//     container.appendChild(salesPurchases);

//     // Beliebteste Produkte (Tabelle)
//     const popularProductsHeadline = document.createElement('h2');
//     popularProductsHeadline.textContent = 'Beliebteste Produkte';
//     container.appendChild(popularProductsHeadline);

//     const popularHeaders = ['Produkt', 'Verkäufe'];
//     const popularData = popularProducts.map(({ itemName, quantity }) => ({
//         'Produkt': `${currentStock.find(item => item.name === itemName)?.emoji || ''} ${itemName}`,
//         'Verkäufe': quantity,
//     }));
//     container.appendChild(createTable(popularHeaders, popularData, {
//         emptyMessage: 'Keine Verkäufe',
//     }));

//     // Umsatz pro Produkt (Tabelle)
//     const productRevenueHeadline = document.createElement('h2');
//     productRevenueHeadline.textContent = 'Umsatz pro Produkt';
//     container.appendChild(productRevenueHeadline);

//     const revenueHeaders = ['Produkt', 'Umsatz (€)'];
//     const revenueData = Object.entries(revenuePerProduct).map(([product, revenue]) => ({
//         'Produkt': product,
//         'Umsatz (€)': revenue.toFixed(2),
//     }));
//     container.appendChild(createTable(revenueHeaders, revenueData));

//     // Bestand aller Produkte (Tabelle)
//     const stockHeadline = document.createElement('h2');
//     stockHeadline.textContent = 'Bestand aller Produkte';
//     container.appendChild(stockHeadline);

//     const stockHeaders = ['Produkt', 'Bestand', 'Verkaufspreis (€)'];
//     const stockData = currentStock.map(product => ({
//         'Produkt': `${product.emoji} ${product.name}`,
//         'Bestand': product.stock,
//         'Verkaufspreis (€)': product.sellPrice.toFixed(2),
//     }));
//     container.appendChild(createTable(stockHeaders, stockData, {
//         rowStyles: { backgroundColor: '#f8d7da' }, // Zeilenstil für niedrige Bestände
//     }));

//     // Button: Nächsten Tag starten
//     const nextDayButton = document.createElement('button');
//     nextDayButton.textContent = 'Nächsten Tag starten';
//     nextDayButton.style.marginTop = '20px';
//     nextDayButton.style.padding = '10px 20px';
//     nextDayButton.style.fontSize = '16px';
//     nextDayButton.addEventListener('click', () => {
//         World.getInstance().events.emit('load_purchase_scene'); 
//     });

//     container.appendChild(nextDayButton);
// });
