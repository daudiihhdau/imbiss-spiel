import { Customer } from './customer.js';
import { setupDebug } from './debug.js';
import { locations } from './location.js';
import { foodStalls } from './food_stall.js';
import { World } from './world.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });

        this.world = World.getInstance();

        this.currentLocation = this.world.isDebugMode
            ? locations[0]
            : locations[Phaser.Math.Between(1, locations.length - 1)];

        this.customerSchedule = [];
        this.customers = [];
        this.dateText = null;
        this.clockText = null;
        this.wealthText = null;
    }

    preload() {
        this.load.image('imbiss', this.currentLocation.backgroundImage);
        this.load.image('customer1', 'mensch1.png');
        this.load.image('customer2', 'mensch2.png');
        this.load.image('customer3', 'mensch3.png');
        this.load.image('customer4', 'mensch4.png');
        this.load.image('bubble', 'bubble.png');

        foodStalls.forEach(stall => this.load.image(stall.getImage(), stall.getImage()));
    }

    create() {
        this.setupScene();
        this.setupTopBar();
        setupDebug(this);

        this.world.startClock();

        // Listener für Mitternacht hinzufügen
        this.world.events.subscribe('midnight', () => {
            console.log('Mitternacht erreicht, Szene wechseln!');
            
            // Uhrzeit stoppen
            this.world.stopClock();

            // Zu einer anderen Szene wechseln
            this.scene.stop();
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('html-content').style.display = 'block';
        });

        this.customerSchedule = this.currentLocation.generateCustomerSchedule();
    }

    update(time, delta) {
        this.updateClockText()

        this.customers.forEach((customer, index) => {
            this.handleCustomerState(customer, index, delta);
        });

        this.updateQueuePositions();
    }

    setupScene() {
        this.add.image(0, 0, 'imbiss')
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height);
    
        const randomStall = foodStalls[Phaser.Math.Between(0, foodStalls.length - 1)];
        this.add.image(this.scale.width / 2, this.scale.height / 2, randomStall.getImage())
            .setOrigin(0.5)
            .setScale(0.5);
    }

    setupTopBar() {
        // Weißer Balken oben
        const barHeight = 43;
        this.add.rectangle(0, 0, this.scale.width, barHeight, 0xffffff)
            .setOrigin(0)
            .setDepth(10);

        // Text für Datum und Uhrzeit mit Kalender-Emoji
        this.dateText = this.add.text(20, 10, `📅 ${this.getFormattedDateAndTime()}`, {
            fontSize: '26px',
            fill: '#000',
        }).setDepth(11);

        // Text für Vermögen mit Geldbeutel-Emoji
        this.wealthText = this.add.text(this.scale.width - 20, 10, `💰 ${this.world.getWealth().toFixed(2)}€`, {
            fontSize: '26px',
            fill: '#000',
        }).setOrigin(1, 0).setDepth(11);
    }

    getFormattedDateAndTime() {
        const dayOfWeek = this.world.getDayOfWeek();
        const formattedDate = this.world.getFormattedDate();
        const formattedTime = this.world.getFormattedTime();
        return `${dayOfWeek}, ${formattedDate} - ${formattedTime}`;
    }

    updateClockText() {
        this.dateText.setText(`📅 ${this.getFormattedDateAndTime()}`);
        this.checkSpawnProbability();
    }

    handleCustomerState(customer, index, delta) {
        customer.updatePosition(delta);
        customer.updateBubblePosition();

        switch (customer.state) {
            case Customer.States.ENTERING:
                this.handleEnteringCustomer(customer);
                break;
            case Customer.States.PAYING:
                this.handlePayingCustomer(customer);
                break;
            case Customer.States.LEAVING:
            case Customer.States.EXITING:
                this.handleExitingCustomer(customer, index);
                break;
        }
    }

    handleEnteringCustomer(customer) {
        customer.showDesiredItems();
        if (customer.isAtTarget()) {
            customer.state = customer.hasPurchased() ? Customer.States.LEAVING : Customer.States.PAYING;
        }
    }

    handlePayingCustomer(customer) {
        const orderSummary = customer.processOrder();
        if (orderSummary) {
            this.world.addWealth(orderSummary.totalRevenue);
            this.wealthText.setText(`💰 ${this.world.getWealth().toFixed(2)}€`);
            customer.state = Customer.States.EXITING;
        } else {
            customer.state = Customer.States.LEAVING;
        }
    }

    handleExitingCustomer(customer, index) {
        const exitDirection = customer.state === Customer.States.LEAVING ? -300 : this.scale.width + 300;
        customer.sprite.setFlipX(customer.state === Customer.States.LEAVING);
        customer.moveTo(exitDirection);

        customer.showPurchasedItems();

        if (
            (customer.state === Customer.States.EXITING && customer.sprite.x > this.scale.width + 50) ||
            (customer.state === Customer.States.LEAVING && customer.sprite.x < -50)
        ) {
            this.customers.splice(index, 1);
            customer.destroy();
        }
    }

    checkSpawnProbability() {
        if (this.customerSchedule.length > 0 && this.customerSchedule[0].time === this.world.currentTime) {
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
        customer.state = Customer.States.ENTERING;
        this.customers.push(customer);
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
