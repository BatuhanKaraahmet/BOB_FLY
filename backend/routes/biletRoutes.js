// Bilet Routes
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Bilet Rezervasyon - Bilet_Rezervasyon() (BCNF Normalizasyon Sonrası)
router.post('/rezervasyon', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { ucus_id, kullanici_id, koltuk_no, yolcu_ad, yolcu_soyad, tc_kimlik } = req.body;

        // Validasyon
        if (!ucus_id || !koltuk_no || !yolcu_ad || !yolcu_soyad || !tc_kimlik) {
            return res.status(400).json({ 
                error: 'Tüm bilgiler gereklidir' 
            });
        }

        // TC kimlik kontrolü (11 hane)
        if (tc_kimlik.length !== 11) {
            return res.status(400).json({ 
                error: 'TC Kimlik numarası 11 haneli olmalıdır' 
            });
        }

        await connection.beginTransaction();

        // Koltuk müsaitlik kontrolü
        const [mevcutBilet] = await connection.execute(
            'SELECT bilet_id FROM Bilet WHERE ucus_id = ? AND koltuk_no = ? AND bilet_durumu = "Aktif"',
            [ucus_id, koltuk_no]
        );

        if (mevcutBilet.length > 0) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'Bu koltuk dolu, lütfen başka bir koltuk seçin' 
            });
        }

        // Uçuş fiyatını al
        const [ucusInfo] = await connection.execute(
            'SELECT temel_fiyat FROM Ucus WHERE ucus_id = ?',
            [ucus_id]
        );

        if (ucusInfo.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Uçuş bulunamadı' });
        }

        const fiyat = ucusInfo[0].temel_fiyat;

        // ADIM 1: Önce Yolcu tablosuna ekle/güncelle (BCNF)
        await connection.execute(
            `INSERT INTO Yolcu (tc_kimlik, yolcu_ad, yolcu_soyad)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                yolcu_ad = VALUES(yolcu_ad),
                yolcu_soyad = VALUES(yolcu_soyad)`,
            [tc_kimlik, yolcu_ad, yolcu_soyad]
        );

        // ADIM 2: Sonra Bilet oluştur (yolcu_ad/soyad yok artık)
        const [result] = await connection.execute(
            `INSERT INTO Bilet (ucus_id, kullanici_id, koltuk_no, tc_kimlik, fiyat, bilet_durumu)
             VALUES (?, ?, ?, ?, ?, 'Aktif')`,
            [ucus_id, kullanici_id || null, koltuk_no, tc_kimlik, fiyat]
        );

        await connection.commit();

        res.json({ 
            success: true, 
            message: 'Rezervasyon başarıyla oluşturuldu',
            bilet_id: result.insertId,
            fiyat: fiyat
        });
    } catch (error) {
        await connection.rollback();
        console.error('Rezervasyon hatası:', error);
        res.status(500).json({ error: 'Rezervasyon oluşturulurken hata oluştu' });
    } finally {
        connection.release();
    }
});

// Bilet Satın Al - Bilet_Satin_Al()
router.post('/satin-al', async (req, res) => {
    try {
        const { bilet_id, odeme_bilgileri } = req.body;

        if (!bilet_id) {
            return res.status(400).json({ error: 'Bilet ID gereklidir' });
        }

        // Bilet kontrolü
        const [bilet] = await db.execute(
            'SELECT * FROM Bilet WHERE bilet_id = ?',
            [bilet_id]
        );

        if (bilet.length === 0) {
            return res.status(404).json({ error: 'Bilet bulunamadı' });
        }

        if (bilet[0].bilet_durumu !== 'Aktif') {
            return res.status(400).json({ error: 'Bu bilet zaten işleme alınmış' });
        }

        // Ödeme simülasyonu (gerçek uygulamada ödeme gateway entegrasyonu yapılır)
        // Şimdilik başarılı kabul ediyoruz

        // Bilet durumunu güncelle
        await db.execute(
            'UPDATE Bilet SET bilet_durumu = "Aktif", odeme_tarihi = NOW() WHERE bilet_id = ?',
            [bilet_id]
        );

        res.json({ 
            success: true, 
            message: 'Ödeme başarılı, biletiniz onaylandı',
            bilet_id: bilet_id
        });
    } catch (error) {
        console.error('Satın alma hatası:', error);
        res.status(500).json({ error: 'Satın alma işlemi sırasında hata oluştu' });
    }
});

