# BOBFLY - Uçak Bileti Arama ve Satın Alma Sistemi

BIL372 Veritabanı Sistemleri dersi için geliştirilmiş, Türkiye ve çevresindeki bölgelerde hava yolu seyahati için bilet arama, karşılaştırma ve satın alma işlemlerinin gerçekleştirilebildiği bir web platformudur.

## Proje Hakkında

### Proje Ekibi
- **Berkhan Öztürk** - 211101005
- **Osman Kaymakçı** - 211101064
- **Batuhan Temel Karahmet** - 211101070

### Proje Özellikleri

- Uçuş arama ve karşılaştırma
- **Alternatif Tarih Önerisi** (Uçuş bulunamazsa otomatik alternatif günleri gösterir)
- Gerçek zamanlı koltuk seçimi
- Bilet rezervasyonu ve satın alma
- Kullanıcı kayıt ve giriş sistemi
- Bilet yönetimi (görüntüleme, iptal)
- Güvenli veri yönetimi (bcrypt şifreleme)
- Responsive tasarım
- **BCNF Normalizasyonu** (7/7 tablo BCNF seviyesinde)

## Proje Yapısı

```
BOBfly/
├── backend/                    # Backend API (Node.js/Express)
│   ├── config/
│   │   └── database.js        # Veritabanı bağlantı ayarları
│   ├── routes/
│   │   ├── ucusRoutes.js      # Uçuş API endpoints
│   │   ├── biletRoutes.js     # Bilet API endpoints
│   │   ├── kullaniciRoutes.js # Kullanıcı API endpoints
│   │   └── havalimanRoutes.js # Havalimanı API endpoints
│   ├── package.json
│   └── server.js              # Ana sunucu dosyası
│
├── frontend/                   # Frontend (HTML/CSS/JS)
│   ├── js/
│   │   ├── config.js          # API ve genel ayarlar
│   │   ├── auth.js            # Kimlik doğrulama
│   │   ├── main.js            # Ana sayfa fonksiyonları
│   │   ├── ucus-sonuclari.js  # Uçuş sonuçları
│   │   ├── bilet-satin-al.js  # Bilet satın alma
│   │   └── biletlerim.js      # Biletlerim sayfası
│   ├── index.html             # Ana sayfa
│   ├── ucus-sonuclari.html    # Uçuş sonuçları sayfası
│   ├── bilet-satin-al.html    # Bilet satın alma sayfası
│   ├── biletlerim.html        # Biletlerim sayfası
│   └── yardim.html            # Yardım sayfası
│
├── database/                   # Veritabanı
│   ├── schema.sql             # Veritabanı şeması (BCNF)
│   ├── sample_data.sql        # Temel örnek veriler
│   ├── additional_data.sql    # Ek demo verileri
│   ├── bcnf_migration.sql     # BCNF normalizasyon scripti
│   ├── views.sql              # View tanımları
│   └── queries.sql            # Test sorguları
│__

```

## Kurulum

### Gereksinimler

- **Node.js** (v18 veya üzeri)
- **MySQL** (v8.0 veya üzeri)
- **npm** (Node.js ile birlikte gelir)
- Web tarayıcısı (Chrome, Firefox, Safari vb.)

### 1. Projeyi İndirin

```bash
# GitHub'dan klonlayın
git clone https://github.com/yourusername/BOBfly.git
cd BOBfly
```

### 2. Veritabanı Kurulumu

```bash
# MySQL'e bağlanın
mysql -u root -p

# Veritabanını oluşturun ve şemayı yükleyin
source database/schema.sql

# Temel verileri yükleyin (havalimanı, firma, uçak)
source database/sample_data.sql

# Ek uçuş verilerini yükleyin
source database/additional_data.sql

# View'ları oluşturun
source database/views.sql
```

### 3. Backend Kurulumu

```bash
# Backend dizinine gidin
cd backend

# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini ayarlayın
# .env dosyası oluşturun:
cp .env.example .env  # (eğer varsa)
# veya manuel olarak .env dosyası oluşturun
```

`.env` dosyası içeriği:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bobfly
DB_PORT=3306
```

```bash
# Sunucuyu başlatın
npm start
```

Sunucu `http://localhost:3000` adresinde çalışmaya başlayacaktır.

### 4. Frontend Kurulumu

