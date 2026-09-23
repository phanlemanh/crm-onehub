---
schema_version: 2
feature_slug: bo-dung-chung-nhan-chuoi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a1e9d9e572845d6f2320b21f8617cafba37b5086
human_signoff:
---

# Evidence Report: bo-dung-chung-nhan-chuoi

_Vòng chấm 5 — mở lại theo quyết định người dùng ("Đồng ý theo khuyến nghị") trên hồ sơ decisions.jsonl; khuôn máy đo của E1-E3/E7-E9 và E5-E6 đổi sang lệnh bun test theo gói, chấm lại toàn bộ trên commit đã ghim._

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | judgment | PASS |

## Evidence

- eval: E1
  run_id: mudevmiqdl7e
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T08:11:55+07:00
  output: |
    Time:    1.966s

    test-run: dropped crm_mudevmiqdl7e_test

- eval: E2
  run_id: mudevmiqdl7e
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T08:11:55+07:00
  output: |
    Time:    1.966s

    test-run: dropped crm_mudevmiqdl7e_test

- eval: E3
  run_id: mudevmiqdl7e
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T08:11:55+07:00
  output: |
    Time:    1.966s

    test-run: dropped crm_mudevmiqdl7e_test

- eval: E4
  run_id: minted-bo-dung-chung-nhan-chuoi-E4-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_goc_ngon_ngu
  verified_at: 2026-09-23T08:11:55+07:00
  output: |
    -- chiều đỏ: gieo một dòng nhập ngược thì phép đo phải bắt
        gieo thì bắt, gỡ ra thì im
    rang-goc-ngon-ngu khong-nhap-nguoc: hai chiều đúng

- eval: E5
  run_id: minted-bo-dung-chung-nhan-chuoi-E5-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_goi_ui
  verified_at: 2026-09-23T08:11:55+07:00
  output: |
    231 expect() calls
    Ran 117 tests across 9 files. [2.03s]

- eval: E6
  run_id: minted-bo-dung-chung-nhan-chuoi-E6-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_goi_ui
  verified_at: 2026-09-23T08:11:55+07:00
  output: |
    231 expect() calls
    Ran 117 tests across 9 files. [2.03s]

- eval: E7
  run_id: mudevmiqdl7e
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T08:11:55+07:00
  output: |
    Time:    1.966s

    test-run: dropped crm_mudevmiqdl7e_test

- eval: E8
  run_id: mudevmiqdl7e
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T08:11:55+07:00
  output: |
    Time:    1.966s

    test-run: dropped crm_mudevmiqdl7e_test

- eval: E9
  run_id: mudevmiqdl7e
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T08:11:55+07:00
  output: |
    Time:    1.966s

    test-run: dropped crm_mudevmiqdl7e_test

### Judgment — E10

- eval: E10
  criterion: AC-10
  executor: judgment
  judged_by: judge panel (3 lens, fresh context)
  panel_verdict: PASS

- domain-correctness: PASS — Đối chiếu đủ 43 khoá trong ban-dich.md với giá trị `vi` tương ứng trong messages.ts: khớp tuyệt đối, không lệch một dòng nào. Đọc lại toàn bộ 43 chuỗi tiếng Việt (Bỏ hết tiêu chí, Sắp xếp theo, Ẩn/hiện cột, Nhận lời, Có thể dự, Đổi thứ tự X, Đang suy nghĩ…, v.v.) đều là văn phong UI tiếng Việt tự nhiên, ngắn gọn, không có dấu vết dịch máy hay dịch từng chữ theo cú pháp Anh, kể cả các cụm mang tính thành ngữ nghiệp vụ (Nhận lời, Có thể dự cho RSVP lịch).
- operational-feasibility: PASS — Trong phạm vi 43 khoá đã chốt ở bảng dịch (khớp với packages/ui/src/lib/messages.ts), các chuỗi tiếng Việt đọc tự nhiên, đúng ngữ vực UI/sản phẩm: dùng thuật ngữ quen thuộc (Tăng dần/Giảm dần, Sắp xếp theo, Đã tải xong X, Không có kết quả), mở rộng ngữ cảnh hợp lý thay vì dịch máy sát nghĩa (Chấp nhận gợi ý, Xoá ngày, Có thể dự), không có dấu hiệu dịch cứng hay sai ngữ pháp. Các khoá ngoài bảng (macDinh.*, thongBao.*, chatMessage.*, v.v.) bị bảng tự loại khỏi phạm vi chấm nên không xét.
- spec-alignment: PASS — Toàn bộ 43 khoá trong ban-dich.md khớp đúng với packages/ui/src/lib/messages.ts. Chữ tiếng Việt đọc tự nhiên, không dịch nguyên từng chữ — thêm ngữ cảnh làm rõ nghĩa ("Xoá ngày" thay vì "Xoá" trần, "Chấp nhận gợi ý"/"Từ chối gợi ý" thay vì "Chấp nhận"/"Từ chối" trần), dùng đúng giọng nghiệp vụ quen thuộc (trạng thái RSVP lịch: "Nhận lời/Từ chối/Có thể dự/Chưa trả lời"), chính tả nhất quán ("Xoá" dùng xuyên suốt, không lẫn "Xóa"). Các quyết định tinh tế được ghi lại trong ban-dich.md (giữ "Các lựa chọn" cho aria-label vì ngữ cảnh trình đọc màn hình khác ngữ cảnh nhìn thấy; bỏ "Kéo" khỏi sortableList.reorder vì tương tác thật là bàn phím) cho thấy người dịch hiểu đúng ngữ cảnh kỹ thuật, đúng chất người trong nghề chứ không phải dịch máy hay dịch hời hợt.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mudevm7yzcc9
  exit_code: 0
  verified_at: 2026-09-23T08:11:55+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-bo-dung-chung-nhan-chuoi-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-09-23T08:11:55+07:00

