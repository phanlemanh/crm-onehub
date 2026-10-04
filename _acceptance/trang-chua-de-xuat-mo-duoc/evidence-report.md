---
schema_version: 2
feature_slug: trang-chua-de-xuat-mo-duoc
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4893629a5ff0068f0b3a0fc09523a037c7c953b7
human_signoff: Phan Le Manh 2026-09-29
---

# Evidence Report: trang-chua-de-xuat-mo-duoc

Vòng 2. Mọi eval máy, hai eval ui-check và bốn lệnh suite đều xanh. E9j là đề xuất của hội đồng, chờ người chốt ở Cổng 2.

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
| E8 | AC-8 | test | PASS |
| E9j | AC-9 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |

## Evidence

- eval: E1
  run_id: minted-trang-chua-de-xuat-mo-duoc-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_ma_tran
  verified_at: 2026-09-29T10:32:59Z
  output: |
    Lệnh: bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t ma-tran"
    Ca ma-tran chạy xong, lượt chạy kết thúc sạch.

- eval: E2
  run_id: minted-trang-chua-de-xuat-mo-duoc-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_diem_vao
  verified_at: 2026-09-29T10:32:59Z
  output: |
    Lệnh: bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t diem-vao"
    Ca diem-vao chạy xong; cơ sở dữ liệu dùng-một-lần được drop sau lượt.

- eval: E3
  run_id: minted-trang-chua-de-xuat-mo-duoc-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_khong_thay
  verified_at: 2026-09-29T10:32:59Z
  output: |
    Lệnh: bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t khong-thay"
    Ca khong-thay chạy xong; cơ sở dữ liệu dùng-một-lần được drop sau lượt.

- eval: E4
  run_id: minted-trang-chua-de-xuat-mo-duoc-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_dang_cho
  verified_at: 2026-09-29T10:32:59Z
  output: |
    Lệnh: bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t dang-cho"
    Ca dang-cho chạy xong; cơ sở dữ liệu dùng-một-lần được drop sau lượt.

- eval: E5
  run_id: minted-trang-chua-de-xuat-mo-duoc-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_man_doc
  verified_at: 2026-09-29T10:32:59Z
  output: |
    Lệnh: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-trang-cho.dom.tsx
    Ran 20 tests across 1 file.

- eval: E6
  run_id: minted-trang-chua-de-xuat-mo-duoc-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_viet_tay
  verified_at: 2026-09-29T10:32:59Z
  output: |
    Lệnh: bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t viet-tay"
    Ca viet-tay chạy xong, lượt chạy kết thúc sạch.

- eval: E6u
  run_id: minted-trang-chua-de-xuat-mo-duoc-E6u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcd_man_trang_cho
  verified_at: 2026-09-29T10:32:59Z
  screenshot: evidence/E6u-step1.png
  observed: |
    Da mo bang Read 3 frame vua luu. E6u-step1.png (tcd-go-tay-1440): man doc trang can go tay, tieu de 'Chính sách thử go-tay bf9e', khung thong bao 'Cần gõ tay. Nguồn là bản quét, máy không đọc được chữ. Gõ nội dung để gửi Phan Lê Mạnh duyệt.', ten tep nguon, hai nut 'Viết tay' va 'Xem nguồn', cot Chu trang Phan Lê Mạnh — khop Expected. E6u-step2.png (tcd-viet-tay-1440): man 'Sửa trang' (URL /sua), ten trang dien san, thanh cong cu trinh soan (H2 H3 B I danh sach, bang, link...), o noi dung rong chi hien placeholder 'Viết nội dung trang, hoặc dán từ Word.', nut 'Gửi duyệt' dang mo mau xanh mo, trang thai 'Chưa có thay đổi' — khop buoc 3 (trinh soan co mat, chu rong). E6u-step3.png (tcd-gui-ban-dau-1440): sau Gui duyet ve man doc /tai-lieu/<slug>, khung thong bao 'Trang này chưa hiện cho mọi người. Đang chờ Phan Lê Mạnh duyệt.', chip 'Có 1 bản chờ duyệt' va 'Xem bản chờ duyệt' — khop buoc 4 (chu dang cho duyet).
  network_observed: n-a (driver)
  output: |
    man-trang-cho.mjs chạy trong phiên đo riêng tự dựng và tự dọn; in 'buoc 3: dat', 'buoc 4: dat' và 'man-trang-cho: dat'. Hai chiều đo (--chieu-do=3 và --chieu-do=4) đều làm script hỏng đúng chỗ đã khai. Frame: evidence/E6u-step1.png, evidence/E6u-step2.png, evidence/E6u-step3.png. Số liệu network ghi ở evidence/E6u-network.txt.

- eval: E7
  run_id: minted-trang-chua-de-xuat-mo-duoc-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcd_ma_tran
  verified_at: 2026-09-29T10:32:59Z
  output: |
    Chung lượt chạy với E1: ca ma-tran chạy xong; ô (owner, máy đang soạn) và (owner, cần gõ tay) nằm trong bảng.

