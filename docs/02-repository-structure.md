# 3. STRUKTUR REPOSITORY

## Tree Repository (ringkas, file penting)

```text
Re-Tracker/
├── .github/
│   └── workflows/
│       └── backend-ci.yml
├── backend/
│   ├── .env.example
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── routers/
│   │   ├── stocks.py
│   │   ├── broker.py
│   │   ├── foreign_flow.py
│   │   └── universe.py
│   ├── app/
│   │   ├── idx_bridge.py
│   │   └── routers/
│   │       └── bandarmology.py
│   ├── idx_bandarmology/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── storage.py
│   │   ├── universe.py
│   │   ├── prices.py
│   │   ├── broker_api.py
│   │   ├── features.py
│   │   ├── analysis.py
│   │   ├── modeling.py
│   │   ├── pipeline.py
│   │   └── init_universe.py
│   ├── src/services/
│   │   └── foreign_analytics.py
│   └── tests/
│       ├── test_bandarmology.py
│       └── test_foreign_analytics.py
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   ├── postcss.config.mjs
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── foreign/page.tsx
│   │   ├── [ticker]/page.tsx
│   │   └── components/
│   │       ├── ff/*
│   │       └── bandarmology/*
│   ├── components/
│   │   ├── analysis/*
│   │   ├── home/*
│   │   ├── layout/*
│   │   └── ui/*
│   ├── hooks/useForeignFlow.ts
│   ├── store/useAppStore.ts
│   ├── types/index.ts
│   └── lib/api.ts
├── docs/
└── readme.md
```

---

## Penjelasan Folder/File Penting

## A. Root Level

### `.github/workflows/backend-ci.yml`
- **Fungsi**: CI backend (install dependency + run pytest).
- **Isi utama**: setup Python 3.11, install paket, run `tests/test_bandarmology.py`.
- **Relasi**: quality gate minimal untuk perubahan backend.
- **Catatan**: hanya menjalankan 1 file test di CI; test suite belum penuh.

### `readme.md`
- **Fungsi**: README root.
- **Isi utama**: saat ini sangat minimal (`Masih OTW`).
- **Catatan**: alasan dibuatnya dokumentasi lengkap di folder `docs/`.

### `LICENSE`
- **Fungsi**: lisensi MIT.

---

## B. Backend (`backend/`)

### `main.py`
- **Fungsi**: entrypoint FastAPI.
- **Isi utama**:
  - Inisialisasi app, CORS, GZip.
  - Middleware rate limiting berbasis Redis.
  - Registrasi router (`stocks`, `broker`, `bandarmology`, `foreign_flow`).
  - Endpoint health (`/`, `/api/health`).
- **Relasi**: memanggil `config.settings`, `database.get_db`, model `BrokerFlow`.

### `config.py`
- **Fungsi**: konfigurasi runtime API dari `.env`.
- **Isi utama**: `DATABASE_URL`, `CORS_ORIGINS`, prefix API, konfigurasi Redis.
- **Catatan**: fail-fast jika `DATABASE_URL` kosong.

### `database.py`
- **Fungsi**: engine SQLAlchemy + session dependency FastAPI.
- **Isi utama**: `engine`, `SessionLocal`, `get_db()`.
- **Relasi**: dipakai semua endpoint yang query database.

### `models.py`
- **Fungsi**: ORM model tabel existing (`prices`, `broker_flow`).
- **Isi utama**: class `Price`, `BrokerFlow`.
- **Relasi**: dipakai router untuk query read-only.
- **Catatan**: komentar menegaskan API layer bersifat read-only terhadap schema utama.

### `schemas.py`
- **Fungsi**: kontrak response Pydantic.
- **Isi utama**: `PriceBar`, `BrokerFlowRow`, `BrokerFlowSummary`, dll.
- **Relasi**: dipakai `routers/stocks.py` dan `routers/broker.py`.

### `routers/stocks.py`
- **Fungsi**: endpoint histori harga.
- **Isi utama**: `GET /api/stocks/{ticker}/history`.
- **Relasi**: query `models.Price` lewat `get_db()`.

### `routers/broker.py`
- **Fungsi**: endpoint ringkas broker-flow.
- **Isi utama**:
  - latest,
  - history,
  - summary agregat.
- **Relasi**: query `models.BrokerFlow`, output `schemas.*`.

### `routers/foreign_flow.py`
- **Fungsi**: endpoint deep-dive precomputed foreign flow.
- **Isi utama**: baca `analytics_foreign_flow` + cache Redis 8 jam.
- **Relasi**: dipakai halaman frontend `/foreign`.

### `app/routers/bandarmology.py`
- **Fungsi**: router analitik utama (fitur paling lengkap).
- **Isi utama**:
  - Universe/tickers,
  - Metrics/overview,
  - Broker flow compare/distribution,
  - Causality,
  - Validation/event-study,
  - Screener,
  - Raw tables,
  - Pipeline trigger,
  - Detail endpoint komprehensif.
- **Relasi**: memanggil `idx_bandarmology.analysis/storage/universe/pipeline`.
- **Catatan**: file besar, memuat banyak helper transformasi JSON untuk frontend.

### `idx_bandarmology/config.py`
- **Fungsi**: konfigurasi pipeline data.
- **Isi utama**: DB URL fallback, token API broker, default watchlist, mode universe.

### `idx_bandarmology/storage.py`
- **Fungsi**: layer persistence PostgreSQL.
- **Isi utama**:
  - inisialisasi schema/index,
  - upsert tabel `prices`, `broker_flow`, `broker_activity`,
  - reader dengan filter ticker/range,
  - run log.
- **Relasi**: dipakai pipeline, analysis, router.

