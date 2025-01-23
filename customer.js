import { ImbissSoftware } from './InventoryManagement.js';
import { Emotions } from './Constants.js';

export class Customer {
    constructor(scene, x, y, spriteKey, order) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, spriteKey);
        this.sprite.setOrigin(0.5);

        this.state = Customer.States.ENTERING;
        this.order = order;
        this.purchasedItems = [];
        this.waitingTime = 0;
        this.targetX = x;

        this.bubble = scene.add.image(x + 20, y - 250, 'bubble').setOrigin(0.5).setScale(0.5);
        this.bubbleText = scene.add.text(x + 20, y - 260, '', {
            fontSize: '48px',
            fill: '#000',
            align: 'center'
        }).setOrigin(0.5);

        this.emotionText = scene.add.text(x, y - 120, this.getEmotion().emoji, {
            fontSize: '100px',
        });

        this.inventory = ImbissSoftware.getInstance(); // Singleton-Instanz von ImbissSoftware
    }

    updateBubblePosition() {
        this.bubble.x = this.sprite.x + 20;
        this.bubble.y = this.sprite.y - 250;
        this.bubbleText.x = this.sprite.x + 20;
        this.bubbleText.y = this.sprite.y - 260;
        this.emotionText.setPosition(this.sprite.x, this.sprite.y - 120);
        this.emotionText.setText(this.getEmotion().emoji);
    }

    moveTo(targetX) {
        this.targetX = targetX;
    }

    isAtTarget() {
        return Math.abs(this.sprite.x - this.targetX) < 5;
    }

    showDesiredItems() {
        const itemsText = this.order.map(item => item.emoji).join(' ');
        this.bubbleText.setText(itemsText);
    }

    showPurchasedItems() {
        const itemsText = this.purchasedItems.map(item => item.emoji).join(' ');
        this.bubbleText.setText(itemsText);
    }

    addPurchasedItem(itemName) {
        const item = this.order.find(i => i.name === itemName);
        if (item) {
            this.purchasedItems.push(item);
        }
    }

    processOrder() {
        const orderSummary = this.inventory.processOrder(this.order);

        if (orderSummary) {
            orderSummary.items.forEach(({ itemName }) => {
                this.addPurchasedItem(itemName);
            });
            return orderSummary;
        } else {
            console.error('Die Bestellung konnte nicht vollständig bearbeitet werden.');
            return null;
        }
    }

    updatePosition(delta) {
        const speed = 300 * (delta / 1000);
        if (this.sprite.x < this.targetX) {
            this.sprite.x = Math.min(this.sprite.x + speed, this.targetX);
        } else if (this.sprite.x > this.targetX) {
            this.sprite.x = Math.max(this.sprite.x - speed, this.targetX);
        }
    }

    updateWaitingTime(delta) {
        this.waitingTime += delta;
    }

    getEmotion() {
        if (this.state === Customer.States.ENTERING) {
            return Emotions.HUNGRY;
        }
        if (this.state === Customer.States.EXITING) {
            if (this.purchasedItems.length === this.order.length) {
                return Emotions.EXCITED;
            } else {
                return Emotions.HAPPY;
            }
        }
        if (this.state === Customer.States.LEAVING) {
            if (this.purchasedItems.length > 0) {
                return Emotions.DISAPPOINTED;
            } else {
                return Emotions.ANGRY;
            }
        }
        if (this.waitingTime > 5000) {
            return Emotions.TIRED;
        }

        return Emotions.HAPPY;
    }

    hasPurchased() {
        return this.purchasedItems.length > 0 || this.state === Customer.States.EXITING || this.state === Customer.States.LEAVING;
    }

    destroy() {
        this.sprite.destroy();
        this.bubble.destroy();
        this.bubbleText.destroy();
        this.emotionText.destroy();
    }
}

Customer.States = {
    ENTERING: 'ENTERING',
    PAYING: 'PAYING',
    EXITING: 'EXITING',
    LEAVING: 'LEAVING',
};
