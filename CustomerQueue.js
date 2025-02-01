export class CustomerQueue {
    constructor() {
        this.queue = []; // Array zur Speicherung der Kunden
        this.spacing = 120; // Abstand zwischen den Kunden
    }

    calcCenterX() {
        return window.screenSize.width / 2;
    }

    // Füge einen neuen Kunden zur Schlange hinzu
    enqueue(character) {
        const positionX = this.calcCenterX() - this.queue.length * this.spacing; // Berechne die Position des neuen Kunden
        character.setTargetX(positionX);
        this.queue.push(character); // Füge den Kunden zur Schlange hinzu
        console.log(`Neuer Kunde ${character.character.firstName} in der Schlange.`);
    }

    dequeue(character) {
        const index = this.queue.indexOf(character); // Finde den Index des Charakters
        if (index !== -1) {
            this.queue.splice(index, 1); // Entferne den Charakter aus der Queue
            console.log(`${character.character.firstName} wurde aus der Schlange entfernt.`);
        } else {
            console.log(`${character.character.firstName} befindet sich nicht in der Schlange.`);
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
            const newX = this.calcPositionX(i);
            const customer = this.queue[i];
            customer.setTargetX(newX);
        }
        console.log("Schlange aktualisiert.");
    }

    calcPositionX(queueIndex) {
        return this.calcCenterX() - queueIndex * this.spacing;
    }

    calcLastPositionX() {
        return this.calcPositionX(this.queue.length - 1)
    }

    // jostle ahead
    moveToFront(character) {
        const index = this.queue.indexOf(character);
        
        if (index === -1) {
            console.log(`${character.character.firstName} ist nicht in der Warteschlange.`);
            return;
        }
    
        // 1️⃣ Charakter aus der aktuellen Position entfernen
        this.queue.splice(index, 1);
    
        // 2️⃣ Charakter an den Anfang der Schlange setzen
        this.queue.unshift(character);
    
        console.log(`${character.character.firstName} hat sich vorgedrängelt! 😲`);
    
        // 3️⃣ Alle Positionen in der Schlange neu berechnen
        this.updateQueuePositions();
    }
    
}
