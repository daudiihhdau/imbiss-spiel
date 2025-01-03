// Warenwirtschaftssoftware für einen Imbiss
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
    static items = [
      { name: 'Pommes', emoji: '🍟', stock: 3, sellPrice: 2.5 },
      { name: 'Currywurst', emoji: '🌭', stock: 3, sellPrice: 3.0 },
      { name: 'Hamburger', emoji: '🍔', stock: 3, sellPrice: 4.0 },
      { name: 'Kaffee', emoji: '☕', stock: 3, sellPrice: 1.5 },
      { name: 'Bonbon', emoji: '🍬', stock: 3, sellPrice: 0.5 },
      { name: 'Lutscher', emoji: '🍭', stock: 3, sellPrice: 0.8 },
      { name: 'Kartoffelsuppe', emoji: '🥣', stock: 3, sellPrice: 3.5 },
      { name: 'Bratwurst', emoji: '🥖', stock: 3, sellPrice: 3.2 },
    ];
  
    constructor() {
      this.sales = []; // Liste der Verkäufe
      this.purchases = []; // Liste der Einkäufe
      this.priceLog = []; // Logbuch für tägliche Preise
      this.dispatcher = new EventDispatcher();
    }
  
    validateInput(itemName, quantity, price) {
      const item = ImbissSoftware.items.find((i) => i.name === itemName);
      if (!item) throw new Error("Produkt nicht gefunden");
      if (quantity <= 0) throw new Error("Ungültige Menge");
      if (price <= 0) throw new Error("Ungültiger Preis");
      return item;
    }
  
    // Verkauf registrieren
    addSale(itemName, quantity, sellPrice) {
      const item = this.validateInput(itemName, quantity, sellPrice);
  
      if (item.stock < quantity) throw new Error("Nicht genug Bestand");
  
      item.stock -= quantity; // Lagerbestand anpassen
  
      if (item.stock < 3) {
        this.dispatcher.emit('lowStock', { name: item.name, stock: item.stock });
      }
  
      this.sales.push({
        itemName,
        quantity,
        sellPrice,
        totalRevenue: sellPrice * quantity,
        date: new Date(),
      });
  
      this.logPrice(itemName, sellPrice, 'sell');
    }
  
    // Einkauf registrieren
    addPurchase(itemName, quantity, purchasePrice) {
      const item = this.validateInput(itemName, quantity, purchasePrice);
  
      item.stock += quantity; // Lagerbestand anpassen
  
      this.purchases.push({
        itemName,
        quantity,
        purchasePrice,
        totalCost: purchasePrice * quantity,
        date: new Date(),
      });
  
      this.logPrice(itemName, purchasePrice, 'purchase');
    }
  
    // Verkaufspreis ändern
    updateSellPrice(itemName, newPrice) {
      const item = this.validateInput(itemName, 1, newPrice);
  
      item.sellPrice = newPrice;
      this.logPrice(itemName, newPrice, 'priceUpdate');
    }
  
    // Logbuch-Eintrag hinzufügen
    logPrice(itemName, price, type) {
      this.priceLog.push({
        itemName,
        price,
        type, // 'sell', 'purchase', oder 'priceUpdate'
        date: new Date(),
      });
    }
  
    // Preise aus Logbuch analysieren
    getPriceLogAnalysis() {
      return this.priceLog;
    }
  
    // Filter für letzten Tag
    filterLastDay(records) {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
      return records.filter((record) => record.date > oneDayAgo);
    }
  
    // Aktueller Bestand abrufen
    getCurrentStock() {
      return ImbissSoftware.items.map((item) => ({
        name: item.name,
        emoji: item.emoji,
        stock: item.stock,
        sellPrice: item.sellPrice,
        needsRestock: item.stock < 3, // Mindestbestand gesetzt auf 3
      }));
    }
  
    // Top-Produkte
    getTopProducts() {
      const salesByProduct = this.filterLastDay(this.sales).reduce((acc, sale) => {
        acc[sale.itemName] = (acc[sale.itemName] || 0) + sale.quantity;
        return acc;
      }, {});
  
      return ImbissSoftware.items
        .map((item) => ({
          name: item.name,
          emoji: item.emoji,
          totalSold: salesByProduct[item.name] || 0,
        }))
        .sort((a, b) => b.totalSold - a.totalSold);
    }
  
    // Zeitbasierte Analyse
    getTimeBasedAnalysis() {
      const salesByTime = this.filterLastDay(this.sales).reduce((acc, sale) => {
        const hour = sale.date.getHours();
        acc[hour] = (acc[hour] || 0) + sale.totalRevenue;
        return acc;
      }, {});
  
      return Object.entries(salesByTime).map(([hour, revenue]) => ({
        hour: `${hour}:00 - ${+hour + 1}:00`,
        revenue,
      }));
    }
  
    // Kostenkontrolle
    getCostControl() {
      const lastDaySales = this.filterLastDay(this.sales);
      const lastDayPurchases = this.filterLastDay(this.purchases);
  
      const totalRevenue = lastDaySales.reduce((acc, sale) => acc + sale.totalRevenue, 0);
      const totalCost = lastDayPurchases.reduce((acc, purchase) => acc + purchase.totalCost, 0);
      return {
        totalRevenue,
        totalCost,
        profit: totalRevenue - totalCost,
      };
    }
  
    // Historische Statistik abrufen
    getStatistics() {
      const lastDaySales = this.filterLastDay(this.sales);
      const lastDayPurchases = this.filterLastDay(this.purchases);
  
      const salesStats = lastDaySales.reduce((acc, sale) => {
        acc.totalRevenue += sale.totalRevenue;
        acc.totalItemsSold += sale.quantity;
        return acc;
      }, { totalRevenue: 0, totalItemsSold: 0 });
  
      const purchaseStats = lastDayPurchases.reduce((acc, purchase) => {
        acc.totalCost += purchase.totalCost;
        acc.totalItemsBought += purchase.quantity;
        return acc;
      }, { totalCost: 0, totalItemsBought: 0 });
  
      return {
        salesStats,
        purchaseStats,
      };
    }
  
    // Gewinn-Einnahme-Rechnung
    calculateProfit() {
      const lastDaySales = this.filterLastDay(this.sales);
      const lastDayPurchases = this.filterLastDay(this.purchases);
  
      const totalRevenue = lastDaySales.reduce((acc, sale) => acc + sale.totalRevenue, 0);
      const totalCost = lastDayPurchases.reduce((acc, purchase) => acc + purchase.totalCost, 0);
      return totalRevenue - totalCost;
    }
  }
  