# Inventory Allocation System

Halo! Ini adalah solusi technical test untuk Foom Lab Global. Repository ini berisi sistem manajemen Purchase Request yang terdiri dari Backend API dan Frontend application.

## Struktur Project

- `backend/`: API menggunakan Node.js, Express.js, dan Sequelize ORM.
- `frontend/`: Aplikasi web menggunakan Next.js dan Material UI.

## Cara Menjalankan (Local)

### Prasyarat

- Node.js (v18 ke atas)
- PostgreSQL

### 1. Setup Backend

1.  Masuk ke folder backend:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Setup Environment Variables:
    - Copy file `.env.example` menjadi `.env`:
      ```bash
      cp .env.example .env
      ```
    - Sesuaikan konfigurasi database di file `.env`.
4.  Buat Database:
    ```bash
    npx sequelize-cli db:create
    ```
    > **Note**: Pastikan PostgreSQL sudah berjalan dan kredensial di `.env` sudah benar.
5.  Jalankan Migrasi dan Seeding Database:
    ```bash
    npx sequelize-cli db:migrate
    npx sequelize-cli db:seed:all
    ```
6.  Jalankan server:
    ```bash
    npm run dev
    ```
    Server akan berjalan di `http://localhost:8080`.

### 2. Setup Frontend

1.  Masuk ke folder frontend:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Setup Environment Variables:
    - Copy file `.env.example` menjadi `.env`:
      ```bash
      cp .env.example .env
      ```
4.  Jalankan aplikasi:
    ```bash
    npm run dev
    ```
    Akses aplikasi di `http://localhost:3000`.

### 3. Testing Webhook dengan Ngrok

Untuk testing webhook dari vendor eksternal (simulasi), Anda perlu expose local server ke internet menggunakan ngrok:

1.  **Install ngrok**:

    - Download dari [ngrok.com](https://ngrok.com/download)
    - Atau install via package manager:

      ```bash
      # Windows (Chocolatey)
      choco install ngrok

      # macOS (Homebrew)
      brew install ngrok

      # Linux (Snap)
      snap install ngrok
      ```

2.  **Jalankan ngrok** untuk expose backend server:
    ```bash
    ngrok http 8080
    ```
3.  **Copy URL ngrok** yang muncul (contoh: `https://abc123.ngrok.io`)

4.  **Gunakan URL webhook** untuk testing:

    ```
    https://abc123.ngrok.io/webhook/purchase-request
    ```

    > **Note**: URL ngrok ini yang akan digunakan oleh vendor untuk mengirim notifikasi status purchase request.

5.  **Testing webhook** dengan curl atau Postman:
    ```bash
    curl -X POST https://abc123.ngrok.io/webhook/purchase-request \
      -H "Content-Type: application/json" \
      -d '{
        "purchase_request_id": 1,
        "status": "COMPLETED"
      }'
    ```

> **Tips**:
>
> - Ngrok free tier akan generate URL baru setiap kali restart. Untuk URL tetap, gunakan ngrok paid plan.
> - Pastikan backend server sudah running sebelum menjalankan ngrok.
> - Monitor webhook requests di ngrok dashboard: `http://127.0.0.1:4040`

## Keputusan Desain (Design Decisions)

### 1. Arsitektur

- **MVC Pattern**: Di backend, saya memisahkan logic menjadi Model, View (Response), dan Controller agar kode lebih rapi dan mudah di-maintain.
- **Next.js App Router**: Di frontend, saya menggunakan App Router terbaru dari Next.js untuk routing yang lebih modern.

### 2. Database & Data

- **PostgreSQL & Sequelize**: Kombinasi ini dipilih karena keandalan relasionalnya dan kemudahan manajemen skema database.
- **Transactions**: Fitur krusial yang saya implementasikan. Saat membuat Purchase Request beserta item-itemnya, kita harus memastikan semuanya tersimpan atau tidak sama sekali (atomic) untuk mencegah data korup.

### 3. Manajemen Vendor

- **Fleksibilitas**: Nama vendor tidak di-hardcode di kodingan, tapi diambil dari `.env` (`VENDOR_NAME`). Ini memudahkan jika nanti nama vendor berubah atau berbeda di environment lain.

### 4. Webhook

- **Idempotency**: Saya memastikan webhook yang sama tidak diproses dua kali (misal jika status sudah selesai) untuk menghindari update stok ganda.
- **Atomic Increment**: Update stok menggunakan fungsi `increment` dari database untuk menghindari race condition jika ada request bersamaan.

## Ide Pengembangan Selanjutnya (Possible Improvements)

Berikut adalah beberapa hal yang bisa ditingkatkan agar sistem ini lebih scalable dan robust:

1.  **API Grouping & Versioning**:

    - Menambahkan prefix `/api` untuk semua endpoint agar lebih terstruktur.
    - Menerapkan versioning seperti `/api/v1/products`. Ini penting agar perubahan di masa depan tidak merusak aplikasi client yang sudah ada (backward compatibility).

2.  **Monorepo Architecture (Turborepo)**:

    - Menggabungkan backend dan frontend dalam satu repository menggunakan tools seperti Turborepo.
    - **Benefit**: Bisa menjalankan backend dan frontend secara bersamaan dengan satu perintah, sharing type/interface antar backend-frontend, dan manajemen dependency yang lebih efisien.

3.  **Authentication**: Menambahkan login system (JWT) untuk mengamankan endpoint.

4.  **Docker**: Membungkus aplikasi dengan Docker agar mudah dijalankan di environment mana saja tanpa pusing setup manual.
