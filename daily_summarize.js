import { ImbissSoftware } from './inventory_management.js';
import { World } from './world.js';
import { game } from './game.js';

World.getInstance().events.subscribe('midnight', () => {
    const imbissSoftware = ImbissSoftware.getInstance();
    const stats = imbissSoftware.getStatistics();
    const revenuePerProduct = imbissSoftware.getRevenuePerProduct();
    const profit = imbissSoftware.calculateProfit();
    const currentStock = imbissSoftware.getCurrentStock();
    const popularProducts = imbissSoftware.getMostPopularProducts();

    const container = document.getElementById('html-content');
    container.innerHTML = ''; // Reset content

    // Tageszusammenfassung hinzufügen
    const header = document.createElement('h1');
    header.textContent = 'Tageszusammenfassung';
    container.appendChild(header);

    // Tagesgewinn (Ganz nach oben)
    const dailyProfit = document.createElement('p');
    dailyProfit.textContent = `Tagesgewinn: ${profit.toFixed(2)} €`;
    container.appendChild(dailyProfit);

    // Tagesumsatz
    const dailyRevenue = document.createElement('p');
    dailyRevenue.textContent = `Tagesumsatz: ${stats.salesStats.totalRevenue.toFixed(2)} €`;
    container.appendChild(dailyRevenue);

    // Durchschnittlicher Umsatz pro Stunde
    const avgRevenuePerHour = stats.salesStats.totalRevenue / 24;
    const hourlyRevenue = document.createElement('p');
    hourlyRevenue.textContent = `Durchschnittlicher Umsatz pro Stunde: ${avgRevenuePerHour.toFixed(2)} €`;
    container.appendChild(hourlyRevenue);

    // Durchschnittlicher Umsatz pro Kunde
    const avgRevenuePerCustomer = stats.salesStats.totalRevenue / stats.salesStats.totalItemsSold;
    const customerRevenue = document.createElement('p');
    customerRevenue.textContent = `Durchschnittlicher Umsatz pro Kunde: ${avgRevenuePerCustomer.toFixed(2)} €`;
    container.appendChild(customerRevenue);

    // Verhältnis von Verkäufen zu Einkäufen
    const salesToPurchasesRatio = (stats.salesStats.totalRevenue / stats.purchaseStats.totalCost).toFixed(2);
    const salesPurchases = document.createElement('p');
    let ratioMessage = `Verhältnis von Verkäufen zu Einkäufen: ${salesToPurchasesRatio} `;

    if (salesToPurchasesRatio > 1.5) {
        ratioMessage += '🟢 Sehr gut';
        salesPurchases.style.color = 'green';
    } else if (salesToPurchasesRatio >= 1.0) {
        ratioMessage += '🟡 Akzeptabel';
        salesPurchases.style.color = 'orange';
    } else {
        ratioMessage += '🔴 Kritisch';
        salesPurchases.style.color = 'red';
    }

    salesPurchases.textContent = ratioMessage;
    container.appendChild(salesPurchases);

    // Umsatz pro Produkt (Tabelle, sortiert nach Umsatz)
    const productRevenueHeader = document.createElement('h2');
    productRevenueHeader.textContent = 'Umsatz pro Produkt';
    container.appendChild(productRevenueHeader);

    const productRevenueTable = document.createElement('table');
    productRevenueTable.style.width = '100%';
    productRevenueTable.style.borderCollapse = 'collapse';
    productRevenueTable.style.marginBottom = '20px';

    const productRevenueHeaderRow = productRevenueTable.insertRow();
    ['Produkt', 'Umsatz (€)'].forEach((text) => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f4f4f4';
        productRevenueHeaderRow.appendChild(th);
    });

    Object.entries(revenuePerProduct)
        .sort(([, aRevenue], [, bRevenue]) => bRevenue - aRevenue) // Sortiere nach Umsatz absteigend
        .forEach(([product, revenue]) => {
            const row = productRevenueTable.insertRow();
            const emoji = currentStock.find(item => item.name === product)?.emoji || '';
            [`${emoji} ${product}`, revenue.toFixed(2)].forEach((value) => {
                const td = document.createElement('td');
                td.textContent = value;
                td.style.border = '1px solid #ddd';
                td.style.padding = '8px';
                row.appendChild(td);
            });
        });

    container.appendChild(productRevenueTable);

    // Bestand aller Produkte (Tabelle, sortiert nach Bestand)
    const stockHeader = document.createElement('h2');
    stockHeader.textContent = 'Bestand aller Produkte';
    container.appendChild(stockHeader);

    const stockTable = document.createElement('table');
    stockTable.style.width = '100%';
    stockTable.style.borderCollapse = 'collapse';
    stockTable.style.marginBottom = '20px';

    const stockHeaderRow = stockTable.insertRow();
    ['Produkt', 'Bestand', 'Verkaufspreis (€)'].forEach((text) => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f4f4f4';
        stockHeaderRow.appendChild(th);
    });

    currentStock
        .sort((a, b) => b.stock - a.stock) // Sortiere nach Bestand absteigend
        .forEach((product) => {
            const row = stockTable.insertRow();
            [
                `${product.emoji} ${product.name}`,
                product.stock,
                product.sellPrice.toFixed(2)
            ].forEach((value, index) => {
                const td = document.createElement('td');
                td.textContent = value;
                td.style.border = '1px solid #ddd';
                td.style.padding = '8px';
                row.appendChild(td);
            });

            // Markiere Zeile rot, wenn der Bestand gering ist
            if (product.needsRestock) {
                row.style.backgroundColor = '#f8d7da'; // Helles Rot für Warnung
            }
        });

    container.appendChild(stockTable);

    // Beliebteste Produkte (Tabelle)
    const popularProductsHeader = document.createElement('h2');
    popularProductsHeader.textContent = 'Beliebteste Produkte';
    container.appendChild(popularProductsHeader);

    const popularProductsTable = document.createElement('table');
    popularProductsTable.style.width = '100%';
    popularProductsTable.style.borderCollapse = 'collapse';
    popularProductsTable.style.marginBottom = '20px';

    const popularProductsHeaderRow = popularProductsTable.insertRow();
    ['Produkt', 'Verkäufe'].forEach((text) => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f4f4f4';
        popularProductsHeaderRow.appendChild(th);
    });

    popularProducts.forEach(({ itemName, quantity }) => {
        const product = currentStock.find(item => item.name === itemName);
        const row = popularProductsTable.insertRow();
        [
            `${product?.emoji || ''} ${itemName}`,
            quantity
        ].forEach((value) => {
            const td = document.createElement('td');
            td.textContent = value;
            td.style.border = '1px solid #ddd';
            td.style.padding = '8px';
            row.appendChild(td);
        });
    });

    // Füge Standardtext hinzu, wenn keine Verkäufe existieren
    if (popularProducts.length === 0) {
        const row = popularProductsTable.insertRow();
        const td = document.createElement('td');
        td.textContent = 'Keine Verkäufe';
        td.colSpan = 2;
        td.style.textAlign = 'center';
        td.style.border = '1px solid #ddd';
        td.style.padding = '8px';
        row.appendChild(td);
    }

    container.appendChild(popularProductsTable);

    // Button: Nächsten Tag starten
    const nextDayButton = document.createElement('button');
    nextDayButton.textContent = 'Nächsten Tag starten';
    nextDayButton.style.marginTop = '20px';
    nextDayButton.style.padding = '10px 20px';
    nextDayButton.style.fontSize = '16px';
    nextDayButton.addEventListener('click', () => {
        game.scene.start('PurchaseScene');
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('html-content').style.display = 'none';
    });

    container.appendChild(nextDayButton);

    // Weitere Tabellen und Analysen können hier ergänzt werden...
});
