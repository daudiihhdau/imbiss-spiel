// price_adjustment.js - Preisänderungsszene

import { Items } from './items.js';

export class PriceAdjustmentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PriceAdjustmentScene' });
    }

    preload() {
        this.load.html('priceForm', 'price_adjustment_form.html');
    }

    create() {
        this.add.text(10, 10, 'Preise Anpassen', { fontSize: '24px', fill: '#000' });

        const formElement = this.add.dom(this.scale.width / 2, this.scale.height / 2).createFromCache('priceForm');

        formElement.addListener('submit');
        formElement.on('submit', event => {
            event.preventDefault();

            const formData = new FormData(formElement.getChildByName('priceForm'));

            for (let [key, value] of formData.entries()) {
                if (Items.getItems()[key]) {
                    Items.getItems()[key].sellPrice = parseFloat(value);
                }
            }

            this.scene.start('MainScene'); // Zurück zum Hauptspiel
        });
    }
}
