
import os

# Read law-res.html as template base
with open('law-res.html', 'r', encoding='utf-8') as f:
    template = f.read()

# Helper to wrap content
def create_page_structure(filename, title, category, date, content_html, en_highlights, source_link, source_text, references_html=""):
    parts = template.split('<article>')
    header_part = parts[0]
    remaining = parts[1]
    footer_part = remaining.split('</article>')[1]
    
    # ENGLISH
    en_block = f"""
            <header class="article-header">
                <div class="category">{category}</div>
                <h1>{title}</h1>
                <div class="meta">
                    {date}
                </div>
            </header>

            <div class="content">
                <div class="article-block">
                   {content_html}
                </div>

                <h2>Key Highlights</h2>
                <ul>
                    {en_highlights}
                </ul>

                <hr style="margin: 3rem 0; border-top: 1px solid rgba(255,255,255,0.1);">

                <h3>Official Source & Resources</h3>
                <p>
                    <a href="{source_link}" target="_blank" class="document-link">{source_text}</a>
                </p>
                {references_html}
            </div>
    """
    
    # AZERBAIJANI (Placeholder/Copy of EN as requested "same logic")
    az_block = f"""
            <header class="article-header">
                <div class="category">{category} (AZ)</div>
                <h1>{title}</h1>
                <div class="meta">
                    {date}
                </div>
            </header>

            <div class="content">
                <div class="article-block">
                   {content_html}
                </div>
                
                <p><em>(Məzmun ingilis dilindədir / Content available in English)</em></p>

                <h2>Əsas Məqamlar</h2>
                <ul>
                    {en_highlights}
                </ul>

                <hr style="margin: 3rem 0; border-top: 1px solid rgba(255,255,255,0.1);">

                <h3>Rəsmi Mənbə</h3>
                <p>
                    <a href="{source_link}" target="_blank" class="document-link">{source_text}</a>
                </p>
                 {references_html}
            </div>
    """

    # RUSSIAN (Placeholder/Copy of EN)
    ru_block = f"""
            <header class="article-header">
                <div class="category">{category} (RU)</div>
                <h1>{title}</h1>
                <div class="meta">
                    {date}
                </div>
            </header>

            <div class="content">
                <div class="article-block">
                   {content_html}
                </div>

                <p><em>(Контент доступен на английском языке / Content available in English)</em></p>

                <h2>Основные моменты</h2>
                <ul>
                    {en_highlights}
                </ul>

                <hr style="margin: 3rem 0; border-top: 1px solid rgba(255,255,255,0.1);">

                <h3>Официальный источник</h3>
                <p>
                    <a href="{source_link}" target="_blank" class="document-link">{source_text}</a>
                </p>
                 {references_html}
            </div>
    """

    new_html = header_part + '<article>\n'
    new_html += '        <!-- ENGLISH CONTENT -->\n        <div class="lang-en">\n' + en_block + '\n        </div>\n\n'
    new_html += '        <!-- AZERBAIJANI CONTENT -->\n        <div class="lang-az">\n' + az_block + '\n        </div>\n\n'
    new_html += '        <!-- RUSSIAN CONTENT -->\n        <div class="lang-ru">\n' + ru_block + '\n        </div>\n'
    new_html += '    </article>' + footer_part
    
    # Update Title
    new_html = new_html.replace('<title>Renewable Energy Sources Law | Plugin.az</title>', f'<title>{title} | Plugin.az</title>')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print(f"{filename} created.")

# 1. COP29 Leadership Page
cop29_highlights = """
<li><strong>Global climate leadership platform:</strong> Hosted high-level dialogues and initiatives in Baku.</li>
<li><strong>Tripling renewable deployment pledge:</strong> Commitment to triple global renewable power capacity by 2030.</li>
<li><strong>Energy storage & grid scaling:</strong> New pledge for 1,500 GW energy storage and 25M km of grids by 2030.</li>
<li><strong>Green hydrogen initiatives:</strong> Declaration to scale up clean hydrogen production.</li>
<li><strong>Baku Call on Climate Action:</strong> Addressing nexus of climate, conflict, and peace.</li>
"""

cop29_content = """
<p>On November 15th, 2024, in Baku, the COP29 Presidency officially launched crucial energy initiatives calling for endorsements for the COP29 Global Energy Storage and Grids Pledge, the COP29 Green Energy Zones and Corridors Pledge, and the COP29 Hydrogen Declaration. These initiatives reflect the Presidency’s efforts to take forward the outcomes of the first Global Stocktake on renewable energy and hydrogen.</p>

<h3>Core Initiatives Launched</h3>
<p><strong>COP29 Global Energy Storage and Grids Pledge:</strong> Target of deploying 1,500 GW of energy storage globally by 2030 (six times 2022 capacity) and adding/refurbishing 25 million km of grids.</p>
<p><strong>COP29 Green Energy Pledge:</strong> Focus on Green Energy Zones and Corridors to connect abundant green energy sources with communities via regional grids.</p>
<p><strong>COP29 Hydrogen Declaration:</strong> Commitment to scale up renewable/low-carbon hydrogen and decarbonize existing production.</p>

<h3>Peace and Recovery</h3>
<p>The Presidency also launched the "Baku Call on Climate Action for Peace, Relief, and Recovery," responding to the nexus of climate change and conflict. This establishes the Baku Climate and Peace Action Hub to facilitate collaboration.</p>

<p>IEA Executive Director Fatih Birol emphasized that countries need to rapidly increase energy storage and expand grids to meet climate goals. IRENA Director-General Francesco La Camera highlighted that these initiatives are vital to keeping 1.5°C within reach.</p>
"""

