const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const ucusRoutes = require('./routes/ucusRoutes');
const biletRoutes = require('./routes/biletRoutes');
const kullaniciRoutes = require('./routes/kullaniciRoutes');
const havalimanRoutes = require('./routes/havalimanRoutes');

app.use('/api/ucuslar', ucusRoutes);
app.use('/api/biletler', biletRoutes);
app.use('/api/kullanicilar', kullaniciRoutes);
app.use('/api/havalimanlar', havalimanRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'BOBFLY API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Sunucu hatası', message: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 BOBFLY API sunucusu çalışıyor: http://localhost:${PORT}`);
    console.log(`📚 API Dokümantasyonu: http://localhost:${PORT}/api/health`);
});

