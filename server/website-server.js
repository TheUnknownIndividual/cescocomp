const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API Routes (existing)
app.get('/api/news', require('../api/news.js'));
app.get('/api/article', require('../api/article.js'));
app.get('/api/sitemap', require('../api/sitemap.js'));
app.get('/sitemap.xml', require('../api/sitemap.js'));
app.all('/api/admin', require('../api/admin.js'));
app.all('/api/admin/*', require('../api/admin.js'));

// Serve static website files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/news', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'news.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'robots.txt'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'projects.html'));
});

app.get('/solar-calculator', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'solar-calculator.html'));
});

app.get('/regulatory-framework', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'regulatory-framework.html'));
});

// Blog routing
app.get('/:lang(en|az|ru)/blog/:slug', async (req, res) => {
  req.query = { slug: req.params.slug, lang: req.params.lang };
  return require('../api/article.js')(req, res);
});

app.get('/blog/:slug', async (req, res) => {
  req.query = { slug: req.params.slug, lang: 'az' };
  return require('../api/article.js')(req, res);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Website + API server running on port ${PORT}`);
  console.log(`📱 Website: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});
