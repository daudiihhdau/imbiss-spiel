import { Helper } from './helper.js';

class Product {
  constructor(name, categoryId, attributeIds, emoji, quality, taste, unit, expiryDate, charge) {
    this.id = Helper.generateUUID();
    this.name = name
    this.categoryId = categoryId
    this.attributeIds = attributeIds
    this.emoji = emoji
    this.quality = quality
    this.taste = taste
    this.unit = unit
    // this.purchasePrice = purchasePrice;
    // this.salePrice = null;
    this.expiryDate = expiryDate;
    this.charge = charge;
    // this.reorderLevel = reorderLevel;
  }
  
  // Calculate margin
  calculateMargin() {
    return this.salePrice - this.purchasePrice;
  }
}
  
