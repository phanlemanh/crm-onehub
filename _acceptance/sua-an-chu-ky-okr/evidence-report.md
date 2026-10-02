---
schema_version: 2
feature_slug: sua-an-chu-ky-okr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 68478e877021999d6c540e4dd4a93e6d57549890
human_signoff: Manh Phan 2026-09-30
---

# Evidence Report: sua-an-chu-ky-okr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-11 | ui-check | PASS |
| E15 | AC-11 | script | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-12 | judgment | UNCERTAIN |
| E18 | AC-13 | script | PASS |
| E19 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-an-chu-ky-okr-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_viec
  verified_at: 2026-09-30T11:04:48Z
  output: |
    cd packages/validation && bun test test/okr-chu-ky-viec.spec.ts
    Ran 45 tests across 1 file. [20.00ms]

- eval: E2
  run_id: minted-sua-an-chu-ky-okr-E2-r1
  exit_code: 0
  verifier: config:executors.test.sac_cycles
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-sua-an-chu-ky-okr-E3-r1
  exit_code: 0
  verifier: config:executors.test.sac_sua_moi_o
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-sua-an-chu-ky-okr-E4-r1
  exit_code: 0
  verifier: config:executors.test.sac_sua_ten
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-sua-an-chu-ky-okr-E5-r1
  exit_code: 0
  verifier: config:executors.test.sac_go
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-sua-an-chu-ky-okr-E6-r1
  exit_code: 0
  verifier: config:executors.test.sac_an_hien
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-sua-an-chu-ky-okr-E7-r1
  exit_code: 0
  verifier: config:executors.test.sac_pham_vi
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-sua-an-chu-ky-okr-E8-r1
  exit_code: 0
  verifier: config:executors.test.sac_ky_mac_dinh
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-sua-an-chu-ky-okr-E9-r1
  exit_code: 0
  verifier: config:executors.test.sac_an_vang_api
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-sua-an-chu-ky-okr-E10-r1
  exit_code: 0
  verifier: config:executors.test.sac_an_vang_nen
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-sua-an-chu-ky-okr-E11-r1
  exit_code: 0
  verifier: config:executors.script.sac_soi_ky_con_hien
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-sua-an-chu-ky-okr-E12-r1
  exit_code: 0
  verifier: config:executors.test.sac_giai_ky
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-sua-an-chu-ky-okr-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_bang_dom
  verified_at: 2026-09-30T11:04:48Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-sua-an-chu-ky.dom.tsx
    Ran 12 tests across 1 file. [2.24s]

