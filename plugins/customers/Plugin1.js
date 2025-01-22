import CharacterPlugin from '../../CharacterPlugin.js';

export default function Plugin1(character) {
    const plugin = new CharacterPlugin(character);

    plugin.phaseTimings = { deciding: 500, buying: 1000 };

    plugin.onDeciding = function () {
        console.log(`${this.character.firstName} is deciding quickly.`);
        this.setTimeout(() => this.startPhase('onPaying'), this.phaseTimings.deciding);
    };

    plugin.onPaying = function () {
        console.log(`${this.character.firstName} is buying.`);
        this.setTimeout(() => this.startPhase('onExiting'), this.phaseTimings.buying);
    };

    return plugin;
}
