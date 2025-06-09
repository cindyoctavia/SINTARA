# SINTARA.id - WebGIS Platform

Platform WebGIS untuk Sistem Informasi Pertanahan Desa Repaking yang telah dioptimalkan untuk hosting di Vercel.

## 🚀 Deploy ke Vercel

Untuk mendeploy aplikasi ini ke Vercel, ikuti langkah-langkah berikut:

### 1. Persiapan Repository

1. Inisialisasi Git repository (jika belum):

```bash
git init
git add .
git commit -m "Initial commit"
```

2. Push ke GitHub/GitLab:

```bash
git remote add origin <your-repository-url>
git push -u origin main
```

### 2. Deploy dengan Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login ke Vercel:

```bash
vercel login
```

3. Deploy aplikasi:

```bash
vercel
```

### 3. Deploy melalui Vercel Dashboard

1. Kunjungi [vercel.com](https://vercel.com)
2. Login dan klik "New Project"
3. Import repository GitHub/GitLab Anda
4. Vercel akan otomatis mendeteksi konfigurasi dari `vercel.json`
5. Klik "Deploy"

## 📁 Struktur File

```
SINTARA/
├── index.html          # File utama HTML (converted dari PHP)
├── js/
│   └── app.js         # JavaScript untuk interaktivitas
├── package.json       # Konfigurasi Node.js
├── vercel.json        # Konfigurasi Vercel
└── README.md          # Dokumentasi ini
```

## 🔧 Perubahan dari Versi PHP

- File `index.php` telah dikonversi menjadi `index.html`
- JavaScript dipisahkan ke file `js/app.js`
- Ditambahkan konfigurasi Vercel untuk static hosting
- Semua fungsi frontend tetap sama

## 🌐 Fitur WebGIS

- **Peta Interaktif**: Menggunakan Leaflet.js
- **Layer Management**: Batas desa, bidang tanah, jalan, penggunaan lahan, sungai
- **GeoServer Integration**: Untuk data spasial
- **Responsive Design**: Kompatibel dengan desktop dan mobile
- **User Interface**: Modern dan user-friendly

## 📋 Persyaratan

- Tidak ada server-side requirement (static hosting)
- Browser modern dengan dukungan ES6+
- Koneksi internet untuk CDN dependencies

## 🛠️ Konfigurasi GeoServer

Jika menggunakan GeoServer, pastikan untuk:

1. Update URL GeoServer di `js/app.js`:

```javascript
const config = {
  geoServerUrl: 'https://your-geoserver-url/geoserver/SIP_DesaRepaking',
  // ... konfigurasi lainnya
};
```

2. Pastikan CORS enabled di GeoServer untuk domain Vercel Anda

## 📞 Support

Untuk pertanyaan atau masalah deployment, silakan hubungi tim pengembang SINTARA.id

## 📄 License

MIT License - Lihat file LICENSE untuk detail lengkap.