- eval: E14
  run_id: minted-sua-an-chu-ky-okr-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.sac_man_chrome
  verified_at: 2026-09-30T11:04:48Z
  screenshot: evidence/E14-step1.png
  observed: |
    step1 (menu hang Năm 2027, 1440): menu hien «Sửa chu kỳ», «Ẩn chu kỳ» (mo, kem giai thich «Còn 2 quý đang hiện — ẩn hoặc gỡ quý trước»), «Chuyển sang Đang chạy»; bang co 6 hang, hang cuoi «Quý 3/2025» mo va nhan «Đã ẩn». step2 (Quý 2/2027 trong): «Sửa chu kỳ», «Gỡ chu kỳ», «Chuyển sang Đang chạy». step3 (Quý 1/2027 dang chay, co muc tieu): «Sửa chu kỳ», «Ẩn chu kỳ», «Mở rà giữa kỳ», «Sang chấm điểm», khong co Gỡ. step4 (Năm 2025): «Sửa chu kỳ», «Ẩn chu kỳ» mo kem giai thich «Còn 1 quý đang hiện…», «Chuyển sang Đang chạy». step5 (Quý 4/2025 da dong): «Gỡ chu kỳ», «Mở lại kỳ». step6 (Quý 3/2025 da an): chi «Hiện lại»; hang mo, pha «Đã ẩn», dong «Ẩn 30 thg 9, 2026 lúc pha Lập kế hoạch · Mở trùng với quý đã có». step7 (390): menu Quý 1/2027 hien 4 muc, bang cuon ngang trong khung, khong tran trang. step8 (sheet sua T, khi da doi): «Sửa Quý 2/2027 dời lịch so01xvp», mo ta «chưa có dữ liệu — sửa được mọi ô trừ loại và năm», Loại/Thuộc năm tat, Ten «Quý 2/2027 dời lịch so01xvp», Ngày cuối 15 thg 6, 2027, Ngày cập nhật tuần «Thứ Tư», nut Lưu bat (xanh). step9: sau Luu bang hien «Quý 2/2027 dời lịch so01xvp», den 15 thg 6, 2027; toast xanh «Đã sửa Quý 2/2027 dời lịch so01xvp.». step10 (sheet sua D 1440): mo ta «đã có dữ liệu — chỉ sửa được tên…», chi o Ten bat (vien xanh, chu boi chon), Ngày đầu/cuối, Khoảng nghỉ, Ngày cập nhật tuần deu mo tat, dong giai thich «Khoá vì chu kỳ đã có dữ liệu. Sai ngày thì ẩn chu kỳ này rồi mở chu kỳ đúng.», Lưu tat truoc khi doi. step11 (390): cung noi dung, nut Lưu/Huỷ xep doc, khong tran ngang. step12: hop «Gỡ Quý 2/2027 dời lịch so01xvp?» mo ta «chưa có mục tiêu, lần hỏi ý hay quý nào… vết tạo và gỡ vẫn còn trong sổ vết», nut Huỷ (focus) + nut «Gỡ chu kỳ» do (tong huy). step13: hop «Ẩn Quý 1/2027 đối tác so01xvp?» o «Lý do ẩn» trong, goi y «Từ 10 đến 500 ký tự…», nut «Ẩn chu kỳ» tat (mo). step14: sau xac nhan bang con 5 hang, D xuong cuoi «Quý 1/2027 đối tác so01xvp» nhan «Đã ẩn» kem ly do «Mở nhầm quý đối tác.» (hien trong dong phu), toast «Đã ẩn Quý 1/2027 đối tác so01xvp.», hang T da bien mat (buoc go). step15 (OKR theo đơn vị): o chon ky mo, danh sach chi Năm 2025, Quý 4/2025 (hien tai, da dong, tick), Năm 2027 — khong co Quý 1/2027 (D) va khong co Quý 3/2025 (A). step16: sau «Hiện lại» toast «Đã hiện lại Quý 1/2027 đối tác so01xvp.», D «Đang chạy» quay lai vi tri tren, cuoi bang chi con A «Đã ẩn». step17 (thanh vien LV): duoi tieu de co dong «Chỉ quản trị đổi được cấu hình chương trình.», nut «Mở chu kỳ» mo, cac nut «…» mo (tat), o cau hinh mo. Chu tren man khop tep chu (vi). Khong mau thuan Expected.
  network_observed: clean
  output: |
    Network: thuoc nghe pageerror/console.error/requestfailed/response>=400 tren moi trang; tep man-sua-an-network.txt 0 byte -> khong loi; khong 4xx/5xx.
    Khong chay --chieu-do (chieu do do la buoc phu, eval nay chay tron E14 dung).
    Luu y nho khong lam do: E14-step11 (390, sheet sua chi ten) dong «Khoá vì chu kỳ…» bi footer che mot phan, nhung noi dung cuon duoc; scrollWidth van dat.

- eval: E15
  run_id: minted-sua-an-chu-ky-okr-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.sac_man_chrome
  verified_at: 2026-09-30T11:04:48Z
  output: |
    bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/sua-an-chu-ky-okr/rang/man-sua-an.mjs"
    phien-do: xong — mã 0

