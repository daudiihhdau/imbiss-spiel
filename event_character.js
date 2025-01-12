export class EventCharacter {
    constructor(scene, x, y, spriteKey, direction) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, spriteKey);
        this.sprite.setOrigin(0.5);
        this.sprite.setScale(0.2); // Tiere deutlich kleiner machen
        this.direction = direction; // "LEFT_TO_RIGHT" or "RIGHT_TO_LEFT"
        this.speed = Phaser.Math.Between(300, 500); // Deutlich schnellere Geschwindigkeit

        // Setze die korrekte Richtung des Sprites
        if (this.direction === "LEFT_TO_RIGHT") {
            this.sprite.setFlipX(false);
        } else {
            this.sprite.setFlipX(true);
        }
    }

    updatePosition(delta) {
        const speed = this.speed * (delta / 1000);
        if (this.direction === "LEFT_TO_RIGHT") {
            this.sprite.x += speed;
        } else {
            this.sprite.x -= speed;
        }
    }

    isOutOfBounds() {
        return (
            this.sprite.x < -50 ||
            this.sprite.x > this.scene.scale.width + 50
        );
    }

    destroy() {
        this.sprite.destroy();
    }
}

export class EventCharacterManager {
    constructor(scene) {
        this.scene = scene;
        this.activeEvents = [];
        this.eventSprites = ["dog1", "dog2", "dog3", "pigeon", "sparrow"];
    }

    preload() {
        // Lade alle Tier-Sprites vor
        this.scene.load.image("dog1", "./pets/dog1.png");
        this.scene.load.image("dog2", "./pets/dog2.png");
        this.scene.load.image("dog3", "./pets/dog3.png");
        this.scene.load.image("sparrow", "./pets/sparrow.png");
        this.scene.load.image("pigeon", "./pets/pigeon.png");
    }

    spawnRandomEvent() {
        const spriteKey = Phaser.Utils.Array.GetRandom(this.eventSprites);
        const direction = Phaser.Math.Between(0, 1) === 0 ? "LEFT_TO_RIGHT" : "RIGHT_TO_LEFT";
        const y = this.scene.scale.height - 50;
        const x = direction === "LEFT_TO_RIGHT" ? -50 : this.scene.scale.width + 50;

        const event = new EventCharacter(this.scene, x, y, spriteKey, direction);
        this.activeEvents.push(event);
    }

    update(delta) {
        this.activeEvents.forEach((event, index) => {
            event.updatePosition(delta);

            // Entferne Events, die den Bildschirm verlassen haben
            if (event.isOutOfBounds()) {
                event.destroy();
                this.activeEvents.splice(index, 1);
            }
        });
    }

    startRandomEventSpawner() {
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(3000, 7000), // Kürzere Zeitspanne für Events
            callback: () => {
                this.spawnRandomEvent();
            },
            callbackScope: this,
            loop: true,
        });
    }
}
