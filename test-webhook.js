// Test script to simulate the exact webhook payload
const testWebhookPayload = {
  "event": "charge.success",
  "data": {
    "id": 5055196577,
    "domain": "test",
    "status": "success",
    "reference": "scan2tap-1749874918074-2o5hz77915p",
    "amount": 3200,
    "message": null,
    "gateway_response": "Approved",
    "paid_at": "2025-06-14T04:22:06.000Z",
    "created_at": "2025-06-14T04:22:02.000Z",
    "channel": "mobile_money",
    "currency": "GHS",
    "ip_address": "71.40.27.174",
    "metadata": {
      "order_id": "38e60e51-2ede-49ce-a3d3-60fe839e06bf",
      "customer_name": "Richmond Azadze",
      "phone": "",
      "referrer": "https://scan2tap.vercel.app/dashboard/order"
    },
    "fees_breakdown": null,
    "log": null,
    "fees": 63,
    "fees_split": null,
    "authorization": {
      "authorization_code": "AUTH_xvxygp3tgl",
      "bin": "055XXX",
      "last4": "X987",
      "exp_month": "12",
      "exp_year": "9999",
      "channel": "mobile_money",
      "card_type": "",
      "bank": "MTN",
      "country_code": "GH",
      "brand": "Mtn",
      "reusable": false,
      "signature": null,
      "account_name": null,
      "receiver_bank_account_number": null,
      "receiver_bank": null
    },
    "customer": {
      "id": 281129078,
      "first_name": "",
      "last_name": "",
      "email": "richmondazadze1313@gmail.com",
      "customer_code": "CUS_qo0yn8m5eiu36hp",
      "phone": "",
      "metadata": null,
      "risk_action": "default",
      "international_format_phone": null
    },
    "plan": {},
    "subaccount": {},
    "split": {},
    "order_id": null,
    "paidAt": "2025-06-14T04:22:06.000Z",
    "requested_amount": 3200,
    "pos_transaction_data": null,
    "source": {
      "type": "web",
      "source": "checkout",
      "entry_point": "request_inline",
      "identifier": null
    }
  }
};

console.log('=== WEBHOOK PAYLOAD ANALYSIS ===');
console.log('Event:', testWebhookPayload.event);
console.log('Reference:', testWebhookPayload.data.reference);
console.log('Order ID from metadata:', testWebhookPayload.data.metadata?.order_id);
console.log('Customer:', testWebhookPayload.data.metadata?.customer_name);
console.log('Amount:', testWebhookPayload.data.amount, 'pesewas (₵' + (testWebhookPayload.data.amount / 100) + ')');

// Test the webhook logic
const event = testWebhookPayload;
const reference = event.data.reference;
const metadata = event.data.metadata;
const orderId = metadata?.order_id;

console.log('\n=== WEBHOOK PROCESSING SIMULATION ===');
console.log('✅ Event type check:', event.event === 'charge.success' ? 'PASS' : 'FAIL');
console.log('✅ Reference check:', reference ? 'PASS' : 'FAIL', '(' + reference + ')');
console.log('✅ Order ID check:', orderId ? 'PASS' : 'FAIL', '(' + orderId + ')');

if (event.event === 'charge.success' && reference && orderId) {
  console.log('\n🎉 Webhook should process successfully!');
  console.log('Next step: Update order', orderId, 'to confirmed status');
  console.log('Payment reference to store:', reference);
} else {
  console.log('\n❌ Webhook processing would fail');
} 