```bash
# Proje kök dizinine dönün
cd ..

# Frontend dizinine gidin
cd frontend

# Herhangi bir HTTP sunucusu ile çalıştırın
# Örnek 1: Python ile
python -m http.server 8080

# Örnek 2: Node.js http-server ile
npx http-server -p 8080

# Örnek 3: PHP ile
php -S localhost:8080
```

Tarayıcınızda `http://localhost:8080` adresini açın.

## Veritabanı Şeması

### Ana Tablolar 

1. **Kullanici** - Sisteme kayıtlı kullanıcılar
2. **Hava_Yolu_Sirketi** - Hava yolu şirketleri
3. **Havalimani** - Havalimanları (IATA/ICAO kodları ile)
4. **Ucak** - Uçak bilgileri
5. **Ucus** - Uçuş seferleri 
6. **Yolcu** - Yolcu bilgileri 
7. **Bilet** - Satın alınan biletler 



## 🔌 API Endpoints

### Uçuş İşlemleri
```
GET    /api/ucuslar/ara?kalkis=IST&varis=ADB&tarih=2025-10-25
GET    /api/ucuslar/ara/alternatif-tarihler?kalkis=IST&varis=ESB
GET    /api/ucuslar/:ucus_id
GET    /api/ucuslar/:ucus_id/koltuklar
GET    /api/ucuslar/rapor/firma?firma_id=1&tarih=2025-10-25
```

### Bilet İşlemleri
```
POST   /api/biletler/rezervasyon
POST   /api/biletler/satin-al
PUT    /api/biletler/iptal/:bilet_id
GET    /api/biletler/kullanici/:kullanici_id
GET    /api/biletler/:bilet_id
```

### Kullanıcı İşlemleri
```
POST   /api/kullanicilar/kayit
POST   /api/kullanicilar/giris
GET    /api/kullanicilar/:kullanici_id
PUT    /api/kullanicilar/:kullanici_id
```

### Havalimanı İşlemleri
```
GET    /api/havalimanlar
GET    /api/havalimanlar/:havalimani_id
GET    /api/havalimanlar/iata/:iata_kodu
```

## 💡 Kullanım

### 1. Uçuş Arama
- Ana sayfada kalkış ve varış havalimanını seçin
- Gidiş tarihini belirleyin
- "Uçuş Ara" butonuna tıklayın
- Eğer uçuş bulunamazsa, alternatif tarihler otomatik gösterilir

### 2. Bilet Satın Alma
- Uçuş sonuçlarından uygun uçuşu seçin
- Koltuk haritasından yerinizi seçin
- Yolcu bilgilerini girin (TC Kimlik, Ad, Soyad)
- Ödeme işlemini tamamlayın

### 3. Bilet Yönetimi
- "Biletlerim" sayfasından tüm biletlerinizi görüntüleyin
- Aktif/İptal/Kullanıldı filtrelerini kullanabilirsiniz
- Gerekirse biletinizi iptal edebilirsiniz

## Test Kullanıcıları

Örnek veriler yüklendikten sonra bu kullanıcılarla test edebilirsiniz:

```
E-posta: ahmet@test.com
Şifre: 123456
```

**Not:** Test kullanıcılarının şifreleri `123456`'dır (bcrypt hash'lenmiş).

## 🔧 Teknolojiler

### Backend
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - MySQL client (ODBC/JDBC eşdeğeri)
- **bcryptjs** - Şifre hashleme
- **dotenv** - Ortam değişkenleri yönetimi
- **cors** - Cross-Origin Resource Sharing

### Frontend
- **HTML5** - Yapı
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (ES6+)** - Vanilla JavaScript
- **Font Awesome** - İkonlar

### Database
- **MySQL 8.0.39** - İlişkisel veritabanı
- **InnoDB** - Storage engine (Transaction, Foreign Key desteği)
- **13 Performans İndeksi** - Optimize edilmiş sorgular
- **4 View** - Karmaşık sorguları basitleştirme

## Temel İşlevler

### Kullanıcı Tarafı
- Uçuş arama ve filtreleme
- Alternatif tarih önerisi
- Koltuk seçimi
- Bilet rezervasyonu
- Bilet satın alma
- Bilet iptal etme
- Kullanıcı kayıt/giriş
- Profil yönetimi

### Sistem Tarafı
- Veritabanı yönetimi (BCNF)
- RESTful API servisleri
- Transaction yönetimi
- Kimlik doğrulama
- Veri güvenliği (SQL Injection koruması)
- Connection pooling



**BOBFLY** - Uçak Bileti Arama ve Satın Alma Sistemi  
BIL372 Veritabanı Sistemleri Projesi 
