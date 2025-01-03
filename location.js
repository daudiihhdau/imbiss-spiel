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
        const items = inventory.getCurrentStock();
        const order = [];
        const itemCount = Phaser.Math.Between(1, 3);
        for (let i = 0; i < itemCount; i++) {
            const randomItem = items[Phaser.Math.Between(0, items.length - 1)];
            order.push({ name: randomItem.name, emoji: randomItem.emoji }); // Nur benötigte Daten übernehmen
        }
        return order;
    }
}

// Beispielkonfiguration für verschiedene Locations
export const locations = [
    new Location('Forest', 'forest.png', [
        { start: '00:00', end: '06:00', probability: 0.001 },
        { start: '06:00', end: '09:00', probability: 0.002 },
        { start: '09:00', end: '12:00', probability: 0.004 },
        { start: '12:00', end: '15:00', probability: 0.003 },
        { start: '15:00', end: '18:00', probability: 0.005 },
        { start: '18:00', end: '21:00', probability: 0.002 },
        { start: '21:00', end: '00:00', probability: 0.001 },
    ]),
    new Location('Parc', 'parc.png', [
        { start: '00:00', end: '06:00', probability: 0.01 },
        { start: '06:00', end: '10:00', probability: 0.03 },
        { start: '10:00', end: '14:00', probability: 0.06 },
        { start: '14:00', end: '18:00', probability: 0.07 },
        { start: '18:00', end: '21:00', probability: 0.05 },
        { start: '21:00', end: '00:00', probability: 0.02 },
    ]),
    new Location('City', 'city.png', [
        { start: '00:00', end: '06:00', probability: 0.01 },
        { start: '06:00', end: '09:00', probability: 0.05 },
        { start: '09:00', end: '12:00', probability: 0.07 },
        { start: '12:00', end: '15:00', probability: 0.08 },
        { start: '15:00', end: '18:00', probability: 0.09 },
        { start: '18:00', end: '21:00', probability: 0.06 },
        { start: '21:00', end: '00:00', probability: 0.04 },
    ]),
    new Location('Altstadt', 'altstadt.png', [
        { start: '00:00', end: '06:00', probability: 0.005 },
        { start: '06:00', end: '10:00', probability: 0.04 },
        { start: '10:00', end: '14:00', probability: 0.07 },
        { start: '14:00', end: '18:00', probability: 0.08 },
        { start: '18:00', end: '21:00', probability: 0.06 },
        { start: '21:00', end: '00:00', probability: 0.03 },
    ]),
    new Location('Fussballplatz_Amateur', 'fussballplatz_amateur.png', [
        { start: '00:00', end: '06:00', probability: 0.001 },
        { start: '06:00', end: '09:00', probability: 0.02 },
        { start: '09:00', end: '12:00', probability: 0.03 },
        { start: '12:00', end: '15:00', probability: 0.04 },
        { start: '15:00', end: '18:00', probability: 0.05 },
        { start: '18:00', end: '21:00', probability: 0.06 },
        { start: '21:00', end: '00:00', probability: 0.02 },
    ]),
    new Location('Fussballplatz_Profi', 'fussballplatz_profi.png', [
        { start: '00:00', end: '06:00', probability: 0.001 },
        { start: '06:00', end: '10:00', probability: 0.002 },
        { start: '10:00', end: '14:00', probability: 0.003 },
        { start: '14:00', end: '17:00', probability: 0.005 },
        { start: '17:00', end: '20:00', probability: 0.08 },
        { start: '20:00', end: '23:00', probability: 0.09 },
        { start: '23:00', end: '00:00', probability: 0.005 },
    ])
];