// Bilet İptal Et - Bilet_Iptal_Et()
router.put('/iptal/:bilet_id', async (req, res) => {
    try {
        const { bilet_id } = req.params;

        // Bilet kontrolü
        const [bilet] = await db.execute(
            'SELECT * FROM Bilet WHERE bilet_id = ?',
            [bilet_id]
        );

        if (bilet.length === 0) {
            return res.status(404).json({ error: 'Bilet bulunamadı' });
        }

        if (bilet[0].bilet_durumu === 'İptal') {
            return res.status(400).json({ error: 'Bu bilet zaten iptal edilmiş' });
        }

        if (bilet[0].bilet_durumu === 'Kullanıldı') {
            return res.status(400).json({ error: 'Kullanılmış bilet iptal edilemez' });
        }

        // Bilet durumunu iptal et
        await db.execute(
            'UPDATE Bilet SET bilet_durumu = "İptal" WHERE bilet_id = ?',
            [bilet_id]
        );

        res.json({ 
            success: true, 
            message: 'Bilet başarıyla iptal edildi',
            bilet_id: bilet_id
        });
    } catch (error) {
        console.error('İptal hatası:', error);
        res.status(500).json({ error: 'Bilet iptal edilirken hata oluştu' });
    }
});

// Kullanıcının biletlerini listele
router.get('/kullanici/:kullanici_id', async (req, res) => {
    try {
        const { kullanici_id } = req.params;

        const query = `
            SELECT 
                b.*,
                y.yolcu_ad,
                y.yolcu_soyad,
                u.ucus_no,
                u.kalkis_tarihi_saati,
                u.tahmini_sure,
                hys.firma_ad,
                k.sehir as kalkis_sehir,
                k.iata_kodu as kalkis_iata,
                v.sehir as varis_sehir,
                v.iata_kodu as varis_iata
            FROM Bilet b
            JOIN Yolcu y ON b.tc_kimlik = y.tc_kimlik
            JOIN Ucus u ON b.ucus_id = u.ucus_id
            JOIN Ucak uc ON u.ucak_id = uc.ucak_id
            JOIN Hava_Yolu_Sirketi hys ON uc.firma_id = hys.firma_id
            JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
            JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
            WHERE b.kullanici_id = ?
            ORDER BY u.kalkis_tarihi_saati DESC
        `;

        const [rows] = await db.execute(query, [kullanici_id]);

        res.json({ 
            success: true, 
            count: rows.length,
            biletler: rows 
        });
    } catch (error) {
        console.error('Bilet listesi hatası:', error);
        res.status(500).json({ error: 'Biletler alınırken hata oluştu' });
    }
});

// Bilet detayı getir
router.get('/:bilet_id', async (req, res) => {
    try {
        const { bilet_id } = req.params;

        const query = `
            SELECT 
                b.*,
                y.yolcu_ad,
                y.yolcu_soyad,
                u.ucus_no,
                u.kalkis_tarihi_saati,
                u.tahmini_sure,
                hys.firma_ad,
                hys.logo_url,
                k.ad as kalkis_havalimani,
                k.sehir as kalkis_sehir,
                k.iata_kodu as kalkis_iata,
                v.ad as varis_havalimani,
                v.sehir as varis_sehir,
                v.iata_kodu as varis_iata
            FROM Bilet b
            JOIN Yolcu y ON b.tc_kimlik = y.tc_kimlik
            JOIN Ucus u ON b.ucus_id = u.ucus_id
            JOIN Ucak uc ON u.ucak_id = uc.ucak_id
            JOIN Hava_Yolu_Sirketi hys ON uc.firma_id = hys.firma_id
            JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
            JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
            WHERE b.bilet_id = ?
        `;

        const [rows] = await db.execute(query, [bilet_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Bilet bulunamadı' });
        }

        res.json({ 
            success: true, 
            bilet: rows[0] 
        });
    } catch (error) {
        console.error('Bilet detay hatası:', error);
        res.status(500).json({ error: 'Bilet detayları alınırken hata oluştu' });
    }
});

module.exports = router;



