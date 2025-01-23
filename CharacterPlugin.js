// CharacterPlugin.js
export class CharacterPlugin {
    constructor(character) {
        this.character = character; // Der Charakter wird von außen übergeben
        this.phaseTimings = {}; // Konfiguration für Phasen-Dauern
        this.currentTimeout = null; // Aktiver Timer für Phasenwechsel

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
            this.character.phase = phase
            await this[phase](); // Hauptlogik der Phase
        }
        await this.executeMiddleware(phase, 'after'); // Middleware nach der Phase
    }

    setTimeout(callback, duration) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = setTimeout(callback, duration);
    }

    update() {
        if (this.character.phase && this[this.character.phase]) {
            console.log("ff", this.character.phase)
            this[this.character.phase]();
        }
    }

    render(scene) {
        if (!this.character.sprite) {
            this.character.sprite = scene.add.sprite(this.character.position.x, this.character.position.y, this.character.spriteKey);
        }
        this.character.sprite.setPosition(this.character.position.x, this.character.position.y);
    }
}
