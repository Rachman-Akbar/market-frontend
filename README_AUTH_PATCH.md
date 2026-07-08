Patch ini hanya mengubah frontend folder auth. Backend Laravel Identity tidak diubah.

Prinsip koneksi API:
- API Laravel mengikuti pola catalog/product, category, dan catalogGroup.
- Tidak wajib membuat .env frontend untuk API karena Auth memakai relative prefix hardcoded: /api/v1/identity/auth.
- Axios tetap memakai withCredentials: true agar kompatibel dengan Sanctum/cookie session.
- Bearer token Sanctum tetap dibaca dari session frontend jika backend mengembalikan access_token.

Firebase:
- serviceAccountKey.json tetap hanya di backend Laravel/Kreait. Jangan pernah taruh file itu di frontend.
- Frontend hanya membutuhkan Firebase Web App config kalau ingin memakai Firebase Auth JS SDK dan subscribe langsung ke Realtime Database.
- Firebase Web App config bukan service account dan bukan private key.
- Kalau config Firebase Web belum diisi, login tetap fallback ke endpoint Laravel password-login/password-register, tetapi fitur Firebase Auth client dan Realtime Database client tidak aktif.

File utama:
- auth/services/firebaseClient.js
- auth/services/authService.js
- auth/context/AuthContext.jsx
- auth/pages/LoginPage.jsx
- auth/pages/RegisterPage.jsx
- auth/pages/ForgotPasswordPage.jsx
- auth/routes/ProtectedRoute.jsx
- auth/routes/GuestRoute.jsx

Opsional konfigurasi Firebase tanpa .env:
Tambahkan sebelum bundle React jalan, misalnya di public/config.js atau index.html:

window.__MARKETKU_FIREBASE_CONFIG__ = {
  apiKey: "isi_api_key",
  authDomain: "project-id.firebaseapp.com",
  databaseURL: "https://project-id-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "isi_sender_id",
  appId: "isi_app_id"
};

Alternatif tetap boleh memakai .env Vite kalau nanti mau:
VITE_FIREBASE_API_KEY=isi_api_key
VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://project-id-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=isi_sender_id
VITE_FIREBASE_APP_ID=isi_app_id

Route yang perlu dipasang di router utama:
<AuthProvider>
  <Routes>
    <Route path="/auth" element={<GuestRoute><AuthLayout /></GuestRoute>}>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      ...route privat...
    </Route>
  </Routes>
</AuthProvider>

Dependency yang dibutuhkan:
npm install axios firebase
