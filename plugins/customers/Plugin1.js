import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function Plugin1(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);
    return plugin;
}
