import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function Plugin2(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    plugin.onMakeDecision = function () {
        console.log(`${this.character.firstName}: „Das nehme ich / Ich warte hier.“`);
        this.setThinking("anstellen?")

        if (this.hasPhaseTimeElapsed(2000)) {
            if (!this.queue.contains(this)) {
                this.queue.enqueue(this);
            }

            this.startPhase('onWaitingInQueue');
        } else {
            this.setTargetX(1600)
            this.moveToTargetX(2)
        }
    };

    return plugin;
}
