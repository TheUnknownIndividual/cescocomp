#!/bin/bash
# Update nav bars across all pages to be consistent

# Standard nav HTML (will customize per page)
read -r -d '' NAV_TEMPLATE << 'EOF'
    <nav>
        <div class="nav-container">
            <a href="/" class="logo">CECSO</a>
            <div class="nav-links">
                <a href="/">Home</a>
                <a href="/#map">Energy Map</a>
                <a href="/solar-calculator">Solar Calculator</a>
                <a href="/regulatory-framework">Regulatory Framework</a>
                <button class="dark-mode-toggle" onclick="toggleDarkMode()" title="Toggle Light/Dark Mode" aria-label="Toggle Light/Dark Mode">
                    <img src="lightmode.png" alt="Light Mode" class="light-icon">
                    <img src="darkmode.png" alt="Dark Mode" class="dark-icon">
                </button>
            </div>
        </div>
    </nav>
EOF

echo "Nav update script ready"
