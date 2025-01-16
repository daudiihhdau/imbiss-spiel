import { InvoiceGenerator } from './invoice_generator.js';

class POS {
  constructor() {
    this.productList = [];
    this.cart = [];
  }

  // Add a product
  addProduct(product) {
    this.productList.push(product);
    console.log(`Product '${product.name}' added.`);
  }

  // Add product to cart
  addToCart(id, quantity = 1) {
    const product = this.productList.find((p) => p.id === id);
    if (product) {
      const existing = this.cart.find((item) => item.product.id === id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.cart.push({ product, quantity });
      }
      console.log(`Product '${product.name}' (${quantity} units) added to cart.`);
    } else {
      console.error("Product not found.");
    }
  }

  // Remove product from cart
  removeFromCart(id, quantity = 1) {
    const itemIndex = this.cart.findIndex((item) => item.product.id === id);
    if (itemIndex > -1) {
      const item = this.cart[itemIndex];
      if (item.quantity > quantity) {
        item.quantity -= quantity;
        console.log(`Product '${item.product.name}' (${quantity} units) removed from cart.`);
      } else {
        this.cart.splice(itemIndex, 1);
        console.log(`Product '${item.product.name}' completely removed from cart.`);
      }
    } else {
      console.error("Product not found in cart.");
    }
  }

  // Calculate total
  calculateTotal() {
    const total = this.cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
    return total.toFixed(2);
  }

  generateInvoice() {
    return InvoiceGenerator.generateInvoice(this.cart, "FoodStall", "Client", "FoodStallSale");
  }

  // Complete payment
  completePayment() {
    if (this.cart.length === 0) {
      console.log("The cart is empty. No payment required.");
      return;
    }
    console.log(`Payment completed. Total Amount: ${this.calculateTotal()} EUR`);
    this.cart = [];
  }
}



// // Example usage
// const pos = new POS();

// // Create products
// const product1 = new Product(1, "Apple", 0.5, 1.0, 100, "2025-12-31", "C001", 20);
// const product2 = new Product(2, "Bread", 1.2, 2.0, 50, "2024-06-30", "C002", 10);
// const product3 = new Product(3, "Milk", 0.8, 1.5, 30, "2024-03-15", "C003", 5);

// // Add products to system
// pos.addProduct(product1);
// pos.addProduct(product2);
// pos.addProduct(product3);

// // Add products to cart
// pos.addToCart(1, 3); // 3 Apples
// pos.addToCart(2, 2); // 2 Bread
// pos.addToCart(3, 1); // 1 Milk

// // Print receipt
// pos.printReceipt();

// // Remove product from cart
// pos.removeFromCart(1, 1); // Remove 1 Apple

// // Print receipt again
// pos.printReceipt();

// // Complete payment
// pos.completePayment();