// schedule.js - Kundenzeitplan

import { Items } from './items.js';

export function generateCustomerSchedule() {
    const schedule = [];
    for (let hour = 0; hour < 24; hour++) {
        const customersInHour = Phaser.Math.Between(
            hour >= 6 && hour <= 9 || hour >= 12 && hour <= 14 || hour >= 17 && hour <= 20 ? 3 : 1,
            hour >= 6 && hour <= 9 || hour >= 12 && hour <= 14 || hour >= 17 && hour <= 20 ? 5 : 2
        );
        for (let i = 0; i < customersInHour; i++) {
            const time = hour * 60 + Phaser.Math.Between(0, 59);
            const order = generateOrder();
            schedule.push({ time, order });
        }
    }
    schedule.sort((a, b) => a.time - b.time);
    return schedule;
}

function generateOrder() {
    const items = Items.getItems();
    const numItems = Phaser.Math.Between(1, 3);
    return Array.from({ length: numItems }).map(() => {
        const itemKeys = Object.keys(items);
        const itemKey = itemKeys[Phaser.Math.Between(0, itemKeys.length - 1)];
        return { name: itemKey, ...items[itemKey] };
    });
}
