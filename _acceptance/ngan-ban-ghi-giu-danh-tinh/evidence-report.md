---
schema_version: 2
feature_slug: ngan-ban-ghi-giu-danh-tinh
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 85f354e1b780ab9e22db19032c1073e642d9e1a5
human_signoff:
---

# Evidence Report: ngan-ban-ghi-giu-danh-tinh

Round 3. Cả 15 eval của tính năng đều đạt (E1–E15, tất cả carry-forward vì delta không chạm paths của eval), và cả bảy lệnh suite không gắn eval đều xanh, kể cả `bun run test -- --filter=api` đã đỏ ở round 2. Không có judgment item nào chờ người và không có eval ngẫu nhiên.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-6 | test | PASS |
| E4 | AC-7 | test | PASS |
| E5 | AC-1 | script | PASS |
| E6 | AC-3 | script | PASS |
| E7 | AC-4 | script | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-3 | ui-check | PASS |
| E10 | AC-4 | ui-check | PASS |
| E11 | AC-5 | ui-check | PASS |
| E12 | AC-3 | script | PASS |
| E13 | AC-8 | test | PASS |
| E14 | AC-8 | script | PASS |
| E15 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gdt_danh_tinh
  verified_at: 2026-10-19T15:42:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gdt_tai_xong
  verified_at: 2026-10-19T15:42:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gdt_nap_vai
  verified_at: 2026-10-19T15:42:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gdt_khong_de
  verified_at: 2026-10-19T15:42:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_chieu_do
  verified_at: 2026-10-19T16:27:52Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T16:27:52Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T16:27:52Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T16:27:52Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T16:27:52Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E9-step1.png
  observed: |
    E9-step1.png (gdt-dong-1440.png, 1440x900): trang Thoả thuận, ô tìm "Wise — expansion", bảng có một hàng "Wise — expansion / Wise / Qualified to buy / 8.661,42 £ / Ada Okafor", rõ ràng ở phía sau. Ngăn bản ghi hiện một phần ở mép phải, lệch sang phải khỏi vị trí cuối: cạnh trái ngăn nằm khoảng x=1216, nội dung bị cắt ở mép phải màn hình ("Wise — expansion", "Wise", "Giá trị 8.661,42 £", tab Tổng quan, "Demo booked", Chi tiết "Wise — expans…"). Chữ «Wise» đọc được. Khớp expected: ngăn đang trượt ra, lệch sang phải, danh sách phía sau thấy rõ.
    E9-step2.png (gdt-dong-390.png, 390x844): trang Thoả thuận bản điện thoại, danh sách phía sau thấy rõ (tìm "Wise — expansion", hàng "Wise — expansi… / Wise / Qualified to buy"). Ngăn hiện một phần ở đáy, lệch xuống dưới: chỉ thấy phần đầu ngăn từ khoảng y=795, có thanh kéo, logo Wise, chữ "Wise —", nút trạng thái "Qual…" và nút đóng X. Chữ «Wise» đọc được. Khớp expected: ngăn trượt xuống, lệch xuống dưới.
    Đối chiếu gdt-man.log: "o 1440 dong: dat" và "o 390 dong: dat" khớp với hai ảnh. Không có mâu thuẫn với expected.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T16:27:52Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E10-step1.png
  observed: |
    gdt-mo-1440.png (1440x900): trang Thoa thuan toi mau di (dim) o phia sau, thay tieu de "Thoa thuan", o tim "Wise — expansion", hang bang "Wise — expansion / Wise / Qualified to b..." bi ngan che mot phan. Ngan ban ghi "Wise — expansion" chiem tu x~680 den het man hinh o ben phai; noi dung ngan bi cat o mep phai (cot thu tu cua dai so lieu chi hien "Phu..." va o chon trang thai bi cat, cot "Gia tri/Ngay du kien chot/O giai doan" chi thay 3 cot) cho thay ngan dang truot vao tu ben phai va chua toi vi tri cuoi (lech sang phai). Danh sach van thay ro phia sau. Dung expected.
    gdt-mo-390.png (390x844): trang Thoa thuan o phia sau toi di (tieu de, nut "Thoa thuan moi", o tim Wise — expansion van thay o phan tren). Ngan dang ben duoi bat dau tu y~220 voi tay nam keo, tieu de "Wise — expansion", nut trang thai, cac the Gia tri/Ngay/O giai doan/Phu trach, tab Tong quan/Ca nhan 2/Hoat dong/Kara, muc Chi tiet; noi dung bi cat o mep duoi man hinh ("Phu trach" bi cat) cho thay ngan dang truot len tu duoi va chua dung vi tri cuoi (lech xuong). Danh sach van thay phia sau. Dung expected.
    Doi chieu gdt-man.log: "o 1440 mo: dat" va "o 390 mo: dat" deu co. Khong mau thuan voi expected.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T16:27:52Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E11-step1.png
  observed: |
    gdt-mo-lai-1440.png (frame chinh, da Read): man Thoa thuan o 1440x900, nen toi mo di, bang chi con dong «Wise — expansion». Ngan chi tiet dang o GIUA DUONG khi quay lai: mep trai ngan ~x=898, bi cat o mep phai (cot «O giai...», «Gia tri» bi cat). Tieu de «Wise — expansion», cong ty «Wise», gia tri 8.861,42 £, ngay du kien chot 23 thg 11, 2026, tab Tong quan/Ca nhan 2/Hoat dong/Kara, giai doan «Demo booked/Qualified to buy/Decision maker in», Chi tiet (Ten Wise — expansion, GBP · Pound Sterling, Ada Okafor), Mo ta deu doc duoc. Doi chieu: gdt-mo-1440.png ngan da dung yen o mep trai ~x=680 (day du cot Gia tri/Quy doi USD/Cong ty); gdt-dong-1440.png ngan dang truot ra voi mep trai ~x=1221. Frame mo lai (x~898) nam giua vi tri dong yen (680) va diem bat dau mo moi tu mep (1440) nen dung la ngan quay lai giua chung, khong phai mot lan mo moi tu mep; khop Expected. gdt-man.log: 6 dong «dat» gom «o 1440 mo lai: dat» va «o 390 mo lai: dat».
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man_chieu_do
  verified_at: 2026-10-19T16:27:52Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vs_nap_san_dom
  verified_at: 2026-10-19T15:42:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_chieu_do_nap_san
  verified_at: 2026-10-19T15:42:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_hydrat_record
  verified_at: 2026-10-19T15:42:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

