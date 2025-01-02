// main_scene.js - Hauptspielszene

import { Customer } from './customer.js';
import { Items } from './items.js';
import { setupDebug } from './debug.js';
import { locations } from './location.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.currentLocation = locations[0]; // Standard-Location auswählen
        this.customerSchedule = [];
    }

    preload() {
        this.load.image('imbiss', this.currentLocation.backgroundImage);
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
        this.customers = [];

        Object.values(Items.getItems()).forEach(item => {
            item.stock = 3;
        });

        const background = this.add.image(0, 0, 'imbiss').setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);

        this.clockText = this.add.text(10, 10, "00:00", {
            fontSize: '24px',
            fill: '#000',
        });

        this.wealthText = this.add.text(this.scale.width - 10, 10, `Vermögen: €${this.playerWealth.toFixed(2)}`, {
            fontSize: '24px',
            fill: '#000',
        }).setOrigin(1, 0);

        setupDebug(this);

        this.customerSchedule = this.currentLocation.generateCustomerSchedule();

        this.time.addEvent({
            delay: 120,
            callback: this.updateClock,
            callbackScope: this,
            loop: true,
        });
    }

    update(time, delta) {
        this.customers.forEach((customer, index) => {
            customer.updateBubblePosition();

            if (customer.state === Customer.States.ENTERING) {
                customer.showDesiredItems();
                if (customer.isAtTarget()) {
                    if (!customer.hasPurchased) {
                        customer.state = Customer.States.PAYING;
                        customer.sprite.setVelocityX(0);
                    } else {
                        customer.state = Customer.States.LEAVING;
                    }
                }
            }

            if (customer.state === Customer.States.PAYING) {
                let totalCost = 0;
                customer.desiredItems.forEach(item => {
                    if (Items.isInStock(item.name)) {
                        Items.reduceStock(item.name);
                        customer.addPurchasedItem(item.name);
                        totalCost += item.sellPrice;
                    } else {
                        console.log(`Item ${item.name} is out of stock!`);
                    }
                });

                if (customer.purchasedItems.length > 0) {
                    this.playerWealth += totalCost;
                    this.wealthText.setText(`Vermögen: €${this.playerWealth.toFixed(2)}`);
                    customer.state = Customer.States.EXITING;
                    customer.hasPurchased = true;
                } else {
                    customer.state = Customer.States.LEAVING;
                }
            }

            if (customer.state === Customer.States.LEAVING || customer.state === Customer.States.EXITING) {
                customer.showPurchasedItems();
            }

            if (customer.state === Customer.States.EXITING) {
                customer.sprite.setVelocityX(300);
                customer.sprite.setFlipX(false);
            }

            if (customer.state === Customer.States.LEAVING) {
                customer.sprite.setVelocityX(-300);
                customer.sprite.setFlipX(true);
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

        this.updateQueuePositions();
    }

    updateClock() {
        this.currentTime++;
        if (this.currentTime >= 1440) {
            this.currentTime = 0;
        }

        const hours = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
        const minutes = (this.currentTime % 60).toString().padStart(2, '0');
        this.clockText.setText(`${hours}:${minutes}`);

        this.checkSpawnProbability();
    }

    spawnCustomer(order = []) {
        const customerIndex = Phaser.Math.Between(1, 4);
        const spriteKey = `customer${customerIndex}`;
        const x = -50;
        const y = this.scale.height - 100;
        const customer = new Customer(this, x, y, spriteKey, order);

        this.customers.push(customer);

        customer.state = Customer.States.ENTERING;
        customer.hasPurchased = false;
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

    checkSpawnProbability() {
        if (this.customerSchedule.length > 0 && this.customerSchedule[0].time === this.currentTime) {
            const nextCustomer = this.customerSchedule.shift();
            this.spawnCustomer(nextCustomer.order);
        }
    }
}