- eval: E16
  run_id: minted-sua-an-chu-ky-okr-E16-r1
  exit_code: 0
  verifier: config:executors.script.sac_san_thiet_ke
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E18
  run_id: minted-sua-an-chu-ky-okr-E18-r1
  exit_code: 0
  verifier: config:executors.script.sac_migration_chi_them
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E19
  run_id: minted-sua-an-chu-ky-okr-E19-r1
  exit_code: 0
  verifier: config:executors.test.sac_dong_thoi
  verified_at: 2026-09-30T10:49:00Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-sua-an-chu-ky-okr-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-30T11:04:48Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-an-chu-ky-okr-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-30T11:04:48Z

- cmd: bun run lint:slop
  run_id: minted-sua-an-chu-ky-okr-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-30T11:04:48Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-an-chu-ky-okr-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-30T11:04:48Z

### Hội đồng judgment (đề xuất — chờ người chốt)

Panel đề xuất cho E17: ba góc nhìn domain-correctness, operational-feasibility, spec-alignment. Cả ba đều UNCERTAIN vì thiếu căn cứ ở ba điểm: chữ hệ quả thật trên màn (tệp chữ và ảnh hộp ẩn, hộp gỡ không nằm trong danh sách đọc), mã của từng chỗ tự tìm chu kỳ có KY_CON_HIEN hay không, và nơi router gắn bốn đầu vào mới. Người quyết ở Cổng 2. Lưu ý các bên cùng nêu: design doc và hợp đồng ghi 15 chỗ lọc và 6 chỗ miễn, còn noi-doc-chu-ky.json có 14 chỗ lọc và 9 chỗ miễn.

- domain-correctness: UNCERTAIN — Hai phần đạt: viecChuKy là hàm thuần khớp bảng luật, bốn thủ tục ghi và màn đều đọc cờ từ nó; menu, sheet, hộp ẩn dựng từ @crm/ui với Huỷ bọc SheetClose/DialogClose. Ba phần không có căn cứ: chữ hệ quả thực tế (okrMessages), KY_CON_HIEN ở từng chỗ đọc chu kỳ (chỉ có bản khai JSON), và việc bốn đầu vào mới nối vào router bằng Zod. Design doc và bản khai JSON lệch số chỗ lọc và chỗ miễn.
- operational-feasibility: UNCERTAIN — Nguồn duy nhất viecChuKy, Zod ở biên của bốn đầu vào và việc dựng bằng packages/ui bậc 1–2 có căn cứ. Ba ý còn lại không đủ căn cứ: các truy vấn tự tìm chu kỳ có dùng KY_CON_HIEN, chữ hệ quả thật trên màn, và router gắn suaChuKyInput/goChuKyInput/hienChuKyInput. Danh sách JSON lệch con số design doc nêu.
- spec-alignment: UNCERTAIN — Ba trong năm ý đạt trên phần đọc được: cờ việc có một nguồn (viecChuKy dùng ở cả bốn thủ tục và chuKyOutput), đầu vào mới có schema Zod, hộp ẩn, sheet sửa, menu dựng bằng @crm/ui với Huỷ bọc DialogClose/SheetClose. Hai ý không kiểm được: KY_CON_HIEN ở 12 chỗ lọc ngoài tinhTrangGiu, và chữ hệ quả ở lib/messages/okr (ảnh E14-step5 chỉ chụp menu). Hai điểm nhỏ chưa đủ để chấm sai: anhEm.find(q => q.anLuc === null …) viết điều kiện nội tuyến thay vì dùng hằng, và mục «Ẩn» tắt trong menu dựng dòng phụ bằng thẻ span tự đặt cỡ chữ.

