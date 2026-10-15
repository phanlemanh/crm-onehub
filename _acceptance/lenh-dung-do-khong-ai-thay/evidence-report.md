---
schema_version: 2
feature_slug: lenh-dung-do-khong-ai-thay
verdict: PASS
failed_evals: []
reason:
verified_by: sequential per-eval verify, run_id minted at execution
enforcement_mode: strict
bypass_used: false
verified_commit: b9acad6b77fde52541221e857cd2eb01d839e45f
run_id: s4r3-20260907T074041Z-16302
human_signoff: Manh Phan 2026-09-07
---

# Evidence Report: lenh-dung-do-khong-ai-thay

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E9 | AC-9 | script | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: s4r1-20260907T045150Z-29244-E1
  exit_code: 0
  verifier: config:executors.script.ld_lenh_dung_xanh
  verified_at: 2026-09-07T04:52:18.242Z
  output: |
    lenh dung: ma 0 · turbo 4/4 task
    XANH: `bun run build` ma 0.

- eval: E2
  run_id: s4r1-20260907T045150Z-29244-E2
  exit_code: 0
  verifier: config:executors.script.ld_khong_doc_ngoai_suspense
  verified_at: 2026-09-07T04:52:02.696Z
  output: |
    file co getLocale: 26 · file dat: 11 · neo: 26
    root layout boc {children} trong <Suspense>: co
    ho THAT o vo tinh: 0 loi goi / 0 file
    doc du lieu luot o man, da duoc ranh cua layout che: 15 loi goi / 15 file
    generateMetadata doc du lieu luot: 22 loi goi / 22 file — KHONG tinh la ho, da do: Next cho metadata dong
    XANH: khong cho nao doc du lieu luot ma khong co mot ranh <Suspense> che — ke ca ranh cua root layout.

- eval: E3
  run_id: s4r1-20260907T045150Z-29244-E3
  exit_code: 0
  verifier: config:executors.script.ld_man_khong_doi
  verified_at: 2026-09-07T04:52:02.749Z
  output: |
    file cua apps/app doi so voi sha ghim: 1
      apps/app/app/layout.tsx
    XANH: dung mot file doi, va do la apps/app/app/layout.tsx.

- eval: E4
  run_id: s4r1-20260907T045150Z-29244-E4
  exit_code: 0
  verifier: config:executors.script.ld_metadata_nguyen_ven
  verified_at: 2026-09-07T04:52:03.124Z
  output: |
    generateMetadata nguyen ven: 22/22
    XANH: khong than generateMetadata nao doi mot ky tu so voi sha ghim.

- eval: E5
  run_id: s4r3-20260907T074041Z-16302-E5
  exit_code: 0
  verifier: config:executors.script.ld_ba_noi_deu_chay
  verified_at: 2026-09-07T07:42:12.888Z
  output: |
    dat  dieu 1a: o cam executors.script.build_khong_cache = bunx turbo run build --force
    dat  dieu 1b: suite_keys goi ten o cam ay (5 khoa)
    dat  dieu 2: ci.yml cua hang khong doi mot ky tu
    dat  dieu 3: danh sach task cua pre-push: check-types lint lint:slop test build
    dat  dieu 4: doi chung duong ma 0 va CO chay lenh dung; cay loi cu vao apps/app/app/layout.tsx -> pre-push ma 1
    dat  dieu 5: 1 buoc chay lenh dung, khong buoc nao mang continue-on-error hay if
    XANH: ca nam dieu deu dat — hai dieu doc ban khai, ba dieu do hanh vi.

- eval: E6
  run_id: s4r1-20260907T045150Z-29244-E6
  exit_code: 0
  verifier: config:executors.script.ld_o_cam_ep_chay_lai
  verified_at: 2026-09-07T04:52:30.820Z
  output: |
    o cam: bunx turbo run build --force
      luot 1: bypass=4 hit=0 fullTurbo=false
      luot 2: bypass=4 hit=0 fullTurbo=false
      doi chieu (khong co --force): bypass=0 hit=4 fullTurbo=true
    XANH: hai luot cua o cam deu that su dung, trong khi lenh khong co --force an dem — cap hai chieu tren cung mot vat.

- eval: E7
  run_id: s4r1-20260907T045150Z-29244-E7
  exit_code: 0
  verifier: config:executors.script.ld_bat_duoc_lop_loi
  verified_at: 2026-09-07T04:53:04.414Z
  output: |
    doi chung duong: cay chua cay -> lenh dung ma 0
    cay loi cu vao apps/app/app/layout.tsx -> lenh dung ma 1
    thong diep khop chan doan vo tinh cua Next: uncached or runtime data during prerendering
    khoi phuc roi dung lai -> ma 0
    XANH: lenh dung xanh khi lanh, do dung chan doan vo tinh khi cay lai loi cu, va sach sau khi khoi phuc.

