import { Emotions } from './Constants.js';

export class Character {
    constructor(firstName, lastName, age) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.emotion = Emotions.HAPPY;
        this.orderRequest = []
        this.purchasedItems = []
        //TODO: add Geldbörse
    }
}
