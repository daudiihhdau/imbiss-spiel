// customer.js - Kundenklasse

const BUBBLE_OFFSET_Y = 250; // Konstante für Bubble-Offset
const SPEED = 300; // Konstante für Bewegungsgeschwindigkeit

export class Customer {
    constructor(scene, x, y, spriteKey, order = []) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, spriteKey);
        this.sprite.setScale(1); // Setzt den Kunden auf Originalgröße
        this.sprite.setCollideWorldBounds(false);
        this.desiredItems = order; // Array von gewünschten Bestellungen
        this.purchasedItems = []; // Array von tatsächlich gekauften Artikeln
        this.state = Customer.States.ENTERING; // Initialer Zustand

        // Sprechblase
        this.bubble = scene.add.image(x, y - BUBBLE_OFFSET_Y, 'bubble')
            .setScale(0.5) // Sprechblase kleiner machen
            .setOrigin(0.5)
            .setVisible(true);
        this.bubbleText = scene.add.text(x, y - BUBBLE_OFFSET_Y, this.generateItemsText(this.desiredItems), {
            fontSize: '24px', // Größere Emojiis in der Bubble
            fill: '#000'
        }).setOrigin(0.5);
    }

    static States = {
        ENTERING: 'entering',
        PAYING: 'paying',
        EXITING: 'exiting',
        LEAVING: 'leaving',
    };

    moveTo(targetX) {
        this.sprite.setVelocityX(targetX > this.sprite.x ? SPEED : -SPEED);
        this.targetX = targetX;
        this.targetY = this.sprite.y; // Y-Position bleibt konstant
    }

    isAtTarget() {
        return Math.abs(this.sprite.x - this.targetX) < 10;
    }

    updateBubblePosition() {
        this.bubble.setPosition(this.sprite.x, this.sprite.y - BUBBLE_OFFSET_Y);
        this.bubbleText.setPosition(this.sprite.x, this.sprite.y - BUBBLE_OFFSET_Y);
    }

    generateItemsText(items) {
        return items.map(item => item.emoji).join(' ');
    }

    addPurchasedItem(itemName) {
        const itemIndex = this.desiredItems.findIndex(item => item.name === itemName);
        if (itemIndex !== -1) {
            this.purchasedItems.push(this.desiredItems[itemIndex]);
        }
    }

    showDesiredItems() {
        this.bubbleText.setText(this.generateItemsText(this.desiredItems));
    }

    showPurchasedItems() {
        this.bubbleText.setText(this.generateItemsText(this.purchasedItems));
    }

    destroy() {
        this.sprite.destroy();
        this.bubble.destroy();
        this.bubbleText.destroy();
    }
}
