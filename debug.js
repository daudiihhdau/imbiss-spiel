import { ImbissSoftware } from './inventory_management.js'; // Importiere Warenwirtschaft

export function setupDebug(scene) {
    const debugBackground = scene.add.rectangle(
        scene.scale.width / 2, scene.scale.height / 2,
        800, 700, // Größeres Fenster für zusätzliche Informationen
        0x000000,
        0.8
    ).setOrigin(0.5).setVisible(false);

    const debugText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2, '', {
        fontSize: '16px',
        fill: '#fff',
        align: 'left',
        wordWrap: { width: 780 } // Breitere Textwrap-Grenze
    }).setOrigin(0.5).setVisible(false);

    let debugVisible = false;

    const inventory = ImbissSoftware.getInstance(); // Singleton-Instanz der Warenwirtschaft

    scene.input.keyboard.on('keydown-SPACE', () => {
        debugVisible = !debugVisible;
        debugBackground.setVisible(debugVisible);
        debugText.setVisible(debugVisible);

        if (debugVisible) {
            updateDebugText();

            const padding = 20;
            debugBackground.setSize(debugText.width + padding, debugText.height + padding); // Hintergrund mit Rand
        }
    });

    function updateDebugText() {
        const items = inventory.getCurrentStock(); // Bestandsdaten aus der Warenwirtschaft abrufen
        const stats = inventory.getStatistics(); // Verkaufs- und Einkaufsstatistiken abrufen
        const profit = inventory.calculateProfit(); // Gewinn berechnen
        const priceLog = inventory.getPriceLogAnalysis(); // Preisänderungslog abrufen

        // Beliebteste Produkte basierend auf Verkaufsdaten
        const salesLog = inventory.logging.filter((entry) => entry.type === 'sale');
        const productSales = {};

        salesLog.forEach((sale) => {
            sale.items.forEach(({ itemName, quantity }) => {
                if (!productSales[itemName]) {
                    productSales[itemName] = 0;
                }
                productSales[itemName] += quantity;
            });
        });

        const sortedProducts = Object.entries(productSales)
            .sort(([, qtyA], [, qtyB]) => qtyB - qtyA) // Nach Verkaufsanzahl sortieren
            .map(([name, qty]) => `${name}: ${qty} verkauft`);

        const itemLines = items.map(
            (item) => `${item.emoji}: Lager: ${item.stock}, Preis: ${item.sellPrice.toFixed(2)} €, ` +
                      `Status: ${item.needsRestock ? 'Nachbestellung nötig' : 'OK'}`
        );

        const statsLines = [
            '',
            '--- Statistiken der letzten 24 Stunden ---',
            `Verkäufe: ${stats.salesStats.totalItemsSold} Artikel, Umsatz: ${stats.salesStats.totalRevenue.toFixed(2)} €`,
            `Einkäufe: ${stats.purchaseStats.totalItemsBought} Artikel, Kosten: ${stats.purchaseStats.totalCost.toFixed(2)} €`,
            `Gewinn: ${profit.toFixed(2)} €`
        ];

        const priceLogLines = [
            '',
            '--- Preisänderungen ---',
            ...priceLog.map((log) => `${log.itemName}: Neuer Preis: ${log.price.toFixed(2)} € (am ${new Date(log.date).toLocaleString()})`)
        ];

        const summaryLines = [
            '',
            '--- Übersicht ---',
            `Anzahl der Produkte: ${items.length}`,
            `Produkte mit geringem Bestand: ${items.filter(item => item.needsRestock).length}`,
            `Gesamtumsatz aller Zeiten: ${inventory.logging.filter(entry => entry.type === 'sale').reduce((acc, sale) => acc + sale.totalRevenue, 0).toFixed(2)} €`
        ];

        const popularProductsLines = [
            '',
            '--- Beliebteste Produkte ---',
            ...sortedProducts
        ];

        debugText.setText([...itemLines, ...statsLines, ...priceLogLines, ...summaryLines, ...popularProductsLines].join('\n'));
    }

    // Aktualisiere Debug-Text, wenn etwas geändert wird
    scene.events.on('update-debug', updateDebugText);
}
