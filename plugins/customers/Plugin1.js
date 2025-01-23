import { CharacterPlugin } from '../../CharacterPlugin.js';
import { Emotions } from '../../Constants.js';

export default function Plugin1(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    // Phase: Bestellen und zahlen
    plugin.onOrderAndPay = function () {
        console.log(`${this.character.firstName}: „Wie läuft der Kauf ab?“`);
        this.setThinking("GELD")
        if (this.hasPhaseTimeElapsed(900)) {
            this.startPhase('onWaitAndVerify');
        }
    };

    return plugin;
}
