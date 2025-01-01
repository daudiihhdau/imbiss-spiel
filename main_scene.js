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
        // Initialisiere globale Variablen hier
        this.clockText = null;
        this.wealthText = null;
        this.currentTime = 0;
        this.playerWealth = 0;
        this.customerSchedule = generateCustomerSchedule();
        this.customers = [];

        // Setze den Bestand aller Waren auf 3
        Object.values(Items.getItems()).forEach(item => {
            item.stock = 3;
        });

        // Hintergrundbild
        const background = this.add.image(0, 0, 'imbiss').setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);

        // Uhrzeit-Anzeige
        this.clockText = this.add.text(10, 10, "00:00", {
            fontSize: '24px',
            fill: '#000'
        });

        // Vermögensanzeige
        this.wealthText = this.add.text(this.scale.width - 10, 10, `Vermögen: €${this.playerWealth.toFixed(2)}`, {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(1, 0);

        // Debug-Modus aktivieren
        setupDebug(this);

        // Uhr-Update
        this.time.addEvent({
            delay: 120,
            callback: this.updateClock,
            callbackScope: this,
            loop: true
        });
    }

    update(time, delta) {
        this.customers.forEach((customer, index) => {
            customer.updateBubblePosition();

            // Zeige je nach Zustand an, was der Kunde in der Bubble sehen soll
            if (customer.state === Customer.States.ENTERING) {
                customer.showDesiredItems(); // Zeigt, was der Kunde kaufen will
            } else if (
                customer.state === Customer.States.EXITING ||
                customer.state === Customer.States.LEAVING
            ) {
                customer.showPurchasedItems(); // Zeigt, was der Kunde gekauft hat
            }

            if (customer.isAtTarget() && customer.state === Customer.States.ENTERING) {
                customer.sprite.setVelocityX(0);
                if (index === 0) {
                    // Überprüfe und kaufe verfügbare Artikel
                    let totalCost = 0;
                    customer.desiredItems.forEach(item => {
                        const stockItem = Items.getItems()[item.name];
                        if (stockItem && stockItem.stock > 0) {
                            Items.reduceStock(item.name);
                            customer.addPurchasedItem(item.name);
                            totalCost += item.sellPrice;
                        }
                    });

                    if (customer.purchasedItems.length > 0) {
                        this.playerWealth += totalCost;
                        this.wealthText.setText(`Vermögen: €${this.playerWealth.toFixed(2)}`);
                        customer.state = Customer.States.EXITING;
                        customer.sprite.setVelocityX(300); // Kunde bewegt sich nach rechts
                        customer.sprite.setFlipX(false); // Spiegelung entfernen für EXITING
                    } else {
                        customer.state = Customer.States.LEAVING;
                        customer.sprite.setVelocityX(-300); // Kunde bewegt sich nach links
                        customer.sprite.setFlipX(true); // Spiegelung aktivieren für LEAVING
                    }
                } else {
                    customer.sprite.setVelocityX(0);
                }
            }

            if (
                (customer.state === Customer.States.EXITING && customer.sprite.x > this.scale.width + 50) ||
                (customer.state === Customer.States.LEAVING && customer.sprite.x < -50)
            ) {
                this.customers.splice(index, 1);
                customer.destroy();
                this.updateQueuePositions();
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
        customer.moveTo(this.scale.width / 3 + this.customers.length * 50); // Kunden reihen sich ein
    }

    updateQueuePositions() {
        this.customers.forEach((customer, index) => {
            if (customer.state !== Customer.States.EXITING && customer.state !== Customer.States.LEAVING) {
                const targetX = this.scale.width / 3 + index * 50;
                customer.moveTo(targetX);
            }
        });
    }
}
