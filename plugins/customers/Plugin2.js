import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function Plugin2(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    plugin.onMakeDecision = function () {
        console.log(`${this.character.firstName}: „Das nehme ich / Ich warte hier.“`);
        this.setThinking("???")
        if (this.hasPhaseTimeElapsed(3000)) {
            this.startPhase('onOrderAndPay');
        }
    };

    return plugin;
}
