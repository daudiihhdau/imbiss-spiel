import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function Plugin3(character) {
    const plugin = new CharacterPlugin(character);

    plugin.onEntering = function () {
        console.log(`${this.character.firstName} is just passing by.`);
        this.character.position.x += 3; // Schnellere Bewegung nach rechts
        if (this.character.position.x > 800) {
            console.log(`${this.character.firstName} has passed by.`);
            this.character.phase = null;
        }
    };

    return plugin;
}
