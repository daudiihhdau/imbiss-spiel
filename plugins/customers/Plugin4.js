import { CharacterPlugin } from '../../CharacterPlugin.js';
import { GeneralSentences, EvaluateQueueSentences, LeavingSentences } from '../../Sentences.js';

export default function Plugin4(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    // Hilfsfunktion für zufälligen Satz aus einer Kategorie
    function getRandomSentence(sentences) {
        return sentences[Math.floor(Math.random() * sentences.length)].emoji;
    }

    // Kunde betritt die Szene und überlegt schon
    plugin.onEnter = async function () {
        console.log(`${character.firstName}: "Hmm, soll ich hier überhaupt essen?"`);

        if (!this.hasReachedTargetX()) {
            this.setTargetX(400);
            this.moveToTargetX(3); // Läuft langsam
        } else {
            if (this.hasPhaseTimeElapsed(2000)) { // Nach 2 Sekunden fängt er an zu zweifeln
                this.setThinking(getRandomSentence(GeneralSentences));
                if (Math.random() < 0.2) { // 20% Wahrscheinlichkeit, dass er einfach wieder geht
                    console.log(`${character.firstName}: "Ach nee, doch nicht!"`);
                    this.setThinking(getRandomSentence(LeavingSentences));
                    this.startLeaving();
                    return;
                }
            }
            this.startNextPhase();
        }
    };

    // Kunde erkennt Hunger, aber überlegt lange
    plugin.onRecognizeHunger = async function () {
        console.log(`${character.firstName}: "Habe ich wirklich Hunger? Oder nur Langeweile?"`);
        this.setThinking("🤔🍔❓");

        if (this.hasPhaseTimeElapsed(3000)) { // Nach 3 Sekunden geht es weiter
            this.startNextPhase();
        }
    };

    // Kunde überlegt lange, was er essen soll
    plugin.onCheckOptions = async function () {
        console.log(`${character.firstName}: "Was esse ich nur? Alles sieht gut aus!"`);
        this.setThinking("🤷‍♂️🍕🍔🌮❓");

        if (this.hasPhaseTimeElapsed(4000)) { // Nach 4 Sekunden kann er sich entscheiden oder zweifeln
            if (Math.random() < 0.2) { // 20% Wahrscheinlichkeit, dass er wieder geht
                console.log(`${character.firstName}: "Ach, ich kann mich nicht entscheiden!"`);
                this.setThinking(getRandomSentence(LeavingSentences));
                this.startLeaving();
                return;
            }
            this.startNextPhase();
        }
    };

    // Kunde überlegt in der Schlange erneut
    plugin.onEvaluateQueue = async function () {
        console.log(`${character.firstName}: "Hmm, wie lange dauert das hier?"`);
        this.setThinking(getRandomSentence(EvaluateQueueSentences));

        if (this.hasPhaseTimeElapsed(3000)) { // Nach 3 Sekunden kann er sich noch umentscheiden
            if (Math.random() < 0.3) { // 30% Wahrscheinlichkeit, dass er aufgibt
                console.log(`${character.firstName}: "Nee, ich hab keine Lust mehr."`);
                this.setThinking(getRandomSentence(LeavingSentences));
                this.startLeaving();
                return;
            }
            this.startNextPhase();
        }
    };

    // Kunde steht in der Schlange, aber denkt über Alternativen nach
    plugin.onWaitingInQueue = async function () {
        console.log(`${character.firstName}: "Soll ich doch woanders hingehen?"`);
        this.setThinking("😵‍💫🕒🤔");

        if (!this.hasReachedTargetX()) {
            this.moveToTargetX(3); // Zögert beim Gehen
        } else {
            if (this.hasPhaseTimeElapsed(4000)) { // Nach 4 Sekunden könnte er erneut gehen
                if (Math.random() < 0.2) { // 20% Wahrscheinlichkeit, dass er die Geduld verliert
                    console.log(`${character.firstName}: "Nee, das dauert zu lange."`);
                    this.setThinking(getRandomSentence(LeavingSentences));
                    this.startLeaving();
                    return;
                }
            }
            this.startNextPhase();
        }
    };

    // Middleware: Kunde zweifelt schon beim Reinkommen
    plugin.addMiddleware('onEnter', 'before', async (character) => {
        character.setThinking("🤔🛑❓");
    });

    // Middleware: Während des Wartens denkt er immer wieder über Alternativen nach
    plugin.addMiddleware('onWaitingInQueue', 'before', async (character) => {
        if (Math.random() < 0.5) { // 50% Chance, dass er sich neue Fragen stellt
            character.setThinking("🤷‍♂️💭🍕❓");
        }
    });

    return plugin;
}
