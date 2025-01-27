import { EventDispatcher } from './event_dispatcher.js'; // Deine EventDispatcher-Klasse
import { foodStalls } from './FoodStall.js';
import { locations } from './Location.js';

export class World {
    static instance = null;
    timer = null;
    isRunning = false; // Status, ob die Uhr läuft
    foodStall = null
    location = null
    events = new EventDispatcher(); // Dein EventDispatcher für Mitternacht und andere Events

    constructor(params = {}) {
        if (World.instance) {
            return World.instance;
        }

        const urlParams = new URLSearchParams(params.url || window.location.search);
        this.isDebugMode = urlParams.get('debug') === '1';

        // this.imbissSoftware = ImbissSoftware.getInstance();
        // this.imbissSoftware.dispatcher.subscribe('lowStock', data => {
        //     console.log(`Warnung: Niedriger Bestand bei ${data.name}. Verbleibend: ${data.stock}`);
        // });

        // if (this.isDebugMode) {
        //     ImbissSoftware.items.forEach(item => {
        //         item.stock = 2;
        //     });
        // }

        this.currentTime = 0; // Minuten seit Tagesbeginn (00:00)
        this.currentDay = params.startDay || 1; // Starttag (Standard: 1. Januar)
        this.currentMonth = params.startMonth || 1; // Startmonat (Standard: Januar)
        this.currentYear = params.startYear || 2025; // Startjahr (Standard: 2025)

        this.playerWealth = 2.22; // Anfangsvermögen

        this.foodStall = foodStalls[Math.floor(Math.random()*foodStalls.length)]
        this.location = this.isDebugMode ? locations[0] : locations[Phaser.Math.Between(1, locations.length - 1)];

        World.instance = this;
    }

    static getInstance(params = {}) {
        if (!World.instance) {
            World.instance = new World(params);
        }
        return World.instance;
    }

    updateClock() {
        this.currentTime = (this.currentTime + 1) % 1440; // Minuten im Tagesverlauf (0-1439)
        if (this.currentTime === 0) {
            this.advanceDay();
            this.events.emit('midnight'); // Mitternacht-Ereignis auslösen
        }
    }

    advanceDay() {
        this.currentDay += 1;

        const daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear);
        if (this.currentDay > daysInMonth) {
            this.currentDay = 1;
            this.currentMonth += 1;

            if (this.currentMonth > 12) {
                this.currentMonth = 1;
                this.currentYear += 1;
            }
        }
    }

    startClock() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.timer = setInterval(() => {
            this.updateClock();
        }, 80); // Alle 120ms
    }

    stopClock() {
        if (!this.isRunning) return;
        this.isRunning = false;

        clearInterval(this.timer);
        this.timer = null;
    }

    getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate(); // Liefert die Anzahl der Tage im Monat
    }

    getDayOfWeek() {
        const date = new Date(this.currentYear, this.currentMonth - 1, this.currentDay);
        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        return days[date.getDay()];
    }

    getFormattedDate() {
        const months = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        return `${this.currentDay}. ${months[this.currentMonth - 1]} ${this.currentYear}`;
    }

    getFormattedTime() {
        const hours = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
        const minutes = (this.currentTime % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    getDate() {
        return new Date(this.getFormattedDate() + ' ' + this.getFormattedTime())
    }

    getHour() {
        return Math.floor(this.currentTime / 60); // Wandelt Minuten in Stunden um
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

    getFullDateAndTime() {
        return `${this.getDayOfWeek()}, ${this.getFormattedDate()} um ${this.getFormattedTime()}`;
    }

    getLightProgress() {
        const sunriseStart = 260;
        const sunriseEnd = 420;
        const sunsetStart = 1250;
        const sunsetEnd = 1400;

        if (this.currentTime >= sunriseStart && this.currentTime <= sunriseEnd) {
            return (this.currentTime - sunriseStart) / (sunriseEnd - sunriseStart);
        } else if (this.currentTime > sunriseEnd && this.currentTime < sunsetStart) {
            return 1;
        } else if (this.currentTime >= sunsetStart && this.currentTime <= sunsetEnd) {
            return 1 - (this.currentTime - sunsetStart) / (sunsetEnd - sunsetStart);
        } else {
            return 0;
        }
    }

    getCurrentAlpha() {
        const lightProgress = this.getLightProgress();
        return 0.9 - (lightProgress * 0.9);
    }
}
