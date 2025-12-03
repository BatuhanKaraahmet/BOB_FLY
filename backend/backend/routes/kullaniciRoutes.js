// Kullanıcı Routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Kullanıcı Kaydı
router.post('/kayit', async (req, res) => {
    try {
        const { ad, soyad, e_posta, telefon, sifre } = req.body;

        // Validasyon
        if (!ad || !soyad || !e_posta || !sifre) {
            return res.status(400).json({ 
                error: 'Ad, soyad, e-posta ve şifre gereklidir' 
            });
        }

        // E-posta kontrolü
        const [mevcutKullanici] = await db.execute(
            'SELECT kullanici_id FROM Kullanici WHERE e_posta = ?',
            [e_posta]
        );

        if (mevcutKullanici.length > 0) {
            return res.status(400).json({ 
                error: 'Bu e-posta adresi zaten kayıtlı' 
            });
        }

        // Şifre hash'leme
        const sifre_hash = await bcrypt.hash(sifre, 10);

        // Kullanıcı oluştur
        const query = `
            INSERT INTO Kullanici (ad, soyad, e_posta, telefon, sifre_hash)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [ad, soyad, e_posta, telefon, sifre_hash]);

        // JWT token oluştur
        const token = jwt.sign(
            { kullanici_id: result.insertId, e_posta },
            process.env.JWT_SECRET || 'gizli_anahtar',
            { expiresIn: '24h' }
        );

        res.json({ 
            success: true, 
            message: 'Kayıt başarılı',
            kullanici_id: result.insertId,
            token
        });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ error: 'Kayıt sırasında hata oluştu' });
    }
});

// Kullanıcı Girişi
router.post('/giris', async (req, res) => {
    try {
        const { e_posta, sifre } = req.body;

        if (!e_posta || !sifre) {
            return res.status(400).json({ 
                error: 'E-posta ve şifre gereklidir' 
            });
        }

        // Kullanıcı kontrolü
        const [kullanici] = await db.execute(
            'SELECT * FROM Kullanici WHERE e_posta = ?',
            [e_posta]
        );

        if (kullanici.length === 0) {
            return res.status(401).json({ 
                error: 'E-posta veya şifre hatalı' 
            });
        }

        // Şifre kontrolü
        const sifreGecerli = await bcrypt.compare(sifre, kullanici[0].sifre_hash);

        if (!sifreGecerli) {
            return res.status(401).json({ 
                error: 'E-posta veya şifre hatalı' 
            });
        }

        // JWT token oluştur
        const token = jwt.sign(
            { kullanici_id: kullanici[0].kullanici_id, e_posta },
            process.env.JWT_SECRET || 'gizli_anahtar',
            { expiresIn: '24h' }
        );

        res.json({ 
            success: true, 
            message: 'Giriş başarılı',
            kullanici: {
                kullanici_id: kullanici[0].kullanici_id,
                ad: kullanici[0].ad,
                soyad: kullanici[0].soyad,
                e_posta: kullanici[0].e_posta,
                telefon: kullanici[0].telefon
            },
            token
        });
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ error: 'Giriş sırasında hata oluştu' });
    }
});

// Kullanıcı Bilgisi Güncelle - Kullanici_Bilgisi_Guncelle()
router.put('/:kullanici_id', async (req, res) => {
    try {
        const { kullanici_id } = req.params;
        const { ad, soyad, telefon, yeni_sifre } = req.body;

        // Kullanıcı kontrolü
        const [kullanici] = await db.execute(
            'SELECT * FROM Kullanici WHERE kullanici_id = ?',
            [kullanici_id]
        );

        if (kullanici.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        let query = 'UPDATE Kullanici SET ';
        const params = [];

        if (ad) {
            query += 'ad = ?, ';
            params.push(ad);
        }
        if (soyad) {
            query += 'soyad = ?, ';
            params.push(soyad);
        }
        if (telefon) {
            query += 'telefon = ?, ';
            params.push(telefon);
        }
        if (yeni_sifre) {
            const sifre_hash = await bcrypt.hash(yeni_sifre, 10);
            query += 'sifre_hash = ?, ';
            params.push(sifre_hash);
        }

        // Son virgülü kaldır
        query = query.slice(0, -2);
        query += ' WHERE kullanici_id = ?';
        params.push(kullanici_id);

        await db.execute(query, params);

        res.json({ 
            success: true, 
            message: 'Kullanıcı bilgileri güncellendi' 
        });
    } catch (error) {
        console.error('Güncelleme hatası:', error);
        res.status(500).json({ error: 'Bilgiler güncellenirken hata oluştu' });
    }
});

// Kullanıcı Profili Getir
router.get('/:kullanici_id', async (req, res) => {
    try {
        const { kullanici_id } = req.params;

        const [kullanici] = await db.execute(
            'SELECT kullanici_id, ad, soyad, e_posta, telefon, kayit_tarihi FROM Kullanici WHERE kullanici_id = ?',
            [kullanici_id]
        );

        if (kullanici.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({ 
            success: true, 
            kullanici: kullanici[0] 
        });
    } catch (error) {
        console.error('Profil hatası:', error);
        res.status(500).json({ error: 'Profil bilgileri alınırken hata oluştu' });
    }
});

module.exports = router;



