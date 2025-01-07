import { ImbissSoftware } from './inventory_management.js';

export class DailySummaryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DailySummaryScene' });
        this.imbissSoftware = ImbissSoftware.getInstance();
    }

    create() {
        // Entferne alle vorherigen Inputs
        const canvasContainer = document.createElement('div');
        canvasContainer.id = 'canvas-container';
        canvasContainer.style.position = 'absolute';
        canvasContainer.style.top = '0';
        canvasContainer.style.left = '0';
        canvasContainer.style.width = '100%';
        canvasContainer.style.height = '100%';
        document.body.appendChild(canvasContainer);

        this.add.text(20, 20, 'Tageszusammenfassung', {
            fontSize: '32px',
            fill: '#000'
        });

        const stats = this.imbissSoftware.getStatistics();
        const revenuePerProduct = this.imbissSoftware.getRevenuePerProduct();
        const priceChanges = this.imbissSoftware.getPriceLogAnalysis();
        const profit = this.imbissSoftware.calculateProfit();

        // Anzeige von Statistiken mit Diagrammen und Tabellen
        this.createRevenueChart(revenuePerProduct);
        this.createPurchaseVsSalesChart(stats);
        this.createPriceLogTable(priceChanges);

        this.add.text(20, this.scale.height - 50, `Nettogewinn: ${profit.toFixed(2)} €`, {
            fontSize: '24px',
            fill: '#000'
        });

        this.add.text(20, this.scale.height - 90, 'Zurück', {
            fontSize: '24px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.cleanupScene();
            this.scene.stop('DailySummaryScene');
            this.scene.start('MainScene');
        });

        this.events.once('shutdown', () => {
            this.cleanupScene();
        });
    }

    createRevenueChart(revenuePerProduct) {
        const ctx = document.createElement('canvas');
        ctx.id = 'revenue-chart';
        ctx.style.position = 'absolute';
        ctx.style.top = '100px';
        ctx.style.left = '50px';
        ctx.style.width = '400px';
        ctx.style.height = '400px';
        document.getElementById('canvas-container').appendChild(ctx);

        new Chart(ctx, {
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

    createPurchaseVsSalesChart(stats) {
        const ctx = document.createElement('canvas');
        ctx.id = 'sales-vs-purchase-chart';
        ctx.style.position = 'absolute';
        ctx.style.top = '100px';
        ctx.style.right = '50px';
        ctx.style.width = '400px';
        ctx.style.height = '400px';
        document.getElementById('canvas-container').appendChild(ctx);

        new Chart(ctx, {
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

    createPriceLogTable(priceChanges) {
        const table = document.createElement('table');
        table.style.position = 'absolute';
        table.style.bottom = '100px';
        table.style.left = '50px';
        table.style.width = '80%';
        table.style.borderCollapse = 'collapse';
        table.style.backgroundColor = '#fff';

        const header = table.createTHead();
        const headerRow = header.insertRow();
        ['Produkt', 'Neuer Preis (€)', 'Datum'].forEach((text) => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.border = '1px solid #ddd';
            th.style.padding = '8px';
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

        document.getElementById('canvas-container').appendChild(table);
    }

    cleanupScene() {
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
            canvasContainer.remove();
        }
    }
}
