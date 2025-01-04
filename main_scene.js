import { Customer } from './customer.js';
import { setupDebug } from './debug.js';
import { locations } from './location.js';
import { foodStalls } from './food_stall.js';
import { ImbissSoftware } from './inventory_management.js'; // Importiere Warenwirtschaft
import { World } from './world.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });

        this.world = World.getInstance();

        // Set currentLocation based on debug mode
        this.currentLocation = this.world.isDebugMode 
            ? locations[0] 
            : locations[Phaser.Math.Between(1, locations.length - 1)];

        this.customerSchedule = [];
        this.imbissSoftware = ImbissSoftware.getInstance();

        // Set all stock to 2 in debug mode
        if (this.world.isDebugMode) {
            ImbissSoftware.items.forEach(item => {
                item.stock = 2;
            });
        }
        this.customers = [];
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
        this.setupClock();
        this.setupWealthDisplay();
        setupDebug(this);

        this.customerSchedule = this.currentLocation.generateCustomerSchedule();

        this.time.addEvent({
            delay: 120,
            callback: this.updateClock,
            callbackScope: this,
            loop: true,
        });

        this.imbissSoftware.dispatcher.subscribe('lowStock', data => {
            console.log(`Warnung: Niedriger Bestand bei ${data.name}. Verbleibend: ${data.stock}`);
        });
    }

    update(time, delta) {
        this.customers.forEach((customer, index) => {
            this.handleCustomerState(customer, index, delta);
        });

        this.updateQueuePositions();
    }

    setupScene() {
        this.add.image(0, 0, 'imbiss').setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);

        const randomStall = foodStalls[Phaser.Math.Between(0, foodStalls.length - 1)];
        this.add.image(this.scale.width / 2, this.scale.height / 2, randomStall.getImage())
            .setOrigin(0.5)
            .setScale(0.5);
    }

    setupClock() {
        this.clockText = this.add.text(10, 10, this.world.getFormattedTime(), {
            fontSize: '24px',
            fill: '#000',
        });
    }

    setupWealthDisplay() {
        this.wealthText = this.add.text(this.scale.width - 10, 10, `Vermögen: €${this.world.getWealth().toFixed(2)}`, {
            fontSize: '24px',
            fill: '#000',
        }).setOrigin(1, 0);
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
            this.wealthText.setText(`Vermögen: €${this.world.getWealth().toFixed(2)}`);
            customer.state = Customer.States.EXITING;
        } else {
            customer.state = Customer.States.LEAVING;
        }
    }

    handleExitingCustomer(customer, index) {
        const exitDirection = customer.state === Customer.States.LEAVING ? -300 : this.scale.width + 300;
        customer.sprite.setFlipX(customer.state === Customer.States.LEAVING);
        customer.moveTo(exitDirection);

        customer.showPurchasedItems()

        if (
            (customer.state === Customer.States.EXITING && customer.sprite.x > this.scale.width + 50) ||
            (customer.state === Customer.States.LEAVING && customer.sprite.x < -50)
        ) {
            this.customers.splice(index, 1);
            customer.destroy();
        }
    }

    updateClock() {
        this.world.updateClock();
        this.clockText.setText(this.world.getFormattedTime());
        this.checkSpawnProbability();
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

    checkSpawnProbability() {
        if (this.customerSchedule.length > 0 && this.customerSchedule[0].time === this.world.currentTime) {
            const nextCustomer = this.customerSchedule.shift();
            this.spawnCustomer(nextCustomer.order);
        }
    }
}
