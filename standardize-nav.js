const fs = require('fs');
const path = require('path');

const files = [
    'policy-detail.html',
    'law-res.html',
    'national-priorities.html',
    'net-metering-decree.html',
    'tax-incentives.html',
    'energy-law.html',
    'law-efficiency.html',
    'law-electric-power.html',
    'law-environmental.html',
    'paris-agreement.html',
    'ppp-law.html',
    'renewable-targets.html',
    'cop29-leadership.html',
    'green-energy-zones.html'
];

const css = `
        /* === STANDARDIZED NAVIGATION CSS === */
        nav {
            background: transparent;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            padding: 1rem 0;
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
            border-bottom: 1px solid transparent;
            transition: all 0.3s ease;
        }

        nav.scrolled {
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        body.light-mode nav.scrolled {
            background: rgba(255, 255, 255, 0.8);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
        }
        
        .logo-img {
            height: 50px;
            width: auto;
            object-fit: contain;
        }
        
        /* Ensure logo visibility in modes */
        .light-mode-logo { display: none !important; }
        .dark-mode-logo { display: block !important; }
        body.light-mode .light-mode-logo { display: block !important; }
        body.light-mode .dark-mode-logo { display: none !important; }

        .nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
        }

        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            position: relative;
        }

        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--gradient-primary);
            transition: width 0.3s ease;
        }

        .nav-links a:hover {
            color: var(--text-primary);
        }

        .nav-links a:hover::after {
            width: 100%;
        }

        /* Dark Mode Toggle */
        .dark-mode-toggle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.05);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .dark-mode-toggle:hover {
            transform: scale(1.1) rotate(15deg);
            box-shadow: 0 6px 20px rgba(0, 153, 204, 0.3);
        }

        .dark-mode-toggle:active {
            transform: scale(0.95) rotate(-15deg);
        }

        .dark-mode-toggle img {
            width: 22px;
            height: 22px;
            object-fit: contain;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            position: absolute;
        }

        .dark-mode-toggle .light-icon {
            opacity: 0;
            transform: rotate(180deg) scale(0);
        }

        .dark-mode-toggle .dark-icon {
            opacity: 1;
            transform: rotate(0deg) scale(1);
        }

        body.light-mode .dark-mode-toggle {
            border-color: rgba(0, 0, 0, 0.2);
            background: rgba(0, 0, 0, 0.05);
        }

        body.light-mode .dark-mode-toggle .light-icon {
            opacity: 1;
            transform: rotate(0deg) scale(1);
        }

        body.light-mode .dark-mode-toggle .dark-icon {
            opacity: 0;
            transform: rotate(-180deg) scale(0);
        }
        
        /* Icon visibility override */
        .light-icon { display: none !important; }
        .dark-icon { display: block !important; }
        body.light-mode .light-icon { display: block !important; }
        body.light-mode .dark-icon { display: none !important; }

        @keyframes ripple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
        }

        .dark-mode-toggle::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: var(--az-blue);
            opacity: 0;
            pointer-events: none;
        }

        .dark-mode-toggle.clicked::after {
            animation: ripple 0.6s ease-out;
        }

        /* Language Switcher */
        .language-switcher {
            position: relative;
        }

        .lang-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: var(--text-primary);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        body.light-mode .lang-btn {
            background: rgba(0, 0, 0, 0.05);
            border-color: rgba(0, 0, 0, 0.1);
        }

        .lang-btn:hover {
            background: rgba(111, 145, 168, 0.2);
            border-color: var(--az-blue);
        }

        .lang-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 0.5rem;
            background: var(--card-bg);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 0.5rem;
            min-width: 120px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        body.light-mode .lang-dropdown {
            background: white;
            border-color: rgba(0, 0, 0, 0.1);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .language-switcher.active .lang-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .lang-dropdown button {
            width: 100%;
            background: transparent;
            border: none;
            color: var(--text-primary);
            padding: 0.75rem 1rem;
            text-align: left;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s ease;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .lang-dropdown button:hover {
            background: rgba(111, 145, 168, 0.2);
        }
        
        /* Fix for button visibility on light backgrounds (before scroll) */
        nav:not(.scrolled) .dark-mode-toggle,
        nav:not(.scrolled) .language-switcher {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 8px;
            padding: 0.25rem;
        }
        
        nav:not(.scrolled) .dark-mode-toggle {
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        nav:not(.scrolled) .lang-btn {
            background: rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.4);
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        /* When scrolled, use normal styling */
        nav.scrolled .dark-mode-toggle,
        nav.scrolled .language-switcher {
            background: transparent;
            padding: 0;
        }
        
        nav.scrolled .lang-btn {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
            color: var(--text-primary);
            text-shadow: none;
        }
        /* === END STANDARDIZED NAVIGATION CSS === */
`;

