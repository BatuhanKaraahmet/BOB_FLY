

USE bobfly;

START TRANSACTION;


SELECT 'Ucus.firma_id kaldırılıyor...' AS status;

-- Veri bütünlüğü kontrolü 
SELECT 
    COUNT(*) AS uyumsuz_kayit_sayisi,
    'Ucus.firma_id ile Ucak.firma_id uyuşmuyor' AS mesaj
FROM Ucus u
JOIN Ucak uc ON u.ucak_id = uc.ucak_id
WHERE u.firma_id != uc.firma_id;
-- Eğer sonuç 0 değilse, veri tutarsızlığı var demektir

-- Foreign key constraint'i kaldır
ALTER TABLE Ucus DROP FOREIGN KEY ucus_ibfk_1;

-- İndeksi kaldır
ALTER TABLE Ucus DROP INDEX firma_id;

-- firma_id sütununu kaldır
ALTER TABLE Ucus DROP COLUMN firma_id;

SELECT 'Ucus.firma_id başarıyla kaldırıldı!' AS status;




-- Yolcu tablosunu oluştur
CREATE TABLE Yolcu (
    tc_kimlik CHAR(11) PRIMARY KEY,
    yolcu_ad VARCHAR(50) NOT NULL,
    yolcu_soyad VARCHAR(50) NOT NULL,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ad_soyad (yolcu_ad, yolcu_soyad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Yolcu tablosu oluşturuldu' AS status;

-- Mevcut Bilet tablosundan unique yolcuları aktar
INSERT INTO Yolcu (tc_kimlik, yolcu_ad, yolcu_soyad)
SELECT DISTINCT tc_kimlik, yolcu_ad, yolcu_soyad
FROM Bilet
ORDER BY tc_kimlik;

SELECT CONCAT( COUNT(*), ' yolcu kaydı aktarıldı!') AS status
FROM Yolcu;


SELECT 'ADIM 3: Bilet tablosu güncelleniyor...' AS status;

-- Bilet tablosuna foreign key ekle
ALTER TABLE Bilet 
ADD CONSTRAINT bilet_ibfk_3 
FOREIGN KEY (tc_kimlik) REFERENCES Yolcu(tc_kimlik) 
ON DELETE RESTRICT;

SELECT 'Bilet → Yolcu foreign key eklendi!' AS status;

-- Eski sütunları kaldır
ALTER TABLE Bilet 
DROP COLUMN yolcu_ad,
DROP COLUMN yolcu_soyad;

SELECT 'Bilet.yolcu_ad ve yolcu_soyad kaldırıldı!' AS status;

COMMIT;



-- Tablo sayısını göster
SELECT 
    COUNT(*) as tablo_sayisi,
    GROUP_CONCAT(table_name ORDER BY table_name) as tablolar
FROM information_schema.tables 
WHERE table_schema = 'bobfly' 
  AND table_type = 'BASE TABLE';

