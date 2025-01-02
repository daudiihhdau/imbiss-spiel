// main_scene.js - Hauptspielszene

import { generateCustomerSchedule } from './schedule.js';
import { Customer } from './customer.js';
import { Items } from './items.js';
import { setupDebug } from './debug.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        this.load.image('imbiss', 'imbiss.png');
        this.load.image('customer1', 'mensch1.png');
        this.load.image('customer2', 'mensch2.png');
        this.load.image('customer3', 'mensch3.png');
        this.load.image('customer4', 'mensch4.png');
        this.load.image('bubble', 'bubble.png');
    }

    create() {
        this.clockText = null;
        this.wealthText = null;
        this.currentTime = 0;
        this.playerWealth = 0;
        this.customerSchedule = generateCustomerSchedule();
        this.customers = [];

        Object.values(Items.getItems()).forEach(item => {
            console.log(`Initial stock for ${item.name}: ${item.stock}`);
        });

        const background = this.add.image(0, 0, 'imbiss').setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);

        this.clockText = this.add.text(10, 10, "00:00", {
            fontSize: '24px',
            fill: '#000'
        });

        this.wealthText = this.add.text(this.scale.width - 10, 10, `Vermögen: €${this.playerWealth.toFixed(2)}`, {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(1, 0);

        setupDebug(this);

        this.time.addEvent({
            delay: 120,
            callback: this.updateClock,
            callbackScope: this,
            loop: true
        });

        console.log("MainScene created.");
    }

    update(time, delta) {
        this.customers.forEach((customer, index) => {
            customer.updateBubblePosition();

            if (customer.state === Customer.States.ENTERING) {
                this.updateQueuePositions();
                customer.showDesiredItems();
                if (customer.isAtTarget()) {
                    if (!customer.hasPurchased) { // Sicherstellen, dass der Kunde noch nicht eingekauft hat
                        customer.state = Customer.States.PAYING;
                        customer.sprite.setVelocityX(0);
                        console.log(`Customer ${index} reached target and is now PAYING.`);
                    } else {
                        customer.state = Customer.States.LEAVING;
                        console.log(`Customer ${index} is leaving without purchasing.`);
                    }
                }
            }

            if (customer.state === Customer.States.PAYING) {
                let totalCost = 0;
                console.log(`Customer ${index} desired items:`, customer.desiredItems);
                customer.desiredItems.forEach(item => {
                    const stockItem = Items.getItems().find(i => i.name === item.name);
                    if (stockItem) {
                        if (stockItem.stock > 0) {
                            Items.reduceStock(item.name);
                            customer.addPurchasedItem(item.name);
                            totalCost += item.sellPrice;
                            console.log(`Customer ${index} bought ${item.name}. Remaining stock: ${stockItem.stock}`);
                        } else {
                            console.log(`Customer ${index} could not buy ${item.name}, stock is 0.`);
                        }
                    } else {
                        console.log(`Customer ${index} requested ${item.name}, but it does not exist in stock.`);
                    }
                });

                if (customer.purchasedItems.length > 0) {
                    this.playerWealth += totalCost;
                    this.wealthText.setText(`Vermögen: €${this.playerWealth.toFixed(2)}`);
                    customer.state = Customer.States.EXITING;
                    customer.hasPurchased = true; // Markiere den Kunden als fertig mit Einkäufen
                    console.log(`Customer ${index} has finished purchasing. Total cost: €${totalCost.toFixed(2)}`);
                } else {
                    customer.state = Customer.States.LEAVING;
                    console.log(`Customer ${index} is leaving without buying anything.`);
                }
            }

            if (customer.state === Customer.States.EXITING) {
                customer.sprite.setVelocityX(300); // Nach rechts bewegen
                customer.sprite.setFlipX(false);
            }

            if (customer.state === Customer.States.LEAVING) {
                customer.sprite.setVelocityX(-300); // Nach links bewegen
                customer.sprite.setFlipX(true);
            }

            if (
                (customer.state === Customer.States.EXITING && customer.sprite.x > this.scale.width + 50) ||
                (customer.state === Customer.States.LEAVING && customer.sprite.x < -50)
            ) {
                console.log(`Customer ${index} has left the scene.`);
                this.customers.splice(index, 1);
                customer.destroy();
            }
        });
    }

    updateClock() {
        this.currentTime++;
        if (this.currentTime >= 1440) {
            this.currentTime = 0;
            this.customerSchedule = generateCustomerSchedule();
        }

        const hours = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
        const minutes = (this.currentTime % 60).toString().padStart(2, '0');
        this.clockText.setText(`${hours}:${minutes}`);

        while (this.customerSchedule.length > 0 && this.customerSchedule[0].time === this.currentTime) {
            const nextCustomer = this.customerSchedule.shift();
            this.spawnCustomer(nextCustomer.order);
        }
    }

    spawnCustomer(order = []) {
        const customerIndex = Phaser.Math.Between(1, 4);
        const spriteKey = `customer${customerIndex}`;
        const x = -50;
        const y = this.scale.height - 100;
        const customer = new Customer(this, x, y, spriteKey, order);

        this.customers.push(customer);

        customer.state = Customer.States.ENTERING;
        customer.hasPurchased = false; // Initialisiere das Einkauf-Flag
        console.log(`Spawned customer with desired items:`, order);
        this.updateQueuePositions();
    }

    updateQueuePositions() {
        this.customers.forEach((customer, index) => {
            if (customer.state === Customer.States.ENTERING) {
                const targetX = this.scale.width / 3 + index * 50;
                customer.moveTo(targetX);
            }
        });
    }
}
