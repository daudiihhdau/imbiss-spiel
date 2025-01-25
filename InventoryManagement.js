import { Product } from './Product.js';

export class InventoryManagement {
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
