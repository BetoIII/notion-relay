# Webhook Integration Examples

This document provides real-world examples of integrating the Notion Relay Worker with popular webhook sources.

## 🐙 GitHub Webhooks

### Setup
1. Go to your GitHub repository settings
2. Add webhook: `https://your-worker.workers.dev`
3. Select events you want to track

### Example Payloads

#### Push Event
```json
{
  "callerName": "GitHub Push",
  "repository": "user/repo-name", 
  "pusher": "john-doe",
  "commits": 3,
  "branch": "main",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Issue Event
```json
{
  "callerName": "GitHub Issue",
  "action": "opened",
  "issue_title": "Bug in user authentication",
  "issue_number": 42,
  "author": "jane-smith",
  "repository": "user/repo-name",
  "labels": ["bug", "high-priority"]
}
```

#### Pull Request
```json
{
  "callerName": "GitHub PR", 
  "action": "opened",
  "pr_title": "Add new feature",
  "pr_number": 15,
  "author": "contributor",
  "repository": "user/repo-name",
  "reviewers": ["maintainer1", "maintainer2"]
}
```

## 💳 Stripe Webhooks

### Setup
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-worker.workers.dev`
3. Select events to monitor

### Example Payloads

#### Payment Success
```json
{
  "callerName": "Stripe Payment",
  "event_type": "payment_intent.succeeded",
  "amount": 2999,
  "currency": "usd",
  "customer_email": "customer@example.com",
  "payment_method": "card",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Subscription Created
```json
{
  "callerName": "Stripe Subscription",
  "event_type": "customer.subscription.created",
  "customer_email": "customer@example.com",
  "plan_name": "Pro Plan",
  "amount": 2999,
  "interval": "month",
  "status": "active"
}
```

#### Failed Payment
```json
{
  "callerName": "Stripe Payment Failed",
  "event_type": "invoice.payment_failed",
  "customer_email": "customer@example.com",
  "amount": 2999,
  "attempt_count": 2,
  "next_payment_attempt": "2024-01-16T10:30:00Z"
}
```

## 📧 Form Submissions

### Contact Form
```html
<form id="contact-form">
  <input name="name" required>
  <input name="email" type="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>

<script>
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  await fetch('https://your-worker.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callerName: 'Contact Form',
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      timestamp: new Date().toISOString()
    })
  });
  
  alert('Message sent!');
});
</script>
```

### Newsletter Signup
```json
{
  "callerName": "Newsletter Signup",
  "email": "subscriber@example.com",
  "source": "homepage",
  "interests": ["product-updates", "newsletters"],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Survey Response
```json
{
  "callerName": "Customer Survey",
  "customer_id": "cust_123",
  "rating": 8,
  "recommend": true,
  "feedback": "Great product, could use more features",
  "survey_type": "nps",
  "completion_time": 120
}
```

## 📱 Mobile App Events

### User Registration
```json
{
  "callerName": "App Registration",
  "user_id": "user_12345",
  "email": "newuser@example.com",
  "signup_method": "google",
  "platform": "ios",
  "app_version": "1.2.3",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Feature Usage
```json
{
  "callerName": "Feature Usage",
  "user_id": "user_12345",
  "feature": "premium_export",
  "usage_count": 1,
  "platform": "android",
  "app_version": "1.2.3",
  "session_duration": 300
}
```

### Error Tracking
```json
{
  "callerName": "App Error",
  "user_id": "user_12345",
  "error_type": "network_timeout",
  "error_message": "Request timeout after 30s",
  "platform": "ios",
  "app_version": "1.2.3",
  "stack_trace": "NetworkManager.swift:42"
}
```

## 🛒 E-commerce Events

### Order Completed
```json
{
  "callerName": "Order Complete",
  "order_id": "order_789",
  "customer_email": "buyer@example.com",
  "total_amount": 149.99,
  "items_count": 3,
  "payment_method": "credit_card",
  "shipping_method": "standard"
}
```

### Cart Abandonment
```json
{
  "callerName": "Cart Abandoned",
  "session_id": "sess_456",
  "customer_email": "potential@example.com",
  "cart_value": 89.99,
  "items_count": 2,
  "time_in_cart": 15,
  "last_page": "/checkout"
}
```

## 🔔 Monitoring & Alerts

### Server Health
```json
{
  "callerName": "Health Check",
  "service": "api-server",
  "status": "degraded",
  "response_time": 1200,
  "error_rate": 0.05,
  "cpu_usage": 78,
  "memory_usage": 65
}
```

### Database Alert
```json
{
  "callerName": "Database Alert",
  "alert_type": "slow_query",
  "query_time": 2.5,
  "affected_table": "users",
  "query_type": "SELECT",
  "server": "db-prod-01"
}
```

## 🎮 Gaming Analytics

### Player Action
```json
{
  "callerName": "Player Action",
  "player_id": "player_999",
  "action": "level_completed",
  "level": 15,
  "score": 8500,
  "time_taken": 240,
  "difficulty": "normal"
}
```

### In-App Purchase
```json
{
  "callerName": "IAP Purchase",
  "player_id": "player_999",
  "item": "coin_pack_large",
  "price": 4.99,
  "currency": "USD",
  "platform": "ios",
  "player_level": 12
}
```

## 🏢 CRM Integration

### Lead Capture
```json
{
  "callerName": "New Lead",
  "lead_source": "website_demo",
  "company": "Acme Corp",
  "contact_name": "John Smith",
  "email": "john@acme.com",
  "phone": "+1-555-0123",
  "interest_level": "high",
  "requested_demo": true
}
```

### Deal Update
```json
{
  "callerName": "Deal Update",
  "deal_id": "deal_456",
  "stage": "proposal_sent",
  "value": 50000,
  "probability": 75,
  "expected_close": "2024-02-15",
  "sales_rep": "sarah@company.com"
}
```

## 🔧 Testing Webhooks

### Using curl
```bash
# GitHub-style webhook
curl -X POST https://your-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "callerName": "GitHub Test",
    "repository": "test/repo",
    "action": "push",
    "author": "test-user"
  }'

# Stripe-style webhook  
curl -X POST https://your-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "callerName": "Stripe Test",
    "event_type": "payment_intent.succeeded", 
    "amount": 1000,
    "currency": "usd"
  }'
```

### Using Postman
1. Create new POST request
2. URL: `https://your-worker.workers.dev`
3. Headers: `Content-Type: application/json`
4. Body: Raw JSON with your test payload

### Webhook Testing Tools
- **ngrok**: Expose local development server
- **webhook.site**: Capture and inspect webhooks
- **Postman Mock Server**: Create webhook endpoints for testing

## 📋 Best Practices

### Data Structure
- Always include `callerName` for easy identification
- Add timestamps for tracking
- Include unique identifiers when available
- Keep payloads focused and relevant

### Error Handling
- Implement retry logic in webhook senders
- Monitor webhook delivery success rates
- Log failed webhook attempts
- Set up alerts for webhook failures

### Security
- Validate webhook signatures when possible
- Use HTTPS only
- Consider API keys for authentication
- Rate limit webhook endpoints

### Performance
- Keep payloads small and focused
- Batch related events when possible
- Use async processing for heavy workloads
- Monitor response times

---

## 💡 Custom Integration Ideas

- **Slack notifications** → Notion task tracking
- **Google Analytics events** → Notion reporting
- **Calendar events** → Notion meeting notes
- **Customer support tickets** → Notion knowledge base
- **Marketing campaigns** → Notion performance tracking
- **IoT sensor data** → Notion monitoring dashboard

The Notion Relay Worker makes it easy to pipe any JSON data into your Notion workspace. Get creative with your integrations! 