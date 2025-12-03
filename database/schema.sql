-- Veritabanı Şeması

CREATE DATABASE IF NOT EXISTS bobfly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bobfly;

-- 1. Kullanıcı Tablosu
CREATE TABLE Kullanici (
    kullanici_id INT AUTO_INCREMENT PRIMARY KEY,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    e_posta VARCHAR(100) NOT NULL UNIQUE,
    telefon VARCHAR(20),
    sifre_hash VARCHAR(255) NOT NULL,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_e_posta (e_posta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Hava Yolu Şirketi Tablosu
CREATE TABLE Hava_Yolu_Sirketi (
    firma_id INT AUTO_INCREMENT PRIMARY KEY,
    firma_ad VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(255),
    INDEX idx_firma_ad (firma_ad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Havalimanı Tablosu
CREATE TABLE Havalimani (
    havalimani_id INT AUTO_INCREMENT PRIMARY KEY,
    ad VARCHAR(150) NOT NULL,
    sehir VARCHAR(100) NOT NULL,
    iata_kodu CHAR(3) NOT NULL UNIQUE,
    icao_kodu CHAR(4) NOT NULL UNIQUE,
    INDEX idx_sehir (sehir),
    INDEX idx_iata (iata_kodu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Uçak Tablosu
CREATE TABLE Ucak (
    ucak_id INT AUTO_INCREMENT PRIMARY KEY,
    firma_id INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    koltuk_sayisi INT NOT NULL,
    ucus_menzili INT,
    FOREIGN KEY (firma_id) REFERENCES Hava_Yolu_Sirketi(firma_id) ON DELETE CASCADE,
    INDEX idx_firma (firma_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Uçuş Tablosu 
CREATE TABLE Ucus (
    ucus_id INT AUTO_INCREMENT PRIMARY KEY,
    ucak_id INT NOT NULL,
    kalkis_havalimani_id INT NOT NULL,
    varis_havalimani_id INT NOT NULL,
    kalkis_tarihi_saati DATETIME NOT NULL,
    tahmini_sure INT NOT NULL COMMENT 'Dakika cinsinden',
    temel_fiyat DECIMAL(10, 2) NOT NULL,
    ucus_durumu ENUM('Zamanında', 'Gecikti', 'İptal', 'Tamamlandı') DEFAULT 'Zamanında',
    ucus_no VARCHAR(10) NOT NULL UNIQUE,
    FOREIGN KEY (kalkis_havalimani_id) REFERENCES Havalimani(havalimani_id) ON DELETE CASCADE,
    FOREIGN KEY (varis_havalimani_id) REFERENCES Havalimani(havalimani_id) ON DELETE CASCADE,
    FOREIGN KEY (ucak_id) REFERENCES Ucak(ucak_id) ON DELETE CASCADE,
    INDEX idx_kalkis_tarih (kalkis_tarihi_saati),
    INDEX idx_havalimanlari (kalkis_havalimani_id, varis_havalimani_id),
    INDEX idx_ucus_no (ucus_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Yolcu Tablosu 
CREATE TABLE Yolcu (
    tc_kimlik CHAR(11) PRIMARY KEY,
    yolcu_ad VARCHAR(50) NOT NULL,
    yolcu_soyad VARCHAR(50) NOT NULL,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ad_soyad (yolcu_ad, yolcu_soyad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bilet Tablosu 
CREATE TABLE Bilet (
    bilet_id INT AUTO_INCREMENT PRIMARY KEY,
    ucus_id INT NOT NULL,
    kullanici_id INT NULL,
    koltuk_no VARCHAR(5) NOT NULL,
    tc_kimlik CHAR(11) NOT NULL,
    odeme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bilet_durumu ENUM('Aktif', 'İptal', 'Kullanıldı') DEFAULT 'Aktif',
    fiyat DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (ucus_id) REFERENCES Ucus(ucus_id) ON DELETE CASCADE,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(kullanici_id) ON DELETE SET NULL,
    FOREIGN KEY (tc_kimlik) REFERENCES Yolcu(tc_kimlik) ON DELETE RESTRICT,
    UNIQUE KEY unique_koltuk_ucus (ucus_id, koltuk_no),
    INDEX idx_kullanici (kullanici_id),
    INDEX idx_ucus (ucus_id),
    INDEX idx_bilet_durumu (bilet_durumu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



