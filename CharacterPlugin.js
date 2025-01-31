import { Emotions } from '../../Constants.js';
import { World } from './World.js';
import { HungrySentences, VerifySentences } from './Sentences.js';

export class CharacterPlugin {
    constructor(spriteKey, character) {
        this.character = character; // Der Charakter wird von außen übergeben

        this.world = World.getInstance();

        this.spriteKey = spriteKey
        this.spriteGraphics = null;
        this.bubbleGraphics = null;
        this.bubbleTextGraphics = null;
        this.statementText = ''
        this.position = null;
        this.targetX = null;

        this.middleware = {}; // Hooks für Phasen

        // this.addMiddleware('onRecognizeHunger', 'before', async (character) => {
        //     console.log("+++++++++++++++++++++++++++++++")
        //     character.setThinking(HungrySentences[Math.floor(Math.random()*HungrySentences.length)].emoji)
        // });

        this.addMiddleware('onEnjoyAndEvaluate', 'before', async (character) => {
            console.log("+++++++++++++++++++++++++++++++")
            character.setThinking(VerifySentences[Math.floor(Math.random()*VerifySentences.length)].emoji)
        });

        this.phase = this.startPhase('onEntering');
        this.phaseStartTime = null;
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
                await middlewareFunc(this); // Middleware erhält den Charakter
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

        if (this.spriteGraphics) this.spriteGraphics.setFlipX(this.position.x > this.targetX)
    }

    setThinking(text) {
        if (text) {
            this.statementText = text;
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
        this.statementText = this.character.wishList.map(item => item.emoji).join(' ');
    }

    showPurchasedItems() {
        this.statementText = this.character.purchasedItems.map(item => item.emoji).join(' ');
    }

    update() {
        if (!this.spriteGraphics) return

        if (this.phase && this[this.phase]) {
            console.log("ff", this.phase)
            this[this.phase]();
        }
    }

    render(scene, delta) {
        if (!this.spriteGraphics) {
            this.spriteGraphics = scene.add.sprite(this.position.x, this.position.y, this.spriteKey);
        }

        if (this.bubbleTextGraphics && this.statementText) {
            this.bubbleTextGraphics.setText(this.statementText);
        }

        if (!this.bubbleGraphics) {
            this.bubbleGraphics = scene.add.image(this.spriteGraphics.x + 20, this.spriteGraphics.y - 250, 'bubble').setOrigin(0.5).setScale(0.5);
            this.bubbleTextGraphics = scene.add.text(this.bubbleGraphics.x, this.bubbleGraphics.y - 40, '', {
                fontSize: '40px',
                fill: '#000',
                align: 'center',
                padding: {
                    left: 0,
                    right: 0,
                    top: 6,
                    bottom: 6,
                },
            }).setOrigin(0.5);
        }

        this.bubbleGraphics.visible = this.statementText.length > 0
        this.bubbleTextGraphics.visible = this.statementText.length > 0

        this.spriteGraphics.setPosition(this.position.x, this.position.y);
        this.bubbleGraphics.setPosition(this.position.x + 50, this.position.y - 240);
        this.bubbleTextGraphics.setPosition(this.bubbleGraphics.x + 10, this.bubbleGraphics.y - 35);

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
            this.setEmotion(Emotions.HUNGRY)
        } else {
            this.startPhase('onRecognizeHunger');
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
            this.startPhase('onMakeDecision');
        }
    };

    // Phase: Entscheidung treffen
    onMakeDecision = function () {
        console.log(`${this.character.firstName}: „Das nehme ich / Ich warte hier.“`);

        if (this.hasPhaseTimeElapsed(180)) {
            if (!this.world.getCustomerQueue().contains(this)) {
                this.world.getCustomerQueue().enqueue(this);
            }

            this.startPhase('onWaitingInQueue');
        }
    };

    onWaitingInQueue = function () {
        console.log(`${this.character.firstName}: „Warten! Ich stelle mich hinten an.“`);

        // Stoppt vor dem Imbisswagen
        if (!this.hasReachedTargetX()) {
            this.moveToTargetX(3)
            this.setEmotion(Emotions.HUNGRY)           
        } else {
            if (this.world.getCustomerQueue().isFirst(this)) {
                this.startPhase('onOrderAndPay'); // Wechselt in die nächste Phase
            }
        }
    };

    // Phase: Bestellen und zahlen
    onOrderAndPay = function () {
        console.log(`${this.character.firstName}: „Wie läuft der Kauf ab?“`);
        this.spriteGraphics.setFlipX(false);
        if (this.hasPhaseTimeElapsed(600)) {
            this.startPhase('onEnjoyAndEvaluate');
        }
    };

    // Phase: Genießen und bewerten
    onEnjoyAndEvaluate = function () {
        console.log(`${this.character.firstName}: „Hat es sich gelohnt?“`);

        if (this.hasPhaseTimeElapsed(500)) {
            console.log(`${this.character.firstName} hat alle Phasen durchlaufen.`);
            
            if (this.world.getCustomerQueue().contains(this)) {
                this.world.getCustomerQueue().dequeue(this);
            }

            this.startPhase('onLeaving');
        }
    };

    onLeaving = function () {
        console.log(`${this.character.firstName}: "Ich gehe jetzt nach Hause."`);
        this.setEmotion(Emotions.HAPPY)
        this.position.x += 4;
    };
    
    destroy() {
        this.spriteGraphics.destroy(); // Entfernt den Sprite, falls nötig
        this.bubbleGraphics.destroy();
        this.bubbleTextGraphics.destroy();
    }
}
