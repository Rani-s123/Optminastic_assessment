const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Wallet, Order } = require('./models');
const walletService = require('./services');

dotenv.config();

const app = express();
app.use(express.json());

// Middlewares for validation and auth (simulated)
const checkClientId = (req, res, next) => {
  const clientId = req.headers['client-id'];
  if (!clientId) {
    return res.status(401).json({ error: 'Client ID required in headers' });
  }
  req.clientId = clientId;
  next();
};

// 1. Admin Credit Wallet
app.post('/admin/wallet/credit', async (req, res) => {
  const { client_id, amount } = req.body;
  if (!client_id || !amount) {
    return res.status(400).json({ error: 'client_id and amount are required' });
  }

  try {
    const wallet = await walletService.creditWallet(client_id, amount);
    res.json({ message: 'Credit successful', balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Admin Debit Wallet
app.post('/admin/wallet/debit', async (req, res) => {
  const { client_id, amount } = req.body;
  if (!client_id || !amount) {
    return res.status(400).json({ error: 'client_id and amount are required' });
  }

  try {
    const wallet = await walletService.debitWallet(client_id, amount, 'Admin Debit', null);
    res.json({ message: 'Debit successful', balance: wallet.balance });
  } catch (error) {
    res.status(error.message === 'Insufficient balance' ? 400 : 500).json({ error: error.message });
  }
});

// 3. Create Order
app.post('/orders', checkClientId, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  try {
    const order = await walletService.createOrder(req.clientId, amount);
    res.status(201).json(order);
  } catch (error) {
    res.status(error.message === 'Insufficient balance' ? 400 : 500).json({ error: error.message });
  }
});

// 4. Get Order Details
app.get('/orders/:order_id', checkClientId, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.order_id, clientId: req.clientId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({
      amount: order.amount,
      status: order.status,
      fulfillmentId: order.fulfillmentId
    });
  } catch (error) {
    res.status(500).json({ error: 'Invalid order ID or server error' });
  }
});

// 5. Get Wallet Balance
app.get('/wallet/balance', checkClientId, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ clientId: req.clientId });
    res.json({ balance: wallet ? wallet.balance : 0 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