- eval: E9
  run_id: s4r1-20260907T045150Z-29244-E9
  exit_code: 0
  verifier: config:executors.script.ld_lang_theo_tieng
  verified_at: 2026-09-07T04:52:04.478Z
  output: |
    cookie lang=vi -> documentElement.lang = vi
    cookie lang=en -> documentElement.lang = en
    XANH: moi luot truy cap deu duoc dat documentElement.lang dung tieng cua no.

- eval: E8
  run_id: s4r1-20260907T045150Z-29244-E8
  exit_code: 0
  verifier: config:executors.script.ld_bon_lenh_cu
  verified_at: 2026-09-07T04:54:33.336Z
  output: |
    test: ma 0
    check-types: ma 0
    lint: ma 0
    lint:slop: ma 0
    apps/app canh bao lint: 3 · ghim: 3
    XANH: bon lenh chung cu deu ma 0, canh bao lint dung ghim.

## Lệnh chứng — nay là NĂM

| Lệnh | run_id | exit |
|---|---|---|
| `test` | s4r1-20260907T045150Z-29244-suite-test | 0 |
| `check-types` | s4r1-20260907T045150Z-29244-suite-check-types | 0 |
| `lint` | s4r1-20260907T045150Z-29244-suite-lint | 0 |
| `lint-slop` | s4r1-20260907T045150Z-29244-suite-lint-slop | 0 |
| `build` | s4r1-20260907T045150Z-29244-suite-build | 0 |

## Vòng 2 — 2026-09-07

Job `lệnh dựng` mà vòng 1 thêm vào `acceptance.yml` **đỏ trên CI** dù xanh ở máy:
`bun install` chạy postinstall của `@crm/db`, vốn gọi prisma và đòi `DATABASE_URL`,
mà job mới thiếu khối `env`. Đã chép đúng khối `env` của `ci.yml`.

Mã đổi nằm trong `.github/workflows/acceptance.yml`.

**Chạy lại:** E5 — phép đo duy nhất đọc file ấy — và cả năm lệnh chứng.

**Mang sang (carry-forward):** E1 · E2 · E3 · E4 · E6 · E7 · E8 · E9. Lý do: không
phép đo nào trong số đó đọc `.github/workflows/**`; `paths` của chúng chỉ gồm
`apps/app/**`, `packages/**`, `_acceptance/**` và `.githooks/pre-push` — không
file nào trong đó đổi ở vòng này.

run_id: s4r2-20260907T073015Z-17429

| Lệnh | run_id | exit |
|---|---|---|
| `test` | s4r2-20260907T073015Z-17429-suite-test | 0 |
| `check-types` | s4r2-20260907T073015Z-17429-suite-check-types | 0 |
| `lint` | s4r2-20260907T073015Z-17429-suite-lint | 0 |
| `lint-slop` | s4r2-20260907T073015Z-17429-suite-lint-slop | 0 |
| `build` | s4r2-20260907T073015Z-17429-suite-build | 0 |

## Vòng 3 — 2026-09-07

Lượt CI thứ hai vẫn đỏ, và lần này lộ ra một điều máy chỉ thấy được khi CI thật
sự dựng: `apps/agent` chạy `eve build`, đòi **Node ≥ 24**, còn runner mặc định
cho Node 22 — trong khi `package.json` của kho khai `engines: node >=22`. Kho tự
khai một ngưỡng mà chính nó không dựng nổi. Đã ghim `actions/setup-node@v4` với
`node-version: 24` trong job; điều lệch giữa `engines` và `eve` ghi thành mục
ngoài hợp đồng.

Mã đổi nằm trong `.github/workflows/acceptance.yml`.

**Chạy lại:** E5 và cả năm lệnh chứng. **Mang sang:** E1 · E2 · E3 · E4 · E6 · E7 ·
E8 · E9 — `paths` của chúng không chạm `.github/workflows/**`.

run_id: s4r3-20260907T074041Z-16302

| Lệnh | run_id | exit |
|---|---|---|
| `test` | s4r3-20260907T074041Z-16302-suite-test | 0 |
| `check-types` | s4r3-20260907T074041Z-16302-suite-check-types | 0 |
| `lint` | s4r3-20260907T074041Z-16302-suite-lint | 0 |
| `lint-slop` | s4r3-20260907T074041Z-16302-suite-lint-slop | 0 |
| `build` | s4r3-20260907T074041Z-16302-suite-build | 0 |


### Re-pin lần 1 — 2026-10-14, do F24 ba-ho-so-do-san: sửa thước chết và răng đỏ sẵn (phạm vi A, làn C 12 hồ sơ)
run_id: repin-20261014T001054Z-11514
sha: aeacc862fc3a28e5391c27772a4ad96e16ae3317 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-15, do ghim ở đỉnh sau gộp onehub 3818ad4ec, ngay trước gộp #406 (làn X lần 2, 11 hồ sơ)
run_id: repin-20261014T231434Z-99400
sha: b9acad6b77fde52541221e857cd2eb01d839e45f · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · chập chờn (đỏ lần đầu, đạt khi chạy lại): lenh-dung-do-khong-ai-thay E8 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