- eval: E7u
  run_id: minted-trang-chua-de-xuat-mo-duoc-E7u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcd_man_trang_cho
  verified_at: 2026-09-29T10:32:59Z
  screenshot: evidence/E7u-step1.png
  observed: |
    step1 (may-soan 1440): tieu de 'Chính sách thử may-soan 2852', khung thong bao co chu 'Máy đang soạn bản đầu.' + 'Bản soạn xong sẽ chờ Phan Lê Mạnh duyệt.' + 'Nguồn Chinh_sach_nhan_vien_2026_ban_cuoi_cung_da_ky_va_dong_dau_lan_ba.pdf.', nut 'Xem nguồn', cot 'Chủ trang Phan Lê Mạnh' ben phai; khong phai trang 404 — khop Expected. step2 (may-soan 390): cung khung, ten tep dai xuong dong gon trong khung, khong tran ngang, khong thanh cuon ngang. step3 (go-tay 390): khung 'Cần gõ tay. Nguồn là bản quét, máy không đọc được chữ. Gõ nội dung để gửi Phan Lê Mạnh duyệt.' + ten tep xuong dong, nut 'Viết tay' va 'Xem nguồn'; khong tran. step4 (loi 390): khung 'Máy chưa soạn được. Soạn lại ở tab Nguồn, hoặc viết tay để gửi...' + ten tep va ly do dai khong dau cach (Maysoanhetthoigian...vuottranbuoc) bi bẻ dong ngay trong khung, khong tran; nut Viết tay/Xem nguồn. step5 (tra-lai 390): khung 'Bản đầu đã bị trả lại. Viết bản mới để gửi Phan Lê Mạnh duyệt.', nut 'Viết tay'; khong tran. Ba anh 1440 (go-tay, loi, tra-lai): bo cuc hai cot, khung thong bao dung tieu de tuong ung (Cần gõ tay / Máy chưa soạn được / Bản đầu đã bị trả lại), ly do dai o loi nam gon 2 dong trong khung. Tat ca khop Expected.
  network_observed: n-a (driver)
  output: |
    man-trang-cho.mjs in 'buoc 1: dat' và bốn dòng 'buoc 2: dat' cho từng trang. Hai chiều đo (--chieu-do=1 và --chieu-do=2) đều làm script hỏng đúng chỗ đã khai. Frame: evidence/E7u-step1.png (may-soan 1440), evidence/E7u-step2.png (may-soan 390), evidence/E7u-step3.png (go-tay 390), evidence/E7u-step4.png (loi 390), evidence/E7u-step5.png (tra-lai 390), và thư mục evidence/E7u-1440/ gồm tcd-go-tay-1440.png, tcd-loi-1440.png, tcd-tra-lai-1440.png. Số liệu network ghi ở evidence/E7u-network.txt.

- eval: E8
  run_id: design-gate-429a2f5e12,design-gate-8bfd10fc44
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcd_san_thiet_ke
  verified_at: 2026-09-29T10:32:59Z
  output: |
    design-gate --mode static chạy trên man-doc.tsx và sua/page.tsx; cả hai lượt kết thúc sạch, không có P0.

- eval: E9j
  judged_by: hội đồng ba lens (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: Hội đồng đề xuất PASS trên tám ảnh (bốn trạng thái, mỗi trạng thái ở 390 và 1440); hai lens PASS, một lens chưa chắc về hai điểm nhỏ nêu ở mục Judge panel. Người chốt ở Cổng 2 bằng cách điền human_override.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-trang-chua-de-xuat-mo-duoc-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-29T10:32:59Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-chua-de-xuat-mo-duoc-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-29T10:32:59Z

- cmd: bun run lint:slop
  run_id: minted-trang-chua-de-xuat-mo-duoc-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-29T10:32:59Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-chua-de-xuat-mo-duoc-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-29T10:32:59Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature deu red trên baseline (có phân biệt). Ba eval E6u, E7u và E8 có baseline n-a (không chạy được trên code cũ) nên chưa chứng minh được phân biệt bằng A/B; hai eval ui-check mỗi cái đã có chiều đo làm script hỏng đúng chỗ khai.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, xác định).

## Judge panel (đề xuất, chờ người chốt)

E9j — đề xuất PASS. human_override để trống cho người ở Cổng 2. Không lens nào bị om hay viết lại; lens chưa chắc hiện đầy đủ bên dưới.

