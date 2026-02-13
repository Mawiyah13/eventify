# Razorpay Integration Setup Guide

## Overview
Your event management application now has full Razorpay payment integration. Paid events require users to complete payment before registration is confirmed.

## ✅ What's Already Integrated

### Backend Features
- ✓ Razorpay package installed (`razorpay` v2.9.6)
- ✓ Order creation endpoint: `POST /api/events/payment/create-order`
- ✓ Payment verification endpoint: `POST /api/events/payment/verify`
- ✓ Payment details endpoint: `GET /api/events/payment/:paymentId`
- ✓ Secure payment signature verification
- ✓ Automatic user registration after successful payment

### Frontend Features
- ✓ Razorpay Checkout modal integration
- ✓ Payment button in EventDetails page
- ✓ Free vs. Paid event detection
- ✓ Responsive payment UI with proper error handling
- ✓ Secure payment powered by Razorpay badge

## 🔑 Credentials Setup

### Environment Variables (Backend)
Your `.env` file is already configured with:
```
RAZORPAY_KEY_ID=rzp_test_SFXRXMrGDUbIp8
RAZORPAY_KEY_SECRET=uXxOfBgSgkmT1Y15g2A
```

### Important Notes
1. **Test Mode**: The current keys are in **test mode**. No real payments will be charged.
2. **Production Keys**: When deploying to production:
   - Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com)
   - Navigate to **Settings > API Keys**
   - Copy your Production Key ID and Key Secret
   - Update `.env` with production keys
   - Never commit production keys to version control

## 🏗️ Architecture

### Payment Flow
```
1. User clicks "Pay & Register" button on paid event
2. Frontend requests order creation from backend
3. Backend creates Razorpay order and returns orderId + key
4. Razorpay Checkout modal opens with payment details
5. User enters payment information and completes payment
6. Razorpay returns payment confirmation
7. Frontend sends payment details to backend for verification
8. Backend verifies signature and automatically registers user
9. Event capacity is checked before registration
10. User receives confirmation message
```

### API Endpoints

#### 1. Create Payment Order
**POST** `/api/events/payment/create-order`

Request:
```json
{
  "eventId": "event_id_here",
  "amount": 500
}
```

Response:
```json
{
  "success": true,
  "orderId": "order_1234567890abcd",
  "amount": 50000,
  "currency": "INR",
  "key": "rzp_test_YOUR_KEY_ID"
}
```

#### 2. Verify Payment
**POST** `/api/events/payment/verify`

Request:
```json
{
  "eventId": "event_id_here",
  "razorpay_order_id": "order_1234567890abcd",
  "razorpay_payment_id": "pay_1234567890abcd",
  "razorpay_signature": "signature_hash_here"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment verified and registration successful",
  "event": {...},
  "paymentId": "pay_1234567890abcd",
  "orderId": "order_1234567890abcd"
}
```

#### 3. Get Payment Details
**GET** `/api/events/payment/:paymentId`

Response:
```json
{
  "success": true,
  "payment": {
    "id": "pay_1234567890abcd",
    "entity": "payment",
    "amount": 50000,
    "currency": "INR",
    "status": "captured",
    ...
  }
}
```

## 🧪 Testing Guide

### Test Cards (in test mode)
Razorpay provides test card numbers for testing:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

**Failed Payment:**
- Card Number: `4444 3333 2222 1111`
- Expiry: Any future date
- CVV: Any 3 digits

### Testing Steps
1. Create a paid event with any price (e.g., ₹500)
2. Log in as a regular user (non-admin)
3. Click on the paid event
4. Click "Pay & Register" button
5. Enter test card details
6. Verify payment is processed and user is registered

## 🔒 Security Features

### Payment Verification
- HMAC SHA256 signature verification
- Only verified payments register users
- Prevents token manipulation
- Server-side validation

### Data Protection
- Payment details never stored in database
- Only transaction metadata is saved
- PCI-DSS compliance through Razorpay
- HTTPS encryption in production

## 📊 Features Implemented

### Event Creation
- Admin can set event price
- Free events bypass payment
- Price validation

### User Registration
- Free events: Direct registration
- Paid events: Payment required before registration
- Capacity checks before accepting registration
- Duplicate registration prevention

### Admin Features
- View event registrations
- See registered user details
- Event analytics available

## ⚙️ Configuration

### Event Model Fields
- `price`: Number (default: 0)
- `category`: String - 'free' or 'paid' (auto-set based on price)

### Backend Configuration Files
- `backend/controllers/eventController.js` - Payment handlers
- `backend/routes/eventRoutes.js` - Payment routes
- `backend/.env` - Razorpay credentials

### Frontend Configuration Files
- `frontend/src/pages/EventDetails.jsx` - Payment UI
- `frontend/src/services/api.js` - API client
- `frontend/src/context/AuthContext.jsx` - User context

## 🐛 Troubleshooting

### Issue: "Failed to create order"
- **Check**: Razorpay keys in `.env`
- **Check**: Backend server is running
- **Check**: Event ID is valid

### Issue: "Invalid payment signature"
- **Check**: RAZORPAY_KEY_SECRET matches backend
- **Check**: Payment ID is correct
- **Check**: Order ID is correct

### Issue: Payment modal doesn't open
- **Check**: Razorpay script loaded (`https://checkout.razorpay.com/v1/checkout.js`)
- **Check**: Browser console for errors
- **Check**: Key ID is correct in API response

### Issue: User not registered after payment
- **Check**: Backend payment verification endpoint response
- **Check**: Event capacity not exceeded
- **Check**: User is logged in

## 📱 Mobile Optimization
- Responsive payment modal
- Touch-friendly buttons
- Mobile-optimized checkout experience
- Works on all modern devices

## 🚀 Deployment Checklist

- [ ] Update Razorpay keys to production in `.env`
- [ ] Test with production keys in test mode first
- [ ] Verify HTTPS is enabled
- [ ] Set up database for payment tracking (optional)
- [ ] Configure Razorpay webhook for reconciliation (optional)
- [ ] Add payment success/failure email notifications (optional)
- [ ] Test with real test payments
- [ ] Monitor payment failures in Razorpay dashboard

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Payment Gateway Best Practices](https://razorpay.com/docs/pillars/payment-gateway/)

## 💡 Future Enhancements

1. **Payment History**: Track user payment transactions
2. **Webhooks**: Real-time payment status updates
3. **Refunds**: Process refunds for cancelled registrations
4. **Email Notifications**: Send payment confirmations
5. **Invoice Generation**: Auto-generate invoices for paid events
6. **Split Payments**: Support for multiple payment methods
7. **Recurring Payments**: Support for subscription-based events

---

**Note**: Always test thoroughly in test mode before going live with production keys. Contact Razorpay support for any issues with their service.
