import { Helper } from './helper.js';

export class InvoiceGenerator {
    static generateInvoice(purchaseList, supplier, customer) {
        const itemsInInvoice = new Map(); // Map, um gleiche Artikel zusammenzufassen
        let totalAmount = 0;

        purchaseList.forEach(({ item, quantity }) => {
            const itemTotal = parseFloat((item.sellPrice * quantity).toFixed(2));
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
                    unitPrice: item.sellPrice,
                    totalPrice: itemTotal,
                });
            }
        });

        if (itemsInInvoice.size === 0) {
            console.warn('Keine Artikel wurden geliefert. Rechnung kann nicht erstellt werden.');
            return null;
        }

        const taxRate = 0.19;
        const netAmount = parseFloat((totalAmount / (1 + taxRate)).toFixed(2));
        const taxAmount = parseFloat((totalAmount - netAmount).toFixed(2));

        const invoice = {
            invoiceId: Helper.generateUUID(),
            date: new Date().toISOString(),
            tag: 'wholesale',
            supplier,
            customer,
            items: Array.from(itemsInInvoice.values()),
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            taxRate,
            taxAmount,
            netAmount,
            summary: {
                totalItems: Array.from(itemsInInvoice.values()).reduce((sum, item) => sum + item.quantity, 0),
                totalPositions: itemsInInvoice.size,
            },
        };

        // Validierung der generierten Rechnung
        InvoiceGenerator.validateInvoice(invoice);

        return invoice;
    }

    /**
     * Validiert die Struktur einer Rechnung.
     * @param {object} invoice - Die zu validierende Rechnung.
     * @throws {Error} - Wirft einen Fehler, wenn die Struktur ungültig ist.
     */
    static validateInvoice(invoice) {
        const requiredProperties = {
            invoiceId: 'string',
            date: 'string',
            tag: 'string',
            supplier: 'object',
            customer: 'object',
            items: 'object', // Array wird als Objekt behandelt
            totalAmount: 'number',
            taxRate: 'number',
            taxAmount: 'number',
            netAmount: 'number',
            summary: 'object',
        };

        const supplierProperties = {
            name: 'string',
            address: 'string',
        };

        const customerProperties = {
            name: 'string',
            address: 'string',
        };

        const summaryProperties = {
            totalItems: 'number',
            totalPositions: 'number',
        };

        const validateProperties = (obj, schema, objName) => {
            Object.entries(schema).forEach(([key, type]) => {
                if (!(key in obj)) {
                    throw new Error(`Fehlendes Property '${key}' in '${objName}'.`);
                }
                if (typeof obj[key] !== type) {
                    throw new Error(`Ungültiger Typ für '${key}' in '${objName}'. Erwartet: ${type}, erhalten: ${typeof obj[key]}.`);
                }
            });
        };

        // Hauptvalidierung
        validateProperties(invoice, requiredProperties, 'Invoice');

        // Validierung der Unterobjekte
        validateProperties(invoice.supplier, supplierProperties, 'Supplier');
        validateProperties(invoice.customer, customerProperties, 'Customer');
        validateProperties(invoice.summary, summaryProperties, 'Summary');

        // Validierung der Artikel
        if (!Array.isArray(invoice.items)) {
            throw new Error(`'items' muss ein Array sein.`);
        }
        invoice.items.forEach((item, index) => {
            const itemSchema = {
                name: 'string',
                quantity: 'number',
                unit: 'string',
                unitPrice: 'number',
                totalPrice: 'number',
            };
            validateProperties(item, itemSchema, `Item[${index}]`);
        });
    }
}
