---
schema_version: 2
feature_slug: trang-chua-de-xuat-mo-duoc
verdict: BLOCKED
failed_evals: []
reason: "Eval E8 (lệnh tcd_san_thiet_ke: design-gate --mode static trên man-doc.tsx và sua/page.tsx) không có kết quả: tác tử chạy nó bị bỏ qua hoặc chết, không được tính là đạt. Cách xử lý là chạy lại lệnh này, không phải sửa mã. Tám eval máy còn lại và bốn lệnh suite đều xanh."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0f118ed4771f9e4f4f7f378e9430d391601a8d08
human_signoff:
---

# Evidence Report: trang-chua-de-xuat-mo-duoc

Vòng 1. Verdict BLOCKED vì E8 không chạy được (xem `reason`). Không eval nào đỏ.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6u | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E7u | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | BLOCKED |
| E9j | AC-9 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |

## Evidence

- eval: E1
  run_id: minted-trang-chua-de-xuat-mo-duoc-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_ma_tran
  verified_at: 2026-09-29T10:19:58Z
  output: |
    Lệnh: bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t ma-tran"
    Ca ma-tran chạy xong, cơ sở dữ liệu dùng-một-lần được drop sau lượt.

- eval: E2
  run_id: minted-trang-chua-de-xuat-mo-duoc-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_diem_vao
  verified_at: 2026-09-29T10:19:58Z
  output: |
    Lệnh: bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t diem-vao"
    Ca diem-vao chạy xong, cơ sở dữ liệu dùng-một-lần được drop sau lượt.

- eval: E3
  run_id: minted-trang-chua-de-xuat-mo-duoc-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_khong_thay
  verified_at: 2026-09-29T10:19:58Z
  output: |
    Lệnh: bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t khong-thay"
    Ca khong-thay chạy xong.

- eval: E4
  run_id: minted-trang-chua-de-xuat-mo-duoc-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_dang_cho
  verified_at: 2026-09-29T10:19:58Z
  output: |
    Lệnh: bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t dang-cho"
    Ca dang-cho chạy xong, cơ sở dữ liệu dùng-một-lần được drop sau lượt.

- eval: E5
  run_id: minted-trang-chua-de-xuat-mo-duoc-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_man_doc
  verified_at: 2026-09-29T10:19:58Z
  output: |
    Lệnh: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-trang-cho.dom.tsx
    Ran 14 tests across 1 file.

- eval: E6
  run_id: minted-trang-chua-de-xuat-mo-duoc-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_viet_tay
  verified_at: 2026-09-29T10:19:58Z
  output: |
    Lệnh: bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t viet-tay"
    Ca viet-tay chạy xong, cơ sở dữ liệu dùng-một-lần được drop sau lượt.

- eval: E6u
  run_id: minted-trang-chua-de-xuat-mo-duoc-E6u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcd_man_trang_cho
  verified_at: 2026-09-29T10:19:58Z
  screenshot: evidence/E6u-step1.png
  observed: |
    E6u-step1.png (buoc 3, 1440): man 'Sua trang' cho trang 'Chinh sach thu go-tay 2777', URL /sua; trinh soan (toolbar H2/H3/B/I/list/link) co mat, vung soan rong chi hien placeholder 'Viet noi dung trang, hoac dan tu Word.'; nut 'Gui duyet' (mo, chua co thay doi), 'Huy', chu 'Chua co thay doi'; khop expected (trinh soan co mat, chu rong). E6u-step2.png (buoc 4, 1440): man doc cua cung trang, tieu de 'Chinh sach thu go-tay 2777', 'Chinh sach · Chua co phien ban dang dung', khung thong bao 'Trang nay chua hien cho moi nguoi. Dang cho Phan Le Manh duyet.', chip 'Co 1 ban cho duyet' + 'Xem ban cho duyet', chu trang Phan Le Manh; khop expected (ve man doc, khung cho duyet co chu, khong con o trinh soan).
  network_observed: n-a (driver)
  output: |
    Bước 3 và bước 4 của man-trang-cho.mjs đạt. Frame: evidence/E6u-step1.png (viet-tay-1440), evidence/E6u-step2.png (gui-ban-dau-1440). Bước 1 (cảnh cây, gieo, đăng nhập) không có ảnh. Số liệu network ghi ở evidence/E6u-network.txt.

