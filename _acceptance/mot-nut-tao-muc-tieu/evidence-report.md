---
schema_version: 2
feature_slug: mot-nut-tao-muc-tieu
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 547cdd4eb6ec9dcb50357e62914a722657379a4b
human_signoff:
---

# Evidence Report: mot-nut-tao-muc-tieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | judgment | PASS (hội đồng đề xuất, chờ người xác nhận) |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-4 | script | PASS |
| E9 | AC-5 | test | PASS |
| E10 | AC-5 | test | PASS |
| E11 | AC-6 | test | PASS |
| E12 | AC-6 | test | PASS |
| E13 | AC-7 | test | PASS |
| E14 | AC-7 | test | PASS |
| E15 | AC-8 | test | PASS |
| E16 | AC-9 | ui-check | PASS |

Tổng: mọi eval máy chạy đều xanh ở vòng 1. Báo cáo vẫn là REJECT vì bước phân loại phạm vi giữ lại năm phát hiện trong hợp đồng, hai trong số đó mức high (xem `review-findings.md`, mục «Trong hợp đồng»). Chúng cho thấy một số bài đo xanh nhưng không thể đỏ nếu code sai.

## Evidence

- eval: E1
  run_id: minted-mot-nut-tao-muc-tieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_dau_trang
  verified_at: 2026-10-22T12:07:09Z
  output: |
    Ran 1 test across 1 file. [1.80s]

- eval: E2
  run_id: minted-mot-nut-tao-muc-tieu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_man_doc
  verified_at: 2026-10-22T12:07:09Z
  output: |
    Ran 1 test across 1 file. [1.93s]

- eval: E3
  run_id: minted-mot-nut-tao-muc-tieu-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mnt_man
  verified_at: 2026-10-22T12:07:09Z
  output: |
    phien-do: xong — mã 0

- eval: E4
  run_id: minted-mot-nut-tao-muc-tieu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_hop
  verified_at: 2026-10-22T12:07:09Z
  output: |
    Ran 5 tests across 1 file. [1.83s]

- eval: E6
  run_id: minted-mot-nut-tao-muc-tieu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_tu_viet
  verified_at: 2026-10-22T12:07:09Z
  output: |
    Ran 2 tests across 1 file. [1.77s]

- eval: E7
  run_id: minted-mot-nut-tao-muc-tieu-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.mnt_api_muc_tieu
  verified_at: 2026-10-22T12:07:09Z
  output: |
    test-run: dropped crm_mvjhxylftzeu_test

- eval: E8
  run_id: minted-mot-nut-tao-muc-tieu-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mnt_man
  verified_at: 2026-10-22T12:07:09Z
  output: |
    phien-do: xong — mã 0

- eval: E9
  run_id: minted-mot-nut-tao-muc-tieu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_tu_mau
  verified_at: 2026-10-22T12:07:09Z
  output: |
    Ran 3 tests across 1 file. [1.90s]

- eval: E10
  run_id: minted-mot-nut-tao-muc-tieu-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.mnt_api_tu_mau
  verified_at: 2026-10-22T12:07:09Z
  output: |
    test-run: dropped crm_mvjhxy3pf4f8_test

- eval: E11
  run_id: minted-mot-nut-tao-muc-tieu-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_bang_tinh
  verified_at: 2026-10-22T12:07:09Z
  output: |
    Ran 2 tests across 1 file. [1.99s]

- eval: E12
  run_id: minted-mot-nut-tao-muc-tieu-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.mnt_api_nhap
  verified_at: 2026-10-22T12:07:09Z
  output: |
    test-run: dropped crm_mvjhxygjoaqr_test

- eval: E13
  run_id: minted-mot-nut-tao-muc-tieu-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_soan
  verified_at: 2026-10-22T12:07:09Z
  output: |
    Ran 4 tests across 1 file. [1.80s]

- eval: E14
  run_id: minted-mot-nut-tao-muc-tieu-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.mnt_api_soan
  verified_at: 2026-10-22T12:07:09Z
  output: |
    test-run: dropped crm_mvjhy986cn38_test

- eval: E15
  run_id: minted-mot-nut-tao-muc-tieu-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_khoa
  verified_at: 2026-10-22T12:07:09Z
  output: |
    Ran 1 test across 1 file. [1.67s]

