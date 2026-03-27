const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

const ledgerSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  fulfillmentId: { type: String },
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);
const Ledger = mongoose.model('Ledger', ledgerSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Wallet, Ledger, Order };
