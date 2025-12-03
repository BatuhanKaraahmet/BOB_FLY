// Uçuş Routes
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ÖNEMLİ: Daha spesifik route'lar önce gelmelidir!

// Alternatif Tarihler - Aynı rotada hangi günlerde uçuş var?
router.get('/ara/alternatif-tarihler', async (req, res) => {
    try {
        const { kalkis, varis } = req.query;
        
        if (!kalkis || !varis) {
            return res.status(400).json({ 
                error: 'Kalkış ve varış bilgileri gereklidir' 
            });
        }

        // Bugünden itibaren 30 gün içindeki uçuşları getir
        const query = `
            SELECT 
                DATE(u.kalkis_tarihi_saati) as ucus_tarihi,
                COUNT(DISTINCT u.ucus_id) as ucus_sayisi,
                MIN(u.temel_fiyat) as en_ucuz_fiyat,
                GROUP_CONCAT(DISTINCT hys.firma_ad SEPARATOR ', ') as firmalar
            FROM Ucus u
            JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
            JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
            JOIN Ucak uc ON u.ucak_id = uc.ucak_id
            JOIN Hava_Yolu_Sirketi hys ON uc.firma_id = hys.firma_id
            WHERE k.iata_kodu = ? 
            AND v.iata_kodu = ?
            AND DATE(u.kalkis_tarihi_saati) >= CURDATE()
            AND DATE(u.kalkis_tarihi_saati) <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            AND u.ucus_durumu != 'İptal'
            GROUP BY DATE(u.kalkis_tarihi_saati)
            ORDER BY ucus_tarihi ASC
        `;

        const [rows] = await db.execute(query, [kalkis, varis]);
        
        res.json({ 
            success: true, 
            count: rows.length,
            alternatif_tarihler: rows 
        });
    } catch (error) {
        console.error('Alternatif tarih arama hatası:', error);
        res.status(500).json({ error: 'Alternatif tarihler alınırken hata oluştu' });
    }
});

// Uçuş Arama - Ucus_Ara()
router.get('/ara', async (req, res) => {
    try {
        const { kalkis, varis, tarih } = req.query;
        
        if (!kalkis || !varis || !tarih) {
            return res.status(400).json({ 
                error: 'Kalkış, varış ve tarih bilgileri gereklidir' 
            });
        }

        const query = `
            SELECT 
                u.ucus_id,
                u.ucus_no,
                u.kalkis_tarihi_saati,
                u.tahmini_sure,
                u.temel_fiyat,
                u.ucus_durumu,
                hys.firma_ad,
                hys.logo_url,
                k.ad as kalkis_havalimani,
                k.sehir as kalkis_sehir,
                k.iata_kodu as kalkis_iata,
                v.ad as varis_havalimani,
                v.sehir as varis_sehir,
                v.iata_kodu as varis_iata,
                uc.model as ucak_model,
                uc.koltuk_sayisi,
                (SELECT COUNT(*) FROM Bilet WHERE ucus_id = u.ucus_id AND bilet_durumu = 'Aktif') as dolu_koltuk
            FROM Ucus u
            JOIN Ucak uc ON u.ucak_id = uc.ucak_id
            JOIN Hava_Yolu_Sirketi hys ON uc.firma_id = hys.firma_id
            JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
            JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
            WHERE k.iata_kodu = ? 
            AND v.iata_kodu = ?
            AND DATE(u.kalkis_tarihi_saati) = ?
            AND u.ucus_durumu != 'İptal'
            ORDER BY u.temel_fiyat ASC
        `;

        const [rows] = await db.execute(query, [kalkis, varis, tarih]);
        
        // Müsait koltuk sayısını hesapla
        const ucuslar = rows.map(row => ({
            ...row,
            musait_koltuk: row.koltuk_sayisi - row.dolu_koltuk,
            doluluk_orani: ((row.dolu_koltuk / row.koltuk_sayisi) * 100).toFixed(2)
        }));

        res.json({ 
            success: true, 
            count: ucuslar.length,
            ucuslar 
        });
    } catch (error) {
        console.error('Uçuş arama hatası:', error);
        res.status(500).json({ error: 'Uçuş arama sırasında hata oluştu' });
    }
});