- eval: E7
  run_id: minted-trang-chua-de-xuat-mo-duoc-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_ma_tran
  verified_at: 2026-09-29T10:19:58Z
  output: |
    Chung lượt chạy với E1: ca ma-tran chạy xong; ô (owner, máy đang soạn) và (owner, cần gõ tay) nằm trong bảng.

- eval: E7u
  run_id: minted-trang-chua-de-xuat-mo-duoc-E7u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcd_man_trang_cho
  verified_at: 2026-09-29T10:19:58Z
  screenshot: evidence/E7u-step1.png
  observed: |
    E7u-step1 (may-soan 1440): trang tai-lieu cua 'Chính sách thử may-soan 66ce' (khong phai 404), thanh ben, khung thong tin dau trang co tieu de 'Máy đang soạn bản đầu.', dong 'Bản soạn xong sẽ chờ Phan Lê Mạnh duyệt.', dong 'Nguồn Chinh_sach_nhan_vien_2026_ban_cuoi_cung_da_ky_va_dong_dau_lan_ba.pdf.' nam gon trong khung; nut 'Xem nguồn'; cot phai 'Chủ trang Phan Lê Mạnh'. Khop expected buoc 1. E7u-step2 (may-soan 390): cung noi dung, ten tep dai bi ngat dong xuong 3 dong ('...da_ky_v / a_dong_dau_lan_ba.pdf.'), khung nam tron trong vien 390, khong tran ngang, 'Chủ trang' xep duoi. E7u-step3 (go-tay 1440): khung 'Cần gõ tay.' + 'Nguồn là bản quét, máy không đọc được chữ. Gõ nội dung để gửi Phan Lê Mạnh duyệt.' + dong Nguon, nut 'Viết tay' va 'Xem nguồn'. go-tay-390 (doc them): cung khung, ten tep ngat dong, khong tran. E7u-step4 (loi 1440): khung 'Máy chưa soạn được.' + 'Soạn lại ở tab Nguồn, hoặc viết tay để gửi Phan Lê Mạnh duyệt.', dong Nguon ten tep, ly do dai 'Maysoanhetthoigian...vuottranbuoc' khong dau cach hien tren dong rieng trong khung; nut 'Viết tay', 'Xem nguồn'. loi-390 (doc them): ly do dai va ten tep deu ngat dong (ly do tren 2 dong), ben trong vien khung, khong cuon ngang. E7u-step5 (tra-lai 1440): 'Bản đầu đã bị trả lại.' + 'Viết bản mới để gửi Phan Lê Mạnh duyệt.', nut 'Viết tay', khong co dong Nguon (dung voi trang tra-lai); tra-lai-390 (doc them) tuong tu, khong tran. Tat ca khop Expected; khong mau thuan.
  network_observed: n-a (driver)
  output: |
    Bước 1 và bốn dòng bước 2 của man-trang-cho.mjs đạt. Frame gốc ở .acceptance-runs/trang-chua-de-xuat-mo-duoc/evidence/tcd-{may-soan,go-tay,loi,tra-lai}-{1440,390}.png. Đã chép sang evidence/E7u-step1.png (may-soan-1440), E7u-step2.png (may-soan-390), E7u-step3.png (go-tay-1440), E7u-step4.png (loi-1440), E7u-step5.png (tra-lai-1440). Ba frame 390 còn lại (go-tay, loi, tra-lai) đã mở đọc trực tiếp từ thư mục gốc. Số liệu network ghi ở evidence/E7u-network.txt.

