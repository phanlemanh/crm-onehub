---
schema_version: 2
feature_slug: gioi-han-duyet-cay-okr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: acf6075c3693321e23f0a28648a93996ab43f58e
human_signoff: Manh Phan 2026-09-29
---

# Evidence Report: gioi-han-duyet-cay-okr

Round 3. Nội dung thay toàn bộ round cũ; lịch sử round nằm ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-11 | script | PASS |
| E15 | AC-12 | ui-check | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-12 | test | PASS |
| E18 | AC-13 | ui-check | PASS |
| E19 | AC-13 | script | PASS |
| E20 | AC-14 | test | PASS |
| E21 | AC-14 | script | PASS |
| E22 | AC-14 | script | PASS |
| E23 | AC-15 | script | PASS |
| E24 | AC-15 | script | PASS |
| E25 | AC-15 | judgment | UNCERTAIN |

Lệnh fail không gắn eval nào: không có.

Round này chạy lại E15 đến E19 (cụm phép đo màn, cùng bộ kiểm DOM) và bốn lệnh suite. Lần chạy chung của E16 và E19 đã xanh, và hai eval ui-check E15, E18 đã được mở từng ảnh đối chiếu; mâu thuẫn ở round 2 giữa lần chạy script và tác tử ui-check không còn. E1 đến E14 và E20 đến E24 mang từ round trước (delta không chạm paths của chúng). E25 vẫn chờ người: hội đồng không có thân diff để đối chiếu.

## Evidence

- eval: E1
  run_id: minted-gioi-han-duyet-cay-okr-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_ghi
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-gioi-han-duyet-cay-okr-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_ma_tran
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-gioi-han-duyet-cay-okr-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_bon_duong
  verified_at: 2026-09-29T11:38:27Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-gioi-han-duyet-cay-okr-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_so_gop
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-gioi-han-duyet-cay-okr-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_ghi_ke
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-gioi-han-duyet-cay-okr-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_nhac
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-gioi-han-duyet-cay-okr-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_duyet_cong_bo
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-gioi-han-duyet-cay-okr-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_duyet_vong
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-gioi-han-duyet-cay-okr-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_duyet_nguoi
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-gioi-han-duyet-cay-okr-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_duyet_nhac
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-gioi-han-duyet-cay-okr-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_luu_tru_chan
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-gioi-han-duyet-cay-okr-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_chuyen_don_vi
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-gioi-han-duyet-cay-okr-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_mo_coi
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-gioi-han-duyet-cay-okr-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_mo_coi_sql
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: E15-verifier-doc-lap-2026-09-29T13:08Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T13:07:24Z
  screenshot: evidence/E15-step3-gioi-han.png
  observed: |
    Đã mở từng frame bằng Read. Bước 3 (1440): khung «Giữ chân đối tác chiến lược miền Bắc», chip Cam kết, Nháp và chip khoá «Giới hạn», nút Gửi duyệt, toast «Đã lưu mức hiển thị». Bước 4: hộp «Mức hiển thị» chọn «Giới hạn», dòng đỏ «Mục tiêu còn 1 căn chỉnh…», nút Lưu khoá. Bước 5: chip Chờ duyệt + Giới hạn, dải «Chờ Trần Quốc Bảo duyệt» với nút Rút lại, không còn Gửi duyệt và Thêm KR.
    Bước 6 (người duyệt): dải «Nguyễn Thị Lan gửi duyệt» với «Duyệt và công bố» và «Trả lại…», không có nút sửa. Bước 7 (bị trả lại): chip Nháp, dải viền cam «Trần Quốc Bảo trả lại» kèm lý do, nút Gửi duyệt, sửa mở lại. Bước 8: người ngoài chỉ thấy «Không tìm thấy mục tiêu này»; trang theo đơn vị Kinh doanh miền Bắc «2 mục tiêu», không có dòng G.
    Bước 9 (390): bottom sheet tiêu đề xuống dòng, nút Rút lại / Duyệt và công bố / Trả lại xếp dọc, không tràn ngang; trạng thái lỗi «Không tải được mục tiêu» kèm «Thử lại». Không frame nào mâu thuẫn Expected; danh sách «Chờ bạn duyệt» ở Tổng quan và thao tác hộp «Trả lại…» 5 ký tự không nằm trong frame, được kiểm bằng 59 khẳng định của script (0 hỏng), không bằng mắt.
  network_observed: clean
  output: |
    Chạy qua tien-de.mjs: man-gioi-han-duyet.mjs, chiều đỏ (--chieu-do) đỏ đúng chỗ ghim và in tiêu đề G tìm thấy trên trang ở bước buoc-khong-thay (đúng kỳ vọng), bản sao worktree chiều đỏ đã dọn.
    Frame lưu ở evidence/: E15-step3-gioi-han, E15-step4-con-can-chinh, E15-step5-cho-duyet, E15-step6-nguoi-duyet, E15-step7-bi-tra-lai, E15-step8-khong-thay, E15-step8b-theo-don-vi, E15-step9-cho-duyet-390, E15-step9-nguoi-duyet-390, E15-step9-trang-thai-loi (.png); network: E15-network.txt.
    Network chỉ có hai lỗi app-scope do chính bước yêu cầu tạo ra: POST okr.datHienThi ở bước 4 (lỗi «còn 1 căn chỉnh» là kết quả đúng) và GET okr.objective ở bước 9 (do chặn truy vấn có chủ đích, app hiện Empty lỗi + Thử lại đúng kỳ vọng). Không lỗi kết nối ngoài ý muốn.

