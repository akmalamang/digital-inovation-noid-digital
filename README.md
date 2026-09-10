This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
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

# 💍 Wedding Invitation API

Backend API untuk sistem undangan digital berbasis **Next.js + Prisma + MySQL**.

---

## ⚙️ Setup

### 1. Install dependencies

```bash
npm install prisma @prisma/client bcryptjs next-auth
npm install -D @types/bcryptjs
```

### 2. Konfigurasi database

```bash
cp .env.example .env
# Edit .env dan isi DATABASE_URL dengan koneksi MySQL kamu
```

### 3. Jalankan migration

```bash
npx prisma migrate dev --name init
```

### 4. (Opsional) Lihat database di browser

```bash
npx prisma studio
```

---

## 📡 Daftar Endpoint

### Users

| Method | Endpoint       | Keterangan       |
| ------ | -------------- | ---------------- |
| GET    | /api/users     | Ambil semua user |
| POST   | /api/users     | Buat user baru   |
| GET    | /api/users/:id | Ambil user by ID |
| PUT    | /api/users/:id | Update user      |
| DELETE | /api/users/:id | Hapus user       |

### Themes

| Method | Endpoint        | Keterangan       |
| ------ | --------------- | ---------------- |
| GET    | /api/themes     | Ambil semua tema |
| POST   | /api/themes     | Tambah tema baru |
| GET    | /api/themes/:id | Ambil tema by ID |
| PUT    | /api/themes/:id | Update tema      |
| DELETE | /api/themes/:id | Hapus tema       |

### Invitations

| Method | Endpoint                    | Keterangan                      |
| ------ | --------------------------- | ------------------------------- |
| GET    | /api/invitations            | Ambil semua undangan            |
| POST   | /api/invitations            | Buat undangan baru              |
| GET    | /api/invitations/:id        | Ambil undangan by ID            |
| PUT    | /api/invitations/:id        | Update undangan                 |
| DELETE | /api/invitations/:id        | Hapus undangan                  |
| GET    | /api/invitations/slug/:slug | Ambil undangan by slug (publik) |

### Wedding Details

| Method | Endpoint                 | Keterangan               |
| ------ | ------------------------ | ------------------------ |
| POST   | /api/wedding-details     | Buat detail pernikahan   |
| GET    | /api/wedding-details/:id | Ambil detail by ID       |
| PUT    | /api/wedding-details/:id | Update detail pernikahan |
| DELETE | /api/wedding-details/:id | Hapus detail             |

### Galleries

| Method | Endpoint                      | Keterangan             |
| ------ | ----------------------------- | ---------------------- |
| GET    | /api/galleries?invitationId=1 | Ambil foto by undangan |
| POST   | /api/galleries                | Tambah foto            |
| PUT    | /api/galleries/:id            | Update foto            |
| DELETE | /api/galleries/:id            | Hapus foto             |

### Digital Wallets

| Method | Endpoint                            | Keterangan      |
| ------ | ----------------------------------- | --------------- |
| GET    | /api/digital-wallets?invitationId=1 | Ambil rekening  |
| POST   | /api/digital-wallets                | Tambah rekening |
| PUT    | /api/digital-wallets/:id            | Update rekening |
| DELETE | /api/digital-wallets/:id            | Hapus rekening  |

### Guest Books

| Method | Endpoint                        | Keterangan           |
| ------ | ------------------------------- | -------------------- |
| GET    | /api/guest-books?invitationId=1 | Ambil ucapan tamu    |
| POST   | /api/guest-books                | Kirim ucapan (tamu)  |
| DELETE | /api/guest-books/:id            | Hapus ucapan (admin) |

---

## 📦 Contoh Request

### Buat undangan baru

```json
POST /api/invitations
{
  "userId": 1,
  "themeId": 2,
  "slug": "budi-riri"
}
```

### Isi detail pernikahan

```json
POST /api/wedding-details
{
  "invitationId": 1,
  "bridegroomName": "Budi Santoso",
  "bridegroomShortName": "Budi",
  "bridegroomParent": "Bapak Hendra & Ibu Dewi",
  "brideName": "Riri Amelia",
  "brideShortName": "Riri",
  "brideParent": "Bapak Surya & Ibu Wati",
  "akadDate": "2025-09-20",
  "akadTime": "08:00:00",
  "akadLocation": "Masjid Al-Ikhlas, Jakarta Selatan",
  "receptionDate": "2025-09-20",
  "receptionTime": "11:00:00",
  "receptionLocation": "Gedung Sasana Kriya, TMII"
}
```

### Tamu kirim ucapan

```json
POST /api/guest-books
{
  "invitationId": 1,
  "guestName": "Andi Wijaya",
  "rsvp": "hadir",
  "wishes": "Selamat menempuh hidup baru, semoga langgeng!"
}
```
