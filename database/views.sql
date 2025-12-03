-- BOBFLY - View (Görünüm) Tanımlamaları

USE bobfly;

-- 1. Aktif Uçuşlar Detaylı Görünümü
CREATE OR REPLACE VIEW v_aktif_ucuslar AS
SELECT 
    u.ucus_id,
    u.ucus_no,
    hys.firma_ad,
    hys.logo_url,
    k.ad as kalkis_havalimani,
    k.sehir as kalkis_sehir,
    k.iata_kodu as kalkis_iata,
    v.ad as varis_havalimani,
    v.sehir as varis_sehir,
    v.iata_kodu as varis_iata,
    u.kalkis_tarihi_saati,
    u.tahmini_sure,
    u.temel_fiyat,
    u.ucus_durumu,
    uc.model as ucak_model,
    uc.koltuk_sayisi,
    (SELECT COUNT(*) FROM Bilet WHERE ucus_id = u.ucus_id AND bilet_durumu = 'Aktif') as dolu_koltuk
FROM Ucus u
JOIN Hava_Yolu_Sirketi hys ON uc.firma_id = hys.firma_id
JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
JOIN Ucak uc ON u.ucak_id = uc.ucak_id
WHERE u.ucus_durumu != 'İptal';

-- 2. Kullanıcı Bilet Özeti Görünümü
CREATE OR REPLACE VIEW v_kullanici_bilet_ozeti AS
SELECT 
    k.kullanici_id,
    CONCAT(k.ad, ' ', k.soyad) as kullanici_adi,
    k.e_posta,
    COUNT(b.bilet_id) as toplam_bilet_sayisi,
    SUM(CASE WHEN b.bilet_durumu = 'Aktif' THEN 1 ELSE 0 END) as aktif_bilet_sayisi,
    SUM(CASE WHEN b.bilet_durumu = 'İptal' THEN 1 ELSE 0 END) as iptal_edilen_bilet,
    SUM(CASE WHEN b.bilet_durumu = 'Aktif' THEN b.fiyat ELSE 0 END) as toplam_harcama,
    MAX(b.odeme_tarihi) as son_bilet_tarihi
FROM Kullanici k
LEFT JOIN Bilet b ON k.kullanici_id = b.kullanici_id
GROUP BY k.kullanici_id;

-- 3. Günlük Uçuş Raporu Görünümü
CREATE OR REPLACE VIEW v_gunluk_ucus_raporu AS
SELECT 
    DATE(u.kalkis_tarihi_saati) as ucus_tarihi,
    u.ucus_no,
    hys.firma_ad,
    CONCAT(k.sehir, ' (', k.iata_kodu, ')') as kalkis,
    CONCAT(v.sehir, ' (', v.iata_kodu, ')') as varis,
    TIME(u.kalkis_tarihi_saati) as kalkis_saati,
    u.ucus_durumu,
    uc.koltuk_sayisi as toplam_koltuk,
    COUNT(b.bilet_id) as satilan_bilet,
    (uc.koltuk_sayisi - COUNT(b.bilet_id)) as bos_koltuk,
    ROUND((COUNT(b.bilet_id) / uc.koltuk_sayisi) * 100, 2) as doluluk_orani
FROM Ucus u
JOIN Hava_Yolu_Sirketi hys ON uc.firma_id = hys.firma_id
JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
JOIN Ucak uc ON u.ucak_id = uc.ucak_id
LEFT JOIN Bilet b ON u.ucus_id = b.ucus_id AND b.bilet_durumu = 'Aktif'
GROUP BY u.ucus_id
ORDER BY u.kalkis_tarihi_saati;

-- 4. Firma Performans Özeti Görünümü
CREATE OR REPLACE VIEW v_firma_performans AS
SELECT 
    hys.firma_id,
    hys.firma_ad,
    COUNT(DISTINCT u.ucus_id) as toplam_ucus_sayisi,
    COUNT(DISTINCT uc.ucak_id) as ucak_sayisi,
    COUNT(b.bilet_id) as satilan_bilet_sayisi,
    SUM(b.fiyat) as toplam_gelir,
    AVG(b.fiyat) as ortalama_bilet_fiyati,
    (SELECT COUNT(*) FROM Ucus WHERE firma_id = hys.firma_id AND ucus_durumu = 'İptal') as iptal_edilen_ucus
FROM Hava_Yolu_Sirketi hys
LEFT JOIN Ucus u ON hys.firma_id = uc.firma_id
LEFT JOIN Ucak uc ON hys.firma_id = uc.firma_id
LEFT JOIN Bilet b ON u.ucus_id = b.ucus_id AND b.bilet_durumu = 'Aktif'
GROUP BY hys.firma_id;

-- 5. Popüler Güzergahlar Görünümü
CREATE OR REPLACE VIEW v_populer_guzergahlar AS
SELECT 
    CONCAT(k.sehir, ' → ', v.sehir) as guzergah,
    CONCAT(k.iata_kodu, '-', v.iata_kodu) as rota_kodu,
    COUNT(DISTINCT u.ucus_id) as ucus_sayisi,
    COUNT(b.bilet_id) as satilan_bilet,
    MIN(u.temel_fiyat) as min_fiyat,
    MAX(u.temel_fiyat) as max_fiyat,
    AVG(u.temel_fiyat) as ortalama_fiyat
FROM Ucus u
JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
LEFT JOIN Bilet b ON u.ucus_id = b.ucus_id AND b.bilet_durumu = 'Aktif'
GROUP BY k.havalimani_id, v.havalimani_id
ORDER BY satilan_bilet DESC;

-- 6. Bilet Detay Görünümü (Müşteri Tarafı)
CREATE OR REPLACE VIEW v_bilet_detay AS
SELECT 
    b.bilet_id,
    b.koltuk_no,
    b.yolcu_ad,
    b.yolcu_soyad,
    b.fiyat,
    b.odeme_tarihi,
    b.bilet_durumu,
    u.ucus_no,
    hys.firma_ad,
    CONCAT(h_kalkis.sehir, ' (', h_kalkis.iata_kodu, ')') as kalkis,
    CONCAT(h_varis.sehir, ' (', h_varis.iata_kodu, ')') as varis,
    u.kalkis_tarihi_saati,
    u.tahmini_sure,
    DATE_ADD(u.kalkis_tarihi_saati, INTERVAL u.tahmini_sure MINUTE) as varis_tarihi_saati,
    CASE 
        WHEN kul.kullanici_id IS NOT NULL THEN CONCAT(kul.ad, ' ', kul.soyad)
        ELSE 'Misafir Kullanıcı'
    END as satin_alan
FROM Bilet b
JOIN Ucus u ON b.ucus_id = u.ucus_id
JOIN Hava_Yolu_Sirketi hys ON uc.firma_id = hys.firma_id
JOIN Havalimani h_kalkis ON u.kalkis_havalimani_id = h_kalkis.havalimani_id
JOIN Havalimani h_varis ON u.varis_havalimani_id = h_varis.havalimani_id
LEFT JOIN Kullanici kul ON b.kullanici_id = kul.kullanici_id;





