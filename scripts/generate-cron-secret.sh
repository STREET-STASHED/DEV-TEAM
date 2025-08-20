#!/bin/bash

# Generate a secure random secret for cron job authentication
echo "Generating cron secret..."
SECRET=$(openssl rand -base64 32)

echo "✅ Generated CRON_SECRET:"
echo "$SECRET"
echo ""
echo "📝 Add this to your .env.local file:"
echo "CRON_SECRET=$SECRET"
echo ""
echo "🔒 Keep this secret secure and don't commit it to version control!"
