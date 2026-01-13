#!/bin/bash

# Fix image paths in HTML files by adding leading slash
# This fixes 404 errors for navbar images

echo "Fixing image paths in HTML files..."

# Files to fix
files=(
  "solar-calculator.html"
  "regulatory-framework.html"
  "renewable-news.html"
)

# Loop through each file and fix image paths
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Fix logo images
    sed -i '' 's|src="pluginlogo\.png"|src="/pluginlogo.png"|g' "$file"
    sed -i '' 's|src="lightmodeplugin\.png"|src="/lightmodeplugin.png"|g' "$file"
    
    # Fix dark mode toggle images
    sed -i '' 's|src="lightmode\.png"|src="/lightmode.png"|g' "$file"
    sed -i '' 's|src="darkmode\.png"|src="/darkmode.png"|g' "$file"
    
    # Fix LinkedIn images
    sed -i '' 's|src="darkmodelinked\.png"|src="/darkmodelinked.png"|g' "$file"
    sed -i '' 's|src="linkedinlight\.png"|src="/linkedinlight.png"|g' "$file"
    
    echo "✓ Fixed $file"
  else
    echo "⚠ File not found: $file"
  fi
done

echo "✓ All image paths fixed!"
