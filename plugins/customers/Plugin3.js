import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function Plugin3(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    plugin.onEntering = function () {
        console.log(`${this.character.firstName} is just passing by.`);
        this.position.x += 3; // Schnellere Bewegung nach rechts
        if (this.position.x > 3000) {
            console.log(`${this.character.firstName} has passed by.`);
            this.character.phase = null;
        }
    };

    return plugin;
}