- cmd: bun run lint:slop
  run_id: minted-bo-dung-chung-nhan-chuoi-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-09-23T08:11:55+07:00

- cmd: bunx turbo run build --force
  run_id: minted-bo-dung-chung-nhan-chuoi-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-09-23T08:11:55+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

Toàn bộ 9 eval máy của tính năng này (E1-E9) xanh trên CẢ HEAD lẫn baseline (diffBase) — không có eval feature nào của round này đỏ trên code cũ, nên xét riêng lẻ chúng không phân biệt được tính năng khỏi trạng thái trước khi làm:

- `bun run test --filter=@crm/ui` (E1, E2, E3, E7, E8, E9): baseline green.
- `bash _acceptance/bo-dung-chung-nhan-chuoi/rang-goc-ngon-ngu.sh --chan mot-goc && --chan khong-nhap-nguoc` (E4): baseline green.
- `cd packages/ui && bun run test` (E5, E6): baseline green.

Xem thêm review-findings.md § "Trong hợp đồng" (AC-7 chỉ đo tên lớp CSS, không đo đầu ra đã vẽ) và mục ngoài hợp đồng "Hình dạng 4" (E1/E2/E3/E7/E8/E9 dùng chung một phép đo mã thoát của cả bộ test @crm/ui, không ghim thông điệp riêng theo từng AC) — hai phát hiện đó là một phần lý do các eval này không phân biệt được với baseline: bài kiểm hiện có phần lớn đã tồn tại trước tính năng (viết lại theo lớp CSS/chuỗi mới), nên bài kiểm không tự "mới" theo nghĩa discriminating, dù bản thân sản phẩm rõ ràng đã đổi. Người ký Cổng 2 nên coi đây là tín hiệu cân nhắc — chấp nhận như regression-guard có chủ ý, hoặc yêu cầu viết lại để assert riêng hành vi mới.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1-3 (2026-09-01): 10 lỗi tìm thấy và sửa (chuỗi tiếng Anh cứng trong thanh công cụ, nhãn "Bỏ lọc" gây mất lựa chọn, AC-7 trống ở 768px, lịch chọn ngày tiếng Anh, chuỗi thư viện ngoài, v.v.); ký Cổng 2 — Manh Phan 2026-09-01.
Round "Người lạ lái thử" (sau ký Cổng 2, 2026-09-01): phát hiện thêm 3 chữ tiếng Anh phải đi hỏi mới hiểu và 1 lỗi sản phẩm ngoài phạm vi ngôn ngữ; ghi vết, không mở lại vòng chấm ngôn ngữ.
Round 5 (2026-09-23, mở lại theo hồ sơ tieu-de-cot-doc-tron / decisions.jsonl): đổi khuôn máy đo E1-E3/E7-E9 và E5-E6 sang lệnh bun test theo gói (mã 0 = đạt); chấm lại toàn bộ 9 eval máy + E10 judgment trên commit a1e9d9e5 — tất cả PASS, không mục UNCERTAIN nào còn treo.
