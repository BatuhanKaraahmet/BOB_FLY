USE bobfly;

-- Hava Yolu Şirketleri
INSERT INTO Hava_Yolu_Sirketi (firma_ad, logo_url) VALUES
('Turkish Airlines', 'https://example.com/logos/thy.png'),
('Pegasus Airlines', 'https://example.com/logos/pegasus.png'),
('SunExpress', 'https://example.com/logos/sunexpress.png'),
('AnadoluJet', 'https://example.com/logos/anadolujet.png');

-- Havalimanları
INSERT INTO Havalimani (ad, sehir, iata_kodu, icao_kodu) VALUES
('İstanbul Havalimanı', 'İstanbul', 'IST', 'LTFM'),
('Sabiha Gökçen Havalimanı', 'İstanbul', 'SAW', 'LTFJ'),
('Esenboğa Havalimanı', 'Ankara', 'ESB', 'LTAC'),
('Adnan Menderes Havalimanı', 'İzmir', 'ADB', 'LTBJ'),
('Antalya Havalimanı', 'Antalya', 'AYT', 'LTAI'),
('Milas-Bodrum Havalimanı', 'Bodrum', 'BJV', 'LTFE'),
('Dalaman Havalimanı', 'Muğla', 'DLM', 'LTBS'),
('Trabzon Havalimanı', 'Trabzon', 'TZX', 'LTCG'),
('Gaziantep Havalimanı', 'Gaziantep', 'GZT', 'LTAJ');

-- Uçaklar
INSERT INTO Ucak (firma_id, model, koltuk_sayisi, ucus_menzili) VALUES
(1, 'Boeing 737-800', 180, 5400),
(1, 'Airbus A321neo', 200, 7400),
(2, 'Boeing 737-800', 189, 5436),
(2, 'Airbus A320neo', 186, 6300),
(3, 'Boeing 737-800', 189, 5436),
(4, 'Boeing 737-800', 189, 5436);

-- Kullanıcılar (şifre: 123456 - hash'lenmiş hali)
INSERT INTO Kullanici (ad, soyad, e_posta, telefon, sifre_hash) VALUES
('Berkhan', 'Öztürk', 'berkhan@example.com', '05551234567', '$2a$10$rGHQGpqY5EYhSKmL8QUHh.VYg7vYJKYz3kYQKxGxQKQKxGxQKQKxG'),
('Osman', 'Kaymakçı', 'osman@example.com', '05559876543', '$2a$10$rGHQGpqY5EYhSKmL8QUHh.VYg7vYJKYz3kYQKxGxQKQKxGxQKQKxG'),
('Batuhan', 'Temel Karahmet', 'batuhan@example.com', '05551122334', '$2a$10$rGHQGpqY5EYhSKmL8QUHh.VYg7vYJKYz3kYQKxGxQKQKxGxQKQKxG');

-- Uçuşlar 
INSERT INTO Ucus (firma_id, kalkis_havalimani_id, varis_havalimani_id, ucak_id, kalkis_tarihi_saati, tahmini_sure, temel_fiyat, ucus_durumu, ucus_no) VALUES
-- İstanbul - Ankara Uçuşları
(1, 1, 3, 1, '2025-10-25 08:00:00', 60, 750.00, 'Zamanında', 'TK2001'),
(2, 1, 3, 3, '2025-10-25 10:30:00', 65, 450.00, 'Zamanında', 'PC1234'),
(1, 1, 3, 2, '2025-10-25 14:00:00', 60, 850.00, 'Zamanında', 'TK2003'),
(4, 2, 3, 6, '2025-10-25 16:30:00', 70, 550.00, 'Zamanında', 'AJ501'),

-- İstanbul - İzmir Uçuşları
(1, 1, 4, 1, '2025-10-25 07:00:00', 70, 800.00, 'Zamanında', 'TK2101'),
(2, 2, 4, 3, '2025-10-25 09:15:00', 75, 500.00, 'Zamanında', 'PC2100'),
(3, 1, 4, 5, '2025-10-25 12:00:00', 70, 650.00, 'Zamanında', 'XQ101'),
(1, 1, 4, 2, '2025-10-25 18:30:00', 70, 900.00, 'Zamanında', 'TK2105'),

-- İstanbul - Antalya Uçuşları
(1, 1, 5, 1, '2025-10-25 06:30:00', 80, 950.00, 'Zamanında', 'TK2201'),
(2, 2, 5, 3, '2025-10-25 08:45:00', 85, 600.00, 'Zamanında', 'PC2200'),
(3, 1, 5, 5, '2025-10-25 11:15:00', 80, 750.00, 'Zamanında', 'XQ201'),
(2, 1, 5, 4, '2025-10-25 15:45:00', 85, 700.00, 'Zamanında', 'PC2202'),

-- Ankara - İzmir Uçuşları
(1, 3, 4, 1, '2025-10-25 09:00:00', 65, 700.00, 'Zamanında', 'TK3101'),
(2, 3, 4, 3, '2025-10-25 13:30:00', 70, 480.00, 'Zamanında', 'PC3100'),

-- İzmir - Bodrum Uçuşları
(3, 4, 6, 5, '2025-10-25 10:00:00', 45, 400.00, 'Zamanında', 'XQ301'),
(2, 4, 6, 3, '2025-10-25 17:00:00', 45, 450.00, 'Zamanında', 'PC3001'),

-- Dönüş Uçuşları (26 Ekim)
(1, 3, 1, 1, '2025-10-26 09:00:00', 60, 780.00, 'Zamanında', 'TK2002'),
(2, 3, 1, 3, '2025-10-26 11:30:00', 65, 480.00, 'Zamanında', 'PC1235'),
(1, 4, 1, 2, '2025-10-26 08:00:00', 70, 850.00, 'Zamanında', 'TK2102'),
(2, 5, 1, 4, '2025-10-26 20:00:00', 85, 720.00, 'Zamanında', 'PC2203');

-- Örnek Biletler
INSERT INTO Bilet (ucus_id, kullanici_id, koltuk_no, yolcu_ad, yolcu_soyad, tc_kimlik, fiyat, bilet_durumu) VALUES
(1, 1, '12A', 'Berkhan', 'Öztürk', '12345678901', 750.00, 'Aktif'),
(1, 2, '12B', 'Osman', 'Kaymakçı', '98765432109', 750.00, 'Aktif'),
(2, 3, '15C', 'Batuhan', 'Temel Karahmet', '11223344556', 450.00, 'Aktif');



