import { ImbissSoftware } from './inventory_management.js';
import { World } from './world.js';

World.getInstance().events.subscribe('midnight', () => {
        const imbissSoftware = ImbissSoftware.getInstance();
        const stats = imbissSoftware.getStatistics();
        const revenuePerProduct = imbissSoftware.getRevenuePerProduct();
        const priceChanges = imbissSoftware.getPriceLogAnalysis();
        const profit = imbissSoftware.calculateProfit();
        const currentStock = imbissSoftware.getCurrentStock();

        const container = document.getElementById('html-content');

        // Tageszusammenfassung hinzufügen
        const header = document.createElement('h1');
        header.textContent = 'Tageszusammenfassung';
        container.appendChild(header);

        // Statistiken der letzten 24 Stunden
        const statsHeader = document.createElement('h2');
        statsHeader.textContent = 'Statistiken der letzten 24 Stunden';
        container.appendChild(statsHeader);

        const statsElement = document.createElement('p');
        statsElement.innerHTML = `
            Verkäufe: ${stats.salesStats.totalRevenue.toFixed(2)} €<br>
            Einkäufe: ${stats.purchaseStats.totalCost.toFixed(2)} €<br>
            Nettogewinn: ${profit.toFixed(2)} €
        `;
        statsElement.style.fontSize = '18px';
        container.appendChild(statsElement);

        // Übersicht
        const overviewHeader = document.createElement('h2');
        overviewHeader.textContent = 'Übersicht';
        container.appendChild(overviewHeader);

        const totalProducts = currentStock.length;
        const lowStockProducts = currentStock.filter(product => product.needsRestock);
        const mostPopularProduct = Object.keys(revenuePerProduct).reduce((a, b) => 
            revenuePerProduct[a] > revenuePerProduct[b] ? a : b, ''
        );

        const overviewElement = document.createElement('p');
        overviewElement.innerHTML = `
            Anzahl der Produkte: ${totalProducts}<br>
            Produkte mit geringem Bestand: ${lowStockProducts.length}<br>
            Beliebtestes Produkt: ${mostPopularProduct}
        `;
        overviewElement.style.fontSize = '18px';
        container.appendChild(overviewElement);

        // Einnahmen pro Produkt anzeigen (Diagramm)
        createRevenueChart(revenuePerProduct);

        // Verkäufe vs Einkäufe anzeigen (Diagramm)
        createPurchaseVsSalesChart(stats);

        // Preisanpassungen anzeigen (Tabelle)
        createPriceLogTable(priceChanges);

        // Produktübersicht (Diagramm: Produkte mit geringem Bestand)
        createLowStockChart(lowStockProducts);
    });

    function createRevenueChart(revenuePerProduct) {
        const chartContainer = document.createElement('div');
        chartContainer.style.width = '100%';
        chartContainer.style.height = '400px';
        chartContainer.style.marginBottom = '20px';
        document.getElementById('html-content').appendChild(chartContainer);

        const canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: Object.keys(revenuePerProduct),
                datasets: [{
                    label: 'Einnahmen pro Produkt (€)',
                    data: Object.values(revenuePerProduct),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function createPurchaseVsSalesChart(stats) {
        const chartContainer = document.createElement('div');
        chartContainer.style.width = '100%';
        chartContainer.style.height = '400px';
        chartContainer.style.marginBottom = '20px';
        document.getElementById('html-content').appendChild(chartContainer);

        const canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);

        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: ['Verkäufe (€)', 'Einkäufe (€)'],
                datasets: [{
                    data: [
                        stats.salesStats.totalRevenue,
                        stats.purchaseStats.totalCost
                    ],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function createPriceLogTable(priceChanges) {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.backgroundColor = '#fff';
        table.style.marginTop = '20px';

        const header = table.createTHead();
        const headerRow = header.insertRow();
        ['Produkt', 'Neuer Preis (€)', 'Datum'].forEach((text) => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.border = '1px solid #ddd';
            th.style.padding = '8px';
            th.style.backgroundColor = '#f4f4f4';
            headerRow.appendChild(th);
        });

        const body = table.createTBody();
        priceChanges.forEach((change) => {
            const row = body.insertRow();
            [change.itemName, change.price.toFixed(2), change.date].forEach((value) => {
                const td = row.insertCell();
                td.textContent = value;
                td.style.border = '1px solid #ddd';
                td.style.padding = '8px';
            });
        });

        document.getElementById('html-content').appendChild(table);
    }

    function createLowStockChart(lowStockProducts) {
        const chartContainer = document.createElement('div');
        chartContainer.style.width = '100%';
        chartContainer.style.height = '400px';
        chartContainer.style.marginBottom = '20px';
        document.getElementById('html-content').appendChild(chartContainer);

        const canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);

        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: lowStockProducts.map(product => product.name),
                datasets: [{
                    label: 'Produkte mit geringem Bestand',
                    data: lowStockProducts.map(product => product.stock),
                    backgroundColor: lowStockProducts.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }