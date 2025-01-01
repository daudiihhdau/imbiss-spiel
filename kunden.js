// kunden.js - Verwaltung der Kunden und Bestellungen

export const customers = [];

import { items, generateOrder, reduceStock } from './items.js';

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

export function processNextCustomer(scene) {
    if (customers.length > 0) {
        const nextCustomer = customers[0];
        if (nextCustomer.state === 'paying') {
            const order = nextCustomer.order;
            let totalCost = 0;

            order.forEach(item => {
                if (items[item.name].stock > 0) {
                    reduceStock(item.name);
                    totalCost += item.sellPrice;
                }
            });

            scene.events.emit('customerPaid', totalCost);

            setTimeout(() => {
                nextCustomer.state = 'exiting';
                customers.shift();
                if (customers.length > 0) {
                    processNextCustomer(scene);
                }
            }, 2000);
        }
    }
}

export function updateQueuePositions(scene) {
    customers.forEach((customer, index) => {
        const targetX = scene.scale.width / 2 - 60 * index;
        customer.moveTo(targetX);
    });
}
