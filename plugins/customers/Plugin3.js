import { CharacterPlugin } from '../../CharacterPlugin.js';
import { LeavingSentences } from '../../Sentences.js';

export default function Plugin3(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    // Hilfsfunktion für zufälligen Satz aus einer Kategorie
    function getRandomSentence(sentences) {
        return sentences[Math.floor(Math.random() * sentences.length)].emoji;
    }

    // Kunde betritt die Szene und geht direkt zur Theke
    plugin.onEnter = function () {
        console.log(`${character.firstName}: "Ich bin da, ich weiß, was ich will!"`);

        if (!this.hasReachedTargetX()) {
            this.setTargetX(400);
            this.moveToTargetX(6); // Geht schnell zur Theke
        } else {
            this.startNextPhase();
        }
    };

    // Kunde entscheidet sofort über seinen Hunger
    plugin.onRecognizeHunger = function () {
        console.log(`${character.firstName}: "Ich habe Hunger, ich weiß, was ich nehme!"`);
        this.setThinking("🍔😋");
        this.startNextPhase(); // Überspringt Auswahlphasen
    };

    // Kunde überprüft kurz die Schlange
    plugin.onEvaluateQueue = function () {
        console.log(`${character.firstName}: "Wie lang ist die Schlange? Egal, ich warte nicht lange."`);

        if (this.hasPhaseTimeElapsed(1000)) { // Falls es länger als 1 Sekunde dauert, verlässt er evtl. den Imbiss
            if (Math.random() < 0.2) { // 20% Wahrscheinlichkeit, dass er geht
                console.log(`${character.firstName}: "Keine Zeit dafür!"`);
                this.setThinking(getRandomSentence(LeavingSentences));
                this.startLeaving();
            }
        }

        this.setThinking("⏳🤨");
        this.startNextPhase();
    };

    // Kunde wartet nicht lange in der Schlange
    plugin.onWaitingInQueue = function () {
        console.log(`${character.firstName}: "Ich verschwende hier keine Zeit!"`);

        if (!this.hasReachedTargetX()) {
            this.moveToTargetX(6); // Geht schnell vorwärts
        } else {
            if (this.hasPhaseTimeElapsed(1500)) { // Falls er länger als 1,5 Sekunden wartet, verlässt er den Imbiss
                console.log(`${character.firstName}: "Ich bin raus!"`);
                this.setThinking(getRandomSentence(LeavingSentences));
                this.startLeaving();
            }
            this.startNextPhase();
        }
    };

    // Middleware: Kunde denkt von Anfang an zielgerichtet
    plugin.addMiddleware('onEnter', 'before', (character) => {
        character.setThinking("🚀💡");
    });

    // Middleware: Falls die Schlange zu lang ist, verlässt er sofort den Imbiss
    plugin.addMiddleware('onEvaluateQueue', 'before', (character) => {
        if (Math.random() < 0.2) { // 20% Chance, dass er direkt geht
            console.log(`${character.firstName}: "Nee, keine Lust auf Warten!"`);
            character.setThinking(getRandomSentence(LeavingSentences));
            character.startLeaving();
        }
    });

    // Middleware: Kunde bleibt fokussiert während des Bestellens
    plugin.addMiddleware('onOrderAndPay', 'before', (character) => {
        character.setThinking("💰🍔✅");
    });

    return plugin;
}