- domain-correctness: PASS — Cả bốn trạng thái ở 390 và 1440 đều có tiêu đề nói thẳng trang đang chờ gì (Máy đang soạn bản đầu, Cần gõ tay, Máy chưa soạn được, Bản đầu đã bị trả lại). Mỗi trạng thái có một dòng hướng dẫn kèm nút Viết tay hoặc Xem nguồn, và nhãn Nguồn, Máy soạn, Cần gõ tay, Chủ trang khớp từ điển CONTEXT.md. Không thấy chữ đè lên nhau hay bị cắt; tên tệp dài và chuỗi lý do lỗi ở khổ 390 tự ngắt dòng trong khung. Hai điểm nhỏ: chuỗi lý do lỗi không dấu, không cách chữ, nhiều khả năng là dữ liệu thử; và lời hướng dẫn nhắc tab Nguồn trong khi màn chỉ có nút Xem nguồn.
- operational-feasibility: UNCERTAIN — Ở cả 8 ảnh (4 trạng thái × 390/1440) không có chữ cuộn ngang hay chồng lên nhau. Nhãn khớp từ điển (Máy đang soạn, Cần gõ tay, Máy chưa soạn được, Chủ trang, Nguồn), và hai trạng thái đầu cùng trạng thái trả lại nói rõ đang chờ gì. Riêng trạng thái «Máy chưa soạn được» có hai chỗ chưa chắc. Dòng chỉ dẫn «Soạn lại ở tab Nguồn» trỏ tới một tab không hiện trong ảnh, chỉ có nút «Xem nguồn». Lý do lỗi hiện thành một chuỗi liền không dấu, không khoảng trắng, dính ngay sau tên tệp, nên không rõ đó là lý do thật hay chuỗi thử.
  - Bằng chứng còn thiếu 1: Ảnh chụp màn nơi nút «Xem nguồn» dẫn tới ở trạng thái «Máy chưa soạn được», cho thấy có tab hay nút tên «Nguồn» và có chỗ «Soạn lại», chụp ở 390 và 1440. Chụp từ eval ui-check, lưu ở _acceptance/trang-chua-de-xuat-mo-duoc/evidence/.
  - Bằng chứng còn thiếu 2: Ảnh trạng thái «Máy chưa soạn được» (tcd-loi-390.png và tcd-loi-1440.png) với lý do lỗi thật như máy soạn ghi ra: câu tiếng Việt có dấu và khoảng trắng, đủ dài để xuống dòng. Kèm dòng in của fixture hoặc lệnh dựng trạng thái cho biết chuỗi liền không dấu hiện nay có phải dữ liệu thử cố ý (đo tràn) hay là lý do thật.
  - Bằng chứng còn thiếu 3: Số đo scrollWidth so với clientWidth của tài liệu ở 390 và 1440 cho cả 4 trạng thái, ghi trong _acceptance/trang-chua-de-xuat-mo-duoc/evidence/, để xác nhận không có cuộn ngang, vì ảnh tĩnh không cho thấy thanh cuộn.
- spec-alignment: PASS — Trong cả 8 ảnh (4 trạng thái, khổ 390 và 1440), dòng đầu của hộp thông báo nói rõ trang đang chờ gì: "Máy đang soạn bản đầu", "Cần gõ tay", "Máy chưa soạn được", "Bản đầu đã bị trả lại". Dòng dưới nói bấm gì tiếp (nút "Viết tay", "Xem nguồn", hoặc chờ Phan Lê Mạnh duyệt). Nhãn khớp từ điển CONTEXT.md (Máy soạn, Cần gõ tay, Nguồn, Chủ trang), không thấy cuộn ngang hay chữ đè nhau; chuỗi lý do dài không có dấu cách ở ảnh lỗi vẫn xuống dòng gọn trong hộp. Có hai chỗ lệch nhỏ không đổi được kết luận. Ảnh lỗi nhắc "tab Nguồn" trong khi ảnh không thấy tab nào. Ảnh không dùng nguyên chữ "Bản đề xuất" (dùng "Bản soạn", "Bản đầu").

## Iterations

Round 1: E8 không chạy được (tác tử design-gate bị bỏ qua hoặc chết) nên BLOCKED; không eval nào đỏ; cần chạy lại E8, không cần sửa mã.
Round 2: chạy lại toàn bộ; E1 đến E8 và bốn lệnh suite đều xanh, E8 chạy được, hội đồng đề xuất PASS cho E9j chờ người chốt.

### Re-pin lần 1 — 2026-09-29, do hoá cũ do gộp onehub (#207) sau chữ ký
run_id: repin-20260929T110436Z-70395
sha: 7f2f7fdb52a33ae83b74c94ee52d53a8cbececc3 · suites: 4 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E6u, E7u, E9j (E9j không khai paths) · AC không có chốt máy: AC-9

### Re-pin lần 2 — 2026-10-04, do khai paths lô 2: chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T075112Z-36317
sha: 11bd93cf9f3488a2ed6df5c432a362feff41a428 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E6u, E7u, E9j · diff chạm vật đo ngoài làn máy: E6u, E7u, E9j — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9

### Re-pin lần 3 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T141023Z-83923
sha: 4893629a5ff0068f0b3a0fc09523a037c7c953b7 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E6u, E7u, E9j · diff chạm vật đo ngoài làn máy: E9j — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9
