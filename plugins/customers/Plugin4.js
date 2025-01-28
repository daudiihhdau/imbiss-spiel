import { CharacterPlugin } from '../../CharacterPlugin.js';
import { WaitingSentences } from '../../Sentences.js';


export default function Plugin4(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    plugin.addMiddleware('onWaitingInQueue', 'before', async (character) => {
        character.setThinking(WaitingSentences[Math.floor(Math.random()*WaitingSentences.length)].emoji)
    });

    return plugin;
}