### `idx_bandarmology/universe.py`
- **Fungsi**: manajemen universe ticker.
- **Isi utama**: fetch ticker IDX, fallback CSV/hardcoded, mode universe (`watchlist`, `idx30`, `lq45`, `idx80`, `all`, `liquid`, custom sektoral).

### `idx_bandarmology/prices.py`
- **Fungsi**: fetch histori harga IDX dengan session warming anti-WAF.
- **Isi utama**: fetch single/multi ticker + batching untuk hindari OOM.

### `idx_bandarmology/broker_api.py`
- **Fungsi**: client API broker-flow eksternal (Stockbit).
- **Isi utama**:
  - token bucket rate limiter,
  - parsing broker summary/foreign-domestic,
  - historical backfill,
  - konversi sinyal acc/dist.
- **Relasi**: dipanggil oleh pipeline dan router analitik.

### `idx_bandarmology/features.py`
- **Fungsi**: feature engineering dataset riset.
- **Isi utama**: return harian, forward/backward return, merge price+broker.

### `idx_bandarmology/analysis.py`
- **Fungsi**: statistik deskriptif + tabel analitik + plotting.
- **Isi utama**: profile flow, event-study, broker alpha scan, causality tests.

### `idx_bandarmology/modeling.py`
- **Fungsi**: modeling regresi/klasifikasi/forecast.
- **Isi utama**: OLS, logistic/RF classification, forecast latest, hypothesis verdict.

### `idx_bandarmology/pipeline.py`
- **Fungsi**: orkestrasi end-to-end (prices + broker + activity + log run).
- **Isi utama**: run harian, resume mode, backfill range.

### `src/services/foreign_analytics.py`
- **Fungsi**: engine analitik foreign deep dive.
- **Isi utama**: HMM regime, VAR IRF, HHI, broker heatmap, broker network.
- **Relasi**: output dipakai endpoint foreign flow dan komponen chart ECharts.

### `tests/test_bandarmology.py`
- **Fungsi**: test fungsi `_broker_distribution_data_range`.
- **Isi utama**: validasi matching buyer-seller, range aggregation, edge cases.

### `tests/test_foreign_analytics.py`
- **Fungsi**: test unit HMM/VAR/HHI.

### `idx_api_wrapper.py` dan `routers/universe.py`
- **Fungsi**: wrapper client IDX legacy.
- **Catatan**: berisi kode sangat mirip; indikasi ada duplikasi utilitas historis.

---

## C. Frontend (`frontend/`)

### `package.json`
- **Fungsi**: dependency & script frontend.
- **Script**: `dev`, `build`, `start`, `lint`.

### `next.config.ts`
- **Fungsi**: konfigurasi Next.js + security headers (CSP, HSTS, X-Frame-Options, dll).

### `app/layout.tsx`
- **Fungsi**: shell global UI (navbar, sidebar, bottom nav).
- **Relasi**: wrap semua halaman.

### `app/page.tsx`
- **Fungsi**: home terminal + watchlist personal via localStorage.
- **Relasi**: fetch `GET /api/bandar/detail/{ticker}` per ticker watchlist.

### `app/[ticker]/page.tsx`
- **Fungsi**: halaman dashboard analitik utama per ticker.
- **Isi utama**: tabs Overview, Broker Flow, Causality, Validation, Screener, Raw Tables.
- **Relasi**: konsumsi endpoint `detail`, `broker-flow`, `causality`, `validation-v2`, `screener-v2`, `raw-tables`.

### `app/foreign/page.tsx` + `app/components/ff/*`
- **Fungsi**: halaman Foreign Flow Deep Dive.
- **Isi utama**: render HMM/VAR/heatmap/network.
- **Relasi**: konsumsi `GET /api/foreign-flow/{ticker}`.

### `components/layout/Sidebar.tsx`
- **Fungsi**: control panel analisis (universe, tanggal, window, pipeline action).
- **Relasi**:
  - trigger `POST /api/bandar/pipeline/run`
  - trigger `POST /api/bandar/pipeline/backfill`
  - trigger `POST /api/bandar/universe/refresh`

### `components/analysis/*`
- **Fungsi**: visual tab analitik versi aktif yang dipakai `app/[ticker]/page.tsx`.

### `hooks/useForeignFlow.ts`
- **Fungsi**: hook SWR untuk foreign flow endpoint.

### `store/useAppStore.ts`
- **Fungsi**: global state (Zustand + persist localStorage).
- **State penting**: activeTicker, universe, analysisDate, windowDays, horizon, minEvents.

### `types/index.ts`
- **Fungsi**: tipe TS mirror schema backend (stocks & broker-flow ringkas).

### `lib/api.ts`
- **Fungsi**: helper fetch API berbasis `NEXT_PUBLIC_API_URL`.
- **Catatan**:
  - dipakai komponen legacy (`MainChart`, `BrokerDetails`).
  - terdapat potensi typo pada header Authorization di file ini.

### `app/components/bandarmology/*` dan `components/BrokerDetails.tsx`, `components/MainChart.tsx`, `components/Watchlist.tsx`
- **Fungsi**: komponen generasi lama/alternatif.
- **Catatan**: sebagian tidak menjadi jalur utama rendering halaman saat ini.

---

## Pola Relasi Sistem (high-level)

1. **Pipeline layer (`idx_bandarmology/*`)** mengambil data eksternal (IDX + broker API), lalu upsert ke PostgreSQL.
2. **API layer (`main.py`, `routers/*`, `app/routers/bandarmology.py`)** menyiapkan endpoint analitik dari data PostgreSQL (plus cache Redis).
3. **Frontend layer (Next.js)** menggunakan SWR untuk konsumsi endpoint dan merender dashboard visual interaktif.
