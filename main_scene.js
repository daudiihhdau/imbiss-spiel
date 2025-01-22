import Character, { character } from './Character.js';
import { characterPlugin } from './CharacterPlugin.js';
// import { setupDebug } from './debug.js';
import { locations } from './Location.js';
import { foodStalls } from './food_stall.js';
import { World } from './world.js';
import { EventCharacterManager } from './event_character.js'; // Import der EventCharacterManager-Klasse

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
        this.load.image('imbiss', this.currentLocation.backgroundImage);
        this.load.image('customer1', 'mensch1.png');
        this.load.image('customer2', 'mensch2.png');
        this.load.image('customer3', 'mensch3.png');
        this.load.image('customer4', 'mensch4.png');
        this.load.image('bubble', 'bubble.png');

        foodStalls.forEach(stall => this.load.image(stall.getImage(), stall.getImage()));

        this.eventManager = new EventCharacterManager(this); // Initialisiere den EventCharacterManager
        this.eventManager.preload();
    }

    async loadAsyncPlugins() {
        const pluginPaths = [
            './plugins/customers/Plugin1.js',
            './plugins/customers/Plugin2.js',
            './plugins/customers/Plugin3.js'
        ];
    
        for (const pathOn of pluginPaths) {
            const module = await import(pathOn);
            const plugin = module.default();
            this.customerPlugins.push(plugin);
        }
    }

    create() {
        loadAsyncPlugins.call(this);

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

        this.customers.forEach((customerOn, index) => {
            customerOn.update();
            customerOn.render(this);
            //this.handleCustomerState(customer, index, delta);
        });

        // this.updateQueuePositions();

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
        const character = this.customerPlugins.default(new Character(spriteKey, 'Alice', 'Smith', 25));
        
        this.customers.push(character);
    }
}
