// customer.js - Kundenlogik

export class Customer {
    static States = {
        ENTERING: 'ENTERING',
        PAYING: 'PAYING',
        EXITING: 'EXITING',
        LEAVING: 'LEAVING',
    };

    constructor(scene, x, y, spriteKey, desiredItems = []) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, spriteKey).setOrigin(0.5);
        this.targetX = null;
        this.state = Customer.States.ENTERING;
        this.desiredItems = desiredItems;
        this.purchasedItems = [];
        this.hasPurchased = false; // Hinzugefügt, um den Einkaufsstatus zu überwachen

        this.bubble = scene.add.image(x, y - 100, 'bubble').setOrigin(0.5).setScale(0.5);
        this.bubbleText = scene.add.text(x, y - 110, '', {
            fontSize: '48px', // Emoji 3x größer dargestellt
            fill: '#000',
            align: 'center'
        }).setOrigin(0.5);
    }

    moveTo(targetX) {
        this.targetX = targetX;
        const speed = 300; // Geschwindigkeit immer 300
        this.sprite.setVelocityX(targetX > this.sprite.x ? speed : -speed);
    }

    isAtTarget() {
        if (this.targetX === null) return false;
        return Math.abs(this.sprite.x - this.targetX) < 5;
    }

    updateBubblePosition() {
        this.bubble.x = this.sprite.x;
        this.bubble.y = this.sprite.y - 100;
        this.bubbleText.x = this.sprite.x;
        this.bubbleText.y = this.sprite.y - 110;
    }

    showDesiredItems() {
        const itemsText = this.desiredItems.map(item => item.emoji).join(' ');
        this.bubbleText.setText(itemsText);
    }

    showPurchasedItems() {
        const itemsText = this.purchasedItems.map(item => item.emoji).join(' ');
        this.bubbleText.setText(itemsText);
    }

    addPurchasedItem(itemName) {
        const item = this.desiredItems.find(i => i.name === itemName);
        if (item) {
            this.purchasedItems.push(item);
        }
    }

    destroy() {
        this.sprite.destroy();
        this.bubble.destroy();
        this.bubbleText.destroy();
    }
}
