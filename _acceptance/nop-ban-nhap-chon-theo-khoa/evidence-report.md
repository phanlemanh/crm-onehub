---
schema_version: 2
feature_slug: nop-ban-nhap-chon-theo-khoa
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b2b54df9eb144a6ad15efc59a1de4b2c3a9d0e30
human_signoff:
---

# Evidence Report: nop-ban-nhap-chon-theo-khoa

Vòng 2. Bốn eval máy (E1, E2, E3, E5) và bảy lệnh suite đều xanh; eval judgment E4 được cả ba giám khảo đề xuất đạt sau khi ca "nộp lại dòng có khoá đã bác" được sửa chọn dòng theo khoá. Verdict: PASS.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-2, AC-7, AC-8 | script | PASS |
| E2 | AC-1, AC-3, AC-7, AC-8 | script | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-6 | judgment | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nop-ban-nhap-chon-theo-khoa-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nbn_dao_thu_tu_xanh
  verified_at: 2026-10-04T02:59:39Z
  output: |
    dich: 3 dong da xep lai thu tu vat ly; bo chon moi: 2 pass, 0 fail

- eval: E2
  run_id: minted-nop-ban-nhap-chon-theo-khoa-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nbn_dao_thu_tu_do
  verified_at: 2026-10-04T02:59:39Z
  output: |
    dich: 3 dong da xep lai thu tu vat ly; bo chon cu do dung chu ky: dich("m3:cc") doc dong can chinh cu: Received co "id-la"

- eval: E3
  run_id: minted-nop-ban-nhap-chon-theo-khoa-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nbn_ca_tep
  verified_at: 2026-10-04T02:59:39Z
  output: |
    test-run: dropped crm_mut8g6kypty9_test

- eval: E5
  run_id: minted-nop-ban-nhap-chon-theo-khoa-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nbn_quet_mau
  verified_at: 2026-10-04T02:59:39Z
  output: |
    cay that khop tung cho voi danh sach da ra

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-04T02:59:39Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-04T02:59:39Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-04T02:59:39Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-04T02:59:39Z

- cmd: bunx turbo run lint --force
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-04T02:59:39Z

- cmd: bun run lint:slop
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-04T02:59:39Z

- cmd: bunx turbo run build --force
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-04T02:59:39Z

### Judgment

Đề xuất panel cho E4 (AC-6): ba giám khảo, mỗi người một lăng kính, cùng đề xuất PASS. Đây là đề xuất của máy; ô human_override để trống cho người ở Cổng 2.

- eval: E4
  judged_by: judge-subagent (fresh context), panel 3 lăng kính
  proposal: PASS
  votes:
    - domain-correctness: PASS — Ca `nhan` (dòng 507) và ca `bac` (dòng 282) đều gọi `mucTieuChoTheoKhoa`, hàm này `findMany` rồi `find` theo `dongSoanTuHang(h).khoa === khoa`. `dich` đọc `can-chinh-moi` với `orderBy [createdAt, id]` (dòng 306-310). Không còn chỗ nào chọn dòng theo thứ tự không xác định mà hai bảng không nêu: `krCho` (`findFirstOrThrow`, `createdAt desc`), `dongMucTieu` với `.at(-1)` của `m2`, và `findMany` chỉ dùng `every`, `filter`, `count` đều mỗi khoá một dòng trong mỗi lần nộp vì `chanTrungKhoa` chặn trùng `khoaDong`, và các lần nộp khác nhau có `createdAt` khác nhau. Bảy chỗ `packages/auth` đều khớp một dòng: token riêng, `userId` + `providerId` với mỗi người một tài khoản, `organizationId` + `email` với một lời mời trong ca. `docDaQuyet` sắp `[createdAt, id]`; schema `banNhap` không chặn trùng `khoa`, đúng như design khai; `docDaQuyet` là chỗ duy nhất trong `nop-ban-nhap.ts` có `orderBy`.
    - operational-feasibility: PASS — Ca «nhan» (spec dòng 507) và ca «bac» (dòng 282) đều chọn Mục tiêu bằng mucTieuChoTheoKhoa rồi dongSoanTuHang(h).khoa === "m1"; dich("m3:cc") đọc can-chinh-moi với orderBy [{createdAt:"asc"},{id:"asc"}] (dòng 308). Các chỗ chọn dòng còn lại không phụ thuộc thứ tự: krCho (findFirstOrThrow, createdAt desc) chỉ phân biệt giữa các lần nộp; dongMucTieu có m1 chỉ một dòng, m2 `.at(-1)` chỉ còn một dòng vì dòng m2 đầu bị loại; cặp [0]/[1] của nhom đối xứng; còn lại chỉ dùng every/filter/length/sort; mucTieuChoTheoKhoa dùng `.find` trên findMany không orderBy nhưng ở mọi điểm gọi chỉ có một dòng m1 đang chờ. Bảy spec auth: identifier là tiền tố cộng token ngẫu nhiên riêng của từng lần chia; user tạo mới theo từng ca nên chỉ có một tài khoản mỗi providerId; lời mời có id tất định theo email và email mang suffix riêng của lượt. docDaQuyet sắp [createdAt, id]; schema banNhap không có refine chặn trùng khoa, đúng như design nói; nop-ban-nhap.ts không còn chỗ sắp createdAt nào khác.
    - spec-alignment: PASS — Spec đã sửa khớp design doc ở cả bốn câu. Ca "nhan" (dòng 507) và ca "bac" (dòng 282) đều chọn m1 qua mucTieuChoTheoKhoa/dongSoanTuHang, và dich("m3:cc") đọc theo orderBy [createdAt, id] (dòng 308). Các chỗ chọn dòng còn lại (krCho desc, dongMucTieu .at(-1) của m2, nhom [0]/[1], các findFirst trong packages/auth) đều không đổi kết quả khi hai dòng bằng nhau đổi chỗ. docDaQuyet sắp [createdAt, id], schema banNhap không chặn trùng khoa, và nop-ban-nhap.ts không có chỗ nào khác sắp theo createdAt.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

E3 (lệnh `bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/nop-ban-nhap.integration.spec.ts"`) xanh trên cả HEAD lẫn baseline: eval này không phân biệt riêng lẻ. Chiều đỏ của từng ca đã sửa nằm ở E2 (đỏ trên baseline, có phân biệt); E3 là chốt hồi quy có chủ ý cho cả tệp spec.

Các eval feature còn lại (E1, E2, E5) đều đỏ trên baseline, có phân biệt.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval đã chạy một lần, tất định, không có phương sai)

## Iterations

Round 1: mọi eval máy xanh (E1, E2, E3, E5, bảy lệnh suite); E4 judgment: ba giám khảo cùng đề xuất không đạt vì ca "nộp lại dòng có khoá đã bác" (spec dòng 273-279) còn chọn dòng theo vị trí vật lý, cùng lớp lỗi với ca đã sửa. Phạm vi mở rộng sang ca đó; quay lại implementation.

Round 2: ca "nộp lại dòng đã bác" chọn m1 theo khoá và ca dịch đọc dòng căn chỉnh theo thứ tự tường minh; E1, E2, E3, E5 và bảy lệnh suite đều xanh; E4: cả ba giám khảo đề xuất đạt. Verdict PASS.
