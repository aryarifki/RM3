# 4. CARA INSTALASI & SETUP

## Prasyarat

## Backend
- Python **3.11** direkomendasikan (mengikuti workflow CI).
- PostgreSQL aktif dan dapat diakses.
- Redis opsional (untuk rate limiting + cache; jika tidak aktif, aplikasi tetap jalan dengan fallback).

## Frontend
- Node.js LTS modern (disarankan Node 20+).
- npm (karena lockfile `package-lock.json`).

## Langkah Instalasi Step-by-Step

### 1) Clone & masuk repo
```bash
git clone <repo-url>
cd Re-Tracker
```

### 2) Setup Backend
```bash
cd /home/runner/work/Re-Tracker/Re-Tracker/backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
pip install --upgrade pip
pip install -r requirements.txt
```

### 3) Konfigurasi Environment Backend
Buat file `.env` di `backend/` berdasarkan `.env.example`:
```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/bandarmology
CORS_ORIGINS=http://localhost:3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
BROKER_API_TOKEN=<token-jika-ingin-fetch-broker-api>
WATCHLIST=BBCA,BBRI,BMRI,BBNI,TLKM,ASII,UNVR,GOTO,BREN,ANTM
UNIVERSE_MODE=watchlist
BROKER_RATE_LIMIT=8.0
```

### 4) Setup Frontend
```bash
cd /home/runner/work/Re-Tracker/Re-Tracker/frontend
npm install
```

Buat `.env.local` frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Menjalankan Aplikasi

### Backend (dev)
```bash
cd /home/runner/work/Re-Tracker/Re-Tracker/backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Frontend (dev)
```bash
cd /home/runner/work/Re-Tracker/Re-Tracker/frontend
npm run dev
```

Akses:
- Frontend: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`

### Menjalankan pipeline manual (opsional)
```bash
cd /home/runner/work/Re-Tracker/Re-Tracker/backend
source .venv/bin/activate
python -c "from idx_bandarmology import pipeline; pipeline.run(universe_mode='watchlist')"
```

### Production (baseline)
- Frontend: `npm run build && npm run start`
- Backend: jalankan `uvicorn` via process manager (systemd/supervisor) dan reverse proxy.

⚠️ **Perlu konfirmasi:** manifest deployment production resmi (Docker/K8s/Nginx/cloud) belum tersedia di repo.

## Menjalankan Testing

### Backend tests
```bash
cd /home/runner/work/Re-Tracker/Re-Tracker/backend
source .venv/bin/activate
pytest -v
```

CI saat ini minimal menjalankan:
```bash
pytest tests/test_bandarmology.py -v --tb=short
```

## Troubleshooting Umum

### 1) `ValueError: DATABASE_URL tidak ditemukan di file .env`
- Pastikan `.env` backend ada dan berisi `DATABASE_URL` valid.

### 2) Endpoint lambat / timeout
- Pastikan Redis aktif untuk cache + rate limiting.
- Cek volume request ke endpoint berat seperti `/api/bandar/*` dan `/api/foreign-flow/*`.

### 3) Data broker kosong
- Pastikan `BROKER_API_TOKEN` tersedia.
- Periksa apakah hari bursa aktif (pipeline skip weekend).

### 4) Frontend gagal fetch (`404` pada `/api/bandar/*`)
- Pastikan backend aktif di URL yang sesuai `NEXT_PUBLIC_API_URL`.
- Beberapa komponen menggunakan relative path `/api/...`; pastikan environment deployment menyediakan routing/proxy yang benar.

### 5) API external diblokir (IDX / Stockbit)
- Proyek sudah menyiapkan fallback sebagian (master ticker dari CSV/hardcoded), tapi data real-time bisa tetap terbatas.

---

# 6. CARA PENGGUNAAN (Usage Guide)

## Use Case 1 — Monitor watchlist harian
1. Buka halaman `/`.
2. Tambah ticker ke watchlist lokal.
3. Pantau sinyal, return 5D, dan foreign net 5D per ticker.

Contoh data yang dipakai kartu watchlist (disederhanakan):
```json
{
  "ticker": "BBCA",
  "signal": "ACCUMULATION",
  "close": 10200,
  "ret_5d": 0.024,
  "foreign_5d": 12500000000
}
```

## Use Case 2 — Analisis mendalam per ticker
1. Buka `/{TICKER}` (mis. `/BBCA`).
2. Atur `analysis date`, `window`, `horizon` dari sidebar.
3. Review tab berurutan: Overview → Broker Flow → Causality → Validation.

Contoh fetch dari frontend:
```ts
const url = `/api/bandar/detail/BBCA?analysis_date=2026-09-12&window_days=20`;
const data = await fetch(url).then(r => r.json());
```

## Use Case 3 — Jalankan pipeline terbaru
1. Buka sidebar.
2. Klik **Run latest pipeline**.
3. Sistem akan:
   - update harga,
   - ambil data broker,
   - simpan ke DB,
   - refresh cache UI.

## Use Case 4 — Foreign Flow Deep Dive
1. Buka `/foreign`.
2. Pilih ticker.
3. Review HMM regime, VAR impulse response, broker heatmap, dan network graph.

## Best Practices
- Jalankan pipeline secara periodik agar `detail/validation/screener` tetap relevan.
- Gunakan horizon & min events yang konservatif saat membaca sinyal statistik.
- Gunakan tab Raw Tables untuk verifikasi data mentah sebelum mengambil keputusan analitik.

## Anti-pattern yang Harus Dihindari
- Menarik kesimpulan trading hanya dari satu metrik (mis. conviction score saja).
- Menjalankan backfill rentang besar tanpa monitoring token/rate-limit.
- Menganggap endpoint dengan data kosong sebagai bug sebelum cek kelengkapan data historis.

## Limitasi & Known Issues
- `requirements.txt` belum pin versi dependency secara ketat.
- Ada indikasi komponen legacy/duplikasi (`app/components/bandarmology/*`, `components/MainChart.tsx`, dll).
- Integrasi proxy frontend↔backend tidak didefinisikan eksplisit di `next.config.ts`.
- Branch/route seperti `/konglo`, `/signal`, `/logs` muncul di navigasi namun implementasi halamannya tidak ditemukan di repo saat ini.
- Kualitas CI belum penuh (belum lint/test frontend dalam workflow).
