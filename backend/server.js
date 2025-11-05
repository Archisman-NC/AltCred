const express = require('express');
const dotenv = require('dotenv');
const routes = require('./src/routes');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

dotenv.config();

const app = express();

// Body parsing with size limit
app.use(express.json({ limit: '10mb' }));
app.use(
  cors({
    origin:"http://localhost:3000",
    credentials:true,
    methods:['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders:["Content-Type,Authorization"],
    exposedHeaders:"Content-Length",
    maxAge:600,
  })
);

// Load and setup Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, 'src/docs/openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AltCred API Documentation',
  customfavIcon: 'https://altcred.com/favicon.ico'
}));

// Global validation middleware
app.use((req, res, next) => {
  // Log requests for debugging
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    docs: '/api-docs'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});