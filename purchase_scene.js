import { World } from './World.js';
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
            <h2>Großhandel Shop</h2>
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
                <p><strong>Vermögen:</strong> <span id="wealth">0</span> €</p>
                <p id="error-message" style="color: red; display: none;">Du hast nicht genug Geld für Deinen Warenkorb</p>
                <button id="checkout-button" class="btn-green">Einkaufen</button>
            </div>
        `;

        document.getElementById('html-content').innerHTML = appHTML;

        const productTableBody = document.querySelector('#product-table tbody');
        const cartList = document.getElementById('cart-list');
        const totalPriceSpan = document.getElementById('total-price');
        const checkoutButton = document.getElementById('checkout-button');
        const wealthSpan = document.getElementById('wealth');
        const errorMessage = document.getElementById('error-message');

        wealthSpan.textContent = World.getInstance().getWealth();

        // Produkte anzeigen
        function renderProducts() {
            const inventory = wholesale.pos.listInventory();
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
                    <td><input type="number" class="table-input" min="1" max="${product.stock}" value="1" id="quantity-${product.id}"></td>
                    <td><button class="btn-blue" onclick="window.addToCart('${product.id}')">+</button></td>
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
                wholesale.pos.addToCart(productId, quantity, {});
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
                errorMessage.style.display = 'none';
                return;
            }

            cart.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `${item.name} (x${item.quantity}) - ${item.totalPrice.toFixed(2)} € 
                    <button class="btn-blue" onclick="window.removeFromCart('${item.id}')">-1</button>`;
                cartList.appendChild(li);
            });

            const total = wholesale.pos.calculateTotal();
            const wealth = World.getInstance().getWealth();
            totalPriceSpan.textContent = total;

            if (total > wealth) {
                errorMessage.style.display = 'block';
                checkoutButton.disabled = true;
            } else {
                errorMessage.style.display = 'none';
                checkoutButton.disabled = false;
            }
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
                const { invoice, items } = wholesale.pos.checkout('Wholesale Supplier', 'Kunde ABC', 'Retail');
                console.log('Rechnung erstellt!', invoice, items);

                // save products in foodStall
                items.forEach(itemOn => {
                    World.getInstance().getFoodStall().getPos().addProductToInventory(itemOn.product, itemOn.quantity, itemOn.purchasePrice)
                })

                renderCart();

                World.getInstance().events.emit('load_pricelist_scene');
            } catch (error) {
                alert(`Fehler beim Erstellen der Rechnung: ${error.message}`);
            }
        });

        // Initiale Anzeige
        renderProducts();
    }

    renderApp();
});
