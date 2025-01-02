// items.js - Items Logik

export class Items {
    static items = [
        { name: 'Pommes', emoji: '🍟', stock: 3, sellPrice: 2.5, purchasePrice: 1.5 },
        { name: 'Currywurst', emoji: '🌭', stock: 3, sellPrice: 3.0, purchasePrice: 2.0 },
        { name: 'Hamburger', emoji: '🍔', stock: 3, sellPrice: 4.0, purchasePrice: 2.5 },
        { name: 'Kaffee', emoji: '☕', stock: 3, sellPrice: 1.5, purchasePrice: 0.8 },
        { name: 'Bonbon', emoji: '🍬', stock: 3, sellPrice: 0.5, purchasePrice: 0.2 },
        { name: 'Lutscher', emoji: '🍭', stock: 3, sellPrice: 0.8, purchasePrice: 0.4 },
        { name: 'Kartoffelsuppe', emoji: '🥣', stock: 3, sellPrice: 3.5, purchasePrice: 2.0 },
        { name: 'Bratwurst', emoji: '🥖', stock: 3, sellPrice: 3.2, purchasePrice: 2.2 },
    ];

    static getItems() {
        return this.items;
    }

    static reduceStock(itemName) {
        const item = this.items.find(i => i.name === itemName);
        if (item && item.stock > 0) {
            item.stock--;
        }
    }

    static isValidItem(itemName) {
        return !!this.items.find(i => i.name === itemName);
    }

    static isInStock(itemName) {
        const item = this.items.find(i => i.name === itemName);
        return item && item.stock > 0;
    }
}
