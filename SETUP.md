# 🚀 Setup Guide

## Environment Configuration

Create a `.env` file in the root directory with the following content:

```env
# Notion Relay Worker Configuration
# Copy this content to a new file called .env

# Required: Your Notion Integration Token
# Get this from: https://www.notion.so/my-integrations
# Example: secret_1234567890abcdef1234567890abcdef12345678
NOTION_TOKEN=your_notion_integration_token_here

# Required: Your Notion Database ID  
# Get this from your database URL: https://notion.so/your-page/DATABASE_ID?v=...
# Example: 1234567890abcdef1234567890abcdef
NOTION_DB_ID=your_notion_database_id_here

# Optional: Custom configuration
# MAX_PAYLOAD_SIZE=1048576
# ENABLE_CORS=true
# API_KEY=your_optional_api_key_for_authentication
```

## Quick Setup Steps

1. **Get Notion Integration Token**
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Give it a name and select your workspace
   - Copy the "Internal Integration Token"

2. **Set Up Database**
   - Create a new database in Notion (or use existing)
   - Share the database with your integration
   - Copy the database ID from the URL

3. **Configure Environment**
   - Create `.env` file with the template above
   - Replace placeholder values with your actual credentials

4. **Validate Configuration**
   ```bash
   npm run validate
   ```

5. **Deploy**
   ```bash
   npm run deploy
   ```

## Interactive Setup

For a guided setup experience, run:
```bash
npm run setup
```

This will walk you through the configuration process step by step. 