- eval: E8
  run_id: n-a (không có kết quả)
  verifier: config:executors.test.tcd_san_thiet_ke
  reason: "design-gate --mode static trên man-doc.tsx và sua/page.tsx: tác tử chạy lệnh bị bỏ qua hoặc chết, không có kết quả, không được tính là đạt. Chạy lại lệnh này."

- eval: E9j
  judged_by: hội đồng ba lens (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: Ba lens đề xuất PASS trên tám ảnh (bốn trạng thái, mỗi trạng thái ở 390 và 1440); người chốt ở Cổng 2 bằng cách điền human_override.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-trang-chua-de-xuat-mo-duoc-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-29T10:19:58Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-chua-de-xuat-mo-duoc-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-29T10:19:58Z

- cmd: bun run lint:slop
  run_id: minted-trang-chua-de-xuat-mo-duoc-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-29T10:19:58Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-chua-de-xuat-mo-duoc-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-29T10:19:58Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt). Hai eval ui-check E6u và E7u có baseline n-a (không chạy được trên code cũ) nên chưa chứng minh được phân biệt; E8 chưa có kết quả.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, xác định).

## Judge panel (đề xuất, chờ người chốt)

E9j — đề xuất PASS. human_override để trống cho người ở Cổng 2.

- domain-correctness: PASS — Cả bốn trạng thái ở 390 và 1440 đều có tiêu đề nói rõ trang đang chờ gì, dòng phụ nói bước tiếp theo, và có nút cho việc bấm tiếp (Viết tay, Xem nguồn; trạng thái máy đang soạn chỉ có Xem nguồn vì chỉ cần chờ). Nhãn Nguồn, Máy đang soạn, Cần gõ tay, Chủ trang khớp từ điển CONTEXT.md, và không có ảnh nào cuộn ngang hay chữ đè nhau. Tên tệp dài và chuỗi lỗi không dấu cách ngắt dòng gọn ở 390.
- operational-feasibility: PASS — Ở cả 8 ảnh (4 trạng thái x 390/1440), khung thông báo nói rõ trang đang chờ gì và bấm gì tiếp. Máy đang soạn thì chờ, chỉ có Xem nguồn. Cần gõ tay, máy chưa soạn được và bản đầu bị trả lại đều có nút Viết tay. Nhãn khớp từ điển CONTEXT.md (Nguồn, Máy soạn, Cần gõ tay, Chủ trang), và không ảnh nào có chữ đè nhau hay bị cắt. Các nút hiện ra đúng theo trạng thái, thứ tự cột ở 390 hợp lý (khung, nút, rồi Chủ trang).
- spec-alignment: PASS — Ở cả bốn trạng thái, ở 1440 và 390, dòng đầu của khung thông báo nói rõ trang đang chờ gì và dòng sau nói bấm gì tiếp: «Máy đang soạn bản đầu» chờ Phan Lê Mạnh duyệt, «Cần gõ tay» có nút Viết tay, «Máy chưa soạn được» cho Viết tay hoặc Xem nguồn, «Bản đầu đã bị trả lại» có nút Viết tay. Nhãn khớp CONTEXT.md (Máy soạn, Cần gõ tay, Nguồn, Chủ trang, không dùng chữ bị cấm như bản nháp hay lỗi OCR), và trong 8 ảnh không thấy cuộn ngang hay chữ đè nhau, tên tệp dài chỉ xuống dòng ở 390. Hai điểm nhỏ không đổi được kết luận: dòng lý do ở trạng thái lỗi là chuỗi liền không dấu cách, và câu «Soạn lại ở tab Nguồn» trỏ tới một tab không hiện trong ảnh (chỉ có nút «Xem nguồn»).

## Iterations

Round 1: E8 không chạy được (tác tử design-gate bị bỏ qua hoặc chết) nên BLOCKED; không eval nào đỏ; cần chạy lại E8, không cần sửa mã.