- eval: E17
  judged_by: judge-subagent (fresh context)
  verdict: UNCERTAIN
  rationale: Cả ba góc nhìn đạt ở phần đọc được (một nguồn viecChuKy, đầu vào Zod, dựng bằng @crm/ui) nhưng không kiểm được chữ hệ quả thật trên màn, mã KY_CON_HIEN ở từng chỗ tự tìm chu kỳ và chỗ router gắn bốn đầu vào mới; số chỗ lọc và chỗ miễn trong JSON lệch design doc.
  required_evidence:
    - Chữ vi và en của caiDat.chuKy.an.moTa, caiDat.chuKy.go.than, caiDat.chuKy.hienLai.than và caiDat.sua.* trong apps/app/lib/messages/okr.ts, hoặc ảnh chụp hộp Ẩn và hộp Gỡ đang mở trong _acceptance/sua-an-chu-ky-okr/evidence/ (E14-step13 và E14-step12; E14-step5 chỉ có menu), cho thấy ý «ẩn thì biến khỏi ô chọn kỳ, không nhận ghi, không nhắc, dữ liệu giữ nguyên, hiện lại được» và «gỡ thì vết tạo và gỡ vẫn còn».
    - Đầu ra của node _acceptance/sua-an-chu-ky-okr/rang/soi-ma.mjs --ca ky-con-hien (thoát mã 0), hoặc grep -n KY_CON_HIEN trên các tệp okr.service.ts, okr-khep.service.ts, okr-cap-nhat.service.ts, okr-trao-doi.service.ts, okr-nhac.ts, okr-don-vi.ts, okr-chup.ts, okr/doc.ts, cho thấy đủ các chỗ nhóm «lọc»; kèm lời giải thích vì sao noi-doc-chu-ky.json có 14 lọc và 9 miễn khi design doc và hợp đồng ghi 15 và 6.
    - Khai báo router của okr.suaChuKy, okr.goChuKy, okr.anChuKy, okr.hienChuKy (apps/api/src/okr/okr.router.ts hoặc tệp khai thủ tục) cho thấy .input(suaChuKyInput), .input(goChuKyInput), .input(anChuKyInput), .input(hienChuKyInput) — xác nhận Zod được nối thật ở biên.
    - Đoạn cycles trong apps/api/src/okr/okr.service.ts cho thấy trường viec của okr.cycles tính bằng đúng viecChuKy(...) với tình trạng từ tinhTrangGiu, không tính lại bằng điều kiện riêng.
  human_override: Manh Phan 2026-09-30 — Đạt

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy đạt (E1-E16, E18, E19); E17 (judgment) UNCERTAIN chờ người chốt ở Cổng 2. Không lệnh fail nào ngoài eval; không finder chết.
Round 2: vòng sửa S4-r1 viết lại E1 thành bảng ca viết tay và cấp mã thật cho E17; chạy lại E1, E13, E14, E15 cùng bốn lệnh suite, tất cả đạt; các eval còn lại mang sang từ round 1 vì delta không chạm paths của chúng. E17 vẫn UNCERTAIN chờ người chốt ở Cổng 2. Không lệnh fail nào ngoài eval; không finder chết.

### Re-pin lần 1 — 2026-09-30, do sửa ca test kỳ mặc định đỏ trên CI vì dữ liệu của packages/db chạy song song
run_id: repin-20260930T131325Z-20368
sha: fb56ea3ad0d98fe827408a777019e22f99f353b4 · suites: 4 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E14 (E14 không khai paths), E17 (E17 không khai paths)

### Re-pin lần 2 — 2026-09-30, do gộp onehub (#221 hydrat giai đoạn Deals)
run_id: repin-20260930T133656Z-60155
sha: 28939bb1599fb3fd416c9a25f0feab19c512ae64 · suites: 4 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E14 (E14 không khai paths), E17 (E17 không khai paths)

### Re-pin lần 3 — 2026-10-02, do hoá cũ do soan-okr-cung-tro-ly; thước thiết kế neo mốc #222, lịch tóm tắt lọc chu kỳ ẩn
run_id: repin-20261002T023241Z-42570
sha: f00cbbdd11671338d90d5e3ebb1734b2097d30de · suites: 7 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E14 (E14 không khai paths), E17 (E17 không khai paths)

### Re-pin lần 4 — 2026-10-02, do hoá cũ do sửa mã kiểm (agent-okr Node 24, api nguon-khoa) cho CI PR #232
run_id: repin-20261002T070749Z-51832
sha: 68478e877021999d6c540e4dd4a93e6d57549890 · suites: 7 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E14 (E14 không khai paths), E17 (E17 không khai paths)
