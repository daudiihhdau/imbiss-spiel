import { CharacterPlugin } from '../../CharacterPlugin.js';
import { GeneralSentences, LeavingSentences } from '../../Sentences.js';

export default function JoggerPlugin(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    // Zugriff auf die globale Warteschlange
    const queue = plugin.world.getCustomerQueue();

    // Hilfsfunktion für zufälligen Satz aus einer Kategorie
    function getRandomSentence(sentences) {
        return sentences[Math.floor(Math.random() * sentences.length)].emoji;
    }

    // Kunde läuft in die Szene – könnte einfach weiterjoggen
    plugin.onEnter = async function () {
        console.log(`${character.firstName}: "Lauf, lauf, lauf!"`);

        if (!this.hasReachedTargetX()) {
            this.setTargetX(400);
            this.moveToTargetX(18); // Läuft sehr schnell
        } else {
            if (Math.random() < 0.5) { // 50% Wahrscheinlichkeit, dass er einfach weiterläuft
                console.log(`${character.firstName}: "Keine Zeit, weiter geht’s!"`);
                this.setThinking(getRandomSentence(LeavingSentences));
                this.startLeaving();
                return;
            }
            this.startNextPhase();
        }
    };

    // Kunde entscheidet sofort über Hunger
    plugin.onRecognizeHunger = async function () {
        console.log(`${character.firstName}: "Brauche ich was zu essen?"`);
        this.setThinking("🏃‍♂️🍌❓");

        if (this.hasPhaseTimeElapsed(1000)) { // Nur 1 Sekunde Überlegung
            if (Math.random() < 0.3) { // 30% Wahrscheinlichkeit, dass er weiterläuft
                console.log(`${character.firstName}: "Nee, später!"`);
                this.setThinking(getRandomSentence(LeavingSentences));
                this.startLeaving();
                return;
            }
            this.startNextPhase();
        }
    };

    // Kunde überprüft die Schlange
    plugin.onEvaluateQueue = async function () {
        console.log(`${character.firstName}: "Wie lang ist die Schlange?"`);
        this.setThinking("⏳🏃‍♂️❓");

        if (this.hasPhaseTimeElapsed(1000)) { // Nach 1 Sekunde entscheidet er
            if (queue.size() > 3) { // Falls die Schlange zu lang ist, verlässt er
                console.log(`${character.firstName}: "Zu viele Leute, ich bin raus!"`);
                this.setThinking(getRandomSentence(LeavingSentences));
                this.startLeaving();
                return;
            }
            this.startNextPhase();
        }
    };

    // Kunde wartet ungern lange
    plugin.onWaitingInQueue = async function () {
        console.log(`${character.firstName}: "Das dauert mir zu lange!"`);
        this.setThinking("😤🏃‍♂️");

        if (!this.hasReachedTargetX()) {
            this.moveToTargetX(8);
        } else {
            if (this.hasPhaseTimeElapsed(2000)) { // Nach 2 Sekunden wird er unruhig
                if (Math.random() < 0.4) { // 40% Chance, dass er die Geduld verliert
                    console.log(`${character.firstName}: "Nee, ich bin weg!"`);
                    this.setThinking(getRandomSentence(LeavingSentences));
                    queue.dequeue(this); // Verlässt die Schlange
                    this.startLeaving();
                    return;
                }
            }
            if (queue.isFirst(this)) { // Falls er an der Reihe ist, geht es weiter
                this.startNextPhase();
            }
        }
    };

    plugin.onLeaving = async function () {
        console.log(`${character.firstName}: "Ich muss rennen!"`);
        this.setTargetX(4000);
        this.moveToTargetX(18);
    }

    // Middleware: Jogger ist schon im Laufmodus
    plugin.addMiddleware('onEnter', 'before', async (character) => {
        character.setThinking("🏃‍♂️💨");
    });

    // Middleware: Falls ihm die Schlange zu lang vorkommt, läuft er weiter
    plugin.addMiddleware('onEvaluateQueue', 'before', async (character) => {
        if (queue.size() > 9) {
            console.log(`${character.firstName}: "Ich habe keine Zeit für sowas!"`);
            character.setThinking(getRandomSentence(LeavingSentences));
            character.startLeaving();
        }
    });

    return plugin;
}
