export class CustomerQueue {
    constructor(scene) {
        if (CustomerQueue.instance) {
            return CustomerQueue.instance; // Gibt die bestehende Instanz zurück
        }

        this.scene = scene;
        this.centerX = scene.scale.width / 2;
        this.centerY = scene.scale.height / 2;

        this.queue = []; // Array zur Speicherung der Kunden
        this.spacing = 120; // Abstand zwischen den Kunden

        CustomerQueue.instance = this; // Speichere die Instanz
    }

    static getInstance(scene) {
        if (!CustomerQueue.instance) {
            CustomerQueue.instance = new CustomerQueue(scene);
        }
        return CustomerQueue.instance;
    }

    // Füge einen neuen Kunden zur Schlange hinzu
    enqueue(character) {
        const positionX = this.centerX - this.queue.length * this.spacing; // Berechne die Position des neuen Kunden
        character.setTargetX(positionX);
        this.queue.push(character); // Füge den Kunden zur Schlange hinzu
        console.log(`Neuer Kunde ${character.character.firstName} in der Schlange.`);
    }

    dequeue(character) {
        const index = this.queue.indexOf(character); // Finde den Index des Charakters
        if (index !== -1) {
            this.queue.splice(index, 1); // Entferne den Charakter aus der Queue
            console.log(`${character.firstName} wurde aus der Schlange entfernt.`);
        } else {
            console.log(`${character.firstName} befindet sich nicht in der Schlange.`);
        }
        this.updateQueuePositions();
    }

    contains(character) {
        return this.queue.includes(character);
    }

    // Aktuelle Länge der Queue
    size() {
        return this.queue.length;
    }

    isFirst(character) {
        const index = this.queue.indexOf(character);
        return (index == 0)
    }

    // Aktualisiere die Positionen der verbleibenden Kunden
    updateQueuePositions() {
        for (let i = 0; i < this.queue.length; i++) {
            const customer = this.queue[i];
            const newX = this.centerX - i * this.spacing; // Neue Position basierend auf Index
            customer.setTargetX(newX);
        }
        console.log("Schlange aktualisiert.");
    }
}
