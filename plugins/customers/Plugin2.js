import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function Plugin2(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    plugin.onDeciding = function () {
        console.log(`${this.character.firstName} is deciding for a long time.`);
        this.startPhase('onReturning')
    };

    plugin.onReturning = function () {
        console.log(`${this.character.firstName} decided not to buy and is returning.`);
        this.position.x -= 3; // Rückwärtsbewegung
        if (this.position.x <= -50) {
            console.log(`${this.character.firstName} has left the screen to the left.`);
            this.character.phase = null;
        }
    };

    return plugin;
}
