export class World {
    static instance = null;

    constructor() {
        if (World.instance) {
            return World.instance;
        }

        const urlParams = new URLSearchParams(window.location.search);
        this.isDebugMode = urlParams.get('debug') === '1';

        this.currentTime = 0; // Minutes since start of the day (00:00)
        this.playerWealth = 0; // Initial wealth

        World.instance = this;
    }

    static getInstance() {
        if (!World.instance) {
            new World();
        }
        return World.instance;
    }

    updateClock() {
        this.currentTime = (this.currentTime + 1) % 1440;
    }

    getFormattedTime() {
        const hours = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
        const minutes = (this.currentTime % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    addWealth(amount) {
        this.playerWealth += amount;
    }

    getWealth() {
        return this.playerWealth;
    }
}
