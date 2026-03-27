const mongoose = require('mongoose');
const { Wallet, Ledger, Order } = require('./models');
const axios = require('axios');

const walletService = {
  async creditWallet(clientId, amount) {
    // Atomic increment/create
    const wallet = await Wallet.findOneAndUpdate(
      { clientId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );

    await new Ledger({
      clientId,
      type: 'CREDIT',
      amount,
      description: 'Admin Credit'
    }).save();

    return wallet;
  },

  async debitWallet(clientId, amount, description, orderId) {
    // Atomic decrement with condition: only if balance >= amount
    const wallet = await Wallet.findOneAndUpdate(
      { clientId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true }
    );

    if (!wallet) {
      throw new Error('Insufficient balance');
    }

    await new Ledger({
      clientId,
      type: 'DEBIT',
      amount,
      description,
      orderId
    }).save();

    return wallet;
  },

  async createOrder(clientId, amount) {
    // 1. Deduct from wallet atomically using findOneAndUpdate with condition
    // This ensures that two concurrent requests won't double-spend
    await this.debitWallet(clientId, amount, 'Order Payment');

    // 2. Create order record
    const order = new Order({
      clientId,
      amount,
      status: 'PENDING'
    });
    await order.save();

    // 3. External fulfillment
    try {
      const response = await axios.post(process.env.FULFILLMENT_API_URL, {
        userId: clientId,
        title: order._id.toString()
      });

      order.fulfillmentId = response.data.id;
      order.status = 'COMPLETED';
      await order.save();
    } catch (error) {
      console.error('Fulfillment failed:', error.message);
      order.status = 'FAILED';
      await order.save();
    }

    return order;
  }
};

module.exports = walletService;
