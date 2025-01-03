class EventDispatcher {
  constructor() {
      this.listeners = {};
  }

  subscribe(event, callback) {
      if (!this.listeners[event]) {
          this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
  }

  emit(event, data) {
      if (this.listeners[event]) {
          this.listeners[event].forEach((callback) => callback(data));
      }
  }
}

export class ImbissSoftware {
  static instance = null;

  constructor() {
      if (ImbissSoftware.instance) {
          return ImbissSoftware.instance;
      }

      this.sales = []; // Liste der Verkäufe
      this.purchases = []; // Liste der Einkäufe
      this.priceLog = []; // Logbuch für tägliche Preise
      this.dispatcher = new EventDispatcher();

      ImbissSoftware.instance = this;
  }

  static getInstance() {
      if (!ImbissSoftware.instance) {
          ImbissSoftware.instance = new ImbissSoftware();
      }
      return ImbissSoftware.instance;
  }

  validateInput(itemName, quantity) {
      const item = ImbissSoftware.items.get(itemName);
      if (!item) throw new Error(`Produkt '${itemName}' nicht gefunden.`);
      if (quantity <= 0) throw new Error(`Ungültige Menge: ${quantity}`);
      return item;
  }

  getCurrentDate(date) {
      return date || new Date();
  }

  // Verkauf registrieren
  processOrder(wishlist, date) {
      const processedItems = [];
      let totalRevenue = 0;
      const currentDate = this.getCurrentDate(date);

      wishlist.forEach(({name}) => {
          try {
              const item = this.validateInput(name, 1);

              if (item.stock >= 1) {
                  item.stock -= 1;
                  processedItems.push({
                      itemName: name,
                      quantity: 1,
                      sellPrice: item.sellPrice,
                      totalCost: item.sellPrice * 1,
                  });
                  totalRevenue += item.sellPrice * 1;

                  if (item.stock < 3) {
                      this.dispatcher.emit('lowStock', { name, stock: item.stock });
                  }
              } else {
                  console.warn(`Produkt '${name}' nicht in ausreichender Menge verfügbar.`);
              }
          } catch (error) {
              console.error(`Fehler bei der Verarbeitung von '${name}': ${error.message}`);
          }
      });

      if (processedItems.length > 0) {
          this.sales.push({
              items: processedItems,
              totalRevenue,
              date: currentDate,
          });
          return { items: processedItems, totalRevenue };
      } else {
          console.log("Keine Artikel aus der Wunschliste konnten verarbeitet werden.");
          return null;
      }
  }

  addPurchase(itemName, quantity, purchasePrice, date) {
      const item = this.validateInput(itemName, quantity);
      item.stock += quantity;

      this.purchases.push({
          itemName,
          quantity,
          purchasePrice,
          totalCost: purchasePrice * quantity,
          date: this.getCurrentDate(date),
      });
  }

  updateSellPrice(itemName, newPrice, date) {
      if (newPrice <= 0) throw new Error(`Ungültiger Preis: ${newPrice}`);

      const item = this.validateInput(itemName, 1);
      item.sellPrice = newPrice;

      this.priceLog.push({
          itemName,
          price: newPrice,
          type: 'priceUpdate',
          date: this.getCurrentDate(date),
      });
  }

  getCurrentStock() {
      return Array.from(ImbissSoftware.items.entries()).map(([name, data]) => ({
          name,
          emoji: data.emoji,
          stock: data.stock,
          sellPrice: data.sellPrice,
          needsRestock: data.stock < 3,
      }));
  }

  static items = new Map([
      ['Pommes', { emoji: '🍟', stock: 3, sellPrice: 2.5 }],
      ['Currywurst', { emoji: '🌭', stock: 3, sellPrice: 3.0 }],
      ['Hamburger', { emoji: '🍔', stock: 3, sellPrice: 4.0 }],
      ['Kaffee', { emoji: '☕', stock: 3, sellPrice: 1.5 }],
      ['Bonbon', { emoji: '🍬', stock: 3, sellPrice: 0.5 }],
      ['Lutscher', { emoji: '🍭', stock: 3, sellPrice: 0.8 }],
      ['Kartoffelsuppe', { emoji: '🥣', stock: 3, sellPrice: 3.5 }],
      ['Bratwurst', { emoji: '🥖', stock: 3, sellPrice: 3.2 }],
  ]);
}
