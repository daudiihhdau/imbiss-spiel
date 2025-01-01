// items.js - Artikelverwaltung

export const Items = {
    items: {
        fries: { name: 'fries', emoji: '🍟', stock: 3, sellPrice: 2.5 },
        sausage: { name: 'sausage', emoji: '🌭', stock: 3, sellPrice: 3.0 },
        burger: { name: 'burger', emoji: '🍔', stock: 3, sellPrice: 4.0 },
        coffee: { name: 'coffee', emoji: '☕', stock: 3, sellPrice: 1.5 },
        candy: { name: 'candy', emoji: '🍬', stock: 3, sellPrice: 0.5 },
        lollipop: { name: 'lollipop', emoji: '🍭', stock: 3, sellPrice: 0.8 },
        soup: { name: 'soup', emoji: '🍲', stock: 3, sellPrice: 3.5 },
        bratwurst: { name: 'bratwurst', emoji: '🥩', stock: 3, sellPrice: 3.2 },
    },

    getItems() {
        return this.items;
    },

    reduceStock(itemName) {
        if (this.items[itemName]?.stock > 0) {
            this.items[itemName].stock--;
        }
    },

    increaseStock(itemName, amount) {
        if (this.items[itemName]) {
            this.items[itemName].stock += amount;
        }
    }
};
