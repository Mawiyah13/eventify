import dotenv from 'dotenv';

dotenv.config();

const key = process.env.RAZORPAY_KEY_ID || '';
const secret = process.env.RAZORPAY_KEY_SECRET || '';

console.log('RAZORPAY_KEY_ID:', key);
console.log('RAZORPAY_KEY_ID length:', key.length);
console.log('RAZORPAY_KEY_ID JSON:', JSON.stringify(key));
console.log('RAZORPAY_KEY_SECRET length:', secret.length);
console.log('RAZORPAY_KEY_SECRET trimmed length:', secret.trim().length);
console.log('Ends with newline?:', /\n$/.test(secret));
console.log('Contains spaces?:', /\s/.test(secret) ? 'yes' : 'no');
