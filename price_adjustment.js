import { World } from './World.js';

World.getInstance().events.subscribe('load_pricelist_scene', () => {
    World.getInstance().events.emit('stop_game');    World.getInstance().events.emit('stop_game');

    function renderApp() {
        document.getElementById('html-content').innerHTML = ''; // Reset content

        const appHTML = `
            <h2>Verkaufspreise anpassen</h2>
            <table id="product-table" class="table">
                <thead>
                    <tr>
                        <th>Emoji</th>
                        <th>Name</th>
                        <th>Besonderheit</th>
                        <th>Haltbarkeit</th>
                        <th>Qualität</th>
                        <th>Geschmack</th>
                        <th>Bestand</th>
                        <th>Aktueller Preis (€)</th>
                        <th>Neuer Preis (€)</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Produkte werden hier dynamisch hinzugefügt -->
                </tbody>
            </table>

            <button id="set-prices-button" class="btn-green">Preise setzen</button>
            <button id="back-button" class="btn-blue">Zurück</button>
        `;

        document.getElementById('html-content').innerHTML = appHTML;

        const productTableBody = document.querySelector('#product-table tbody');
        const setPricesButton = document.getElementById('set-prices-button');
        const backButton = document.getElementById('back-button');
        const inputs = {}; // Eingabe-Elemente sammeln

        // Produkte anzeigen
        function renderProducts() {
            const inventory = World.getInstance().getFoodStall().getPos().listInventory();
            productTableBody.innerHTML = '';
            inventory.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.emoji}</td>
                    <td>${product.name}</td>
                    <td>${product.attributeIds.join(',')}</td>
                    <td>${product.expiryDate}</td>
                    <td>${product.quality}</td>
                    <td>${product.taste}</td>
                    <td>${product.stock}</td>
                    <td>${product.purchasePrice} €</td>
                    <td><input type="number" class="price-input" min="0.01" step="0.01" value="${product.purchasePrice}" id="price-${product.id}"></td>
                `;
                productTableBody.appendChild(row);
                inputs[product.id] = document.getElementById(`price-${product.id}`);
            });
        }

        // Preise anwenden
        function applyPrices() {
            Object.keys(inputs).forEach(productId => {
                const inputElement = inputs[productId];
                const newPrice = parseFloat(inputElement.value);

                if (!isNaN(newPrice) && newPrice > 0) {
                    console.log(`Preis für Produkt ${productId} auf ${newPrice.toFixed(2)} € gesetzt.`);
                    World.getInstance().getFoodStall().getPos().updateSellPrice(productId, newPrice);
                    inputElement.style.borderColor = '';
                } else {
                    console.warn(`Ungültiger Preis für Produkt ${productId} ignoriert.`);
                    inputElement.style.borderColor = 'red';
                }
            });

            // Erfolgsmeldung anzeigen
            const successMessage = document.createElement('p');
            successMessage.textContent = 'Preise erfolgreich aktualisiert!';
            successMessage.style.color = 'green';
            document.getElementById('html-content').appendChild(successMessage);
            setTimeout(() => successMessage.remove(), 3000);
        }

        // Event-Listener für Buttons
        setPricesButton.addEventListener('click', () => {
            applyPrices();
            World.getInstance().events.emit('start_game')
        });

        // backButton.addEventListener('click', () => {
        //     game.scene.start('MainScene');
        //     document.getElementById('game-container').style.display = 'block';
        //     document.getElementById('html-content').style.display = 'none';
        // });

        // Initiale Anzeige
        renderProducts();
    }

    renderApp();
});
