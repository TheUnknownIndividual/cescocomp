#!/bin/bash

# Update renewable energy news from renewables.az
# Run this script periodically to keep news fresh

echo "🌱 Updating renewable energy news..."

cd "$(dirname "$0")"

# Run the scraper
node fetch-news.js

if [ $? -eq 0 ]; then
    echo "✅ News update completed successfully!"
    echo "📊 Check news-data.json for latest articles"
else
    echo "❌ News update failed!"
    exit 1
fi