- eval: E16
  run_id: minted-gioi-han-duyet-cay-okr-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T13:07:24Z
  output: |
    Lệnh chung với E19: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gioi-han-duyet-cay-okr/rang/man-gioi-han-duyet.mjs"
    1 lần chạy, 1 lần đạt, không phương sai.
    phien-do: xong — mã 0

- eval: E17
  run_id: minted-gioi-han-duyet-cay-okr-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_khung_dom
  verified_at: 2026-09-29T13:07:24Z
  output: |
    Lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-gioi-han-duyet.dom.tsx
    Ran 16 tests across 1 file. [1.57s]

- eval: E18
  run_id: minted-gioi-han-duyet-cay-okr-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T13:07:24Z
  screenshot: evidence/E18-step1.png
  observed: |
    Đã mở từng khung bằng Read. Bước 1 (1440): trang Chương trình OKR của quản trị (avatar LH), dòng «Công bố cần duyệt» với công tắc đang bật, toast «Đã lưu cấu hình chương trình.». Bước 2: thành viên thường (avatar VĐ) thấy «Chỉ quản trị đổi được cấu hình chương trình.», các ô nhập và nút đều khoá. Bước 3: hộp «Lưu trữ «Kinh doanh miền Bắc»?» có cảnh báo cam «Chưa lưu trữ được — Phòng ban còn 4 mục tiêu ở kỳ đang mở», nút «Chuyển OKR…» sáng, «Lưu trữ» khoá.
    Bước 4: trang Tổ chức, dòng «OKR: 1 mục tiêu ở kỳ đang mở» kèm «Chuyển OKR…», toast «Đã chuyển 3 mục tiêu sang Kinh doanh miền Nam.» (kèm cảnh báo vượt trần 6/5). Bước 5: khối «OKR mồ côi» rỗng «Không có OKR mồ côi», sau khi gỡ người phụ trách KR có 1 thẻ «Xuất kho nhanh như đối thủ tốt nhất» nhãn «Người phụ trách KR đã rời» và nút «Mở mục tiêu». Bước 6 (390): bố cục xếp dọc, không tràn ngang, thẻ OKR và toast hiện đầy đủ. Không khung nào mâu thuẫn Expected.
  network_observed: clean
  output: |
    Chiều đỏ (--chieu-do --chi E18, bản sao xác nhận lưu trữ đổi điều kiện okrMo): script báo hỏng đúng ở buoc-luu-tru-chan với nút lưu trữ bật, tổng kết «DO DUNG GHIM» (đạt, đúng kỳ vọng); bản sao worktree tạm đã dọn.
    Khung lưu ở evidence/: E18-step1, E18-step2, E18-step3, E18-step4, E18-step5a-rong, E18-step5b, E18-step6a-chuyen-390, E18-step6b-mo-coi-390 (.png); network: E18-network.txt (0 dòng lỗi). Không lỗi console. Một verifier khác (E15) chạy song song cùng cây nên phiên đo chờ nhau qua hàng đợi, không ảnh hưởng kết quả.

