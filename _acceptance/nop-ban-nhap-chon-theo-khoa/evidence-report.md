---
schema_version: 2
feature_slug: nop-ban-nhap-chon-theo-khoa
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3383bf1e36d6d912d604acabc09c3840fc45be7e
human_signoff:
---

# Evidence Report: nop-ban-nhap-chon-theo-khoa

Vòng 1. Mọi eval máy đều xanh; eval judgment E4 còn chờ người quyết (cả ba giám khảo đề xuất không đạt), nên verdict là PENDING-JUDGMENT.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-2 | script | PASS |
| E2 | AC-1, AC-3 | script | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-6 | judgment | PENDING-JUDGMENT |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nop-ban-nhap-chon-theo-khoa-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nbn_dao_thu_tu_xanh
  verified_at: 2026-10-04T02:32:55Z
  output: |
    bo chon theo khoa: ca xanh du thu tu vat ly dao

- eval: E2
  run_id: minted-nop-ban-nhap-chon-theo-khoa-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nbn_dao_thu_tu_do
  verified_at: 2026-10-04T02:32:55Z
  output: |
    bo chon createdAt: ca do dung chu ky CI 37169842118 ("giu": [], m1 them ten moi)

- eval: E3
  run_id: mut7iqh63ba2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nbn_ca_tep
  verified_at: 2026-10-04T02:32:55Z
  output: |
    test-run: dropped crm_mut7iqh63ba2_test

- eval: E5
  run_id: minted-nop-ban-nhap-chon-theo-khoa-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nbn_quet_mau
  verified_at: 2026-10-04T02:32:55Z
  output: |
    (rang quet-mau.mjs khong in dong nao o phan cuoi dau ra da ghi lai)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-04T02:32:55Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-04T02:32:55Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-04T02:32:55Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-04T02:32:55Z

- cmd: bunx turbo run lint --force
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-04T02:32:55Z

- cmd: bun run lint:slop
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-04T02:32:55Z

- cmd: bunx turbo run build --force
  run_id: minted-nop-ban-nhap-chon-theo-khoa-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-04T02:32:55Z

### Judgment

Đề xuất panel cho E4 (AC-6): ba giám khảo, mỗi người một lăng kính. Cả ba cùng chỉ ra một chỗ mà bảng «Rà các ca cùng mẫu» của design doc bỏ sót. Các dissent hiển thị đầy đủ bên dưới, không gộp.

