import { World } from './World.js';

export class CharacterPlugin {
    constructor(spriteKey, character) {
        this.character = character;
        
        this.world = World.getInstance();

        this.spriteKey = spriteKey
        this.spriteGraphics = null;
        this.bubbleGraphics = null;
        this.bubbleTextGraphics = null;
        this.statementText = ''
        this.position = { x: 0, y: 0 };
        this.targetX = null;
        this.phaseStartTime = null;
        this.phase = null;

        this.middleware = {}; // Hooks für Phasen

        this.phaseOrder = [
            'onEnter',
            'onRecognizeHunger',
            'onCheckOptions',
            'onEvaluateQueue',
            'onEvaluatePricePerformance',
            'onMakeDecision',
            'onWaitingInQueue',
            'onOrderAndPay',
            'onEnjoyAndEvaluate',
            'onLeaving'
        ];
    }

    handlePhaseConditions(phase) {
        if (!this.world?.getCustomerQueue) {
            console.warn("Customer queue is not available.");
            return false;
        }
    
        const queue = this.world.getCustomerQueue();
        
        // Bedingungen und verpflichtende Aktionen in einer einzigen Struktur
        const phaseHandlers = {
            "onMakeDecision": {
                condition: () => !queue.contains?.(this),
                action: () => queue.enqueue?.(this)
            },
            "onEnjoyAndEvaluate": {
                condition: () => queue.contains?.(this),
                action: () => {
                    if (queue.contains?.(this)) {
                        queue.dequeue?.(this);
                    } else {
                        console.warn("Character was not in queue but tried to dequeue.");
                    }
                }
            }
        };
    
        // Falls die Phase existiert, Bedingungen prüfen & Aktion ausführen
        if (phaseHandlers[phase]) {
            if (phaseHandlers[phase].condition?.()) {
                phaseHandlers[phase].action?.();
                return true;
            }
            return false;
        }
    
        return true; // Standardmäßig kein spezielles Handling notwendig
    }
    
    startNextPhase() {
        const currentIndex = this.phaseOrder.indexOf(this.phase);
        if (currentIndex === -1 || currentIndex >= this.phaseOrder.length - 1) return;
    
        const nextPhase = this.phaseOrder[currentIndex + 1];
    
        if (this.handlePhaseConditions(nextPhase)) {
            this.startPhase(nextPhase);
        }
    }

    startLeaving() {
        this.world.getCustomerQueue().dequeue(this)
    
        if (this.handlePhaseConditions('onLeaving')) {
            this.startPhase('onLeaving');
        }
    }
    
    startPhase(phase) {
        console.log(`Starting phase: ${phase}`);
        this.executeMiddleware(phase, 'before');
    
        if (this[phase]) {
            this.phaseStartTime = Date.now();
            this.phase = phase;
            this[this.phase]();
        }
    
        this.executeMiddleware(phase, 'after');
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
    executeMiddleware(phase, timing) {
        const key = `${phase}_${timing}`; // Beispiel: "onPaying_before"
        if (this.middleware[key]) {
            for (const middlewareFunc of this.middleware[key]) {
                middlewareFunc(this); // Middleware erhält den Charakter
            }
        }
    }
 
    // Überprüft, wie lange der Charakter bereits in der Phase verweilt
    hasPhaseTimeElapsed(duration) {
        const elapsed = Date.now() - this.phaseStartTime;
        return elapsed >= duration;
    }

    hasReachedTargetX() {
        if (this.targetX === null) return false

        const tolerance = 50;
        return Math.abs(this.targetX - this.position.x) <= tolerance;
    }

    setTargetX(targetX) {
        this.targetX = targetX;
    }

    moveToTargetX(speed) {
        // Prüfe, ob das Ziel schon erreicht wurde
        if (this.hasReachedTargetX()) {
            return;
        }
    
        // Reduziere Geschwindigkeit, wenn der Kunde kurz vor dem Ziel ist
        const distance = Math.abs(this.targetX - this.position.x);
        if (distance < 100) {
            speed = Math.max(speed / 2, 2); // Halbieren, aber nicht unter 2 fallen
        }
    
        // Bestimme Bewegungsrichtung
        if (this.position.x > this.targetX) speed *= -1;
    
        // Bewege den Charakter, aber überlaufe nicht das Ziel
        if (Math.abs(this.position.x + speed - this.targetX) < Math.abs(speed)) {
            this.position.x = this.targetX; // Direkt auf Ziel setzen, falls er drüber gehen würde
        } else {
            this.position.x += speed;
        }
    
        // Flip Sprite in Phaser.js
        if (this.spriteGraphics) {
            this.spriteGraphics.setFlipX(this.position.x > this.targetX);
        }
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
        if (!this.phase) this.startPhase('onEnter');

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

    onEnter = function () {
        console.log(`${this.character.firstName}: "Ich laufe hier lang."`);
        
        if (!this.hasReachedTargetX()) {
            this.setTargetX(400)
            this.moveToTargetX(3);
        } else {
            this.startNextPhase()
        }
    };

    onRecognizeHunger = function () {
        console.log(`${this.character.firstName}: "Ich habe Hunger, was will ich essen?"`);
        this.startNextPhase();
    };

    onCheckOptions = function () {
        console.log(`${this.character.firstName}: "Gibt es hier etwas, das mir schmeckt?"`);
        this.startNextPhase();
    };

    onEvaluateQueue = function () {
        console.log(`${this.character.firstName}: "Wie lang ist die Schlange? Habe ich die Zeit und Geduld?"`);
        this.startNextPhase();
    };

    onEvaluatePricePerformance = function () {
        console.log(`${this.character.firstName}: "Ist es das wert? Was kostet es?"`);
        this.startNextPhase();
    };

    onMakeDecision = function () {
        console.log(`${this.character.firstName}: "Das nehme ich / Ich warte hier."`);
        this.startNextPhase();
    };

    onWaitingInQueue = function () {
        console.log(`${this.character.firstName}: "Warten! Ich stelle mich hinten an."`);

        if (!this.hasReachedTargetX()) {
            this.moveToTargetX(3)   
        } else {
            if (this.world.getCustomerQueue().isFirst(this)) {
                this.startNextPhase();
            }
        }
    };

    onOrderAndPay = function () {
        console.log(`${this.character.firstName}: "Wie läuft der Kauf ab?"`);
        this.startNextPhase();
    };

    onEnjoyAndEvaluate = function () {
        console.log(`${this.character.firstName}: "Hat es sich gelohnt?"`);
        this.startNextPhase();
    };

    onLeaving = function () {
        console.log(`${this.character.firstName}: "Ich gehe jetzt nach Hause."`);
        this.setTargetX(4000);
        this.moveToTargetX(4);
    };

    destroy() {
        this.spriteGraphics.destroy(); // Entfernt den Sprite, falls nötig
        this.bubbleGraphics.destroy();
        this.bubbleTextGraphics.destroy();
    }
}
