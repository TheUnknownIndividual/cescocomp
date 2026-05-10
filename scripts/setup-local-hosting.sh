#!/bin/bash

# Setup script to host website locally instead of Vercel
# Run this on your Ubuntu server

echo "🏠 Setting up local website hosting..."

# 1. Create website directory
sudo mkdir -p /var/www/plugin.az
sudo chown $USER:$USER /var/www/plugin.az

# 2. Clone your website files
cd /var/www/plugin.az
git clone https://github.com/TheUnknownIndividual/cescocomp.git .

# 3. Install Node.js dependencies (for API endpoints)
npm install

# 4. Create Apache virtual host
sudo tee /etc/apache2/sites-available/plugin.az.conf > /dev/null << 'EOF'
<VirtualHost *:80>
    ServerName plugin.az
    ServerAlias www.plugin.az
    DocumentRoot /var/www/plugin.az
    
    # Redirect HTTP to HTTPS
    Redirect permanent / https://plugin.az/
</VirtualHost>

<VirtualHost *:443>
    ServerName plugin.az
    ServerAlias www.plugin.az
    DocumentRoot /var/www/plugin.az
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/api.plugin.az/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/api.plugin.az/privkey.pem
    
    # Serve static files
    <Directory /var/www/plugin.az>
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Require all granted
    </Directory>
    
    # Proxy API endpoints to Node.js
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
    ProxyPass /sitemap.xml http://localhost:3001/sitemap.xml
    ProxyPassReverse /sitemap.xml http://localhost:3001/sitemap.xml
    
    # Handle blog routing
    ProxyPass /blog/ http://localhost:3001/blog/
    ProxyPassReverse /blog/ http://localhost:3001/blog/
    
    # Clean URLs (no .html)
    RewriteEngine On
    RewriteRule ^/(en|az|ru)/blog/([^/]+)/?$ http://localhost:3001/$1/blog/$2 [P,L]
    RewriteRule ^([^.]+)$ $1.html [L]
</VirtualHost>
EOF

# 5. Enable site and modules
sudo a2ensite plugin.az.conf
sudo a2enmod ssl rewrite proxy proxy_http
sudo systemctl reload apache2

# 6. Update Node.js server to handle website API
# (Your existing PM2 process already handles this)

echo "✅ Local hosting setup complete!"
echo "📝 Next steps:"
echo "   1. Update DNS: plugin.az A record → 217.64.28.103"
echo "   2. Test: curl -H 'Host: plugin.az' http://localhost"
echo "   3. If ISP blocks 80/443, use Cloudflare Tunnel or different port"
