// customer.js - Kundenmodell

export class Customer {
    constructor(scene, x, y, spriteKey, order) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, spriteKey);
        this.sprite.setScale(0.7);
        this.state = 'entering';
        this.order = order;

        this.thoughtBubble = scene.add.image(x, y - 90, 'bubble').setScale(0.5).setOrigin(0.5);
        this.orderText = scene.add.text(x, y - 95, this.getOrderText(), {
            fontSize: '48px',
            fill: '#000'
        }).setOrigin(0.5);

        scene.tweens.add({
            targets: [this.thoughtBubble, this.orderText],
            y: '-=2',
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    getOrderText() {
        return this.order.map(item => item.emoji).join(' ');
    }

    updateBubblePosition() {
        this.thoughtBubble.setPosition(this.sprite.x, this.sprite.y - 90);
        this.orderText.setPosition(this.sprite.x, this.sprite.y - 95);
    }

    moveTo(targetX, speed = 300) {
        this.sprite.setVelocityX(speed);
        this.targetX = targetX;
    }

    isAtTarget() {
        return this.sprite.x >= this.targetX;
    }

    destroy() {
        this.thoughtBubble.destroy();
        this.orderText.destroy();
        this.sprite.destroy();
    }
}
