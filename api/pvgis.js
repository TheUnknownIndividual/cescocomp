export default async function handler(req, res) {
    const { lat, lon, tilt, aspect } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Missing latitude or longitude' });
    }

    // Construct the PVGIS API URL
    // defaults: peakpower=1, loss=11 (as per original frontend code)
    const targetUrl = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=1&loss=11&angle=${tilt || 35}&aspect=${aspect || 0}&outputformat=json`;

    try {
        const response = await fetch(targetUrl);

        if (!response.ok) {
            throw new Error(`PVGIS API responded with ${response.status}`);
        }

        const data = await response.json();

        // Set cache control to optimize performance and reduce hits to upstream
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache for 24 hours
        res.status(200).json(data);
    } catch (error) {
        console.error('PVGIS Proxy Error:', error);
        res.status(500).json({ error: 'Failed to fetch data from PVGIS', details: error.message });
    }
}
