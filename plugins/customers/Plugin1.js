import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function Plugin1(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    plugin.onOrderAndPay = function () {
        console.log(`${this.firstName}: "Wie läuft der Kauf ab?"`);
        if (this.hasPhaseTimeElapsed(1000)) {
            this.startNextPhase();
        }
    };
    
    return plugin;
}
