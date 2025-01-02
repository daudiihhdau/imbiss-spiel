// schedule.js - Zeitplan für Kunden

import { Items } from './items.js';

export function generateCustomerSchedule() {
    const schedule = [];
    const totalMinutes = 1440; // 24 Stunden in Minuten

    for (let i = 0; i < totalMinutes; i++) {
        if (Math.random() < getCustomerProbability(i)) {
            schedule.push({
                time: i,
                order: generateRandomOrder()
            });
        }
    }

    return schedule;
}

function getCustomerProbability(minute) {
    const hour = Math.floor(minute / 60);

    if (hour >= 6 && hour < 9) return 0.15; // Morgens
    if (hour >= 12 && hour < 14) return 0.25; // Mittags
    if (hour >= 17 && hour < 20) return 0.3; // Abends
    return 0.005; // Rest des Tages
}

function generateRandomOrder() {
    const allItems = Object.values(Items.getItems());
    const orderSize = Phaser.Math.Between(1, 4);

    const order = [];
    for (let i = 0; i < orderSize; i++) {
        const randomItem = allItems[Phaser.Math.Between(0, allItems.length - 1)];
        order.push({ name: randomItem.name, emoji: randomItem.emoji, sellPrice: randomItem.sellPrice });
    }

    return order;
}
