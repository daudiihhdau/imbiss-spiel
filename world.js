import { EventDispatcher } from './event_dispatcher.js'; // Deine EventDispatcher-Klasse
import { foodStalls } from './FoodStall.js';
import { locations } from './Location.js';

export class World {
    static instance = null;
    timer = null;
    isRunning = false;
    foodStall = null;
    location = null;
    events = new EventDispatcher(); // EventDispatcher für Mitternacht und andere Events

    constructor(params = {}) {
        if (World.instance) {
            return World.instance;
        }

        const urlParams = new URLSearchParams(params.url || window.location.search);
        this.isDebugMode = urlParams.get('debug') === '1';

        this.timestamp = new Date(
            params.startYear || 2025,
            (params.startMonth || 1) - 1,
            params.startDay || 1,
            0,
            0,
            0
        ).getTime(); // Initialisiere mit Startdatum und Mitternacht

        this.playerWealth = 22.22; // Anfangsvermögen

        this.foodStall = foodStalls[Math.floor(Math.random() * foodStalls.length)];
        this.location = this.isDebugMode ? locations[0] : locations[Phaser.Math.Between(1, locations.length - 1)];

        World.instance = this;
    }

    static getInstance(params = {}) {
        if (!World.instance) {
            World.instance = new World(params);
        }
        return World.instance;
    }

    getLocation() {
        return this.location
    }

    getFoodStall() {
        return this.foodStall
    }

    updateClock() {
        this.timestamp += 60 * 1000; // Eine Minute in Millisekunden hinzufügen

        if (this.getTimeInMinutes() === 0) {
            this.events.emit('midnight'); // Mitternacht-Ereignis auslösen
        }
    }

    startClock() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.timer = setInterval(() => {
            this.updateClock();
        }, 80); // Alle 80ms (Simulation von Spielzeit)
    }

    stopClock() {
        if (!this.isRunning) return;
        this.isRunning = false;

        clearInterval(this.timer);
        this.timer = null;
    }

    getDate() {
        return new Date(this.timestamp);
    }

    getDayOfWeek() {
        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        return days[this.getDate().getDay()];
    }

    getFormattedDate() {
        const date = this.getDate();
        const months = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    getFormattedTime() {
        const date = this.getDate();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    getFullDateAndTime() {
        return `${this.getDayOfWeek()}, ${this.getFormattedDate()} um ${this.getFormattedTime()}`;
    }

    getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    getTimeInMinutes() {
        const date = this.getDate();
        return date.getHours() * 60 + date.getMinutes();
    }

    getLightProgress() {
        const currentTime = this.getTimeInMinutes();
        const sunriseStart = 260; // 04:20 Uhr
        const sunriseEnd = 420; // 07:00 Uhr
        const sunsetStart = 1250; // 20:50 Uhr
        const sunsetEnd = 1400; // 23:20 Uhr

        if (currentTime >= sunriseStart && currentTime <= sunriseEnd) {
            return (currentTime - sunriseStart) / (sunriseEnd - sunriseStart);
        } else if (currentTime > sunriseEnd && currentTime < sunsetStart) {
            return 1;
        } else if (currentTime >= sunsetStart && currentTime <= sunsetEnd) {
            return 1 - (currentTime - sunsetStart) / (sunsetEnd - sunsetStart);
        } else {
            return 0;
        }
    }

    getCurrentAlpha() {
        const lightProgress = this.getLightProgress();
        return 0.9 - (lightProgress * 0.9);
    }

    addWealth(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('Invalid amount: Amount must be a valid number');
        }
        this.playerWealth += amount;
    }

    getWealth() {
        return this.playerWealth;
    }
}
