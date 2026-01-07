// Cleanup script to remove duplicate navigation CSS blocks from framework pages
const fs = require('fs');
const path = require('path');

const files = [
    'policy-detail.html',
    'national-priorities.html',
    'law-electric-power.html',
    'net-metering-decree.html',
    'tax-incentives.html',
    'law-environmental.html',
    'energy-law.html',
    'green-energy-zones.html',
    'law-res.html',
    'paris-agreement.html',
    'cop29-leadership.html',
    'renewable-targets.html',
    'ppp-law.html',
    'law-efficiency.html'
];

console.log('🧹 Starting cleanup of duplicate navigation CSS blocks...\n');

let fixedCount = 0;
let errorCount = 0;

files.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Skipped: ${filename} (not found)`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Check if file has the duplicate issue (two nav { blocks before STANDARDIZED section)
        const beforeStandardized = content.split('/* === STANDARDIZED NAVIGATION CSS === */')[0];
        const navMatches = (beforeStandardized.match(/\/\* Navigation \*\/\s*nav \{/g) || []).length;
        
        if (navMatches > 0) {
            // Remove the first navigation block (the duplicate one)
            // Find and remove everything from "/* Navigation */" until just before the STANDARDIZED block
            const standardizedIndex = content.indexOf('/* === STANDARDIZED NAVIGATION CSS === */');
            
            if (standardizedIndex > -1) {
                // Find the first occurrence of "/* Navigation */"
                const firstNavIndex = content.indexOf('/* Navigation */');
                
                if (firstNavIndex > -1 && firstNavIndex < standardizedIndex) {
                    // Find the end of the first nav block - look for the next major CSS comment or the STANDARDIZED marker
                    // We'll look for common section markers that come after nav
                    const searchAfterNav = content.substring(firstNavIndex);
                    
                    // Find the end of the nav section - typically before article/content styles
                    const patterns = [
                        /\/\* Hero Section \*\//,
                        /\/\* Page Header \*\//,
                        /\/\* Content \*\//,
                        /\/\* Article \*\//,
                        /\/\* Main Content \*\//,
                        /\.document-link \{/,
                        /\/\* === STANDARDIZED NAVIGATION CSS === \*\//
                    ];
                    
                    let endIndex = standardizedIndex; // Default to just before STANDARDIZED
                    
                    for (const pattern of patterns) {
                        const match = searchAfterNav.search(pattern);
                        if (match > -1 && (firstNavIndex + match) < endIndex) {
                            // Find the previous closing brace before this pattern
                            const beforePattern = content.substring(firstNavIndex, firstNavIndex + match);
                            const lastBrace = beforePattern.lastIndexOf('}');
                            if (lastBrace > -1) {
                                endIndex = firstNavIndex + lastBrace + 1;
                                break;
                            }
                        }
                    }
                    
                    // Remove the duplicate nav section
                    content = content.substring(0, firstNavIndex) + content.substring(endIndex);
                    
                    // Write the cleaned content back
                    fs.writeFileSync(filePath, content, 'utf-8');
                    console.log(`✅ Fixed: ${filename}`);
                    fixedCount++;
                } else {
                    console.log(`⚠️  Skipped: ${filename} (nav block not found before STANDARDIZED)`);
                }
            } else {
                console.log(`⚠️  Skipped: ${filename} (STANDARDIZED marker not found)`);
            }
        } else {
            console.log(`✓  OK: ${filename} (no duplicate found)`);
        }
        
    } catch (error) {
        console.log(`❌ Error: ${filename} - ${error.message}`);
        errorCount++;
    }
});

console.log(`\n📊 Cleanup Summary:`);
console.log(`   ✅ Fixed: ${fixedCount} files`);
console.log(`   ⚠️  Errors: ${errorCount} files`);
console.log(`   📁 Total processed: ${files.length} files\n`);

if (fixedCount > 0) {
    console.log(`💡 Next steps:`);
    console.log(`   1. Review the changes: git diff`);
    console.log(`   2. Test the pages in your browser`);
    console.log(`   3. Commit: git add . && git commit -m "fix: Remove duplicate nav CSS blocks"`);
    console.log(`   4. Push: git push origin main`);
}