- eval: E19
  run_id: minted-gioi-han-duyet-cay-okr-E19-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T13:07:24Z
  output: |
    Cùng lần chạy chung với E16: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gioi-han-duyet-cay-okr/rang/man-gioi-han-duyet.mjs"
    1 lần chạy, 1 lần đạt, không phương sai.
    phien-do: xong — mã 0

- eval: E20
  run_id: minted-gioi-han-duyet-cay-okr-E20-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_bo_mau
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E21
  run_id: minted-gioi-han-duyet-cay-okr-E21-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_ty_le
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E22
  run_id: minted-gioi-han-duyet-cay-okr-E22-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_migration_chi_them
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E23
  run_id: minted-gioi-han-duyet-cay-okr-E23-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_soi_xem
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E24
  run_id: minted-gioi-han-duyet-cay-okr-E24-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_san_thiet_ke
  verified_at: 2026-09-29T11:38:27Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E25
  judged_by: judge-subagent panel (fresh context, ba lăng kính)
  verdict: UNCERTAIN
  rationale: Cả ba giám khảo đều không xác nhận được vì tệp diff-luot.txt chỉ có `--stat` và danh sách tệp, không có thân diff. Tên tệp và mô tả PR khớp hình dạng cần có (hàm xem thuần và điều kiện xem dùng chung, người duyệt suy ra không thêm bảng, đếm OKR cho cây tổ chức, migration chỉ thêm bảng người xem), nhưng nội dung bốn mục CONTEXT.md, độ đủ của docs/api.md, việc to-chuc không nhập okr, và việc dải chờ duyệt cùng nhãn giới hạn không lộ tên mục tiêu đều chỉ có lời khẳng định, không có chữ để đối chiếu. Lăng kính spec-alignment còn nêu thêm một điểm cần người phân định: câu hỏi nói API và nhắc buổi sáng dựng ngữ cảnh từ một chỗ, còn spec mô tả hai đường dựng khớp nhau bằng một bài so tập trưởng.
  votes:
    - domain-correctness: UNCERTAIN — chỉ có --stat, mọi khẳng định về nội dung (điều kiện xem cho mọi truy vấn, to-chuc không nhập okr, bốn mục CONTEXT.md, docs/api.md) không có nội dung để đối chiếu.
    - operational-feasibility: UNCERTAIN — danh sách tệp khớp kiến trúc khai, nhưng không kiểm được ngữ cảnh xem dựng từ đâu, to-chuc có nhập okr không, màn có dùng packages/ui và không lộ tên mục tiêu không.
    - spec-alignment: UNCERTAIN — không thấy thân diff cho ba vế; và hai đường dựng ngữ cảnh (API từ OkrAccessService.quyen, nhắc/tác tử từ nguCanhXemOkr) có thể lệch hoặc không lệch tuỳ AC-15 đòi «một chỗ» hay chỉ đòi dùng chung hàm xem.
  required_evidence:
    - Thân diff CONTEXT.md (`git diff origin/onehub...HEAD -- CONTEXT.md`, +46 dòng) cho thấy bốn mục Mức hiển thị, Chờ duyệt / Người duyệt, Chuyển OKR, OKR mồ côi, mỗi mục có nghĩa, Avoid, Vì sao.
    - Thân diff docs/api.md (`git diff origin/onehub...HEAD -- docs/api.md`, +121 dòng) cho thấy mục OKR và mục cây tổ chức nói đủ luật xem, bước duyệt, chặn lưu trữ và xoá hẳn đơn vị còn OKR, chuyển OKR, OKR mồ côi.
    - Thân diff hoặc `grep -rn "okr" apps/api/src/to-chuc` cho thấy to-chuc chỉ nhập demOkrCuaDonVi / demOkrTheoDonVi từ packages/db, không nhập module apps/api/src/okr.
    - Thân diff okr-access.service.ts, packages/db/src/okr-nhac.ts, apps/agent/agent/lib/tin-nhac.ts (hoặc kết quả `soi-ma.mjs --ca xem`) cho thấy API và nhắc buổi sáng dùng cùng xemDuocMucTieu và dieuKienXemMucTieu, kèm văn bản chốt hai bộ dựng ngữ cảnh cộng bài so tập trưởng là đủ cho AC-15.
    - Thân diff objective-duyet.tsx, objective-hien-thi.tsx, viec-cua-toi.tsx, okr-mo-coi.tsx (hoặc ảnh evidence/man/buoc-khong-thay.png, buoc-khong-thay-theo-don-vi.png) cho thấy chỉ import từ @crm/ui, không dấu hiệu vẽ tay, và dải chờ duyệt cùng nhãn giới hạn không đưa tên mục tiêu cho người không xem được.
  human_override: PASS — Manh Phan 2026-09-29

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-29T13:07:24Z

