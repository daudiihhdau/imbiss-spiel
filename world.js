import { ImbissSoftware } from './inventory_management.js';

export class World {
    static instance = null;

    constructor(params = {}) {
        if (World.instance) {
            return World.instance;
        }

        const urlParams = new URLSearchParams(params.url || window.location.search);
        this.isDebugMode = urlParams.get('debug') === '1';

        this.imbissSoftware = ImbissSoftware.getInstance();
        this.imbissSoftware.dispatcher.subscribe('lowStock', data => {
            console.log(`Warnung: Niedriger Bestand bei ${data.name}. Verbleibend: ${data.stock}`);
        });

        if (this.isDebugMode) {
            ImbissSoftware.items.forEach(item => {
                item.stock = 2;
            });
        }

        this.currentTime = 0; // Minuten seit Tagesbeginn (00:00)
        this.currentDay = params.startDay || 1; // Starttag (Standard: 1. Januar)
        this.currentMonth = params.startMonth || 1; // Startmonat (Standard: Januar)
        this.currentYear = params.startYear || 2025; // Startjahr (Standard: 2025)

        this.playerWealth = 0; // Anfangsvermögen

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

    addWealth(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('Invalid amount: Amount must be a valid number');
        }
        if (amount < 0) {
            throw new Error('Invalid amount: Amount cannot be negative');
        }
        this.playerWealth += amount;
    }

    getWealth() {
        return this.playerWealth;
    }

    getFullDateAndTime() {
        return `${this.getDayOfWeek()}, ${this.getFormattedDate()} um ${this.getFormattedTime()} (${this.getSeason()})`;
    }

    static parseDebugMode(url) {
        const urlParams = new URLSearchParams(url);
        return urlParams.get('debug') === '1';
    }
}
