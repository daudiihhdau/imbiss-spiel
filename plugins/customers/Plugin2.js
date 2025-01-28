import { CharacterPlugin } from '../../CharacterPlugin.js';
import { EvaluateQueueSentences } from '../../Sentences.js';

export default function Plugin2(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    plugin.addMiddleware('onMakeDecision', 'before', async (character) => {
        character.setThinking(EvaluateQueueSentences[Math.floor(Math.random()*EvaluateQueueSentences.length)].emoji)
    });

    plugin.onMakeDecision = function () {
        console.log(`${this.character.firstName}: „Das nehme ich / Ich warte hier.“`);

        if (this.hasPhaseTimeElapsed(4000)) {
            if (!this.queue.contains(this)) {
                this.queue.enqueue(this);
            }

            this.startPhase('onWaitingInQueue');
        } else {
            this.setTargetX(90)
            this.moveToTargetX(2)
        }
    };

    return plugin;
}