const html = `    <nav>
        <div class="nav-container">
            <a href="/" class="logo">
                <img src="/pluginlogo.png" alt="Plugin.az" class="logo-img dark-mode-logo"
                    style="height: 50px; width: auto;">
                <img src="/lightmodeplugin.png" alt="Plugin.az" class="logo-img light-mode-logo"
                    style="height: 50px; width: auto; display: none;">
            </a>

            <!-- Desktop Navigation -->
            <div class="nav-links">
                <a href="/" data-i18n="nav.home">Home</a>
                <a href="/azerbaijan-rayon-energy-map.html" data-i18n="nav.energyMap">Energy Map</a>
                <a href="/solar-calculator.html" data-i18n="nav.calculator">Solar Calculator</a>
                <a href="/regulatory-framework.html" data-i18n="nav.framework">Regulatory Framework</a>
                <a href="/renewable-news.html" data-i18n="nav.news">News</a>

                <!-- Language Switcher -->
                <div class="language-switcher">
                    <button class="lang-btn" id="currentLang">EN</button>
                    <div class="lang-dropdown">
                        <button onclick="setLanguage('en')">🇬🇧 EN</button>
                        <button onclick="setLanguage('ru')">🇷🇺 RU</button>
                        <button onclick="setLanguage('az')">🇦🇿 AZ</button>
                    </div>
                </div>

                <!-- Dark Mode Toggle -->
                <button class="dark-mode-toggle" onclick="toggleDarkMode()" title="Toggle Light/Dark Mode"
                    aria-label="Toggle Light/Dark Mode">
                    <img src="/lightmode.png" alt="Light Mode" class="light-icon">
                    <img src="/darkmode.png" alt="Dark Mode" class="dark-icon">
                </button>
            </div>

            <!-- Mobile Menu Button -->
            <button class="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Toggle mobile menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" onclick="toggleMobileMenu()"></div>

    <!-- Mobile Menu -->
    <div class="mobile-menu">
        <a href="/" data-i18n="nav.home" onclick="toggleMobileMenu()">Home</a>
        <a href="/azerbaijan-rayon-energy-map.html" data-i18n="nav.energyMap" onclick="toggleMobileMenu()">Map</a>
        <a href="/solar-calculator.html" data-i18n="nav.calculator" onclick="toggleMobileMenu()">Solar Calculator</a>
        <a href="/regulatory-framework.html" data-i18n="nav.framework" onclick="toggleMobileMenu()">Regulatory Framework</a>
        <a href="/renewable-news.html" data-i18n="nav.news" onclick="toggleMobileMenu()">News</a>

        <!-- Language Switcher and Dark Mode Toggle on Same Level -->
        <div class="mobile-controls">
            <div class="language-switcher">
                <button class="lang-btn" id="mobileCurrentLang">EN</button>
                <div class="lang-dropdown">
                    <button onclick="setLanguage('en'); toggleMobileMenu()">🇬🇧 EN</button>
                    <button onclick="setLanguage('ru'); toggleMobileMenu()">🇷🇺 RU</button>
                    <button onclick="setLanguage('az'); toggleMobileMenu()">🇦🇿 AZ</button>
                </div>
            </div>

            <button class="dark-mode-toggle" onclick="toggleDarkMode(); toggleMobileMenu()">
                <img src="/lightmode.png" alt="Light Mode" class="light-icon">
                <img src="/darkmode.png" alt="Dark Mode" class="dark-icon">
            </button>
        </div>
    </div>`;

files.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`Skipping ${file} - not found`);
        return;
    }

    let content = fs.readFileSync(file, 'utf-8');

    // 1. Remove old Nav/Mobile Menu block
    // Pattern: <nav> ... <div class="mobile-menu"> ... </div>
    // This needs to handle potential whitespace and comments

    const navStart = content.indexOf('<nav>');
    let navEndIdx = -1;
    let insertionPoint = -1;

    if (navStart !== -1) {
        // Find the END of the mobile menu
        const mobileMenuEndTag = '</div>\n    <!-- Page Header -->';
        // Usually these files have <!-- Page Header --> or similar after mobile menu

        let endMarker = '<!-- Page Header -->';
        let endIdx = content.indexOf(endMarker);

        if (endIdx === -1) {
            // Try another marker
            endMarker = '<header class="page-header"';
            endIdx = content.indexOf(endMarker);
        }

        if (endIdx === -1) {
            // If we can't find header, try locating </nav> and assume mobile menu follows closely
            // But we want to be safe.
            // Regex might be safer for replacing the whole block
            const regex = /<nav>[\s\S]*?(<header|<div class="page-header"|<main)/i;
            const match = content.match(regex);
            if (match) {
                endIdx = match.index + match[0].length - match[1].length;
            }
        }

        if (endIdx !== -1) {
            // Remove everything from navStart to endIdx
            const before = content.substring(0, navStart);
            const after = content.substring(endIdx);
            content = before + html + '\n\n    ' + after;
        } else {
            console.log(`Could not find end of nav/mobile-menu in ${file}`);
        }

    } else {
        console.log(`Could not find <nav> in ${file}`);
    }

    // 2. Inject CSS
    // Remove old styles if we can identify them?
    // It's safer to Append the new CSS at the end of the style block to override
    content = content.replace('</style>', css + '\n    </style>');

    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated navigation in ${file}`);
});
