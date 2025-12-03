// Havalimanı Routes
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Tüm havalimanlarını listele
router.get('/', async (req, res) => {
    try {
        const { sehir } = req.query;

        let query = 'SELECT * FROM Havalimani';
        const params = [];

        if (sehir) {
            query += ' WHERE sehir LIKE ?';
            params.push(`%${sehir}%`);
        }

        query += ' ORDER BY sehir, ad';

        const [rows] = await db.execute(query, params);

        res.json({ 
            success: true, 
            count: rows.length,
            havalimanlar: rows 
        });
    } catch (error) {
        console.error('Havalimanı listesi hatası:', error);
        res.status(500).json({ error: 'Havalimanları alınırken hata oluştu' });
    }
});

// Havalimanı detayı getir
router.get('/:havalimani_id', async (req, res) => {
    try {
        const { havalimani_id } = req.params;

        const [rows] = await db.execute(
            'SELECT * FROM Havalimani WHERE havalimani_id = ?',
            [havalimani_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Havalimanı bulunamadı' });
        }

        res.json({ 
            success: true, 
            havalimani: rows[0] 
        });
    } catch (error) {
        console.error('Havalimanı detay hatası:', error);
        res.status(500).json({ error: 'Havalimanı detayları alınırken hata oluştu' });
    }
});

// IATA koduna göre havalimanı ara
router.get('/iata/:iata_kodu', async (req, res) => {
    try {
        const { iata_kodu } = req.params;

        const [rows] = await db.execute(
            'SELECT * FROM Havalimani WHERE iata_kodu = ?',
            [iata_kodu.toUpperCase()]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Havalimanı bulunamadı' });
        }

        res.json({ 
            success: true, 
            havalimani: rows[0] 
        });
    } catch (error) {
        console.error('IATA arama hatası:', error);
        res.status(500).json({ error: 'Arama sırasında hata oluştu' });
    }
});

// Hava yolu şirketlerini listele
router.get('/api/firmalar', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Hava_Yolu_Sirketi ORDER BY firma_ad');

        res.json({ 
            success: true, 
            count: rows.length,
            firmalar: rows 
        });
    } catch (error) {
        console.error('Firma listesi hatası:', error);
        res.status(500).json({ error: 'Firmalar alınırken hata oluştu' });
    }
});

module.exports = router;



