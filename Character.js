import { Emotions } from './Constants.js';

export class Character {
    constructor(spriteKey, firstName, lastName, age) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.emotion = Emotions.HAPPY;
        this.orderRequest = []
        this.purchasedItems = []
        //TODO: add Geldbörse

        // Position und Phase
        this.position = { x: -50, y: 100 + Math.random() * 200 };
        this.phase = 'onEntering'; // Startphase

        // Rendering-Komponente
        this.sprite = spriteKey;
    }
}
