#!/bin/bash

# Add Google Analytics to all HTML pages

ANALYTICS_CODE='<!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-GTDNPY8HYP"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-GTDNPY8HYP');
    </script>
    '

# List of main HTML files to update
FILES=(
    "index.html"
    "renewable-news.html"
    "solar-calculator.html"
    "azerbaijan-rayon-energy-map.html"
    "regulatory-framework.html"
    "policy-detail.html"
)

echo "📊 Adding Google Analytics to all pages..."
echo ""

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        # Check if Google Analytics is already added
        if grep -q "G-GTDNPY8HYP" "$file"; then
            echo "✓ $file - Already has Google Analytics"
        else
            # Add Google Analytics right after <head> tag
            # Using perl for cross-platform compatibility
            perl -i -pe 's/(<head>)/$1\n    <!-- Google Analytics -->\n    <script async src="https:\/\/www.googletagmanager.com\/gtag\/js?id=G-GTDNPY8HYP"><\/script>\n    <script>\n      window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag('\''js'\'', new Date());\n      gtag('\''config'\'', '\''G-GTDNPY8HYP'\'');\n    <\/script>\n    /' "$file"
            echo "✅ $file - Google Analytics added"
        fi
    else
        echo "⚠️  $file - File not found"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Google Analytics setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Tracking ID: G-GTDNPY8HYP"
echo "🔗 View analytics: https://analytics.google.com/"
echo ""
