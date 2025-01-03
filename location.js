// location.js - Locations und Zeitplan

import { ImbissSoftware } from './inventory_management.js'; // Importiere Warenwirtschaft

const inventory = new ImbissSoftware(); // Instanziere Warenwirtschaft

export class Location {
    constructor(name, backgroundImage, config) {
        this.name = name;
        this.backgroundImage = backgroundImage;
        this.config = config; // Uhrzeitenslots und Wahrscheinlichkeiten
    }

    getCustomerProbability(currentTime) {
        // Uhrzeit in Minuten berechnen
        const hours = Math.floor(currentTime / 60).toString().padStart(2, '0');
        const minutes = (currentTime % 60).toString().padStart(2, '0');
        const currentHourMinute = `${hours}:${minutes}`;

        // Konfiguration durchlaufen und passenden Slot finden
        for (const slot of this.config) {
            if (this.isTimeInRange(currentHourMinute, slot.start, slot.end)) {
                return slot.probability;
            }
        }
        return 0; // Standardwert, falls keine passende Zeit gefunden
    }

    isTimeInRange(current, start, end) {
        return current >= start && current < end;
    }

    generateCustomerSchedule() {
        const schedule = [];
        for (let time = 0; time < 1440; time++) {
            const probability = this.getCustomerProbability(time);
            if (Math.random() < probability) {
                schedule.push({ time, order: this.generateRandomOrder() });
            }
        }
        return schedule;
    }

    generateRandomOrder() {
        const items = inventory.getCurrentStock(); // Nutze Items aus inventory_management.js
        const order = [];
        const itemCount = Phaser.Math.Between(1, 3);
        for (let i = 0; i < itemCount; i++) {
            const randomItem = items[Phaser.Math.Between(0, items.length - 1)];
            order.push(randomItem); // Nur benötigte Daten übernehmen
        }
        return order;
    }
}

// Beispielkonfiguration für verschiedene Locations
export const locations = [
    new Location('Forest', 'forest.png', [
        { start: '00:00', end: '06:00', probability: 0.01 },
        { start: '06:00', end: '12:00', probability: 0.03 },
        { start: '12:00', end: '18:00', probability: 0.05 },
        { start: '18:00', end: '00:00', probability: 0.02 },
    ]),
    new Location('Parc', 'parc.png', [
        { start: '00:00', end: '08:00', probability: 0.2 },
        { start: '08:00', end: '16:00', probability: 0.6 },
        { start: '16:00', end: '00:00', probability: 0.4 },
    ]),
    new Location('City', 'city.png', [
        { start: '00:00', end: '08:00', probability: 0.2 },
        { start: '08:00', end: '16:00', probability: 0.6 },
        { start: '16:00', end: '00:00', probability: 0.4 },
    ]),
    new Location('Altstadt', 'altstadt.png', [
        { start: '00:00', end: '08:00', probability: 0.2 },
        { start: '08:00', end: '16:00', probability: 0.6 },
        { start: '16:00', end: '00:00', probability: 0.4 },
    ]),
    new Location('Altstadt', 'fussballplatz_amateur.png', [
        { start: '00:00', end: '08:00', probability: 0.2 },
        { start: '08:00', end: '16:00', probability: 0.6 },
        { start: '16:00', end: '00:00', probability: 0.4 },
    ]),
    new Location('Altstadt', 'fussballplatz_profi.png', [
        { start: '00:00', end: '08:00', probability: 0.2 },
        { start: '08:00', end: '16:00', probability: 0.6 },
        { start: '16:00', end: '00:00', probability: 0.4 },
    ])
];
