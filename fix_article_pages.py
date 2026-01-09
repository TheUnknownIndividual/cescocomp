#!/usr/bin/env python3
"""
Script to fix article pages by adding missing <article> and language wrapper tags,
and adding scroll/language switcher event listeners.
"""

import re
import os

# List of files to fix
files_to_fix = [
    'law-res.html',
    'national-priorities.html',
    'law-efficiency.html',
    'ppp-law.html',
    'energy-law.html',
    'law-electric-power.html',
    'law-environmental.html',
    'paris-agreement.html',
    'renewable-targets.html',
    'cop29-leadership.html',
    'green-energy-zones.html',
    'tax-incentives.html'
]

def fix_article_structure(filepath):
    """Fix missing <article> tag and language wrappers"""
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has <article> tag
    if '<article>' in content:
        print(f"  ✓ {filepath} already has <article> tag")
        needs_article_fix = False
    else:
        needs_article_fix = True
    
    # Check if has scroll event listener
    if "window.addEventListener('scroll'" in content:
        print(f"  ✓ {filepath} already has scroll listener")
        needs_scroll_fix = False
    else:
        needs_scroll_fix = True
    
    # Check if has language switcher toggle
    if "language-switcher').forEach" in content:
        print(f"  ✓ {filepath} already has language switcher toggle")
        needs_lang_fix = False
    else:
        needs_lang_fix = True
    
    if not needs_article_fix and not needs_scroll_fix and not needs_lang_fix:
        print(f"  → {filepath} is already fixed, skipping")
        return False
    
    modified = False
    
    # Fix 1: Add <article> and language wrapper
    if needs_article_fix:
        # Find the first <header class="article-header"> after </div> (mobile menu close)
        pattern = r'(    </div>\s*\n\s*<header class="article-header">)'
        replacement = r'    </div>\n\n    <article>\n        <div class="lang-en">\n            <header class="article-header">'
        
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content, count=1)
            print(f"  ✓ Added <article> and language wrapper")
            modified = True
        else:
            print(f"  ✗ Could not find pattern to add <article> tag")
    
    # Fix 2: Add scroll and language switcher event listeners
    if needs_scroll_fix or needs_lang_fix:
        # Find the closing script tag before </body>
        pattern = r'(        }\n    </script>\n</body>)'
        
        additions = []
        if needs_scroll_fix:
            additions.append("""        
        // Add scroll event listener for nav backdrop
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('nav');
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });""")
        
        if needs_lang_fix:
            additions.append("""        
        // Language switcher toggle
        document.querySelectorAll('.language-switcher').forEach(switcher => {
            const btn = switcher.querySelector('.lang-btn');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    switcher.classList.toggle('active');
                });
            }
        });
        
        // Close language dropdown when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.language-switcher').forEach(switcher => {
                switcher.classList.remove('active');
            });
        });""")
        
        replacement = '\n'.join(additions) + '\n    </script>\n</body>'
        
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content, count=1)
            if needs_scroll_fix:
                print(f"  ✓ Added scroll event listener")
            if needs_lang_fix:
                print(f"  ✓ Added language switcher toggle")
            modified = True
        else:
            print(f"  ✗ Could not find pattern to add event listeners")
    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ {filepath} fixed successfully")
        return True
    else:
        return False

def main():
    os.chdir('/Users/user/Desktop/CECSO')
    
    fixed_count = 0
    for filename in files_to_fix:
        if os.path.exists(filename):
            if fix_article_structure(filename):
                fixed_count += 1
        else:
            print(f"  ⚠️  {filename} not found, skipping")
    
    print(f"\n✅ Fixed {fixed_count} out of {len(files_to_fix)} files")

if __name__ == '__main__':
    main()
