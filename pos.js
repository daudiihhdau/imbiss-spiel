import { InvoiceGenerator } from './invoice_generator.js';

    // this.reorderLevel = reorderLevel;
    // this.purchasePrice = purchasePrice;
    // this.salePrice = null;
  
  // // Calculate margin
  // calculateMargin() {
  //   return this.salePrice - this.purchasePrice;
  // }

class POS {
  constructor(supplier, inventoryManagement) {
    this.cart = [];
    this.supplier = supplier;
    this.inventoryManagement = inventoryManagement
  }

  // Add product to cart
  addToCart(id, quantity = 1) {
    const product = this.inventoryManagement.findProduct(id);
    if (product) {
      this.inventoryManagement.updateStock(product.id, quantity * -1)

      const existsInCard = this.cart.find((item) => item.product.id === id);
      if (existsInCard) {
        existsInCard.quantity += quantity;
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

  pay() {
    const invoice = InvoiceGenerator.generateInvoice(this.cart, this.supplier, "Client", `${this.supplier}Sale`);
    this.cart = [];
    return invoice
  }
}