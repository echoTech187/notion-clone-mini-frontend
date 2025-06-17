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
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
