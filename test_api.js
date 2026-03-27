const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const CLIENT_ID = 'test_user_789';

async function runTests() {
  console.log('--- Starting Wallet System Tests ---\n');

  try {
    // 1. Credit Wallet
    console.log('1. Crediting 1000 to wallet...');
    const creditRes = await axios.post(`${BASE_URL}/admin/wallet/credit`, {
      client_id: CLIENT_ID,
      amount: 1000
    });
    console.log('Success:', creditRes.data);

    // 2. Check Balance
    console.log('\n2. Checking balance...');
    const balanceRes = await axios.get(`${BASE_URL}/wallet/balance`, {
      headers: { 'client-id': CLIENT_ID }
    });
    console.log('Current Balance:', balanceRes.data.balance);

    // 3. Create Order
    console.log('\n3. Creating order of 450...');
    const orderRes = await axios.post(`${BASE_URL}/orders`, {
      amount: 450
    }, {
      headers: { 'client-id': CLIENT_ID }
    });
    console.log('Order Done Header:', orderRes.data);

    // 4. Check Balance Again
    console.log('\n4. Checking balance after order...');
    const balanceRes2 = await axios.get(`${BASE_URL}/wallet/balance`, {
      headers: { 'client-id': CLIENT_ID }
    });
    console.log('Remaining Balance:', balanceRes2.data.balance);

    // 5. Test Insufficient Balance
    console.log('\n5. Testing insufficient balance (trying to spend 10,000)...');
    try {
      await axios.post(`${BASE_URL}/orders`, {
        amount: 10000
      }, {
        headers: { 'client-id': CLIENT_ID }
      });
    } catch (err) {
      console.log('Expected Error:', err.response.data.error);
    }

    console.log('\n--- Tests Completed Successfully ---');
  } catch (error) {
    console.error('\nTests Failed:', error.response ? error.response.data : error.message);
    console.log('\nMake sure the server is running on port 3000 (node index.js)');
  }
}

runTests();
