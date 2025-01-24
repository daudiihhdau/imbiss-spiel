import { Character } from './Character.js';
// import { setupDebug } from './debug.js';
import { locations } from './Location.js';
import { foodStalls } from './FoodStall.js';
import { World } from './world.js';
import { EventCharacterManager } from './event_character.js'; // Import der EventCharacterManager-Klasse
import { CustomerQueue } from './CustomerQueue.js';

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

        this.customerPlugins = [];

        this.dayCycleOverlay = null; // Overlay für Tag-Nacht-Zyklus

        this.eventManager = null; // EventCharacterManager-Instanz
    }

    preload() {
        this.loadAsyncPlugins();

        this.load.image('imbiss', this.currentLocation.backgroundImage);
        this.load.image('customer1', './img/characters/mensch1.png');
        this.load.image('customer2', './img/characters/mensch2.png');
        this.load.image('customer3', './img/characters/mensch3.png');
        this.load.image('customer4', './img/characters/mensch4.png');
        this.load.image('bubble', './img/characters/bubble.png');

        foodStalls.forEach(stall => this.load.image(stall.getImage(), stall.getImage()));

        this.eventManager = new EventCharacterManager(this); // Initialisiere den EventCharacterManager
        this.eventManager.preload();

        this.queue = CustomerQueue.getInstance(this);
    }

    async loadAsyncPlugins() {
        const pluginPaths = [
            './plugins/customers/Plugin1.js',
            './plugins/customers/Plugin2.js',
            './plugins/customers/Plugin3.js'
        ];
    
        for (const pathOn of pluginPaths) {
            const module = await import(pathOn);
            this.customerPlugins.push(module);
        }
    }

    create() {
        this.setupScene();
        this.setupTopBar();
        // setupDebug(this);

        // Tag-Nacht-Overlay hinzufügen
        this.dayCycleOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
            .setOrigin(0)
            .setDepth(5) // Über Hintergrund, aber unter anderen Objekten
            .setAlpha(this.world.getCurrentAlpha()); // Initialer Helligkeitswert

        this.world.startClock();

        // Listener für Mitternacht hinzufügen
        this.world.events.subscribe('midnight', () => {
            console.log('Mitternacht erreicht, Szene wechseln!');
            
            this.world.stopClock();
            this.scene.stop();
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('html-content').style.display = 'block';
        });

        this.customerSchedule = this.currentLocation.generateCustomerSchedule();
        this.eventManager.startRandomEventSpawner(); // Starte die zufällige Generierung von Events
    }

    update(time, delta) {
        this.updateClockText();
        this.adjustDayCycle(); // Helligkeit basierend auf der Tageszeit anpassen

        this.customers.forEach((customerOn) => {
            customerOn.update();
            customerOn.render(this, delta);
        });
        this.eventManager.update(delta); // Aktualisiere die EventCharacter
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
        const barHeight = 43;
        this.add.rectangle(0, 0, this.scale.width, barHeight, 0xffffff)
            .setOrigin(0)
            .setDepth(10);

        this.dateText = this.add.text(20, 10, `📅 ${this.world.getFullDateAndTime()}`, {
            fontSize: '26px',
            fill: '#000',
        }).setDepth(11);

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

    adjustDayCycle() {
        const currentAlpha = this.world.getCurrentAlpha();
        this.dayCycleOverlay.setAlpha(currentAlpha);
    }

    checkSpawnProbability() {
        if (this.customerSchedule.length > 0 && this.customerSchedule[0].time === this.world.currentTime) {
            const nextCustomer = this.customerSchedule.shift();
            this.spawnCustomer(nextCustomer);
        }
    }

    spawnCustomer() {
        const customerIndex = Phaser.Math.Between(1, 4);
        const spriteKey = `customer${customerIndex}`;

        const pluginIndex = 0 // Phaser.Math.Between(0, this.customerPlugins.length - 1);
        const character = this.customerPlugins[pluginIndex].default(spriteKey, new Character('Alice', 'Smith', 25));
        character.position = { x: -70, y: this.scale.height - 150 };
        character.setTargetX(this.scale.width / 2 - 100);
        
        this.customers.push(character);
    }
}
