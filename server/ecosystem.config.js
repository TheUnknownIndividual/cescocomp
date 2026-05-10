module.exports = {
  apps: [
    {
      name:   'cescocomp-news',
      script: 'index.js',
      cwd:    '/home/deyerverdb/cescocomp-server',
      env: {
        NODE_ENV:     'production',
        DATABASE_URL: 'postgresql://cescocomp_user:your_password@localhost:5432/cescocomp_news',
        PORT:         3001,
        API_SECRET:   'replace_with_random_secret_token',
        ADMIN_PASSWORD: 'replace_with_strong_admin_password',
        SITE_URL: 'https://plugin.az'
      },
      // Restart automatically if it crashes
      autorestart:    true,
      watch:          false,
      max_memory_restart: '200M',
      // Log files on the server
      out_file:  '/home/deyerverdb/logs/cescocomp-out.log',
      error_file: '/home/deyerverdb/logs/cescocomp-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
