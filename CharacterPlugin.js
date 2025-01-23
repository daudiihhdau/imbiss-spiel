// CharacterPlugin.js
export class CharacterPlugin {
    constructor(spriteKey, character) {
        this.character = character; // Der Charakter wird von außen übergeben

        this.spriteKey = spriteKey
        this.sprite = null;
        this.bubble = null;
        this.position = null;

        this.phase = 'onEntering'; // Startphase
        this.middleware = {}; // Hooks für Phasen
    }

    // Methode zum Hinzufügen von Hooks für Phasen
    addMiddleware(phase, timing, middlewareFunc) {
        const key = `${phase}_${timing}`; // Beispiel: "onPaying_before"
        if (!this.middleware[key]) {
            this.middleware[key] = [];
        }
        this.middleware[key].push(middlewareFunc);
    }

    // Methode zum Ausführen von Middleware
    async executeMiddleware(phase, timing) {
        const key = `${phase}_${timing}`; // Beispiel: "onPaying_before"
        if (this.middleware[key]) {
            for (const middlewareFunc of this.middleware[key]) {
                await middlewareFunc(this.character); // Middleware erhält den Charakter
            }
        }
    }

    // Startet eine Phase und integriert Hooks
    async startPhase(phase) {
        console.log(`Starting phase: ${phase}`);
        await this.executeMiddleware(phase, 'before'); // Middleware vor der Phase
        if (this[phase]) {
            this.phase = phase
            await this[phase](); // Hauptlogik der Phase
        }
        await this.executeMiddleware(phase, 'after'); // Middleware nach der Phase
    }

    setThinking(text) {
        if (this.bubbleText && text) {
            this.bubbleText.setText(text);
        }
    }

    update() {
        if (this.phase && this[this.phase]) {
            console.log("ff", this.phase)
            this[this.phase]();
        }
    }

    render(scene) {
        if (!this.sprite) {
            this.sprite = scene.add.sprite(this.position.x, this.position.y, this.spriteKey);
        }

        if (!this.bubble) {
            this.bubble = scene.add.image(this.sprite.x + 20, this.sprite.y - 250, 'bubble').setOrigin(0.5).setScale(0.5);
            this.bubbleText = scene.add.text(this.sprite.x + 20, this.sprite.y - 260, '', {
                fontSize: '32px',
                fill: '#000',
                align: 'center'
            }).setOrigin(0.5);
        }

        this.sprite.setPosition(this.position.x, this.position.y);
        this.bubble.setPosition(this.position.x + 50, this.position.y - 240);
        this.bubbleText.setPosition(this.position.x + 50, this.position.y - 240);
    }
}