Bảy lệnh suite không gắn eval đều chạy lại ở round 3 và đều xanh, kể cả `bun run test -- --filter=api` (đỏ ở round 2). Mốc giờ của lượt chạy round 3 không có trong dữ liệu máy trả về; cột verified_at dưới đây ghi ngày chạy (2026-10-20) với giờ 00:00:00Z làm mốc đệm, giờ thật nằm ở run-log.jsonl.

- cmd: bun run test -- --filter=api
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-19T17:01:02Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-19T17:01:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-19T17:01:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-19T17:01:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-19T17:01:02Z

- cmd: bun run lint:slop
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-19T17:01:02Z

- cmd: bunx turbo run build --force
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-19T17:01:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

none — khong eval nao duoc liet ke la khong-phan-biet; cac lenh suite xanh o ca hai phia la regression-guard binh thuong

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: BLOCKED — E5 đỏ giả khi phép đo màn chạy song song, lệnh suite api đỏ. Returned to implementation (răng màn đọc slug workspace từ DB phiên đo).
Round 2: REJECT — E1–E15 đều đạt (E1–E4, E13–E15 carry-forward từ round 1), nhưng lệnh suite `bun run test -- --filter=api` không gắn eval đã đỏ với 10 bài trượt và 1 lỗi. Returned to implementation.
Round 3: PASS — E1–E15 đều đạt (carry-forward từ round 1 và round 2, delta không chạm paths của eval) và cả bảy lệnh suite xanh, kể cả suite api (bập bênh do tải ở round 2, xanh lại ở round 3).

### Re-pin lần 1 — 2026-10-19, do gộp onehub (#489 VK1, #494 lộ trình) sau S4 lượt 3
run_id: repin-20261019T184126Z-34217
sha: 5b300090f1b150768f9d9a9e8037ab981447bc38 · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E9, E10, E11 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-19, do gộp onehub (trang Lộ trình) trước chữ ký Cổng Bằng chứng
run_id: repin-20261019T213740Z-87652
sha: 85f354e1b780ab9e22db19032c1073e642d9e1a5 · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E9, E10, E11 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
