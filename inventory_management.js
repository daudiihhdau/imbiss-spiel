import { Product } from './product.js';

class InventoryManagement {
  constructor() {
    this.products = []; // Array zur Speicherung von Produkten
    this.stock = new Map(); // Map zur Verwaltung der Bestände
  }

  // Produkt hinzufügen
  addProduct(product, quantity = 0) {
    if (!(product instanceof Product)) {
      throw new Error('Das Objekt muss eine Instanz der Product-Klasse sein.');
    }
    this.products.push(product);
    this.stock.set(product.id, quantity);
  }

  // Produkt entfernen
  removeProduct(productId) {
    this.products = this.products.filter(product => product.id !== productId);
    this.stock.delete(productId);
  }

  updateStock(productId, increment) {
    if (!this.stock.has(productId)) {
      throw new Error('Produkt nicht gefunden.');
    }
    if (quantity < 0) {
      throw new Error('Bestand kann nicht negativ sein.');
    }
    this.stock.set(productId, getStock(productId) + increment);
  }

  getStock(productId) {
    if (!this.stock.has(productId)) {
      throw new Error('Produkt nicht gefunden.');
    }
    return this.stock.get(productId);
  }

  // Produkte basierend auf einer Kategorie abrufen
  getProductsByCategory(categoryId) {
    return this.products.filter(product => 
      product.categoryId === categoryId && this.getStock(product.id) > 0
    );
  }

  // Alle Produkte auflisten
  listAllProducts() {
    return this.products.map(product => ({
      ...product,
      stock: this.getStock(product.id)
    }));
  }

  // Produkte basierend auf einem Ablaufdatum filtern
  getExpiredProducts(currentDate) {
    return this.products.filter(product => 
      new Date(product.expiryDate) < new Date(currentDate) && this.getStock(product.id) > 0
    );
  }
}

// // Beispielverwendung
// const inventory = new InventoryManagement();

// const product1 = new Product('Apfel', 1, [101, 102], '🍎', 'hoch', 'süß', 'kg', '2025-01-30', 'ChargeA');
// const product2 = new Product('Banane', 1, [103], '🍌', 'mittel', 'süß', 'kg', '2025-01-25', 'ChargeB');

// inventory.addProduct(product1, 50);
// inventory.addProduct(product2, 100);

// console.log('Alle Produkte:', inventory.listAllProducts());
// console.log('Abgelaufene Produkte:', inventory.getExpiredProducts('2025-01-26'));

// // Produkt aktualisieren
// inventory.updateProduct(product1.id, { quality: 'sehr hoch' });
// console.log('Produkt nach Aktualisierung:', inventory.getProductById(product1.id));

// // Bestand aktualisieren
// inventory.updateStock(product1.id, 75);
// console.log('Aktueller Bestand von Apfel:', inventory.getStock(product1.id));
