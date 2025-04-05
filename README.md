# Geo API Server - Backend

Bu repo, Geo API'nin backend bileşenini içerir. NestJS kullanılarak geliştirilmiş olup, Prisma ORM aracılığıyla PostgreSQL ve PostGIS ile entegre edilmiştir.

## Gereksinimler

- Node.js (18.x veya üzeri)
- PostgreSQL ve PostGIS (Docker ile veya yerel olarak)
- npm veya yarn

## Kurulum Adımları

### 1. Projeyi Klonlama

```bash
git clone https://github.com/kullanici/geo-api-server-backend.git
cd geo-api-server-backend
```

### 2. Bağımlılıkları Yükleme

```bash
npm install
```

### 3. Ortam Değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişiklikleri yapın:

```bash
cp .env.example .env
```

### 4. Veritabanı Kurulumu (Docker)

```bash
# Docker ile PostgreSQL ve PostGIS kurulumu
docker run --name postgis -e POSTGRES_PASSWORD=password -e POSTGRES_DB=geodb -p 5432:5432 -d postgis/postgis
```

### 5. Prisma Kurulumu

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Uygulamayı Başlatma

```bash
npm run start:dev
```

## API Endpointleri

Backend API, http://localhost:3000/api adresinde çalışır ve aşağıdaki ana endpointleri içerir:

### 1. Auth Endpointleri

- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/refresh` - JWT token yenileme
- `GET /api/auth/users` - Tüm kullanıcıları listeleme (test için)

### 2. API Key Endpointleri

- `GET /api/api-keys/list` - API anahtarlarını listeleme
- `POST /api/api-keys/create` - Yeni API anahtarı oluşturma
- `GET /api/api-keys/:id` - Belirli bir API anahtarını görüntüleme
- `PUT /api/api-keys/:id` - Belirli bir API anahtarını güncelleme
- `DELETE /api/api-keys/:id` - Belirli bir API anahtarını silme

### 3. Geo API Endpointleri

- `GET /api/geo/coordinates` - Koordinatlardan konum bilgisi
- `GET /api/geo/city/:id` - Şehir ID'sine göre coğrafi veri
- `GET /api/geo/geojson` - Tüm şehirleri GeoJSON formatında alma

## Örnek API Yanıtları

### Koordinatlardan Konum Bilgisi

**Endpoint:** `GET /api/geo/coordinates?latitude=41.0082&longitude=28.9784`

**Örnek Yanıt:**
```json
{
  "id": 1,
  "name": "Istanbul",
  "country": "Turkey",
  "coordinates": {
    "latitude": 41.0135,
    "longitude": 29.0277
  },
  "population": 15462452,
  "timezone": "Europe/Istanbul",
  "distance": 3
}
```

## Mock Veri Kullanımı

Backend API, PostgreSQL veritabanına bağlantı kurulamadığında otomatik olarak mock verilere geri döner. Mock kullanıcıları:

1. **Admin Kullanıcısı**
   - Email: admin@example.com
   - Şifre: password123

2. **Test Kullanıcısı**
   - Email: user@example.com
   - Şifre: password123

## Teknoloji Yığını

- **Framework**: NestJS
- **ORM**: Prisma
- **Veritabanı**: PostgreSQL, PostGIS
- **Auth**: JWT, bcrypt 