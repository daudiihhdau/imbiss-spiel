import { CharacterPlugin } from '../../CharacterPlugin.js';

export default function ImpatientPlugin(spriteKey, character) {
    const plugin = new CharacterPlugin(spriteKey, character);

    // Überschreibe die onEnter-Methode
    plugin.onEnter = async function () {
        console.log(`${character.firstName}: "Ich laufe hier lang."`);
        
        if (!this.hasReachedTargetX()) {
            this.setTargetX(400);
            this.moveToTargetX(3);
        } else {
            // Prüfen, ob er direkt ungeduldig wird
            if (Math.random() < 0.3) { // 30% Chance, dass er direkt geht
                console.log(`${character.firstName}: "Nee, das ist mir zu stressig!"`);
                this.startSpecificPhase('onLeaving');
                return;
            }
            this.startNextPhase();
        }
    };

    // Überschreibe die onWaitingInQueue-Methode für Ungeduld
    plugin.onWaitingInQueue = async function () {
        console.log(`${character.firstName}: "Warten! Ich stelle mich hinten an."`);

        if (!this.hasReachedTargetX()) {
            this.moveToTargetX(3);
        } else {
            // Falls er zu lange wartet, könnte er gehen
            if (this.hasPhaseTimeElapsed(100)) { // 10 Sekunden Wartezeit
                console.log(`${character.firstName}: "Das dauert mir zu lange!"`);
                this.setThinking("😡");
                this.startSpecificPhase('onLeaving');
                return;
            }
            if (this.world.getCustomerQueue().isFirst(this)) {
                this.startNextPhase();
            }
        }
    };

    // Middleware: Ungeduldige Sätze je nach Wartezeit
    plugin.addMiddleware('onWaitingInQueue', 'before', async (character) => {
        const elapsed = character.hasPhaseTimeElapsed(200) ? "echt zu lange!" : "schon ein bisschen nervig...";
        console.log(`${character.firstName}: "Boah, das dauert ${elapsed}"`);
        character.setThinking("⏳😠");
    });

    // Middleware: Kunde wird aggressiver, je länger er wartet
    plugin.addMiddleware('onWaitingInQueue', 'before', async (character) => {
        if (character.hasPhaseTimeElapsed(300)) { // 15 Sekunden Wartezeit
            console.log(`${character.firstName}: "Ey, macht mal schneller da vorne!"`);
            character.setThinking("💢😡");
        }
    });

    return plugin;
}