create_page_structure(
    'cop29-leadership.html',
    'COP29 Leadership',
    'November 2024 • Baku',
    'Hosted COP29 in Baku (2024)',
    cop29_content,
    cop29_highlights,
    'https://cop29.az/en/media-hub/news/energy-and-peace-are-the-focus-at-cop29-day-five-energypeace-relief-and-recovery-day',
    'Read Full News at COP29.az'
)

# 2. Green Energy Zones Page
green_highlights = """
<li><strong>Karabakh, Nakhchivan & Green Corridors:</strong> Strategic focus on liberated territories and regional connectivity.</li>
<li><strong>Karabakh Projects:</strong> 240 MW Shafag SPP (bp), Ufug & Shams (2x50 MW), Hydro power on rivers.</li>
<li><strong>Nakhchivan Initiatives:</strong> Plans for Green Energy Zone and 1,000+ MW export capacity.</li>
<li><strong>Green Corridors:</strong> Routes to Europe (Black Sea cable) and Central Asia integration.</li>
"""

green_content = """
<p>The wide application of renewable energy sources has been identified as a priority of Azerbaijan's energy policy. The transition to green energy and establishing a low-carbon economy are key targets.</p>

<h3>Potential and Current Status</h3>
<p>Azerbaijan has 135 GW onshore and 157 GW offshore renewable energy potential. Currently, RES account for about 18.8% of total capacity, with major hydro, wind, and solar plants in operation.</p>

<h3>Major Projects</h3>
<ul>
    <li><strong>Garadagh Solar Power Plant (230 MW):</strong> Operational since Oct 2023, built with Masdar (UAE).</li>
    <li><strong>Khizi-Absheron Wind Power Plant (240 MW):</strong> Under construction with ACWA Power (Saudi Arabia).</li>
    <li><strong>Shafag Solar Power Plant (240 MW):</strong> Implemented in Jabrayil with bp, utilizing virtual power transmission.</li>
    <li><strong>Mega Project (Masdar):</strong> 1 GW capacity including solar in Bilasuvar/Neftchala and wind in Absheron/Garadagh.</li>
    <li><strong>Gobustan & Floating Solar:</strong> 100 MW solar plant and pilot floating solar on Boyukshor Lake.</li>
</ul>

<h3>Green Energy Zones: Karabakh and East Zangezur</h3>
<p>A Green Energy Zone concept is being applied in liberated territories. Solar panels are installed in over 1500 buildings, and 38 hydro plants (307 MW) are operational. New solar projects like Ufug and Shams are underway.</p>

<h3>Green Energy Corridors</h3>
<p><strong>Caspian-Black Sea-Europe:</strong> Strategic partnership with Georgia, Romania, and Hungary to export green energy via subsea cable.</p>
<p><strong>Central Asia-Azerbaijan:</strong> Agreement with Kazakhstan and Uzbekistan to transmit green energy across the Caspian.</p>
<p><strong>Azerbaijan-Türkiye-Europe:</strong> Integration of infrastructure to export electricity through Nakhchivan (Jabrayil-Nakhchivan-Türkiye route).</p>
"""

green_refs = """
<div style="margin-top: 2rem;">
<h4>Additional Resources</h4>
<ul style="list-style: none; padding-left: 0;">
    <li style="margin-bottom: 0.5rem;"><a href="https://area.gov.az/en/page/layiheler/yasil-enerji-zonasi/yasil" target="_blank" class="document-link">Green Energy Zone Projects (AREA)</a></li>
    <li style="margin-bottom: 0.5rem;"><a href="https://cop29.az/en/pages/green-energy-pledge-background-information" target="_blank" class="document-link">COP29 Green Energy Pledge Background</a></li>
    <li style="margin-bottom: 0.5rem;"><a href="https://minenergy.gov.az/en/alternativ-ve-berpa-olunan-enerji/azerbaycanda-berpa-olunan-enerji-menbelerinden-istifade" target="_blank" class="document-link">Ministry of Energy - Renewable Energy Overview</a></li>
</ul>
</div>
"""

create_page_structure(
    'green-energy-zones.html',
    'Green Energy Zones Initiative',
    'Presidential Orders • 2021-2024',
    'Strategic Priority',
    green_content,
    green_highlights,
    'https://minenergy.gov.az/en/alternativ-ve-berpa-olunan-enerji/azerbaycanda-berpa-olunan-enerji-menbelerinden-istifade',
    'Ministry of Energy Overview',
    green_refs
)
