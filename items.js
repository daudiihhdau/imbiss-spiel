// items.js - Verwaltung der Artikel

class ItemsManager {
    constructor() {
        this.items = {
            "Pommes": { emoji: "🍟", sellPrice: 2.5, buyPrice: 1.0, stock: 10 },
            "Currywurst": { emoji: "🌭", sellPrice: 3.0, buyPrice: 1.5, stock: 8 },
            "Hamburger": { emoji: "🍔", sellPrice: 4.0, buyPrice: 2.0, stock: 6 },
            "Kaffee": { emoji: "☕", sellPrice: 1.5, buyPrice: 0.8, stock: 15 }
        };
    }

    reduceStock(itemName) {
        if (this.items[itemName] && this.items[itemName].stock > 0) {
            this.items[itemName].stock -= 1;
        }
    }

    restock(itemName, quantity) {
        if (this.items[itemName]) {
            this.items[itemName].stock += quantity;
        }
    }

    getItems() {
        return this.items;
    }
}

export const Items = new ItemsManager();
