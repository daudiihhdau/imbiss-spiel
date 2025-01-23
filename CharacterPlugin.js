import { Emotions } from '../../Constants.js';

export class CharacterPlugin {
    constructor(spriteKey, character) {
        this.character = character; // Der Charakter wird von außen übergeben

        this.foodTruckPositionX = null

        this.spriteKey = spriteKey
        this.sprite = null;
        this.bubble = null;
        this.position = null;

        this.phase = 'onEntering'; // Startphase
        this.phaseStartTime = null;

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
            this.phaseStartTime = Date.now();
            this.phase = phase
            await this[phase](); // Hauptlogik der Phase
        }
        await this.executeMiddleware(phase, 'after'); // Middleware nach der Phase
    }

    // Überprüft, wie lange der Charakter bereits in der Phase verweilt
    hasPhaseTimeElapsed(duration) {
        const elapsed = Date.now() - this.phaseStartTime;
        return elapsed >= duration;
    }

    setThinking(text) {
        if (this.bubbleText && text) {
            this.bubbleText.setText(text);
        }
    }

    setEmotion(emotion) {
        if (emotion) {
            this.character.emotion = emotion;
        }
    }

    update() {
        if (this.phase && this[this.phase]) {
            console.log("ff", this.phase)
            this[this.phase]();
        }
    }

    render(scene, delta) {
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

        // Falls der Kunde den Bildschirm verlässt, wird die Position nicht weiter aktualisiert
        if (this.position.x > 3000) {
            console.log(`${this.character.firstName} hat den Bildschirm verlassen.`);
            this.destroy();
        }
    }

    onEntering = function () {
        console.log(`${this.character.firstName}: "Ich laufe hier lang."`);
        this.position.x += 3;
        this.setThinking("Hallo")
        this.setEmotion(Emotions.HUNGRY)

        // Stoppt vor dem Imbisswagen
        if (this.position.x >= this.foodTruckPositionX) {
            this.position.x = this.foodTruckPositionX; // Sicherstellen, dass der Kunde nicht weiterläuft
            this.startPhase('onRecognizeHunger'); // Wechselt in die nächste Phase
        }
    };

    // Phase: Hunger erkennen
    onRecognizeHunger = function () {
        console.log(`${this.character.firstName}: „Ich habe Hunger, was will ich essen?“`);
        if (this.hasPhaseTimeElapsed(200)) {
            this.startPhase('onCheckOptions');
        }
    };

    // Phase: Optionen prüfen
    onCheckOptions = function () {
        console.log(`${this.character.firstName}: „Gibt es hier etwas, das mir schmeckt?“`);
        if (this.hasPhaseTimeElapsed(300)) {
            this.startPhase('onEvaluateQueue');
        }
    };

    // Phase: Schlange bewerten
    onEvaluateQueue = function () {
        console.log(`${this.character.firstName}: „Wie lang ist die Schlange? Habe ich die Zeit und Geduld?“`);
        if (this.hasPhaseTimeElapsed(250)) {
            this.startPhase('onEvaluatePricePerformance');
        }
    };

    // Phase: Preis-Leistungs-Abgleich
    onEvaluatePricePerformance = function () {
        console.log(`${this.character.firstName}: „Ist es das wert? Was kostet es?“`);
        if (this.hasPhaseTimeElapsed(250)) {
            this.startPhase('onConsiderAlternative');
        }
    };

    // Phase: Alternative abwägen
    onConsiderAlternative = function () {
        console.log(`${this.character.firstName}: „Soll ich woanders hingehen oder warten?“`);
        if (this.hasPhaseTimeElapsed(200)) {
            this.startPhase('onConsiderTime');
        }
    };

    // Phase: Zeitfaktor bedenken
    onConsiderTime = function () {
        console.log(`${this.character.firstName}: „Wie lange dauert es insgesamt?“`);
        if (this.hasPhaseTimeElapsed(150)) {
            this.startPhase('onMakeDecision');
        }
    };

    // Phase: Entscheidung treffen
    onMakeDecision = function () {
        console.log(`${this.character.firstName}: „Das nehme ich / Ich warte hier.“`);
        if (this.hasPhaseTimeElapsed(200)) {
            this.startPhase('onOrderAndPay');
        }
    };

    // Phase: Bestellen und zahlen
    onOrderAndPay = function () {
        console.log(`${this.character.firstName}: „Wie läuft der Kauf ab?“`);
        if (this.hasPhaseTimeElapsed(300)) {
            this.startPhase('onWaitAndVerify');
        }
    };

    // Phase: Erwarten und prüfen
    onWaitAndVerify = function () {
        console.log(`${this.character.firstName}: „Kommt alles wie bestellt?“`);
        if (this.hasPhaseTimeElapsed(200)) {
            this.startPhase('onEnjoyAndEvaluate');
        }
    };

    // Phase: Genießen und bewerten
    onEnjoyAndEvaluate = function () {
        console.log(`${this.character.firstName}: „Hat es sich gelohnt?“`);
        if (this.hasPhaseTimeElapsed(400)) {
            console.log(`${this.character.firstName} hat alle Phasen durchlaufen.`);
            this.startPhase('onLeaving');
        }
    };

    onLeaving = function () {
        console.log(`${this.character.firstName}: "Ich gehe jetzt nach Hause."`);
        this.setThinking("Bye")
        this.setEmotion(Emotions.HAPPY)
        this.sprite.setFlipX(true)
        this.position.x -= 6;
    };
    
    destroy() {
        this.sprite.destroy(); // Entfernt den Sprite, falls nötig
        this.bubble.destroy();
        this.bubbleText.destroy();
    }
}
