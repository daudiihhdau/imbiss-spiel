export class EventDispatcher {
    constructor() {
        this.listeners = {};
    }

    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    unsubscribe(event, callback) {
        if (!this.listeners[event]) return;

        this.listeners[event] = this.listeners[event].filter(listener => listener !== callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach((callback) => callback(data));
        }
    }
}