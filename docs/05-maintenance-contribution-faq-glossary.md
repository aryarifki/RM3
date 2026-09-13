# 7. MAINTENANCE & DEVELOPMENT

## Branching Strategy
⚠️ **Perlu konfirmasi:** strategi branching formal (Git Flow/trunk-based) tidak didefinisikan di repo.

## Commit Convention
⚠️ **Perlu konfirmasi:** tidak ada dokumen convention commit message resmi.

## Code Style & Linting Rules
- Frontend: ESLint (`npm run lint`) dengan `eslint-config-next`.
- TypeScript strict mode aktif (`tsconfig.json`).
- Backend: belum ada config linter dedicated di repo (mis. `ruff`/`flake8`).

## Cara Menambah Fitur Baru (Step-by-step)
1. Tentukan apakah fitur butuh perubahan pipeline, API, frontend, atau kombinasi.
2. Tambahkan/ubah fungsi di `idx_bandarmology` jika menyangkut data ingestion/analytics.
3. Expose data lewat endpoint FastAPI (`routers/*` atau `app/routers/bandarmology.py`).
4. Tambahkan UI di `frontend/components/analysis/*` dan wiring page di `app/[ticker]/page.tsx`.
5. Tambahkan test backend terkait.
6. Jalankan test lokal + lint frontend.

## Cara Memperbaiki Bug
1. Reproduksi dengan endpoint/UI spesifik.
2. Cek data mentah via endpoint `raw-tables`.
3. Validasi logic transformasi di router/helper terkait.
4. Tambahkan test regresi di `backend/tests`.
5. Jalankan test ulang.

## Cara Release / Versioning
⚠️ **Perlu konfirmasi:** belum ada mekanisme release/tag/versioning formal di repository.

## Dependency Update Policy
⚠️ **Perlu konfirmasi:** policy pembaruan dependency belum didokumentasikan.

## Testing Strategy
- **Unit test**: fungsi analytics dan helper distribusi broker.
- **Integration ringan**: endpoint implicit tervalidasi lewat pipeline + UI consume.
- ⚠️ **Perlu konfirmasi:** belum ada e2e test otomatis frontend.

## CI/CD Pipeline (tiap stage)
Workflow: `.github/workflows/backend-ci.yml`
1. Checkout repository.
2. Setup Python 3.11 + pip cache.
3. Install dependencies.
4. Run pytest (`tests/test_bandarmology.py`).

⚠️ **Perlu konfirmasi:** belum ada stage lint frontend, build frontend, deployment, atau security scan khusus.

## Monitoring & Logging
- Logging berbasis `print()` di banyak modul pipeline/router.
- File `backend/uvicorn.log` tersedia di repo (snapshot log lokal).
- ⚠️ **Perlu konfirmasi:** belum ada integrasi observability terpusat (Prometheus/Grafana/Sentry/ELK).

## Backup & Recovery
⚠️ **Perlu konfirmasi:** prosedur backup/restore PostgreSQL tidak terdokumentasi di repo.

## Roadmap / TODO
- Indikasi TODO tidak formal terlihat dari:
  - root `readme.md` masih placeholder.
  - adanya komponen legacy/duplikasi frontend.
- ⚠️ **Perlu konfirmasi:** roadmap resmi belum tersedia.

---

# 8. KONTRIBUSI

## Cara Kontribusi
1. Fork repository.
2. Buat branch fitur/bugfix.
3. Lakukan perubahan kecil-terukur + test.
4. Buat Pull Request dengan ringkasan jelas.

## Code Review Checklist
- [ ] Perubahan tidak merusak endpoint yang dipakai frontend.
- [ ] Query/transform data sudah aman untuk data kosong/null.
- [ ] Tidak ada hardcoded secret/token.
- [ ] Test backend relevan sudah dijalankan.
- [ ] Jika ubah endpoint, dokumentasi API ikut diupdate.

## Kontak Maintainer
⚠️ **Perlu konfirmasi:** daftar maintainer resmi tidak tercantum eksplisit.

---

# 9. FAQ & TROUBLESHOOTING

## Q1: Kenapa data ticker saya kosong di dashboard?
A: Kemungkinan data belum ada di `broker_flow`/`broker_activity`. Jalankan pipeline/backfill dan cek endpoint `raw-tables`.

## Q2: Kenapa muncul error rate limit?
A: Middleware API membatasi endpoint berat. Kurangi frekuensi request atau aktifkan caching Redis dengan konfigurasi benar.

## Q3: Kenapa watchlist di home berbeda antar browser?
A: Watchlist disimpan di `localStorage` browser (`tradepulse_watchlist`), bukan server-side profile.

## Q4: Kenapa pipeline tidak fetch saat weekend?
A: `pipeline.run()` memang skip otomatis saat hari Sabtu/Minggu.

## Q5: Kenapa endpoint foreign flow mengembalikan 404?
A: Data analitik precomputed untuk kombinasi ticker + lookback_days belum tersedia di tabel `analytics_foreign_flow`.

## Q6: Kenapa beberapa menu bottom nav tidak bekerja?
A: Link `/konglo`, `/signal`, `/logs` terdeteksi di nav, tetapi implementasi halaman tidak ditemukan di struktur repo saat ini.

---

# 10. GLOSSARY

- **Bandarmology**: pendekatan analisis jejak transaksi broker besar (akumulasi/distribusi).
- **Smart Money**: broker/partisipan yang diasumsikan lebih informasional (mis. foreign institutional).
- **Foreign Net**: selisih nilai beli-jual pihak asing.
- **Conviction Score**: skor komposit dari sinyal, causality, flow, dan validasi broker historis.
- **Event Study**: analisis performa harga setelah event sinyal tertentu.
- **Granger Causality**: uji statistik apakah seri waktu A membantu prediksi seri waktu B.
- **HMM (Hidden Markov Model)**: model regime tersembunyi (akumulasi/netral/distribusi).
- **VAR IRF (Impulse Response Function)**: respons harga terhadap shock aliran dana asing.
- **HHI (Herfindahl-Hirschman Index)**: indeks konsentrasi aktivitas broker.
- **Universe Mode**: himpunan ticker yang dianalisis (`watchlist`, `idx30`, `lq45`, `idx80`, `all`, dsb).
