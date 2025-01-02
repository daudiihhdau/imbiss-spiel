// items.js - Artikelverwaltung

export const Items = {
    items: [
        { name: 'Pommes', emoji: '🍟', stock: 3, sellPrice: 2.5, purchasePrice: 1.5 },
        { name: 'Currywurst', emoji: '🌭', stock: 3, sellPrice: 3.0, purchasePrice: 2.0 },
        { name: 'Hamburger', emoji: '🍔', stock: 3, sellPrice: 4.0, purchasePrice: 2.5 },
        { name: 'Kaffee', emoji: '☕', stock: 3, sellPrice: 1.5, purchasePrice: 0.8 },
        { name: 'Bonbon', emoji: '🍬', stock: 3, sellPrice: 0.5, purchasePrice: 0.2 },
        { name: 'Lutscher', emoji: '🍭', stock: 3, sellPrice: 0.8, purchasePrice: 0.4 },
        { name: 'Kartoffelsuppe', emoji: '🥣', stock: 3, sellPrice: 3.5, purchasePrice: 2.0 },
        { name: 'Bratwurst', emoji: '🥖', stock: 3, sellPrice: 3.2, purchasePrice: 2.2 },
    ],

    getItems() {
        return this.items;
    },

    reduceStock(itemName) {
        const item = this.items.find(item => item.name === itemName);
        if (item && item.stock > 0) {
            item.stock--;
            console.log(`Stock reduced for ${itemName}. Remaining: ${item.stock}`);
        } else {
            console.warn(`No stock left for ${itemName} or item not found.`);
        }
    },

    increaseStock(itemName, amount) {
        const item = this.items.find(item => item.name === itemName);
        if (item) {
            item.stock += amount;
            console.log(`Stock increased for ${itemName}. New stock: ${item.stock}`);
        } else {
            console.warn(`Item ${itemName} not found.`);
        }
    }
};