// Belirli bir uçuşun detaylarını getir
router.get('/:ucus_id', async (req, res) => {
    try {
        const { ucus_id } = req.params;

        const query = `
            SELECT 
                u.*,
                hys.firma_ad,
                hys.logo_url,
                k.ad as kalkis_havalimani,
                k.sehir as kalkis_sehir,
                k.iata_kodu as kalkis_iata,
                v.ad as varis_havalimani,
                v.sehir as varis_sehir,
                v.iata_kodu as varis_iata,
                uc.model as ucak_model,
                uc.koltuk_sayisi
            FROM Ucus u
            JOIN Ucak uc ON u.ucak_id = uc.ucak_id
            JOIN Hava_Yolu_Sirketi hys ON uc.firma_id = hys.firma_id
            JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
            JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
            WHERE u.ucus_id = ?
        `;

        const [rows] = await db.execute(query, [ucus_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Uçuş bulunamadı' });
        }

        res.json({ success: true, ucus: rows[0] });
    } catch (error) {
        console.error('Uçuş detay hatası:', error);
        res.status(500).json({ error: 'Uçuş detayları alınırken hata oluştu' });
    }
});

// Koltuk Durumu Göster - Koltuk_Durumu_Goster()
router.get('/:ucus_id/koltuklar', async (req, res) => {
    try {
        const { ucus_id } = req.params;

        // Uçağın toplam koltuk sayısını al
        const [ucusInfo] = await db.execute(`
            SELECT uc.koltuk_sayisi 
            FROM Ucus u 
            JOIN Ucak uc ON u.ucak_id = uc.ucak_id 
            WHERE u.ucus_id = ?
        `, [ucus_id]);

        if (ucusInfo.length === 0) {
            return res.status(404).json({ error: 'Uçuş bulunamadı' });
        }

        // Dolu koltukları al
        const [doluKoltuklar] = await db.execute(`
            SELECT koltuk_no 
            FROM Bilet 
            WHERE ucus_id = ? AND bilet_durumu = 'Aktif'
        `, [ucus_id]);

        const doluKoltukNolar = doluKoltuklar.map(k => k.koltuk_no);
        const toplamKoltuk = ucusInfo[0].koltuk_sayisi;

        // Koltuk layoutu oluştur (A-F sütunları, 30 sıra varsayılan)
        const satirSayisi = Math.ceil(toplamKoltuk / 6);
        const koltuklar = [];

        for (let satir = 1; satir <= satirSayisi; satir++) {
            ['A', 'B', 'C', 'D', 'E', 'F'].forEach(sutun => {
                const koltukNo = `${satir}${sutun}`;
                koltuklar.push({
                    koltuk_no: koltukNo,
                    dolu: doluKoltukNolar.includes(koltukNo)
                });
            });
        }

        res.json({ 
            success: true, 
            toplam_koltuk: toplamKoltuk,
            dolu_koltuk: doluKoltukNolar.length,
            musait_koltuk: toplamKoltuk - doluKoltukNolar.length,
            koltuklar: koltuklar.slice(0, toplamKoltuk)
        });
    } catch (error) {
        console.error('Koltuk durumu hatası:', error);
        res.status(500).json({ error: 'Koltuk durumu alınırken hata oluştu' });
    }
});

// Firma Uçuş Raporu - Firma_Ucus_Raporu()
router.get('/rapor/firma', async (req, res) => {
    try {
        const { firma_id, tarih } = req.query;

        if (!firma_id || !tarih) {
            return res.status(400).json({ 
                error: 'Firma ID ve tarih bilgisi gereklidir' 
            });
        }

        const query = `
            SELECT 
                u.ucus_id,
                u.ucus_no,
                u.kalkis_tarihi_saati,
                u.ucus_durumu,
                k.sehir as kalkis,
                v.sehir as varis,
                uc.koltuk_sayisi,
                COUNT(b.bilet_id) as satilanlar,
                (uc.koltuk_sayisi - COUNT(b.bilet_id)) as bos_koltuk,
                ROUND((COUNT(b.bilet_id) / uc.koltuk_sayisi) * 100, 2) as doluluk_orani
            FROM Ucus u
            JOIN Ucak uc ON u.ucak_id = uc.ucak_id
            JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
            JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
            LEFT JOIN Bilet b ON u.ucus_id = b.ucus_id AND b.bilet_durumu = 'Aktif'
            WHERE uc.firma_id = ? AND DATE(u.kalkis_tarihi_saati) = ?
            GROUP BY u.ucus_id
            ORDER BY u.kalkis_tarihi_saati
        `;

        const [rows] = await db.execute(query, [firma_id, tarih]);

        res.json({ 
            success: true, 
            rapor: rows 
        });
    } catch (error) {
        console.error('Firma raporu hatası:', error);
        res.status(500).json({ error: 'Rapor oluşturulurken hata oluştu' });
    }
});

module.exports = router;



