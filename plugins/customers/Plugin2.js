import CharacterPlugin from '../../CharacterPlugin.js';

export default function Plugin2(character) {
    const plugin = new CharacterPlugin(character);

    plugin.phaseTimings = { deciding: 3000 };

    plugin.onDeciding = function () {
        console.log(`${this.character.firstName} is deciding for a long time.`);
        this.setTimeout(() => this.startPhase('onReturning'), this.phaseTimings.deciding);
    };

    plugin.onReturning = function () {
        console.log(`${this.character.firstName} decided not to buy and is returning.`);
        this.character.position.x -= 3; // Rückwärtsbewegung
        if (this.character.position.x <= -50) {
            console.log(`${this.character.firstName} has left the screen to the left.`);
            this.character.phase = null;
        }
    };

    return plugin;
}
