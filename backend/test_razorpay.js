import dotenv from 'dotenv';
import Razorpay from 'razorpay';

dotenv.config();

console.log('Testing Razorpay credentials...');
console.log('Key ID present:', !!process.env.RAZORPAY_KEY_ID);
console.log('Key Secret present:', !!process.env.RAZORPAY_KEY_SECRET);

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

(async () => {
  try {
    const order = await rzp.orders.create({ amount: 100, currency: 'INR', receipt: `test_${Date.now()}` });
    console.log('Order created:', order);
  } catch (err) {
    console.error('Razorpay test error:', err);
  }
})();
