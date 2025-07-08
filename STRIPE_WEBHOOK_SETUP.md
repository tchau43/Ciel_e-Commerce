# Stripe Webhook Setup Guide

## 1. Cấu hình Webhook trong Stripe Dashboard

1. Đăng nhập vào [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vào **Developers** > **Webhooks**
3. Click **Add endpoint**
4. Nhập URL: `https://your-domain.com/v1/stripe/webhook`
5. Chọn các events cần thiết:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.processing`
6. Click **Add endpoint**
7. Copy **Signing secret** và thêm vào `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## 2. Test Webhook

### Sử dụng Stripe CLI (Recommended)

```bash
# Install Stripe CLI
# Windows: https://stripe.com/docs/stripe-cli#install
# Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/v1/stripe/webhook
```

### Test với thẻ 4242 4242 4242 4242

- Thẻ này sẽ thành công ngay lập tức
- Webhook `payment_intent.succeeded` sẽ được gọi
- Invoice sẽ được cập nhật thành `paid`

## 3. Debug Webhook

### Kiểm tra logs

```bash
# Xem logs của server
npm run dev

# Hoặc nếu dùng PM2
pm2 logs
```

### Test endpoint

```bash
# Kiểm tra trạng thái payment
GET /v1/stripe/payment-status/{paymentIntentId}
```

## 4. Các trạng thái Payment Intent

- `requires_payment_method`: Chưa thanh toán
- `requires_confirmation`: Đang chờ xác nhận
- `requires_action`: Cần 3D Secure
- `processing`: Đang xử lý
- `requires_capture`: Đã authorize, chờ capture
- `canceled`: Đã hủy
- `succeeded`: Thành công

## 5. Troubleshooting

### Webhook không được gọi

1. Kiểm tra URL webhook trong Stripe Dashboard
2. Đảm bảo server có thể truy cập từ internet (ngrok cho local)
3. Kiểm tra logs của Stripe Dashboard

### Signature verification failed

1. Kiểm tra `STRIPE_WEBHOOK_SECRET` trong `.env`
2. Đảm bảo webhook endpoint nhận raw body
3. Kiểm tra webhook secret trong Stripe Dashboard

### Invoice không được cập nhật

1. Kiểm tra `invoiceId` trong payment intent metadata
2. Kiểm tra logs của webhook handler
3. Test với endpoint `/v1/stripe/payment-status/{paymentIntentId}`
