import { Emotions } from '../../Constants.js';
import { CustomerQueue } from './CustomerQueue.js';

export class CharacterPlugin {
    constructor(spriteKey, character) {
        this.character = character; // Der Charakter wird von außen übergeben

        this.queue = CustomerQueue.getInstance();

        this.spriteKey = spriteKey
        this.sprite = null;
        this.bubble = null;
        this.position = null;

        this.phase = 'onEntering'; // Startphase
        this.phaseStartTime = null;
        this.targetX = null;

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

    hasReachedTargetX() {
        const tolerance = 100;
        return Math.abs(this.targetX - this.position.x) <= tolerance;
    }

    setTargetX(targetX) {
        this.targetX = targetX;
    }

    moveToTargetX(speed) {
        if (this.position.x > this.targetX) speed *= -1
        this.position.x += speed;

        if (this.sprite) this.sprite.setFlipX(this.position.x > this.targetX)
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

    setWishes(items) {
        if (items) {
            this.character.wishList = items;
        }
    }

    showWishes() {
        const itemsText = this.character.wishList.map(item => item.emoji).join(' ');
        this.bubbleText.setText(itemsText);
    }

    showPurchasedItems() {
        const itemsText = this.character.purchasedItems.map(item => item.emoji).join(' ');
        this.bubbleText.setText(itemsText);
    }

    update() {
        if (!this.sprite) return

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

        // Stoppt vor dem Imbisswagen
        if (!this.hasReachedTargetX()) {
            this.moveToTargetX(3)
            this.setThinking("Hallo")
            this.setEmotion(Emotions.HUNGRY)
        } else {
            this.startPhase('onRecognizeHunger');
        }
    };

    // Phase: Hunger erkennen
    onRecognizeHunger = function () {
        console.log(`${this.character.firstName}: „Ich habe Hunger, was will ich essen?“`);
        this.setThinking("Hunger")
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

        if (this.hasPhaseTimeElapsed(20)) {
            if (!this.queue.contains(this)) {
                this.queue.enqueue(this);
            }

            this.startPhase('onWaitingInQueue');
        }
    };

    onWaitingInQueue = function () {
        console.log(`${this.character.firstName}: „Warten! Ich stelle mich hinten an.“`);

        // Stoppt vor dem Imbisswagen
        if (!this.hasReachedTargetX()) {
            this.moveToTargetX(3)
            this.setThinking("...")
            this.setEmotion(Emotions.HUNGRY)           
        } else {
            if (this.queue.isFirst(this)) {
                this.startPhase('onOrderAndPay'); // Wechselt in die nächste Phase
            }
        }
    };

    // Phase: Bestellen und zahlen
    onOrderAndPay = function () {
        console.log(`${this.character.firstName}: „Wie läuft der Kauf ab?“`);
        this.sprite.setFlipX(false);
        if (this.hasPhaseTimeElapsed(600)) {
            this.startPhase('onWaitAndVerify');
        }
    };

    // Phase: Erwarten und prüfen
    onWaitAndVerify = function () {
        console.log(`${this.character.firstName}: „Kommt alles wie bestellt?“`);
        if (this.hasPhaseTimeElapsed(400)) {
            this.startPhase('onEnjoyAndEvaluate');
        }
    };

    // Phase: Genießen und bewerten
    onEnjoyAndEvaluate = function () {
        console.log(`${this.character.firstName}: „Hat es sich gelohnt?“`);

        if (this.hasPhaseTimeElapsed(500)) {
            console.log(`${this.character.firstName} hat alle Phasen durchlaufen.`);
            
            if (this.queue.contains(this)) {
                this.queue.dequeue(this);
            }

            this.startPhase('onLeaving');
        }
    };

    onLeaving = function () {
        console.log(`${this.character.firstName}: "Ich gehe jetzt nach Hause."`);
        this.setThinking("Bye")
        this.setEmotion(Emotions.HAPPY)
        this.position.x += 4;
    };
    
    destroy() {
        this.sprite.destroy(); // Entfernt den Sprite, falls nötig
        this.bubble.destroy();
        this.bubbleText.destroy();
    }
}
