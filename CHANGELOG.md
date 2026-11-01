# 📋 Changelog

Semua perubahan penting dan pembaruan pada proyek **WhatsApp Assistant** didokumentasikan di dalam berkas ini. Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mengikuti kaidah [Semantic Versioning](https://semver.org/).

---

## [2.1.0] - 2026-11-02

### ✨ Fitur Baru & Tampilan Interaktif (Interactive UI)
- **Fitur Interaktif Lapor Bug / Kendala via WhatsApp:**
  - Menambahkan kartu *Lapor Bug / Kendala* interaktif di dalam halaman About/Tentang.
  - Pengguna dapat mengetikkan keluhan atau kendala pada textarea yang disediakan. URL tautan WhatsApp otomatis ter-format secara dinamis (`wa.me/6282287592930?text=...`) dengan pesan rapi mencakup rincian kendala, versi ekstensi, dan platform.
  - Menyediakan pesan *default* otomatis jika pengguna tidak mengisi textarea, sehingga pengguna tetap bisa melaporkan bug hanya dengan 1-klik tombol kirim.

### ⚡ Optimasi Performa Ekstrem (Zero-Lag & 60FPS)
- **Zero-Lag GPU Composited Filters:**
  - Mengalihkan sebagian besar mekanisme penyamaran blur ke CSS murni berbasis atribut root HTML (`data-wa-messages`, `data-wa-contacts`, dll.) yang diproses langsung oleh GPU browser.
  - Menghapus total pemanggilan `getBoundingClientRect()` di dalam loop traversal DOM avatar yang sebelumnya menyebabkan *layout thrashing* dan penurunan performa drastis saat scrolling.
  - Menerapkan *debounced scheduler* (80ms) pada pemindaian DOM serta pengecekan pasif instan pada observer tombol navbar, sehingga halaman WhatsApp Web kembali terasa sangat ringan, responsif, dan lancar.

### 🐛 Perbaikan Masalah (Bug Fixes)
- **Sinkronisasi Sensor pada Panel "Info Kontak" (Profile Info Drawer):**
  - Menyamarkan foto profil berukuran besar pada panel "Info Kontak" orang lain (`[data-animate-drawer-right="true"] [style*="border-radius: 50%"]`, `[data-testid="drawer-right"] img`, dsb.).
  - Menyamarkan deretan pratinjau thumbnail pada seksi **"Media, tautan, dan dok"** (baik gambar, video, canvas, maupun kartu placeholder unduhan) di dalam panel info kontak.
  - Mendukung efek *hover-to-reveal* yang mulus dan instan pada foto profil kontak dan kotak galeri media saat disorot kursor mouse (ketika Safe Screen-Share tidak aktif).
- **Perbaikan Posisi Tombol Dropdown Konteks WhatsApp pada Pesan File:**
  - Memperbaiki bug di mana tombol dropdown menu pesan bawaan WhatsApp (`[data-testid="down-context"]`) bergeser keluar/turun ke bawah balon pesan saat pesan berkas di-hover.
  - Membatasi selektor penyamaran dan efek hover secara presisi hanya pada wadah dokumen (`document-container`) serta memproteksi tombol aksi menu WhatsApp agar tidak terpengaruh filter CSS atau perubahan *stacking context*.
- **Perbaikan Sensor Foto Profil Pengirim di Obrolan Grup:**
  - Memperbaiki bug di mana foto profil pengirim di sebelah kiri balon pesan obrolan grup tidak tersensor.
  - Menambahkan selektor mendalam untuk avatar di dalam baris percakapan obrolan (`#main div[role="row"] img`, `#main [style*="border-radius: 50%"]`, dsb.) dan memastikan avatar bertipe gambar/SVG tidak pernah terlewatkan.
- **Perbaikan Penyamaran Avatar Menyeluruh (Group, Channel & Archived Chats):**
  - Memperbaiki bug di mana foto profil orang lain tidak tersensor di obrolan grup/komunitas (avatar pengirim pesan di samping bubble chat), saluran/channel, dan panel Chat Diarsipkan (*Archived Chats*).
  - Menghapus pembatasan selektor `#pane-side` dan menerapkan selektor universal `img[src*="pps.whatsapp.net"]` serta SVG avatar bawaan (`svg[data-testid="default-user"]`, `svg[data-testid="default-group"]`) agar mencakup seluruh kontak dan grup tanpa terkecuali.
- **Perbaikan Hover Reveal pada Chat Preview & Berkas / File:**
  - Memperbaiki aturan spesifisitas CSS dan menerapkan `!important` pada status `:hover` sehingga saat mouse diarahkan ke pratinjau pesan di sidebar (*chat preview*), teks langsung terbuka secara responsif.
  - Memastikan seluruh komponen pesan berkas / dokumen (wadah file, thumbnail ekstensi, dan nama dokumen) langsung terbuka saat disorot kursor mouse (ketika Safe Screen-Share tidak aktif).
- **Sensor Link Preview & Kartu Undangan (Link Preview Censoring):**
  - Memperbaiki bug di mana kartu preview link (seperti Google Drive, YouTube, link domain, dan kartu undangan grup) tidak tersensor.
  - Menambahkan selektor komprehensif untuk mendeteksi kontainer preview link, anchor link, dan kartu invite grup di dalam bubble chat.
- **Perbaikan Race Condition & Penataan Ulang Preset:**
  - Memperbaiki race condition saat berpindah antar-preset dengan sinkronisasi state atomik murni.
  - Menata ulang fungsi preset sesuai kebutuhan:
    - 🛡️ **Enhanced**: Seluruh fitur aktif *kecuali* Safe Mode dan Typing (intensitas 8px).
    - 💼 **Screen-Share**: Seluruh fitur aktif termasuk Safe Mode dan Typing (intensitas 8px).
    - 👁️ **Chat Only**: Mengaktifkan Messages, Contacts, Media, Files, dan Preview (intensitas 6px).
    - 🔄 **Reset**: Menonaktifkan seluruh fitur perlindungan, namun Master tetap berstatus **ON** (intensitas 6px).
- **Shortcut `Ctrl + Shift + U`:**
  - Memperbaiki pintasan keyboard dengan mendaftarkan event listener pada **Capture Phase** (`window.addEventListener("keydown", handler, true)`), sehingga event tidak lagi terpotong atau ditelan oleh script internal WhatsApp saat kursor berada di kolom input.
- **Perbaikan Kursor Ketik pada Safe Mode (Typing Safety Fix):**
  - Memperbaiki bug di mana pengguna terkadang tidak bisa mengetik saat *Safe Screen-Sharing Mode* aktif.
  - Memastikan elemen `contenteditable="true"` selalu mempertahankan `user-select: text !important` dan otomatis membuka blur secara halus saat kotak ketik menerima fokus kursor (`:focus-within`).
  - Mengisolasi selektor Safe Mode agar tidak pernah mengunci kursor pada elemen input pesan.
- **Eksekusi Real-Time Sinkron:**
  - Mengubah alur kerja toggle agar langsung memanggil pemindaian DOM sinkron seketika (`applySettingsDirectly`) tanpa menunggu antrean async storage atau tertahan flag pemindai.

### 🎨 Desain Antarmuka & UX (UI/UX Redesign)
- **Desain Logo Baru ("Shield of WhatsApp"):**
  - Mengganti total logo lama (perisai lonceng merah) menjadi kombinasi resmi **Security Shield + WhatsApp Chat Bubble & Phone Handset**.
  - Mengadopsi gradien warna ultra-kontras dan terang (*Neon Mint `#00FFA3` &bull; WhatsApp Emerald `#25D366` &bull; Cyber Cyan `#00D2FF`*), sehingga sangat kontras dan terlihat tajam baik di Dark Mode maupun Light Mode WhatsApp.
  - Memperbarui seluruh aset logo: ikon navbar WhatsApp Web, header dashboard, halaman About, toolbar popup, serta seluruh berkas icon browser (`icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`).
- **Penyelarasan Tema Aksen (Accent Color Scheme):**
  - Menyelaraskan seluruh aksen visual UI (badge versi, active toggle switches, simulator pulse glow, dan tombol open) agar serasi dengan gradien neon logo baru.
- **Tooltip & Hover Khas WhatsApp Web (Native Tooltip):**
  - Menghapus atribut `title` HTML bawaan browser yang memunculkan kotak hitam kaku (seperti pada Gambar 2).
  - Mengimplementasikan sistem tooltip melayang kustom yang tampil **persis seperti tooltip asli WhatsApp Web** (seperti pada Gambar 1): berbentuk kapsul/pill melengkung putih bersih dengan teks gelap, bayangan halus, dan animasi transisi halus ke kanan tombol.
  - Memberikan efek *circular backdrop hover* melingkar abu-abu pada tombol sidebar sehingga terasa 100% menyatu (*seamless*) dengan tombol bawaan WhatsApp (Chat, Status, Saluran, Komunitas).
- **Menu Dashboard Bebas Geser (Draggable Modal / Drawer):**
  - Panel dashboard kini dapat digeser (*drag-and-drop*) secara bebas ke seluruh penjuru layar dengan menarik bagian header.
  - Menggunakan API modern `PointerEvents` dengan koordinat terikat (*screen-boundary protection*), memastikan dashboard tidak pernah keluar dari batas layar monitor pengguna.
- **Halaman About & Tautan Media Sosial Berwarna:**
  - Menyediakan tampilan *About* informatif yang merangkum arsitektur *Zero-Knowledge Privacy* (100% lokal tanpa server luar), pintasan keyboard, serta tautan resmi developer dengan ikon berwarna asli masing-masing platform:
    - 🟢 WhatsApp Developer Contact (`https://wa.me/6282287592930`)
    - 🟣 Repository & Source Code (`notbell1/whatsapp-assistant`)
    - 🔴 Instagram Profile (`https://www.instagram.com/_ntbbll`)
    - 🔵 Telegram Chat (`https://t.me/bellxss`)
- **Tautan & Format Footer Baru:**
  - Footer mengarah langsung ke Instagram (`https://www.instagram.com/_ntbbll`), dengan teks "**Nttbell**" tebal (*bold*) berwarna hijau khas WhatsApp (`#25D366`).
- **Penyempurnaan Label Familiar (Fitur & Quick Presets Bar):**
  - Mengubah label filter *Compose* menjadi **Typing** agar lebih mudah dipahami oleh pengguna umum.
  - Memperbarui sistem preset 1-klik dengan logika atomik dan nama komunikatif:
    - 🛡️ **Enhanced** (Semua proteksi aktif kecuali Safe Mode & Typing, intensitas 8px)
    - 💼 **Screen-Share** (Seluruh proteksi aktif termasuk Safe Mode & Typing, intensitas 8px)
    - 👁️ **Chat Only** (Fokus obrolan: Messages, Contact Names, Media, Files, dan Chat Preview, intensitas 6px)
    - 🔄 **Reset** (Mematikan seluruh filter privasi dengan mempertahankan Master Switch tetap **ON**, intensitas 6px)
- **Tombol Header Berkontras Tinggi (About & Close):**
  - Tombol **About** dirancang mencolok dengan pill aksen neon hijau/mint dan teks label "About" yang langsung terlihat jelas.
  - Tombol **Close** diberi kontras tinggi dengan bingkai terang dan efek hover merah terdefinisi.
- **Glassmorphic Floating Drawer:**
  - Mengubah dashboard dari yang sebelumnya menutupi seluruh layar chat (*full overlay*) menjadi **panel melayang elegan (Floating Sidecar Drawer)** dengan efek *frosted glass* di sisi kanan.
  - Percakapan dan sidebar WhatsApp kini tetap terlihat jelas di samping dashboard, memberikan feedback visual *real-time* langsung saat pengguna menyalakan/mematikan fitur.
- **Live Interactive Shield Simulator:**
  - Menampilkan kartu simulator interaktif yang otomatis mendeteksi **foto profil asli pengguna** dari WhatsApp Web serta menampilkan nama akun pribadi Anda ("Anda (Profil Saya)").
  - Simulator bereaksi secara *live* mengikuti pergeseran slider blur dan toggle filter.
- **Tata Letak Presisi 2 Kolom:**
  - Mengorganisasi 8 filter privasi ke dalam grid 2-kolom yang ringkas dan padat, menghemat ruang vertikal hingga 60%.
- **Precision Slider dengan Tombol `[-]` & `[+]`:**
  - Menambahkan tombol kendali presisi 1px untuk memudahkan pengaturan ketebalan blur.
- **Pinned Footer (Bebas Scroll):**
  - Menempatkan footer `Created by Nttbell` secara permanen (*pinned*) di bagian bawah panel, selalu terlihat tanpa perlu scrolling.

---

## [2.0.0] - 2026-11-01

### 🚀 Ditambahkan (Added)
- **Safe Screen-Sharing Mode:**
  - Opsi keamanan baru untuk mematikan fitur *hover-to-reveal* selama melakukan presentasi daring (*Google Meet, Zoom, Microsoft Teams*).
  - Dilengkapi badge khusus `SAFE MODE` pada baris kontrol pengaturan.
- **Compose Box Privacy Protection:**
  - Kategori filter privasi baru untuk menyamarkan kotak ketik pesan (`contenteditable` compose box) saat pengguna mengetik balasan sensitif dari intipan sekitar (*shoulder surfing*).
- **Extension Toolbar Popup:**
  - Antarmuka popup mandiri di browser toolbar (`popup.html` & `popup.js`).
- **Chrome Commands API Shortcut:**
  - Pendaftaran shortcut resmi `Ctrl + Shift + U` ke dalam `chrome.commands` di `manifest.json`.

### 🔄 Diubah & Ditingkatkan (Changed)
- **Rebranding Menyeluruh:**
  - Mengubah identitas ekstensi dari **Nttbell Assistant** menjadi **WhatsApp Assistant**.
- **Footer UI:**
  - Disesuaikan menjadi: `code with love - created by Nttbell`.

### ⚡ Performa & Penghematan Memori (Performance)
- Variabel CSS global terpusat `--whatsapp-blur`.
- Smart Mutation Filtering untuk mencegah siklus rekursif re-scan DOM.
- Penghapusan timer polling agresif 1200ms.

---

## [1.0.0] - 2026-03-15

### 🚀 Rilis Perdana (Initial Release - Nttbell Assistant)
- Peluncuran awal ekstensi perlindungan visual untuk WhatsApp Web berbasis Chrome Manifest V3.
- Master Privacy Switch dan granular privacy filter.
- Fitur *Hover-to-Reveal* interaktif.
- Arsitektur 100% client-side lokal tanpa database eksternal.

---

<p align="center">
  <sub>Created by Nttbell</sub>
</p>
