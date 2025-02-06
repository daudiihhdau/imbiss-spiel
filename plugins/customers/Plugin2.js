import { CharacterPlugin } from '../../CharacterPlugin.js';
import { WaitingSentences, LeavingSentences } from '../../Sentences.js';

export default function Plugin2(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    // Hilfsfunktion für zufälligen Satz aus einer Kategorie
    function getRandomSentence(sentences) {
        return sentences[Math.floor(Math.random() * sentences.length)].emoji;
    }

    // Überschreibe die onEnter-Methode mit hasPhaseTimeElapsed
    plugin.onEnter = function () {
        console.log(`${character.firstName}: "Ich laufe hier lang."`);

        if (!this.hasReachedTargetX()) {
            this.setTargetX(400);
            this.moveToTargetX(3);
        } else {
            if (this.hasPhaseTimeElapsed(1000)) { // Nach 5 Sekunden überlegt er, ob er direkt geht
                console.log(`${character.firstName}: "Nee, das ist mir zu stressig!"`);
                this.setThinking(getRandomSentence(LeavingSentences));
                this.startLeaving();
            }
            this.startNextPhase();
        }
    };

    // Überschreibe die onWaitingInQueue-Methode mit hasPhaseTimeElapsed
    plugin.onWaitingInQueue = function () {
        console.log(`${character.firstName}: "Warten! Ich stelle mich hinten an."`);

        if (!this.hasReachedTargetX()) {
            this.moveToTargetX(3);
        } else {
            if (this.hasPhaseTimeElapsed(500)) { // Nach 10 Sekunden verlässt er frustriert die Schlange
                console.log(`${character.firstName}: "Das dauert mir zu lange!"`);
                this.setThinking(getRandomSentence(LeavingSentences));
                this.startLeaving();
            }
            if (this.world.getCustomerQueue().isFirst(this)) {
                this.startNextPhase();
            }
        }
    };

    // Middleware: Kunde wird während des Wartens immer ungeduldiger
    plugin.addMiddleware('onWaitingInQueue', 'before', (character) => {
        character.setThinking(getRandomSentence(WaitingSentences)); // Zufälliger genervter Gedanke
    });

    // Middleware: Falls der Kunde wirklich ungeduldig wird, verlässt er spontan die Schlange
    plugin.addMiddleware('onWaitingInQueue', 'before', (character) => {
        if (Math.random() < 0.2) { // 20% Chance, dass er plötzlich geht
            console.log(`${character.firstName}: "Vergiss es, ich bin raus!"`);
            character.setThinking(getRandomSentence(LeavingSentences));
            character.startLeaving();
        }
    });

    return plugin;
}
