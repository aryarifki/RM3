# 5. API REFERENCE

Base URL (default lokal):
- `http://localhost:8000`

## Catatan Umum
- **Auth**: saat ini tidak ada mekanisme auth aktif di endpoint (public/internal network).
- **Content-Type**: `application/json`.
- **Rate limit middleware**: berlaku khusus path yang mengandung `/api/foreign-flow` atau `/api/bandar` (maks 30 request/menit/IP jika Redis aktif).

---

## 5.1 Health Endpoints

### `GET /`
- **Deskripsi**: status service dasar.
- **Request**: tanpa parameter.
- **Success 200**
```json
{ "status": "ok", "service": "SM Tracker API", "version": "1.0.0" }
```
- **cURL**
```bash
curl http://localhost:8000/
```

### `GET /api/health`
- **Deskripsi**: health + tanggal data broker_flow terbaru.
- **Success 200**
```json
{ "status": "healthy", "latest_date": "2026-09-12" }
```

---

## 5.2 Stocks

### `GET /api/stocks/{ticker}/history`
- **Deskripsi**: histori OHLCV ticker.
- **Query params**:
  - `start_date` (optional, `YYYY-MM-DD`)
  - `end_date` (optional, `YYYY-MM-DD`)
  - `limit` (default 500, max 5000)
- **Success 200**
```json
{
  "ticker": "BBCA",
  "count": 2,
  "sort_order": "asc",
  "data": [
    {"date":"2026-09-11","ticker":"BBCA","open":10000,"high":10100,"low":9950,"close":10050,"volume":123456789}
  ]
}
```
- **Error**: response kosong (`count:0`) jika tidak ada data.
- **Contoh**
```bash
curl "http://localhost:8000/api/stocks/BBCA/history?limit=250"
```

---

## 5.3 Broker Flow (router ringkas)

### `GET /api/broker-flow/{ticker}/latest`
- **Deskripsi**: baris broker_flow terbaru ticker.
- **Success 200**: objek `BrokerFlowRow`.
- **Error 404**
```json
{ "detail": "Tidak ada data broker_flow untuk ticker 'BBCA'" }
```

### `GET /api/broker-flow/{ticker}/history`
- **Deskripsi**: time-series broker flow.
- **Query**: `start_date`, `end_date`, `limit` (1..2500).
- **Success 200**
```json
{ "ticker":"BBCA", "count":10, "sort_order":"asc", "data":[...] }
```

### `GET /api/broker-flow/{ticker}/summary`
- **Deskripsi**: agregat N hari.
- **Query**: `days` (default 30, 1..365).
- **Success 200**
```json
{
  "ticker":"BBCA",
  "period_days":30,
  "trading_days":22,
  "foreign_net_broker_sum":12000000000,
  "local_net_broker_sum":-9000000000,
  "gov_net_broker_sum":500000000,
  "total_value_sum":345000000000,
  "foreign_dominance_pct":52.3,
  "latest_bandar_signal":"ACCUMULATION",
  "latest_bandar_signal_score":1,
  "latest_foreign_signal":"NET_BUY",
  "accumulation_days":12,
  "distribution_days":6,
  "latest_date":"2026-09-12"
}
```

---

## 5.4 Foreign Flow Deep Dive

### `GET /api/foreign-flow/{ticker}`
- **Deskripsi**: ambil payload analitik precomputed dari tabel `analytics_foreign_flow`.
- **Query**: `lookback_days` (default 60, range 20..250).
- **Success 200**
```json
{
  "ticker":"BBCA",
  "company":{"name":"Bank Central Asia","group":"Djarum Group"},
  "lookback_days":60,
  "latest_date":"2026-09-12",
  "features":{},
  "timeseries":{},
  "models":{}
}
```
- **Error 404**
```json
{ "detail": "Data analitik untuk BBCA pada window 60 hari belum dihitung oleh Smtracker." }
```

---

## 5.5 Bandarmology API (`/api/bandar`)

## Universe & Tickers

### `GET /api/bandar/universe`
- **Query**: `mode` (default `watchlist`).
- **Success**: `{ "tickers": ["BBCA", "BBRI"] }`

### `GET /api/bandar/tickers`
- **Deskripsi**: master ticker aktif.
- **Success**: `{ "tickers": [...] }`

### `GET /api/bandar/universe/{mode}`
- **Deskripsi**: resolve universe + count.
- **Success**
```json
{ "mode":"all", "tickers":["AALI","BBCA"], "count": 2 }
```

### `POST /api/bandar/universe/refresh`
- **Deskripsi**: refresh master tickers dari IDX.
- **Success**
```json
{ "status":"success", "count":900, "message":"Berhasil memperbarui 900 emiten dari IDX." }
```

## Overview / Detail

### `GET /api/bandar/stocks/{ticker}/metrics`
- **Query**: `date` (optional), `window` (default 30).
- **Deskripsi**: metrik ringkas conviction + top buyers/sellers.

