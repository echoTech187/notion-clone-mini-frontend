# NotionCloneMini - Real-time Collaborative Note Taking Application

**NotionCloneMini** adalah aplikasi pencatat kolaboratif real-time yang memungkinkan beberapa pengguna untuk mengedit catatan secara bersamaan. Aplikasi ini dikembangkan menggunakan Next.js untuk frontend dan Node.js dengan Express serta MongoDB untuk backend, dilengkapi dengan fitur auto-save untuk fungsionalitas real-time.

## Fitur Utama

* **Autentikasi Pengguna:** Pendaftaran, Login, Logout dengan JWT.
* **Manajemen Catatan:** Buat, Lihat, Edit, Hapus catatan.
* **Editor Rich-Text:** Menggunakan BlockNote untuk pengalaman mengedit yang kaya.
* **Auto-Save:** Catatan secara otomatis disimpan saat pengguna mengetik, dengan *debouncing* untuk mengoptimalkan permintaan ke server.
* **Kolaborasi Real-time:** Perubahan pada catatan disinkronkan secara instan ke semua pengguna yang melihat catatan yang sama.
* **Unggah Gambar:** Mendukung unggah gambar ke dalam catatan (disimpan secara lokal di server).
* **Responsif:** Antarmuka pengguna yang adaptif untuk berbagai ukuran layar.

## Teknologi yang Digunakan

### Frontend (Client)
* **Next.js:** Framework React untuk membangun aplikasi web.
* **React:** Library JavaScript untuk membangun antarmuka pengguna.
* **Tailwind CSS:** Framework CSS utilitas-first untuk styling cepat dan kustomisasi.
* **BlockNote/React:** Editor rich-text yang fleksibel dan dapat diperluas.
* **Axios:** Klien HTTP untuk membuat permintaan ke API backend.
* **JS-Cookie:** Untuk manajemen cookie di sisi klien.

### Backend (Server)
* **Node.js:** Runtime JavaScript.
* **Express.js:** Framework web untuk Node.js.
* **MongoDB:** Database NoSQL untuk menyimpan data catatan dan pengguna.
* **Mongoose:** ODM (Object Data Modeling) untuk MongoDB di Node.js.
* **Socket.IO:** Library untuk komunikasi real-time bidirectional.
* **bcryptjs:** Untuk hashing password pengguna.
* **jsonwebtoken (JWT):** Untuk otentikasi pengguna.
* **dotenv:** Untuk memuat variabel lingkungan dari file `.env`.
* **cookie-parser:** Middleware untuk parsing cookie.
* **cors:** Middleware untuk mengelola Cross-Origin Resource Sharing.
* **Multer:** Middleware Node.js untuk menangani `multipart/form-data`, terutama untuk unggah file.
* **path & fs:** Modul bawaan Node.js untuk menangani jalur file dan sistem file.

## Panduan Instalasi

Ikuti langkah-langkah di bawah ini untuk mengatur dan menjalankan proyek di lingkungan lokal Anda.

### 1. Clone Repositori

```bash
git clone [<URL_REPOSITORI_ANDA>](https://github.com/echoTech187/notion-clone-mini-frontend)
cd notion-clone-mini-frontend
```

### 2. Instalansi Backend 
```bash
cd backend
npm install
npm run dev
```
Aplikasi Backend akan berjalan di **http://localhost:5000** (atau port lain yang tersedia). Buka browser Anda dan navigasikan ke URL tersebut.


### 3. Configure Environment Variables
Buat file `.env` di dalam direktori server/ dan tambahkan konfigurasi berikut:
```
NODE_ENV=development
PORT=5000

CRYPTO_KEY=SECRET_KEY

## BCRYPT CONFIG ##
BCRYPT_SALT_ROUNDS=12

## JWT CONFIG ##
JWT_SECRET=SECRET_KEY
JWT_EXPIRE=30d

## COOKIE CONFIG ##
COOKIE_SECRET=SECRET_KEY
COOKIE_EXPIRE=30

## MONGO DATABASE CONFIG ##
MONGO_URI='mongodb://127.0.0.1:27017/mini-notion-db'
```

### 4. Instalansi Frontend
```bash
cd frontends
npm install
npm run dev
```
Aplikasi Frontend akan berjalan di **http://localhost:3000** (atau port lain yang tersedia). Buka browser Anda dan navigasikan ke URL tersebut.


### 5. Catatan Tambahan / Troubleshooting
* **Koneksi MongoDB**: Pastikan layanan MongoDB Anda berjalan sebelum memulai server backend.
* **Port Conflict:** Jika Anda mengalami masalah Address already in use, pastikan tidak ada aplikasi lain yang berjalan di port 5000 (untuk backend) atau 3000 (untuk frontend).
* **CORS Issues:** Pastikan konfigurasi corsOptions di server/server.js mengizinkan http://localhost:3000 sebagai origin, terutama selama pengembangan.
* **Environment Variables:** Pastikan file .env dan .env.local Anda sudah terisi dengan benar dan sesuai dengan setup Anda. Restart server/frontend setelah mengubah file .env.
* **BlockNote Version:** Aplikasi ini dikembangkan dengan @blocknote/react dan @blocknote/core versi 0.31.2. Pastikan dependensi Anda cocok untuk menghindari masalah kompatibilitas.
* **Frontend axios BaseURL:** Pastikan baseURL di client/lib/axios.js dan NEXT_PUBLIC_API_URL di client/.env.local menunjuk dengan benar ke URL API backend Anda (termasuk /api jika digunakan sebagai prefix).