- cmd: bunx turbo run lint --force
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-29T13:07:24Z

- cmd: bun run lint:slop
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-29T13:07:24Z

- cmd: bunx turbo run build --force
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-29T13:07:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Field baseline cua tung eval ghi n-a.

Eval không phân biệt (xanh cả trên diffBase lẫn HEAD): không có. Các lệnh suite xanh cả hai phía là lưới hồi quy bình thường, không liệt kê.

## Variance

none — mọi eval chạy một lần, không eval nào có pass_rate lẫn lộn hay chập chờn.

## Iterations

Round 1: bộ kiểm app đỏ ở khoá chữ chết (một lỗi trong hợp đồng). Trả về sửa.
Round 2: E16, E19 đỏ — thước màn chập chờn ở bước chọn người xem khi máy chịu tải. Trả về sửa.
Round 3: mọi eval máy xanh (E16, E19 xanh lại, E15, E18 mở lại từng ảnh); còn E25 chờ người vì hội đồng chỉ có --stat của diff. Verdict PENDING-JUDGMENT, chuyển Cổng Bằng chứng.

### Re-pin lần 1 — 2026-09-29, do ghim lại sau khi gộp onehub tới #212
run_id: repin-20260929T233409Z-97700
sha: 8d8725346789a1736b8e93aecd051c28535aa2ce · suites: 4 lệnh exit 0 · evals: 22/22 eval máy đạt kỳ vọng · ngoài làn máy: E15 (E15 không khai paths), E18 (E18 không khai paths), E25 (E25 không khai paths)

### Re-pin lần 2 — 2026-10-01, do PR 226 gom #229: thuoc gioi-han-duyet-cay-okr sua sau cac PR gop sau 29/09
run_id: repin-20261001T110529Z-90087
sha: ae5cc42cf61cac0bc654d60077bf97c96bf285ec · suites: 4 lệnh exit 0 · evals: 22/22 eval máy đạt kỳ vọng · ngoài làn máy: E15 (E15 không khai paths), E18 (E18 không khai paths), E25 (E25 không khai paths)

### Re-pin lần 3 — 2026-10-04, do sửa thước đỏ lô 2-4 (b2)
run_id: repin-20261004T151626Z-30567
sha: acf6075c3693321e23f0a28648a93996ab43f58e · suites: 7 lệnh exit 0 · evals: 22/22 eval máy đạt kỳ vọng · ngoài làn máy: E15, E18, E25 · diff chạm vật đo ngoài làn máy: E15, E18 — chưa chứng lại, đi vòng S4 delta