### `GET /api/bandar/detail/{ticker}`
- **Query**:
  - `analysis_date` optional
  - `window_days` default 20
  - `horizon` default 10
  - `min_events` default 5
  - `min_net_buy_b` default 0.0
- **Deskripsi**: payload dashboard utama (overview cards, chart, profile flow, broker summary, alerts, verdict).
- **Success (ringkas)**
```json
{
  "ticker":"BBCA",
  "analysis_date":"2026-09-12",
  "signal":"Accumulation",
  "conviction_score":72.1,
  "ret_5d":0.024,
  "foreign_5d":12000000000,
  "broker_summary":[],
  "profile_flow":[],
  "smart_daily":[],
  "price_chart":[]
}
```

### `GET /api/bandar/daily-summary`
- **Query**: `universe_mode` default `all`, `refresh` default 0.
- **Deskripsi**: ringkasan market harian dengan cache 5 menit.

### `GET /api/bandar/dates/{ticker}`
- **Deskripsi**: daftar tanggal activity tersedia untuk ticker.

## Broker Flow Tab

### `GET /api/bandar/stocks/{ticker}/smart-flow`
- **Query**: `window` default 30.
- **Output**: daily smart net + cumulative net.

### `GET /api/bandar/stocks/{ticker}/broker-compare`
- **Query**: `window` default 30, `mode` (`cumulative`/lainnya).

### `GET /api/bandar/stocks/{ticker}/broker-distribution`
- **Query**: `trade_date` optional, `top_n` default 12.

### `GET /api/bandar/broker-flow/{ticker}`
- **Query**:
  - `analysis_date`, `window_days`
  - `broker_codes` (CSV)
  - `flow_mode` (`Cumulative`/`Daily`)
  - `dist_mode` (`Single day`/`Date range`)
  - `dist_date`, `dist_start`, `dist_end`
- **Deskripsi**: payload lengkap tab broker-flow (compare_chart, distribution edges, summary, profile detail).

## Causality

### `GET /api/bandar/stocks/{ticker}/causality`
- **Deskripsi**: causality sederhana (foreign, participant, broker).

### `GET /api/bandar/causality/{ticker}`
- **Query**: `analysis_date`, `window_days` (opsional).
- **Deskripsi**: format causality untuk UI terbaru.

## Validation & Event Study

### `GET /api/bandar/validation/broker-scan`
- **Query**: `ticker`, `horizon`, `min_events`, `min_net_b`.

### `GET /api/bandar/stocks/{ticker}/event-study`
- **Query**: `horizons` (contoh `1,3,5,10`), `lookback_days`.

### `GET /api/bandar/validation/{ticker}`
- **Query**: `analysis_date`, `window_days`, `horizon`, `min_events`, `min_net_buy`, `universe_mode`.

### `GET /api/bandar/validation-v2/{ticker}`
- **Query**: sama seperti `/validation/{ticker}`.
- **Deskripsi**: endpoint validasi yang dipakai frontend saat ini.

## Screener

### `GET /api/bandar/screener`
- **Query**: `universe_mode`, `horizon`.

### `GET /api/bandar/screener-v2`
- **Query**:
  - `universe_mode` default `lq45`
  - `analysis_date` optional
  - `window_days` default 20
  - `tickers` optional (CSV custom list)

## Raw Tables

### `GET /api/bandar/stocks/{ticker}/raw`
- **Query**: `window`.
- **Deskripsi**: raw flow + activity pada window.

### `GET /api/bandar/stocks/{ticker}/raw-tables`
- **Query**: `analysis_date`, `window_days`.
- **Deskripsi**: raw flow/activity format tabel UI terbaru.

## Pipeline Controls

### `POST /api/bandar/pipeline/run`
- **Parameter kode saat ini**: `universe_mode` sebagai query parameter.
- **Deskripsi**: trigger pipeline run asynchronous (thread daemon).
- **Success**
```json
{ "status": "started", "universe_mode": "watchlist" }
```

### `POST /api/bandar/pipeline/backfill`
- **Parameter kode saat ini**:
  - `tickers` (CSV, default `BBCA`)
  - `start` (default `2024-01-01`)
  - `end` optional
- **Deskripsi**: trigger backfill asynchronous.

⚠️ **Perlu konfirmasi:** frontend mengirim payload JSON untuk beberapa endpoint pipeline, sementara signature endpoint FastAPI saat ini berupa parameter fungsi (query/form style), bukan model body eksplisit.

---

## Contoh Pemanggilan dengan `fetch`

```ts
// Ticker detail
const detail = await fetch('/api/bandar/detail/BBCA?analysis_date=2026-09-12&window_days=20')
  .then(r => r.json());

// Validation v2
const validation = await fetch('/api/bandar/validation-v2/BBCA?window_days=60&horizon=10&min_events=5&universe_mode=watchlist')
  .then(r => r.json());

// Foreign flow deep dive
const foreign = await fetch('/api/foreign-flow/BBCA?lookback_days=60')
  .then(r => r.json());
```