- eval: E4
  judged_by: judge-subagent (fresh context), panel 3 lăng kính
  proposal: FAIL
  votes:
    - domain-correctness: FAIL — Câu (1) và các ý (3a), (3b), (3c) đúng như design doc. Ca "Mục tiêu đã nhận" (spec dòng 503-508) chọn m1 qua dongSoanTuHang(h).khoa === "m1" và không dùng orderBy nào. docDaQuyet (dòng 159) sắp [{createdAt:"asc"},{id:"asc"}]. Schema banNhap không có refine nào chặn trùng khoa. Trong nop-ban-nhap.ts chỉ docDaQuyet có orderBy. Ba chỗ orderBy createdAt còn lại của câu (2) không để thứ tự quyết định kết quả: dòng 242 chỉ dùng every/filter().length/sort(), dòng 443 lọc theo tên nên mỗi lần nộp chỉ khớp một dòng, dòng 522 lọc theo khoá. Nhưng bản quét của design bỏ sót một chỗ cùng mẫu: spec dòng 273-279 (ca "nộp lại dòng có khoá đã bác") dùng findFirstOrThrow lọc muc-tieu-moi/cho mà không có orderBy. Sau lần nộp đầu, cuộc dùng chung có hai Mục tiêu đang chờ cùng createdAt là m1 và m3, vì m2 đã bi-loai. Dòng nào Postgres trả trước thì bị đánh dấu bac, và các kỳ vọng sau đó giả định đó là m1 ("m1 da-bac", "m3 không nằm trong biLoai"). Đây là thứ tự trong một lần nộp quyết định kết quả mà bảng không nêu, đúng lỗi chập chờn mà hồ sơ này sửa.
    - operational-feasibility: FAIL — Câu (1) và (3) đồng ý, câu (2) đúng với bốn chỗ orderBy createdAt. Nhưng ở test "nộp lại dòng có khoá đã bác" (spec dòng 273-279), findFirstOrThrow chọn dòng Mục tiêu "cho" không có orderBy, và hai dòng m1/m3 của cùng một lần nộp đang "cho" cùng createdAt. Thứ tự vật lý của một lần nộp quyết định nó đánh dấu m1 hay m3 là "bac", và bảng «Rà các ca cùng mẫu» không nêu chỗ này.
    - spec-alignment: FAIL — Câu (1) và (3) đồng ý với design doc. Ca "Mục tiêu đã nhận" chọn m1 qua dongSoanTuHang(h).khoa === "m1" (spec dòng 503-508). docDaQuyet sắp [{createdAt asc},{id asc}] (nop-ban-nhap.ts dòng 159) và đây là chỗ sắp createdAt duy nhất trong tệp. Schema banNhap không chặn trùng khoá. Bốn chỗ orderBy createdAt còn lại không đổi kết quả khi hai dòng của cùng một lần nộp đổi chỗ. Tuy nhiên ca "nộp lại dòng có khoá đã bác" trong nop-ban-nhap.integration.spec.ts dòng 273-279 có cùng mẫu lỗi mà bảng không nêu: findFirstOrThrow({where: {cuocSoanId, loai: "muc-tieu-moi", trangThai: "cho"}}) không có orderBy. Sau lần nộp tron() đầu tiên của cuộc dùng chung canh.cuocSoanId, m1 và m3 đều là "cho" và cùng một createdAt, vì chỉ m2 bị loại. Thứ tự vật lý quyết định dòng nào bị đánh dấu "bac"; nếu ra m3 thì ca không còn thấy m1 da-bac nữa (expect ở dòng 301-302 đỏ). Bảng quét của spec chỉ đếm pattern orderBy: { createdAt, nên bỏ sót chỗ này.
  required_evidence:
    - domain-correctness: Sửa apps/agent-okr/test/nop-ban-nhap.integration.spec.ts dòng 273-279 để ca "nộp lại dòng có khoá đã bác" chọn dòng m1 theo khoá bằng findMany(...).find((h) => dongSoanTuHang(h).khoa === "m1"), như đã làm ở dòng 503-508. Hoặc thêm vào bảng «Rà các ca cùng mẫu» trong docs/superpowers/specs/2026-10-04-nop-ban-nhap-chon-theo-khoa-design.md một dòng cho findFirstOrThrow này, nêu rõ vì sao thứ tự không quyết định kết quả khi cuộc có cả m1 và m3 cùng cho, hoặc ghi nó là chỗ cùng mẫu cần sửa. Có một trong hai thì đề xuất đổi sang PASS.
    - operational-feasibility: Một trong hai. (i) Spec dòng 273 được sửa thành chọn m1 theo khoá qua dongSoanTuHang (cùng kiểu BO_CHON_KHOA), và nop-ban-nhap.integration.spec.ts không còn findFirst/findFirstOrThrow nào trên các dòng Mục tiêu cùng lần nộp mà thiếu orderBy hoặc chọn theo khoá. (ii) Design doc thêm một dòng vào bảng giải thích vì sao dòng 273 không phụ thuộc thứ tự; cách (ii) chỉ đúng khi có căn cứ, vì dòng 301-302 đòi hỏi m1 phải là dòng bị đánh dấu bac.
    - spec-alignment: Một trong hai. Bảng «Rà các ca cùng mẫu» của design doc thêm dòng cho spec dòng khoảng 273 (test "nộp lại dòng có khoá đã bác") và kết luận rõ: chứng minh thứ tự không quyết định kết quả, hoặc ghi nó là cùng lỗi và nằm trong hay ngoài phạm vi hồ sơ. Hoặc sửa dòng 273-279 chọn m1 theo khoá bằng findMany(...).find(h => dongSoanTuHang(h).khoa === 'm1') như ca "Mục tiêu đã nhận", và mở rộng rang/quet-mau.mjs để bắt cả findFirst không orderBy trên okrDeXuat muc-tieu-moi/cho.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

E3 (lệnh `bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/nop-ban-nhap.integration.spec.ts"`) xanh trên cả HEAD lẫn baseline: eval này không phân biệt riêng lẻ. Theo design, chiều đỏ của đúng ca này đã nằm ở E2 (cùng bản sao spec, bộ chọn cũ cộng bước dời bản ghi, đỏ đúng chữ ký CI 37169842118), nên E3 đứng vai regression-guard có chủ ý cho 16 ca của tệp. Nếu muốn E3 tự phân biệt thì viết lại để tự chèn bước dời bản ghi m1.

Các eval feature còn lại (E1, E2, E5) đều đỏ trên baseline, có phân biệt.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval đã chạy một lần, tất định, không có phương sai)

## Iterations

Round 1: mọi eval máy xanh (E1, E2, E3, E5, bảy lệnh suite); E4 judgment: ba giám khảo cùng đề xuất không đạt vì ca "nộp lại dòng có khoá đã bác" (spec dòng 273-279) còn chọn dòng theo vị trí vật lý, cùng lớp lỗi với ca đã sửa. Chờ người quyết ở Cổng 2.