- eval: E16
  run_id: minted-mot-nut-tao-muc-tieu-E16-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mnt_man
  verified_at: 2026-10-22T12:07:09Z
  screenshot: evidence/cua-toi-dau-trang-1280.png
  observed: |
    1) cua-toi-dau-trang-1280.png: trang Mục tiêu, thanh bên có "Của tôi" đang chọn. Đầu trang bên phải chỉ có hai nút: "Hỏi Kara" (nút xám có biểu tượng AI) và "Thêm mục mục tiêu" màu xanh lá (nút chính). Không có nút "…" và không có nhóm "Soạn". Khớp kỳ vọng.
    2) bo-okr-hop-1280.png: hộp thoại "Thêm mục tiêu" nằm giữa màn. Dòng phụ: "Mục tiêu mới của Kinh doanh miền Bắc. Chọn cách bắt đầu." (gọi tên đơn vị). Bốn dòng theo đúng thứ tự: Tự viết, Từ mẫu, Từ bảng tính, Soạn cùng Kara. Dòng Soạn cùng Kara bị mờ (do chu kỳ không ở giai đoạn lập kế hoạch, có giải thích "Chỉ mở khi chu kỳ đang lập kế hoạch...") và có dấu tia sáng AI kèm chữ "Kara" bên phải. Khớp kỳ vọng.
    3) suc-khoe-dau-trang-1280.png: trang Sức khoẻ có ô số tổng quan và bảng "Theo đơn vị". Đầu trang chỉ có nút xám "Hỏi Kara", không có nút to màu (không có nút xanh). Khớp kỳ vọng.
    4) cua-toi-hop-375.png: khung 375, hộp "Thêm mục tiêu" vừa bề ngang màn (lề khoảng 16px mỗi bên). Bốn dòng đọc trọn, mô tả xuống dòng, không bị cắt chữ; dòng Soạn cùng Kara mờ có dấu AI. Không thấy tràn ngang. Khớp.
    5) bo-okr-hop-375.png: nhìn y hệt ảnh 4 (cùng hộp, cùng bốn dòng, không tràn, không cắt chữ). Khớp.
    Bản đồ in đủ ba dòng DUNG AC-9 cho ba ảnh hộp, mỗi dòng "tran ngang 0, dong bi cat 0, vung bam tron 4/4". Không có mâu thuẫn giữa ảnh và Expected.
  network_observed: n-a (driver)
  output: |
    Ảnh trong evidence/ (đủ 5, đã mở bằng Read): cua-toi-dau-trang-1280.png, bo-okr-hop-1280.png, suc-khoe-dau-trang-1280.png, cua-toi-hop-375.png, bo-okr-hop-375.png. Tên ảnh do bộ đo đặt, không phải E16-stepN.png.
    Lưu ý: cua-toi-hop-375.png và bo-okr-hop-375.png cùng 38538 byte và nhìn giống hệt nhau; nhìn không thấy nền trang phía sau nên không phân biệt được nguồn bằng mắt. Cả hai đều đạt kỳ vọng.
    Mạng: do-man.mjs tự lái trình duyệt, không có công cụ đọc network, nên không tạo E16-network.txt.

### Judgment

- eval: E5
  judged_by: judge panel (fresh context): domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: Ba judge cùng đọc okr.ts (tiếng Việt dòng 48–79, tiếng Anh dòng 829–860) và thấy đủ chuỗi, lời người dùng, Kara được gọi đúng tên, câu khoá có lối đi tiếp. Đây là đề xuất của máy.
  votes:
    - domain-correctness: PASS — Bốn câu mô tả nói người dùng sẽ làm gì bằng lời thường, không tên kỹ thuật, không «AI», Kara đúng tên. Các câu khoá nêu khi nào đường mở (quản trị thêm mẫu; chỉ khi chu kỳ đang lập kế hoạch) và nên chọn gì thay (Tự viết, Từ mẫu); câu «cá nhân» giải thích vì sao khoá. Bản tiếng Anh cùng nghĩa từng chuỗi. Điểm yếu nhỏ: «mới» trong «Mục tiêu mới của {ten}» hơi thừa nhưng không làm sai nghĩa.
    - operational-feasibility: PASS — okr.ts (dòng 48–79) có đủ tiêu đề «Thêm mục tiêu», câu đơn vị đích «Mục tiêu mới của {ten}. Chọn cách bắt đầu.», bốn đường kèm mô tả, «Tiếp cuộc đang soạn» và các câu khoá. «OKR» và «KR» là từ sẵn có của màn. Câu khoá nói khi nào mở lại hoặc việc nên làm thay. Bản tiếng Anh ở dòng 829–860 cùng nghĩa.
    - spec-alignment: PASS — chonDuong (tiếng Việt dòng 49–79, tiếng Anh dòng 830–860) có đủ tiêu đề, câu đơn vị đích có {ten}, bốn câu mô tả đường, «Tiếp cuộc đang soạn» và ba câu lý do khoá. «chuaCoMau» nói khi nào mở lại và nên chọn Tự viết; «ngoaiPha» nói mở khi chu kỳ đang lập kế hoạch. Tiếng Anh dùng «Division/Department» khớp cap.bp/pb. Hai điểm nhỏ không đủ để loại: «OneHub» trong «caNhan» khác nhãn cấp gốc «Công ty», và «ngoaiPha» gợi ý Từ mẫu có thể đang khoá.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-22T12:07:09Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-22T12:07:09Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-22T12:07:09Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-22T12:07:09Z

- cmd: bunx turbo run lint --force
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-22T12:07:09Z

- cmd: bun run lint:slop
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-22T12:07:09Z

- cmd: bunx turbo run build --force
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-22T12:07:09Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline). Cả bốn đều là bài API sẵn có; hồ sơ nói rõ vòng này không đổi API và các eval này chỉ giữ đường ghi sống, nên chúng là regression-guard có chủ ý, không chứng minh được tính năng mới:
- E7: bun run test -- "cd apps/api && bun test test/okr.spec.ts -t muc-tieu"
- E10: bun run test -- "cd apps/api && bun test test/okr-canh-kr.spec.ts -t tu-mau"
- E12: bun run test -- "cd apps/api && bun test test/okr.spec.ts -t nhap-bang-tinh"
- E14: bun run test -- "cd apps/api && bun test test/soan-okr-mo.spec.ts -t soan-mo"

Hành vi mới của vòng này nằm ở E1–E4, E6, E8, E9, E11, E13, E15, E16. Sáu trong số đó (E1, E2, E4, E6, E9, E11, E13, E15) chạy trên tệp mới chưa có ở baseline nên baseline là n-a; E3 và E8 là red trên baseline (có phân biệt).

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-dau-trang: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-man-doc: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-hop: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-tu-viet: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-tu-mau: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-bang-tinh: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-soan: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-khoa: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval ngẫu nhiên)

## Iterations

Round 1: không eval máy nào đỏ; REJECT vì phân loại phạm vi giữ lại năm phát hiện trong hợp đồng (hai mức high: bài kiểm E6/E9/E11 không thể đỏ khi truyền sai đơn vị hay chu kỳ, và bàn đo E3 đếm 0 nút chính cả khi màn không dựng). Trả về bước thực thi để sửa bài đo.

