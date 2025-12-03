-- KULLANICI SORGULARI

-- Tüm kullanıcıları göster 
SELECT 
    kullanici_id,
    ad,
    soyad,
    e_posta,
    telefon,
    kayit_tarihi
FROM Kullanici 
ORDER BY kayit_tarihi DESC;

-- Bugün kayıt olan kullanıcılar
SELECT 
    ad,
    soyad,
    e_posta,
    kayit_tarihi
FROM Kullanici 
WHERE DATE(kayit_tarihi) = CURDATE();

-- Kullanıcı sayısı
SELECT COUNT(*) as ToplamKullanici FROM Kullanici;

-- UÇUŞ SORGULARI


-- Tüm uçuşları detaylı göster
SELECT 
    u.ucus_no,
    hys.firma_ad,
    k.sehir as Kalkis,
    v.sehir as Varis,
    u.kalkis_tarihi_saati,
    u.temel_fiyat,
    u.ucus_durumu,
    COUNT(b.bilet_id) as SatilanBilet
FROM Ucus u
JOIN Hava_Yolu_Sirketi hys ON u.firma_id = hys.firma_id
JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
LEFT JOIN Bilet b ON u.ucus_id = b.ucus_id AND b.bilet_durumu = 'Aktif'
GROUP BY u.ucus_id
ORDER BY u.kalkis_tarihi_saati;

-- İstanbul'dan kalkan uçuşlar
SELECT 
    u.ucus_no,
    hys.firma_ad,
    v.sehir as Varis,
    u.kalkis_tarihi_saati,
    u.temel_fiyat
FROM Ucus u
JOIN Hava_Yolu_Sirketi hys ON u.firma_id = hys.firma_id
JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
WHERE k.sehir = 'İstanbul'
ORDER BY u.kalkis_tarihi_saati;

-- BİLET SORGULARI

-- Tüm biletleri detaylı göster
SELECT 
    b.bilet_id,
    u.ucus_no,
    k.sehir as Kalkis,
    v.sehir as Varis,
    b.yolcu_ad,
    b.yolcu_soyad,
    b.koltuk_no,
    b.fiyat,
    b.bilet_durumu,
    b.odeme_tarihi,
    CONCAT(kul.ad, ' ', kul.soyad) as SatinAlan
FROM Bilet b
JOIN Ucus u ON b.ucus_id = u.ucus_id
JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
LEFT JOIN Kullanici kul ON b.kullanici_id = kul.kullanici_id
ORDER BY b.odeme_tarihi DESC;

-- Son satılan 10 bilet
SELECT 
    u.ucus_no,
    CONCAT(k.sehir, ' → ', v.sehir) as Guzergah,
    b.yolcu_ad,
    b.yolcu_soyad,
    b.fiyat,
    b.odeme_tarihi
FROM Bilet b
JOIN Ucus u ON b.ucus_id = u.ucus_id
JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
WHERE b.bilet_durumu = 'Aktif'
ORDER BY b.odeme_tarihi DESC
LIMIT 10;

-- Kullanıcı bazında bilet sayısı
SELECT 
    CONCAT(k.ad, ' ', k.soyad) as Kullanici,
    k.e_posta,
    COUNT(b.bilet_id) as BiletSayisi,
    SUM(b.fiyat) as ToplamHarcama
FROM Kullanici k
LEFT JOIN Bilet b ON k.kullanici_id = b.kullanici_id AND b.bilet_durumu = 'Aktif'
GROUP BY k.kullanici_id
ORDER BY BiletSayisi DESC;

-- İSTATİSTİK SORGULARI

-- Genel istatistikler
SELECT 
    'Toplam Kullanıcı' as Kategori, 
    COUNT(*) as Sayi 
FROM Kullanici
UNION ALL
SELECT 'Toplam Uçuş', COUNT(*) FROM Ucus
UNION ALL
SELECT 'Satılan Bilet', COUNT(*) FROM Bilet WHERE bilet_durumu = 'Aktif'
UNION ALL
SELECT 'İptal Edilen Bilet', COUNT(*) FROM Bilet WHERE bilet_durumu = 'İptal'
UNION ALL
SELECT 'Toplam Ciro', SUM(fiyat) FROM Bilet WHERE bilet_durumu = 'Aktif';

-- Firma bazında satış raporu
SELECT 
    hys.firma_ad,
    COUNT(DISTINCT u.ucus_id) as UcusSayisi,
    COUNT(b.bilet_id) as SatilanBilet,
    SUM(b.fiyat) as ToplamCiro
FROM Hava_Yolu_Sirketi hys
LEFT JOIN Ucus u ON hys.firma_id = u.firma_id
LEFT JOIN Bilet b ON u.ucus_id = b.ucus_id AND b.bilet_durumu = 'Aktif'
GROUP BY hys.firma_id
ORDER BY ToplamCiro DESC;

-- En popüler güzergahlar
SELECT 
    CONCAT(k.sehir, ' → ', v.sehir) as Guzergah,
    COUNT(b.bilet_id) as BiletSayisi,
    AVG(b.fiyat) as OrtalamaBiletFiyati
FROM Ucus u
JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
JOIN Bilet b ON u.ucus_id = b.ucus_id
WHERE b.bilet_durumu = 'Aktif'
GROUP BY k.havalimani_id, v.havalimani_id
ORDER BY BiletSayisi DESC;

-- Bugünün uçuşları
SELECT 
    u.ucus_no,
    hys.firma_ad,
    CONCAT(k.sehir, ' → ', v.sehir) as Guzergah,
    TIME(u.kalkis_tarihi_saati) as KalkisSaati,
    COUNT(b.bilet_id) as SatilanBilet,
    uc.koltuk_sayisi,
    (uc.koltuk_sayisi - COUNT(b.bilet_id)) as BosKoltuk
FROM Ucus u
JOIN Hava_Yolu_Sirketi hys ON u.firma_id = hys.firma_id
JOIN Havalimani k ON u.kalkis_havalimani_id = k.havalimani_id
JOIN Havalimani v ON u.varis_havalimani_id = v.havalimani_id
JOIN Ucak uc ON u.ucak_id = uc.ucak_id
LEFT JOIN Bilet b ON u.ucus_id = b.ucus_id AND b.bilet_durumu = 'Aktif'
WHERE DATE(u.kalkis_tarihi_saati) = CURDATE()
GROUP BY u.ucus_id
ORDER BY u.kalkis_tarihi_saati;

-- VERİ GÜNCELLEME (Gerektiğinde kullanabiliriz.)

-- Kullanıcı bilgisi güncelleme (örnek)
-- UPDATE Kullanici 
-- SET telefon = '05551234567' 
-- WHERE kullanici_id = 1;

-- Bilet iptal etme (örnek)
-- UPDATE Bilet 
-- SET bilet_durumu = 'İptal' 
-- WHERE bilet_id = 1;

-- Uçuş durumu güncelleme (örnek)
-- UPDATE Ucus 
-- SET ucus_durumu = 'Gecikti' 
-- WHERE ucus_id = 1;

