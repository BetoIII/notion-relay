#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Validates that all required environment variables are set correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Notion Relay Worker Configuration...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('💡 Run: cp .env.example .env');
    console.log('   Then edit .env with your Notion credentials\n');
    process.exit(1);
}

// Load environment variables from .env file
require('dotenv').config();

const errors = [];
const warnings = [];

// Validate NOTION_TOKEN
if (!process.env.NOTION_TOKEN) {
    errors.push('NOTION_TOKEN is required');
} else if (!process.env.NOTION_TOKEN.startsWith('secret_')) {
    warnings.push('NOTION_TOKEN should start with "secret_"');
} else if (process.env.NOTION_TOKEN === 'your_notion_integration_token_here') {
    errors.push('NOTION_TOKEN is still set to placeholder value');
} else {
    console.log('✅ NOTION_TOKEN configured');
}

// Validate NOTION_DB_ID
if (!process.env.NOTION_DB_ID) {
    errors.push('NOTION_DB_ID is required');
} else if (process.env.NOTION_DB_ID === 'your_notion_database_id_here') {
    errors.push('NOTION_DB_ID is still set to placeholder value');
} else if (!/^[a-f0-9-]{32,36}$/i.test(process.env.NOTION_DB_ID)) {
    warnings.push('NOTION_DB_ID format looks unusual (should be 32 hex characters, optionally with hyphens)');
} else {
    console.log('✅ NOTION_DB_ID configured');
}

// Check wrangler.jsonc
const wranglerPath = path.join(process.cwd(), 'wrangler.jsonc');
if (!fs.existsSync(wranglerPath)) {
    errors.push('wrangler.jsonc file not found');
} else {
    console.log('✅ wrangler.jsonc found');
    
    try {
        const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
        // Remove comments for JSON parsing
        const cleanedContent = wranglerContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        const wranglerConfig = JSON.parse(cleanedContent);
        
        if (wranglerConfig.name === 'notion-relay') {
            warnings.push('Consider changing the worker name in wrangler.jsonc to something unique');
        }
    } catch (error) {
        errors.push('wrangler.jsonc is not valid JSON');
    }
}

// Display results
console.log('\n📋 Validation Results:');

if (errors.length > 0) {
    console.log('\n❌ Errors (must fix):');
    errors.forEach(error => console.log(`   • ${error}`));
}

if (warnings.length > 0) {
    console.log('\n⚠️  Warnings (should review):');
    warnings.forEach(warning => console.log(`   • ${warning}`));
}

if (errors.length === 0 && warnings.length === 0) {
    console.log('\n🎉 Configuration looks good! Ready to deploy.');
    console.log('\n💡 Next steps:');
    console.log('   • npm run test');
    console.log('   • npm run deploy');
} else if (errors.length === 0) {
    console.log('\n✅ Configuration is valid (with warnings above)');
    console.log('\n💡 You can deploy with: npm run deploy');
}

console.log('\n📚 Need help?');
console.log('   • Documentation: README.md');
console.log('   • Notion Setup: https://www.notion.so/my-integrations');
console.log('   • Issues: https://github.com/yourusername/notion-relay-worker/issues');

process.exit(errors.length > 0 ? 1 : 0); 