import { InvoiceStatus } from './constants.js';

class AccountingSoftware {
  constructor() {
    this.invoices = [];
    this.dbKey = 'invoicesDB';
    this.loadInvoicesFromDB();
  }

  // Load invoices from browser storage
  loadInvoicesFromDB() {
    const storedInvoices = localStorage.getItem(this.dbKey);
    this.invoices = storedInvoices ? JSON.parse(storedInvoices) : [];
    console.log(`${this.invoices.length} invoices loaded from the browser database.`);
  }

  // Save invoices to browser storage
  saveInvoicesToDB() {
    localStorage.setItem(this.dbKey, JSON.stringify(this.invoices));
    console.log('Invoices saved to the browser database.');
  }

  addInvoice(invoice) {
      this.invoices.push(invoice);
      this.saveInvoicesToDB();
      console.log('Invoice added: ', invoice);
  }

  // Mark an invoice as paid
  markInvoicePaid(invoiceNumber) {
    const invoice = this.invoices.find(i => i.invoiceNumber === invoiceNumber);
    if (!invoice) {
      console.error(`Invoice #${invoiceNumber} not found`);
      return;
    }
    invoice.status = InvoiceStatus.PAID;
    this.saveInvoicesToDB();
    console.log(`Invoice #${invoiceNumber} marked as paid`);
  }
}
