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
    this.expiryDate = expiryDate;
    this.charge = charge;
  }
}
  
