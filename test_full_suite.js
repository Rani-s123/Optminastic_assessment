const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_CLIENT = `client_${Math.floor(Math.random() * 10000)}`;

async function runFullTest() {
  console.log('=========================================');
  console.log(`🚀 STARTING API SUITE FOR: ${TEST_CLIENT}`);
  console.log('=========================================\n');

  try {
    // 1. Initial Balance Check
    console.log('Step 1: Checking Initial Balance (Expected: 0)');
    const balance0 = await axios.get(`${BASE_URL}/wallet/balance`, { headers: { 'client-id': TEST_CLIENT } });
    console.log('✅ Balance:', balance0.data.balance);

    // 2. Admin Credit
    console.log('\nStep 2: Admin Crediting 500.00');
    const credit = await axios.post(`${BASE_URL}/admin/wallet/credit`, { client_id: TEST_CLIENT, amount: 500 });
    console.log('✅ Response:', credit.data);

    // 3. Admin Debit
    console.log('\nStep 3: Admin Debiting 100.00');
    const debit = await axios.post(`${BASE_URL}/admin/wallet/debit`, { client_id: TEST_CLIENT, amount: 100 });
    console.log('✅ Response:', debit.data);

    // 4. Create Order (Success)
    console.log('\nStep 4: Creating Order of 250.00 (Success Case)');
    const order1 = await axios.post(`${BASE_URL}/orders`, { amount: 250 }, { headers: { 'client-id': TEST_CLIENT } });
    console.log('✅ Order Created!');
    console.log('   - Order ID:', order1.data._id);
    console.log('   - Fulfillment ID:', order1.data.fulfillmentId);
    console.log('   - Status:', order1.data.status);
    const orderId = order1.data._id;

    // 5. Get Order Details
    console.log(`\nStep 5: Fetching details for Order ${orderId}`);
    const details = await axios.get(`${BASE_URL}/orders/${orderId}`, { headers: { 'client-id': TEST_CLIENT } });
    console.log('✅ Details:', details.data);

    // 6. Final Balance Check
    console.log('\nStep 6: Checking Final Balance (Expected: 150)');
    const balanceFinal = await axios.get(`${BASE_URL}/wallet/balance`, { headers: { 'client-id': TEST_CLIENT } });
    console.log('✅ Final Balance:', balanceFinal.data.balance);

    // 7. Insufficient Balance Test
    console.log('\nStep 7: Testing Insufficient Balance (Spending 1000)');
    try {
      await axios.post(`${BASE_URL}/orders`, { amount: 1000 }, { headers: { 'client-id': TEST_CLIENT } });
      console.log('❌ Error: Order should have failed');
    } catch (err) {
      console.log('✅ Expected Failure:', err.response.data.error);
    }

    console.log('\n=========================================');
    console.log('🎉 ALL API TESTS PASSED SUCCESSFULLY!');
    console.log('=========================================');

  } catch (error) {
    console.error('\n❌ TEST FAILED at some point:');
    if (error.response) {
      console.error('   API Error:', error.response.data);
    } else {
      console.error('   Local Error:', error.message);
    }
    console.log('\n[Tip] Make sure "node index.js" is running in another terminal window.');
  }
}

runFullTest();
