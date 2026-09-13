# 1. OVERVIEW PROYEK

## Nama & Tujuan
**Re-Tracker** adalah sistem analitik saham IDX (Indonesia Stock Exchange) berbasis:
- **Backend FastAPI + pipeline data kuantitatif** untuk ingest, analisis, dan expose data bandarmologi/foreign flow.
- **Frontend Next.js** untuk dashboard interaktif (watchlist, ticker detail, screener, validation, causality, foreign flow deep dive).

## Latar Belakang / Problem yang Diselesaikan
Proyek ini dirancang untuk menjawab kebutuhan:
1. Melihat **jejak smart money/bandar** lintas saham.
2. Mengukur apakah sinyal broker/foreign flow punya hubungan statistik terhadap pergerakan harga.
3. Menyajikan data mentah dan insight dalam dashboard yang bisa dipakai untuk riset cepat.

## Fitur Utama
- Tracking **broker flow** (buy/sell/net) per ticker.
- Tracking **foreign vs domestic flow**.
- **Conviction scoring** (gabungan sinyal, causality, broker validation).
- **Causality analysis** (Granger) untuk foreign flow/participant/broker.
- **Validation event-study** dan broker alpha scan.
- **Screener v2** untuk shortlist ticker berdasarkan skor dan metrik flow.
- **Foreign Flow Deep Dive** (HMM regime, VAR impulse response, broker heatmap, broker network).
- Pipeline harian + backfill historis untuk sinkronisasi data.

## Status Proyek
⚠️ **Perlu konfirmasi:** status formal rilis (aktif/maintenance/deprecated) tidak dinyatakan eksplisit di repository.

## Lisensi
- `LICENSE`: **MIT License**.

---

# 2. TECH STACK

## Bahasa Pemrograman
- **Python** (backend) — versi runtime tidak dipin di file proyek, namun CI menggunakan **Python 3.11** (`.github/workflows/backend-ci.yml`).
- **TypeScript** (frontend Next.js).

## Framework & Library Utama

### Backend (`backend/requirements.txt` + source code)
- **FastAPI**, **Uvicorn[standard]**
- **pandas**, **numpy**, **scipy**
- **statsmodels**
- **matplotlib**, **seaborn**, **plotly**
- **SQLAlchemy**, **psycopg2-binary**
- **requests**, **python-dotenv**
- **streamlit**, **streamlit-searchbox** (indikasi warisan arsitektur lama sebelum migrasi penuh ke FastAPI)
- Digunakan juga di source: **redis**, **hmmlearn**, **networkx**

⚠️ **Perlu konfirmasi:** beberapa dependency di `requirements.txt` tidak dipin versinya.

### Frontend (`frontend/package.json`)
- **next** `16.3.3`
- **react** `19.2.8`, **react-dom** `19.2.8`
- **swr** `^2.5.1`
- **zustand** `^5.0.15`
- **echarts** `^6.1.0`, **echarts-for-react** `^3.0.6`
- **recharts** `^3.10.1`
- **lightweight-charts** `^5.2.1`
- **@iconify/react** `^6.0.2`

## Database & Storage
- **PostgreSQL** sebagai storage utama (`DATABASE_URL`).
- Tabel utama: `prices`, `broker_flow`, `broker_activity`, `runs`, `tickers`.
- **Redis** dipakai untuk:
  - Rate limiting endpoint berat di FastAPI.
  - Caching hasil foreign-flow deep dive.

## Tools Development
- Frontend linting: **ESLint 9** + `eslint-config-next`.
- Styling: **Tailwind CSS v4** (`@tailwindcss/postcss`).
- Build frontend: Next.js built-in (`next build`).

## Testing Framework
- Backend test: **pytest** (`backend/tests/*`).
- Fokus test saat ini:
  - Unit test fungsi analytics (HMM/VAR/HHI).
  - Test integritas agregasi broker distribution range.

## Infrastruktur / DevOps
- CI: **GitHub Actions** (`.github/workflows/backend-ci.yml`)
  - Trigger: push/pull_request ke `main`/`master`.
  - Install dependency Python.
  - Run `pytest` untuk `tests/test_bandarmology.py`.

⚠️ **Perlu konfirmasi:** belum ada Dockerfile/compose, deployment manifest, atau cloud provider config di repo.

## Alasan Pemilihan Stack (inferensi)
- **FastAPI + SQLAlchemy**: cepat untuk API analitik dan query data relasional.
- **pandas/statsmodels/hmmlearn/networkx**: sesuai kebutuhan analitik kuantitatif time-series, causality, dan graph broker.
- **Next.js + SWR + ECharts/Recharts**: cocok untuk dashboard data-heavy yang butuh fetch incremental dan visualisasi interaktif.
- **Redis**: menurunkan latency endpoint analitik yang mahal dan membatasi spam request.
