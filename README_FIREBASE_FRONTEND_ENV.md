# Setup Firebase Web SDK Frontend

Patch ini membuat koneksi API Auth tetap memakai relative URL Laravel seperti `/api/v1/identity/auth`, jadi `.env` tidak dipakai untuk endpoint backend.

`.env.local` hanya dipakai untuk konfigurasi Firebase Web SDK di frontend. Jangan pernah menaruh `serviceAccountKey.json` di frontend. File tersebut hanya untuk backend Laravel/Kreait.

## Cara pakai

1. Copy `.env.local.example` menjadi `.env.local` di root frontend.
2. Isi semua value dari Firebase Console > Project settings > General > Your apps > Web app config.
3. Tambahkan isi `GITIGNORE_ADD_THIS.txt` ke `.gitignore` frontend.
4. Restart dev server Vite setelah mengubah `.env.local`.

## Contoh .env.local

```env
VITE_FIREBASE_API_KEY=isi_api_key_dari_firebase_console
VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://project-id-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=isi_sender_id
VITE_FIREBASE_APP_ID=isi_app_id
VITE_FIREBASE_USERS_PATH=users
```
