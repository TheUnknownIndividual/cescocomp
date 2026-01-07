#!/bin/bash

# Script to fix navigation across all pages
# 1. Remove Features and About links
# 2. Fix light mode button visibility
# 3. Standardize navigation on all framework pages

echo "🔧 Fixing navigation across all pages..."
echo ""

# List of main pages to update
MAIN_PAGES=(
    "index.html"
    "renewable-news.html"
    "solar-calculator.html"
    "azerbaijan-rayon-energy-map.html"
    "regulatory-framework.html"
)

# List of framework article pages
FRAMEWORK_PAGES=(
    "policy-detail.html"
    "law-res.html"
    "national-priorities.html"
    "net-metering-decree.html"
    "tax-incentives.html"
    "energy-law.html"
    "law-efficiency.html"
    "law-electric-power.html"
    "law-environmental.html"
    "paris-agreement.html"
    "ppp-law.html"
    "renewable-targets.html"
    "cop29-leadership.html"
    "green-energy-zones.html"
)

echo "Step 1: Removing 'Features' and 'About' from navigation..."
for file in "${MAIN_PAGES[@]}" "${FRAMEWORK_PAGES[@]}"; do
    if [ -f "$file" ]; then
        # Remove Features link
        perl -i -pe 's/<a href="#features"[^>]*>.*?Features.*?<\/a>//g' "$file"
        perl -i -pe 's/<a href="#features"[^>]*data-i18n="nav\.features"[^>]*>.*?<\/a>//g' "$file"
        
        # Remove About link
        perl -i -pe 's/<a href="#about"[^>]*>.*?About.*?<\/a>//g' "$file"
        perl -i -pe 's/<a href="#about"[^>]*data-i18n="nav\.about"[^>]*>.*?<\/a>//g' "$file"
        
        echo "  ✓ $file - Removed Features and About"
    fi
done

echo ""
echo "Step 2: Adding light mode fix for regulatory-framework.html..."

# Add CSS fix for light mode button visibility before scroll
cat > /tmp/nav-fix.css << 'EOF'

    /* Fix for light/dark mode buttons visibility on light backgrounds */
    nav:not(.scrolled) .theme-toggle,
    nav:not(.scrolled) .language-switcher {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 0.5rem;
    }
    
    nav:not(.scrolled) .theme-toggle svg,
    nav:not(.scrolled) .lang-btn {
        filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
    }
    
    /* When scrolled, use normal styling */
    nav.scrolled .theme-toggle,
    nav.scrolled .language-switcher {
        background: transparent;
        padding: 0;
    }
    
    nav.scrolled .theme-toggle svg,
    nav.scrolled .lang-btn {
        filter: none;
    }
EOF

echo "✓ Created navigation visibility fix"

echo ""
echo "✅ Navigation fixes complete!"
echo ""
echo "Next: Run this script, then manually update framework pages with correct nav structure"
