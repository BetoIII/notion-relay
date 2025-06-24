# Deployment Guide

This guide covers different deployment scenarios and configurations for the Notion Relay Worker.

## 🚀 Quick Deployment

### Prerequisites
- Cloudflare account
- Notion workspace with integration
- Node.js 18+ installed

### 1. Basic Deployment
```bash
# Clone and setup
git clone https://github.com/yourusername/notion-relay-worker.git
cd notion-relay-worker
npm install

# Configure (interactive)
npm run setup

# Deploy
npm run deploy
```

## 🔧 Configuration Options

### Environment Variables

#### Required
```env
NOTION_TOKEN=secret_your_integration_token
NOTION_DB_ID=your_database_id_here
```

#### Optional
```env
# Maximum request payload size (default: 1MB)
MAX_PAYLOAD_SIZE=1048576

# Enable CORS headers
ENABLE_CORS=true

# API key for authentication
API_KEY=your_api_key_here

# Custom worker name
WORKER_NAME=my-notion-relay
```

### Wrangler Configuration

#### Basic wrangler.jsonc
```json
{
  "name": "notion-relay-worker",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01",
  "vars": {
    "MAX_PAYLOAD_SIZE": "1048576",
    "ENABLE_CORS": "true"
  }
}
```

#### Advanced Configuration
```json
{
  "name": "notion-relay-worker",
  "main": "src/index.js", 
  "compatibility_date": "2024-01-01",
  "vars": {
    "MAX_PAYLOAD_SIZE": "2097152",
    "ENABLE_CORS": "true",
    "LOG_LEVEL": "info"
  },
  "routes": [
    { "pattern": "api.yourdomain.com/notion/*", "zone_name": "yourdomain.com" }
  ],
  "limits": {
    "cpu_ms": 50
  }
}
```

## 🌐 Deployment Scenarios

### 1. Personal/Development Use
```bash
# Use default settings
npm run setup
npm run deploy
```

### 2. Team/Organization Use
```bash
# Customize worker name
npm run setup
# Enter: my-team-notion-relay

# Deploy with team-specific settings
npm run deploy
```

### 3. Production Environment
```bash
# Use environment-specific configuration
cp wrangler.jsonc wrangler.production.jsonc

# Edit production config
# - Update worker name
# - Add custom routes
# - Configure limits

# Deploy to production
npx wrangler deploy --config wrangler.production.jsonc
```

### 4. Multiple Environments
```bash
# Staging
npx wrangler deploy --env staging

# Production  
npx wrangler deploy --env production
```

## 🔐 Secrets Management

### Using Wrangler Secrets
```bash
# Set secrets (recommended for production)
npx wrangler secret put NOTION_TOKEN
npx wrangler secret put NOTION_DB_ID

# Optional: API key for authentication
npx wrangler secret put API_KEY
```

### Using Environment Variables
```bash
# For local development only
echo "NOTION_TOKEN=secret_your_token" >> .env
echo "NOTION_DB_ID=your_db_id" >> .env
```

## 🏗️ Custom Domain Setup

### 1. Add Route to Wrangler Config
```json
{
  "routes": [
    { 
      "pattern": "api.yourdomain.com/webhook/*", 
      "zone_name": "yourdomain.com" 
    }
  ]
}
```

### 2. Configure DNS
```bash
# Add CNAME record in Cloudflare dashboard:
# Name: api
# Content: yourdomain.com
# Proxy: Enabled
```

### 3. Deploy with Routes
```bash
npx wrangler deploy
```

## 🔄 CI/CD Deployment

### GitHub Actions Setup

#### 1. Add Secrets to GitHub
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `NOTION_TOKEN`: Your Notion integration token  
- `NOTION_DB_ID`: Your database ID

#### 2. Configure Workflow
The included `.github/workflows/ci.yml` handles:
- Automated testing
- Security scanning
- Staging deployment (develop branch)
- Production deployment (main branch)

#### 3. Deployment Triggers
```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main
```

## 📊 Monitoring & Logging

### Built-in Logging
The worker includes comprehensive logging:
```javascript
console.log('Received payload:', JSON.stringify(payload));
console.log('Notion response status:', notionRes.status);
```

### Cloudflare Analytics
- View metrics in Cloudflare Workers dashboard
- Monitor request volume, error rates, duration
- Set up alerts for errors

### Custom Monitoring
```javascript
// Add to worker for custom metrics
if (env.ANALYTICS_TOKEN) {
  // Send metrics to your analytics service
  await fetch('https://analytics.yourdomain.com/metrics', {
    method: 'POST',
    body: JSON.stringify({
      timestamp: Date.now(),
      status: response.status,
      duration: Date.now() - startTime
    })
  });
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Missing NOTION_TOKEN" Error
```bash
# Check if secret is set
npx wrangler secret list

# Set the secret
npx wrangler secret put NOTION_TOKEN
```

#### 2. "Database access error (401)"
- Verify Notion token is correct
- Ensure database is shared with integration
- Check if token has expired

#### 3. "Database access error (404)"
- Verify database ID is correct
- Check database still exists
- Ensure integration has access

#### 4. Deployment Fails
```bash
# Check wrangler configuration
npx wrangler validate

# Check authentication
npx wrangler whoami

# Try with verbose logging
npx wrangler deploy --compatibility-date 2024-01-01 --verbose
```

### Testing Deployment
```bash
# Test with curl
curl -X POST https://your-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"test": "deployment", "timestamp": "'$(date -Iseconds)'"}'

# Run full smoke test
./test/smoke-test.sh https://your-worker.workers.dev
```

### Rollback
```bash
# List deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback [deployment-id]
```

## 📈 Scaling Considerations

### Request Limits
- Cloudflare Workers: 100,000 requests/day (free tier)
- CPU time: 10ms per request (free tier)
- Memory: 128MB per request

### Notion API Limits
- Rate limit: 3 requests per second
- Consider implementing queuing for high-volume use

### Performance Optimization
```javascript
// Batch multiple requests
const batch = payloads.map(payload => 
  createNotionPage(payload, env)
);
await Promise.all(batch);
```

## 🔧 Advanced Configuration

### Multiple Database Support
```javascript
// Route to different databases based on payload
const databaseId = payload.eventType === 'user' 
  ? env.USER_DB_ID 
  : env.EVENT_DB_ID;
```

### Custom Field Mapping
```javascript
// Custom property type mapping
const customTypeMapping = {
  email: 'email',
  phone: 'phone_number', 
  website: 'url'
};
```

### Authentication
```javascript
// Add API key authentication
if (env.API_KEY && request.headers.get('Authorization') !== `Bearer ${env.API_KEY}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

---

## 📞 Support

If you encounter issues during deployment:

1. **Check the logs**: `npx wrangler tail`
2. **Validate configuration**: `npm run validate`  
3. **Test locally**: `npm run dev`
4. **Review documentation**: README.md and this guide
5. **Open an issue**: GitHub Issues for bug reports

For urgent production issues, include:
- Worker name and deployment ID
- Error messages and timestamps
- Request payload (sanitized)
- Expected vs actual behavior 