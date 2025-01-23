import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function Plugin1(character) {
    const plugin = new CharacterPlugin(character);

    plugin.phaseTimings = { deciding: 50, buying: 1000 };

    plugin.onEntering = function () {
        // console.log(`${this.character.firstName} is entering.`);
        this.character.position.x += 3;
        if (this.character.position.x > 300) this.startPhase('onDeciding')
        // this.setTimeout(() => this.startPhase('onDeciding'), this.phaseTimings.deciding);
    };

    plugin.onDeciding = function () {
        console.log(`${this.character.firstName} is deciding quickly.`);
        this.startPhase('onPaying')
        // this.setTimeout(() => this.startPhase('onPaying'), this.phaseTimings.deciding);
    };

    plugin.onPaying = function () {
        console.log(`${this.character.firstName} is buying.`);
        this.startPhase('onLeaving')
        // this.setTimeout(() => this.startPhase('onExiting'), this.phaseTimings.buying);
    };

    plugin.onLeaving = function () {
        console.log(`${this.character.firstName} is leaving.`);
        this.character.position.x -= 6;
        // this.setTimeout(() => this.startPhase('onExiting'), this.phaseTimings.buying);
    };

    return plugin;
}
