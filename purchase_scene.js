import { World } from './world.js';
import { game } from './game.js';
import { Wholesale } from './Wholesale.js';

World.getInstance().events.subscribe('load_purchase_scene', () => {
    game.scene.stop();
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('html-content').style.display = 'block';

    const wholesale = new Wholesale();

    function renderApp() {
        document.getElementById('html-content').innerHTML = ''; // Reset content

        const appHTML = `
            <h1>Großhandel Shop</h1>

            <h2>Produkte</h2>
            <table id="product-table">
                <thead>
                    <tr>
                        <th>Emoji</th>
                        <th>Name</th>
                        <th>Qualität</th>
                        <th>Geschmack</th>
                        <th>Bestand</th>
                        <th>Preis (€)</th>
                        <th>Menge</th>
                        <th>Aktion</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Produkte werden hier dynamisch hinzugefügt -->
                </tbody>
            </table>

            <h2>Warenkorb</h2>
            <div class="cart">
                <ul id="cart-list">
                    <li>Warenkorb ist leer.</li>
                </ul>
                <p><strong>Gesamtsumme:</strong> <span id="total-price">0</span> €</p>
                <button id="checkout-button">Rechnung erstellen</button>
            </div>
        `;

        document.getElementById('html-content').innerHTML = appHTML;

        const productTableBody = document.querySelector('#product-table tbody');
        const cartList = document.getElementById('cart-list');
        const totalPriceSpan = document.getElementById('total-price');
        const checkoutButton = document.getElementById('checkout-button');

        // Produkte anzeigen
        function renderProducts() {
            const inventory = wholesale.pos.listInventory();
            productTableBody.innerHTML = '';
            inventory.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.emoji}</td>
                    <td>${product.name}</td>
                    <td>${product.quality}</td>
                    <td>${product.taste}</td>
                    <td>${product.stock}</td>
                    <td>${product.purchasePrice} €</td>
                    <td><input type="number" min="1" max="${product.stock}" value="1" id="quantity-${product.id}"></td>
                    <td><button onclick="window.addToCart('${product.id}')">Hinzufügen</button></td>
                `;
                productTableBody.appendChild(row);
            });
        }

        // Produkt in den Warenkorb legen
        window.addToCart = function (productId) {
            const quantityInput = document.getElementById(`quantity-${productId}`);
            const quantity = parseInt(quantityInput.value);
            if (isNaN(quantity) || quantity <= 0) {
                alert('Bitte eine gültige Menge eingeben!');
                return;
            }

            try {
                wholesale.pos.addToCart(productId, quantity, { });
                resetQuantities();
                renderCart();
            } catch (error) {
                alert(`Fehler beim Hinzufügen zum Warenkorb: ${error.message}`);
            }
        };

        // Produkt aus dem Warenkorb entfernen
        window.removeFromCart = function (productId) {
            try {
                wholesale.pos.removeFromCart(productId, 1);
                resetQuantities();
                renderCart();
            } catch (error) {
                alert(`Fehler beim Entfernen aus dem Warenkorb: ${error.message}`);
            }
        };

        // Warenkorb anzeigen
        function renderCart() {
            const cart = wholesale.pos.listCart();
            cartList.innerHTML = '';

            if (cart.length === 0) {
                cartList.innerHTML = '<li>Warenkorb ist leer.</li>';
                totalPriceSpan.textContent = '0';
                return;
            }

            cart.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `${item.name} (x${item.quantity}) - ${item.totalPrice.toFixed(2)} € 
                    <button onclick="window.removeFromCart('${item.id}')">-1</button>`;
                cartList.appendChild(li);
            });

            const total = wholesale.pos.calculateTotal();
            totalPriceSpan.textContent = total;
        }

        // Input-Felder auf 1 zurücksetzen
        function resetQuantities() {
            const inputs = document.querySelectorAll("#product-table input[type='number']");
            inputs.forEach(input => input.value = 1);
        }

        // Rechnung erstellen
        checkoutButton.addEventListener('click', () => {
            if (wholesale.pos.listCart().length === 0) {
                alert('Warenkorb ist leer!');
                return;
            }

            try {
                const invoice = wholesale.pos.checkout('Wholesale Supplier', 'Kunde ABC', 'Retail');
                alert('Rechnung erstellt! Details wurden in der Konsole ausgegeben.');
                console.log(invoice);
                renderCart();
            } catch (error) {
                alert(`Fehler beim Erstellen der Rechnung: ${error.message}`);
            }
        });

        // Initiale Anzeige
        renderProducts();
    }

    renderApp();
});
