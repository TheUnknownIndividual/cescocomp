module.exports = {
  apps: [
    {
      name: 'cescocomp-scraper',
      script: 'index.js',
      cwd: '/home/deyerverdb/cescocomp-server',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
        SITE_URL: process.env.SITE_URL || 'https://plugin.az'
      },
      restart_delay: 4000,
      max_restarts: 5
    },
    {
      name: 'cescocomp-website',
      script: 'website-server.js',
      cwd: '/home/deyerverdb/cescocomp-website',
      env: {
        NODE_ENV: 'production', 
        PORT: 3002,
        POSTGRES_URL: process.env.DATABASE_URL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
        SITE_URL: process.env.SITE_URL || 'https://plugin.az'
      },
      instances: 2,
      exec_mode: 'cluster',
      restart_delay: 4000,
      max_restarts: 5
    }
  ]
};
