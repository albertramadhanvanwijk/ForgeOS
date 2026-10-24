# ForgeOS Persistent Memory — Complete Requirements Pack v1.0

Dokumen ini mendefinisikan Persistent Memory sebagai kemampuan inti ForgeOS: bukan sekadar chat history, tetapi sistem pengetahuan yang menyimpan, memvalidasi, mengambil, memperbarui, dan mengevaluasi konteks untuk membantu agent menghasilkan output yang lebih baik.

## Isi paket
- `00_Memory_System_Overview.md` — tujuan, jenis memory, prinsip, sumber kebenaran.
- `01_Functional_Requirements.md` — kebutuhan fungsional.
- `02_Data_Model_and_Storage.md` — model data dan storage.
- `03_Lifecycle_and_Retrieval.md` — alur capture, validasi, retrieval, maintenance.
- `04_Governance_Security_Privacy.md` — akses, scope, secret, promosi, retensi.
- `05_Memory_Center_UI.md` — requirement UI/UX.
- `06_API_and_Observability.md` — kontrak API dan monitoring.
- `07_Testing_Acceptance_Roadmap.md` — acceptance criteria, Definition of Done, roadmap.
- `08_Antigravity_Prompt.md` — prompt siap pakai untuk Antigravity.
- `09_Requirements_Traceability.md` — pemetaan requirement ke komponen dan tes.

## Keputusan inti
Bangun Memory Service yang terintegrasi dengan Orchestrator, Workflow Engine, Artifact Registry, Policy Engine, dan Evaluation System. Mulai dari PostgreSQL, provenance, scope controls, versioning, full-text retrieval, dan event-driven capture. Tambahkan vector/semantic retrieval hanya jika evaluasi menunjukkan manfaat yang terukur.

## Aturan non-negotiable
1. Memory bukan sumber kebenaran utama untuk kode, status runtime, tes, atau policy.
2. Akses diperiksa sebelum ranking retrieval.
3. Isolasi proyek aktif secara default.
4. Secret tidak boleh disimpan di memory.
5. Memory yang diambil adalah data kontekstual, bukan instruksi berprioritas tinggi.
6. Konflik, data usang, dan ketidakpastian harus terlihat.
7. Perubahan memory dapat ditelusuri dan dikoreksi.
8. Klaim selesai harus didukung bukti.
9. Ukur manfaat memory melalui hasil tugas, bukan jumlah catatan.
10. Audit repository ForgeOS sebelum implementasi dan gunakan kembali komponen yang sudah ada.
