import { Helper } from './helper.js';
import { taxRate, InvoiceStatus } from './constants.js';
import { World } from './World.js';

export class InvoiceGenerator {
    static generateInvoice(items, supplier, customer, category, date = null, isExternal = false) {
        const itemsInInvoice = new Map(); // Map, um gleiche Artikel zusammenzufassen
        let totalAmount = 0;

        items.forEach(({ item, quantity }) => {
            const itemTotal = parseFloat((item.price * quantity).toFixed(2));
            totalAmount += itemTotal;

            if (itemsInInvoice.has(item.name)) {
                const existing = itemsInInvoice.get(item.name);
                itemsInInvoice.set(item.name, {
                    ...existing,
                    quantity: existing.quantity + quantity,
                    totalPrice: existing.totalPrice + itemTotal,
                });
            } else {
                itemsInInvoice.set(item.name, {
                    name: item.name,
                    quantity,
                    unit: item.unit,
                    unitPrice: item.price,
                    totalPrice: itemTotal,
                });
            }
        });

        if (itemsInInvoice.size === 0) {
            console.warn('Keine Artikel wurden geliefert. Rechnung kann nicht erstellt werden.');
            return null;
        }

        const netAmount = parseFloat((totalAmount / (1 + taxRate)).toFixed(2));
        const taxAmount = parseFloat((totalAmount - netAmount).toFixed(2));

        const invoice = {
            invoiceId: Helper.generateUUID(),
            date: date ? date : World.getInstance().getDate(),
            isExternal,
            category,
            supplier,
            customer,
            items: Array.from(itemsInInvoice.values()),
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            taxRate,
            taxAmount,
            netAmount,
            status: InvoiceStatus.OPEN
        };
        return invoice;
    }
}
