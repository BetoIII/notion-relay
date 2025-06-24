# Notion Relay Worker

🚀 **A lightweight Cloudflare Worker that instantly sends any JSON payload to your Notion database**

Perfect for webhooks, form submissions, API integrations, and any scenario where you need to quickly pipe data into Notion.

## ✨ Features

- **Universal JSON Support**: Send any JSON object - the worker automatically creates matching Notion properties
- **Auto-Schema Detection**: Dynamically adapts to your data structure
- **Smart Type Mapping**: Automatically maps JSON types to appropriate Notion property types
- **Zero Configuration**: Works out of the box with minimal setup
- **Error Handling**: Comprehensive error reporting and request validation
- **Fast & Reliable**: Built on Cloudflare's edge network

## 🎯 Use Cases

- **Webhook Receiver**: Capture data from GitHub, Stripe, Zapier, etc.
- **Form Backend**: Process form submissions directly to Notion
- **API Integration**: Bridge any API to your Notion workspace
- **Data Collection**: Gather analytics, logs, or user feedback
- **Event Tracking**: Monitor application events in real-time

## 🚀 Quick Start

### 1. Fork & Clone
```bash
git clone https://github.com/yourusername/notion-relay-worker.git
cd notion-relay-worker
npm install
```

### 2. Set Up Notion
1. Create a new [Notion integration](https://www.notion.so/my-integrations)
2. Copy your **Internal Integration Token**
3. Create a database in Notion and share it with your integration
4. Copy your **Database ID** from the URL

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
NOTION_TOKEN=your_notion_integration_token_here
NOTION_DB_ID=your_notion_database_id_here
```

### 4. Deploy to Cloudflare Workers
```bash
npm run deploy
```

### 5. Test Your Worker
```bash
curl -X POST https://your-worker.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Entry", "email": "test@example.com", "message": "Hello World!"}'
```

## 📖 How It Works

1. **Receive JSON**: Worker accepts any POST request with JSON data
2. **Analyze Structure**: Examines your JSON to understand the data types
3. **Update Schema**: Automatically adds new properties to your Notion database if needed
4. **Map & Send**: Converts JSON fields to appropriate Notion property types
5. **Confirm**: Returns success/error status

### Data Type Mapping

| JSON Type | Notion Property |
|-----------|----------------|
| `string` | Rich Text |
| `number` | Number |
| `boolean` | Checkbox |
| `YYYY-MM-DD` | Date |
| `object` | Rich Text (JSON stringified) |

## 🛠️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NOTION_TOKEN` | ✅ | Your Notion integration token |
| `NOTION_DB_ID` | ✅ | Target Notion database ID |

### Advanced Configuration

You can customize the worker behavior by modifying `wrangler.jsonc`:

```json
{
  "name": "your-notion-relay",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01",
  "vars": {
    "MAX_PAYLOAD_SIZE": "1048576",
    "ENABLE_CORS": "true"
  }
}
```

## 📝 API Reference

### POST /
Send JSON data to your Notion database.

**Request:**
```bash
curl -X POST https://your-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "callerName": "John Doe",
    "email": "john@example.com", 
    "score": 95,
    "completed": true,
    "date": "2024-01-15"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Data saved to Notion"
}
```

### Special Fields

| Field | Purpose |
|-------|---------|
| `callerName` | Used as the page title in Notion |

## 🔒 Security

- **Environment Variables**: Keep your Notion token secure using Cloudflare Workers secrets
- **Input Validation**: All JSON payloads are validated before processing
- **Rate Limiting**: Cloudflare automatically provides DDoS protection
- **HTTPS Only**: All communication is encrypted

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Manual testing with different payloads:
```bash
./test/smoke-test.sh https://your-worker.workers.dev
```

## 🚀 Deployment Options

### Cloudflare Workers (Recommended)
```bash
npm run deploy
```

### Custom Domain
1. Add a custom domain in Cloudflare Workers dashboard
2. Update your DNS settings
3. Deploy with custom routes

## 🛠️ Development

### Local Development
```bash
npm run dev
```

### Custom Modifications
The worker is designed to be easily customizable:

- **Custom Field Mapping**: Edit the type mapping logic in `src/index.js`
- **Authentication**: Add API key validation
- **Multiple Databases**: Route to different databases based on payload
- **Data Transformation**: Pre-process data before sending to Notion

## 📚 Examples

### Webhook Integration
```javascript
// GitHub webhook payload
{
  "callerName": "GitHub Event",
  "repository": "my-repo",
  "action": "push",
  "author": "john-doe",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Form Submission
```javascript
// Contact form
{
  "callerName": "Contact Form",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Partnership Inquiry",
  "message": "I'd like to discuss...",
  "urgent": true
}
```

### Analytics Event
```javascript
// User analytics
{
  "callerName": "User Event",
  "event": "button_click",
  "user_id": "user_123",
  "page": "/pricing",
  "timestamp": "2024-01-15",
  "session_duration": 120
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/notion-relay-worker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/notion-relay-worker/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/notion-relay-worker/wiki)

## ⭐ Show Your Support

If this project helped you, please give it a ⭐ on GitHub!

---

**Built with ❤️ for the developer community** 