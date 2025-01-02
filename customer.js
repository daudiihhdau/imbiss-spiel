// customer.js - Kundenklasse ohne Arcade-Physics mit Emotionen

export const Emotions = {
    HAPPY: { emoji: '😊', description: 'glücklich' },
    SAD: { emoji: '😢', description: 'traurig' },
    ANGRY: { emoji: '😡', description: 'wütend' },
    TIRED: { emoji: '😴', description: 'müde' },
    EXCITED: { emoji: '😁', description: 'fröhlich' },
    HUNGRY: { emoji: '🍴', description: 'hungrig' },
    DISAPPOINTED: { emoji: '😞', description: 'enttäuscht' },
};

export class Customer {
    constructor(scene, x, y, spriteKey, order) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, spriteKey);
        this.sprite.setOrigin(0.5);

        this.state = Customer.States.ENTERING;
        this.order = order;
        this.purchasedItems = [];
        this.hasPurchased = false;
        this.waitingTime = 0;
        this.targetX = x;

        this.bubble = scene.add.image(x, y - 100, 'bubble').setOrigin(0.5).setScale(0.5);
        this.bubbleText = scene.add.text(x, y - 110, '', {
            fontSize: '48px', // Emoji 3x größer dargestellt
            fill: '#000',
            align: 'center'
        }).setOrigin(0.5);

        // Emotion als Text anzeigen
        this.emotionText = scene.add.text(x, y - 50, this.getEmotion().emoji, {
            fontSize: '32px',
        });
    }

    updateBubblePosition() {
        this.bubble.x = this.sprite.x;
        this.bubble.y = this.sprite.y - 100;
        this.bubbleText.x = this.sprite.x;
        this.bubbleText.y = this.sprite.y - 110;
        this.emotionText.setPosition(this.sprite.x, this.sprite.y - 50);
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

    updatePosition(delta) {
        const speed = 300 * (delta / 1000); // Geschwindigkeit ohne Physik
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
        if (this.state === Customer.States.PAYING) {
            if (this.purchasedItems.length === this.order.length) {
                return Emotions.HAPPY;
            } else if (this.purchasedItems.length > 0) {
                return Emotions.DISAPPOINTED;
            } else {
                return Emotions.ANGRY;
            }
        }
        if (this.state === Customer.States.EXITING) {
            return Emotions.EXCITED;
        }
        if (this.state === Customer.States.LEAVING) {
            if (this.purchasedItems.length > 0) {
                return Emotions.DISAPPOINTED;
            } else {
                return Emotions.SAD;
            }
        }
        if (this.waitingTime > 5000) {
            return Emotions.TIRED;
        }

        return Emotions.HAPPY; // Standardemotion
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
