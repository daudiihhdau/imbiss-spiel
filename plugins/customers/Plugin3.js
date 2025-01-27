import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function Plugin3(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    plugin.onEntering = function () {
        console.log(`${this.character.firstName}: "Ich laufe hier lang."`);
        this.position.x += 4;
    };

    return plugin;
}
