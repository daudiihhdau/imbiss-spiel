// game.js - Hauptspiel
import { generateCustomerSchedule } from './schedule.js';
import { Customer } from './customer.js';
import { Items } from './items.js';
import { setupDebug } from './debug.js';

const customers = [];

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let currentTime = 0;
let customerSchedule = [];
let clockText;
let wealthText;
let playerWealth = 0;
let debugUpdater; // Debugging-Text-Aktualisierung

function preload() {
    this.load.image('imbiss', 'imbiss.png');
    this.load.image('customer1', 'mensch1.png');
    this.load.image('customer2', 'mensch2.png');
    this.load.image('customer3', 'mensch3.png');
    this.load.image('customer4', 'mensch4.png');
    this.load.image('bubble', 'bubble.png');
}

function create() {
    const background = this.add.image(0, 0, 'imbiss').setOrigin(0).setDisplaySize(config.width, config.height);

    clockText = this.add.text(10, 10, "00:00", {
        fontSize: '24px',
        fill: '#000'
    });

    wealthText = this.add.text(config.width - 10, 10, `Vermögen: €${playerWealth.toFixed(2)}`, {
        fontSize: '24px',
        fill: '#000'
    }).setOrigin(1, 0);

    customerSchedule = generateCustomerSchedule();

    setupDebug(this); // Debugging aktivieren

    this.time.addEvent({
        delay: 120,
        callback: updateClock,
        callbackScope: this,
        loop: true
    });
}

function updateClock() {
    currentTime++;
    if (currentTime >= 1440) {
        currentTime = 0;
        customerSchedule = generateCustomerSchedule();
    }

    const hours = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const minutes = (currentTime % 60).toString().padStart(2, '0');
    clockText.setText(`${hours}:${minutes}`);

    while (customerSchedule.length > 0 && customerSchedule[0].time === currentTime) {
        const nextCustomer = customerSchedule.shift();
        spawnCustomer(this, nextCustomer.order);
    }
}

function spawnCustomer(scene, order) {
    const customerIndex = Phaser.Math.Between(1, 4);
    const spriteKey = `customer${customerIndex}`;
    const x = -50;
    const y = scene.scale.height - 100;
    const customer = new Customer(scene, x, y, spriteKey, order);

    customers.push(customer);

    customer.state = 'entering';
    customer.moveTo(scene.scale.width / 3 + customers.length * 50, 300); // Kunden reihen sich ein
}

function update(time, delta) {
    customers.forEach((customer, index) => {
        customer.updateBubblePosition();

        if (customer.isAtTarget() && customer.state === 'entering') {
            customer.sprite.setVelocityX(0);
            if (index === 0) {
                // Der erste Kunde zahlt
                customer.state = 'paying';
                const totalCost = customer.order.reduce((sum, item) => {
                    if (Items.getItems()[item.name].stock > 0) {
                        Items.reduceStock(item.name);
                        this.events.emit('updateDebug'); // Debugging-Nachricht aktualisieren
                        return sum + item.sellPrice;
                    }
                    return sum;
                }, 0);

                playerWealth += totalCost;
                wealthText.setText(`Vermögen: €${playerWealth.toFixed(2)}`);

                setTimeout(() => {
                    customer.state = 'exiting';
                    customer.moveTo(config.width + 50, 300); // Bildschirm verlassen
                }, 2000);
            } else {
                // Andere Kunden warten in der Schlange
                customer.sprite.setVelocityX(0);
            }
        }

        if (customer.state === 'exiting' && customer.sprite.x > config.width + 50) {
            customers.splice(index, 1);
            customer.destroy();
            updateQueuePositions();
        }
    });
}

function updateQueuePositions() {
    customers.forEach((customer, index) => {
        if (customer.state !== 'exiting') {
            const targetX = config.width / 3 + index * 50;
            customer.moveTo(targetX, 300);
        }
    });
}
