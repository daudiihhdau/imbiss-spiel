import { Character } from './Character.js';
// import { setupDebug } from './debug.js';
import { World } from './World.js';
import { EventCharacterManager } from './event_character.js'; // Import der EventCharacterManager-Klasse

export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });

        this.world = World.getInstance();

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

        this.load.image('customer1', './img/characters/mensch1.png');
        this.load.image('customer2', './img/characters/mensch2.png');
        this.load.image('customer3', './img/characters/mensch3.png');
        this.load.image('customer4', './img/characters/mensch4.png');
        this.load.image('bubble', './img/characters/bubble.png');

        this.load.image(this.world.getFoodStall().getImage(), this.world.getFoodStall().getImage())
        this.load.image('imbiss', this.world.getLocation().getImage());

        this.eventManager = new EventCharacterManager(this); // Initialisiere den EventCharacterManager
        this.eventManager.preload();
    }

    async loadAsyncPlugins() {
        const pluginPaths = [
             './plugins/customers/Plugin1.js',
            // './plugins/customers/Plugin2.js',
            // './plugins/customers/PluginPassBy.js',
            // './plugins/customers/PluginHurry.js'
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
        this.dayCycleOverlay = this.add.rectangle(0, 0, window.screenSize.width, window.screenSize.height, 0x000000)
            .setOrigin(0)
            .setDepth(5) // Über Hintergrund, aber unter anderen Objekten
            .setAlpha(this.world.getCurrentAlpha()); // Initialer Helligkeitswert

        this.world.startClock();

        // Listener für Mitternacht hinzufügen
        this.world.events.subscribe('midnight', () => {
            console.log('Mitternacht erreicht, Szene wechseln!');
            
            this.world.stopClock();
            this.world.events.emit('stop_game');
        });

        this.customerSchedule = this.world.getLocation().generateCustomerSchedule();
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
            .setDisplaySize(window.screenSize.width, window.screenSize.height);

        this.add.image(window.screenSize.width / 2, window.screenSize.height / 2, this.world.getFoodStall().getImage())
            .setOrigin(0.5)
            .setScale(0.5);
    }

    setupTopBar() {
        const barHeight = 43;
        this.add.rectangle(0, 0, window.screenSize.width, barHeight, 0xffffff)
            .setOrigin(0)
            .setDepth(10);

        this.dateText = this.add.text(20, 10, `📅 ${this.world.getFullDateAndTime()}`, {
            fontSize: '26px',
            fill: '#000',
        }).setDepth(11);

        this.wealthText = this.add.text(window.screenSize.width - 20, 10, `💰 ${this.world.getWealth().toFixed(2)}€`, {
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
        if (this.customerSchedule.length > 0 && this.customerSchedule[0].time === this.world.getTimeInMinutes()) {
            const nextCustomer = this.customerSchedule.shift();
            this.spawnCustomer(nextCustomer);
        }
    }

    spawnCustomer() {
        const customerIndex = Phaser.Math.Between(1, 4);
        const spriteKey = `customer${customerIndex}`;

        const pluginIndex = Phaser.Math.Between(0, this.customerPlugins.length - 1);
        const character = this.customerPlugins[pluginIndex].default(spriteKey, new Character('Alice', 'Smith', 25));
        character.position = { x: -70, y: window.screenSize.height - 150 };
        character.setTargetX(this.world.getCustomerQueue().calcLastPositionX());

        this.customers.push(character);
    }
}
