import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function Plugin1(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    plugin.onEntering = function () {
        console.log(`${this.character.firstName} is entering.`);
        this.position.x += 3;
        this.setThinking("Hallo")
        if (this.position.x > 300) this.startPhase('onDeciding')
    };

    plugin.onDeciding = function () {
        console.log(`${this.character.firstName} is deciding quickly.`);
        this.startPhase('onPaying')
    };

    plugin.onPaying = function () {
        console.log(`${this.character.firstName} is buying.`);
        this.setThinking("Geld")
        this.startPhase('onLeaving')
    };

    plugin.onLeaving = function () {
        console.log(`${this.character.firstName} is leaving.`);
        this.setThinking("Bye")
        this.position.x -= 6;
    };

    return plugin;
}
