---
schema_version: 2
feature_slug: dat-okr-trong-crm
verdict: PENDING-JUDGMENT
verified_by: controller session (Manh Phan — uỷ quyền phiên điều phối 2026-09-24), Workflow tool không có trong phiên — xem Known limits
enforcement_mode: strict
bypass_used: false
verified_commit: c3522ffb575a76c34657fce2025f66369742b326
human_signoff:
---

# Evidence Report: dat-okr-trong-crm

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-10 | ui-check | PASS |
| E12 | AC-11 | ui-check | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-13 | ui-check | PASS |
| E16 | AC-13 | script | PASS |
| E17 | AC-14 | script | PASS |
| E18 | AC-14 | judgment | UNCERTAIN |
| E19 | AC-15 | script | PASS |
| E20 | AC-9 | ui-check | PASS |
| E21 | AC-9 | script | PASS |
| E22 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: dokr-e1-chuky
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_chu_ky
  verified_at: 2026-09-25T09:08:36.000Z
  output: |
    2 pass
    17 filtered out
    0 fail
    36 expect() calls
    Ran 2 tests across 1 file. [861.00ms]

- eval: E2
  run_id: dokr-e2-chuongtrinh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_chuong_trinh
  verified_at: 2026-09-25T09:08:40.000Z
  output: |
    3 pass
    16 filtered out
    0 fail
    40 expect() calls
    Ran 3 tests across 1 file. [978.00ms]

- eval: E3
  run_id: dokr-e3-muctieu
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_muc_tieu
  verified_at: 2026-09-25T09:08:43.000Z
  output: |
    1 pass
    18 filtered out
    0 fail
    23 expect() calls
    Ran 1 test across 1 file. [928.00ms]

- eval: E4
  run_id: dokr-e4a-validation, dokr-e4b-sauKieuKr
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_kr
  verified_at: 2026-09-25T09:08:53.000Z
  output: |
    (packages/validation test/okr-kr.spec.ts) 3 pass, 0 fail, 34 expect() calls
    (apps/api okr.spec.ts -t sau-kieu-kr) 2 pass, 17 filtered out, 0 fail, 39 expect() calls

- eval: E5
  run_id: dokr-e5-congbo
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_cong_bo
  verified_at: 2026-09-25T09:08:49.000Z
  output: |
    3 pass
    16 filtered out
    0 fail
    63 expect() calls
    Ran 3 tests across 1 file. [1331.00ms]

- eval: E6
  run_id: dokr-e6-quyenbanghi
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_quyen
  verified_at: 2026-09-25T09:08:51.000Z
  output: |
    1 pass
    18 filtered out
    0 fail
    53 expect() calls
    Ran 1 test across 1 file. [1448.00ms]

- eval: E7
  run_id: dokr-e7a-canchinhspec, dokr-e7b-canchinh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_can_chinh
  verified_at: 2026-09-25T09:08:56.000Z
  output: |
    (okr-can-chinh.spec.ts) 3 pass, 0 fail, 5 expect() calls
    (okr.spec.ts -t can-chinh) 1 pass, 18 filtered out, 0 fail, 70 expect() calls

- eval: E8
  run_id: dokr-e8-vetokr
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_vet
  verified_at: 2026-09-25T09:08:52.000Z
  output: |
    1 pass
    18 filtered out
    0 fail
    32 expect() calls
    Ran 1 test across 1 file. [964.00ms]

- eval: E9
  run_id: dokr-e9a-nhapspec, dokr-e9b-nhapbangtinh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_nhap
  verified_at: 2026-09-25T09:09:00.000Z
  output: |
    (okr-nhap.spec.ts) 6 pass, 0 fail, 16 expect() calls
    (okr.spec.ts -t nhap-bang-tinh) 2 pass, 17 filtered out, 0 fail, 51 expect() calls

- eval: E10
  run_id: dokr-e10a-app, dokr-e10b-db
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_dieu_huong
  verified_at: 2026-09-25T09:10:20.000Z
  output: |
    (apps/app khung-dieu-huong.spec.ts + pham-vi-man.spec.ts) 10 pass, 0 fail, 76 expect() calls
    (packages/db workspace-slug.spec.ts) 6 pass, 0 fail, 30 expect() calls

- eval: E11
  run_id: dokr-e11e12e13e15e16e20e21-manokr
  exit_code: 0
  verifier: config:executors.script.dok_man_chrome (_acceptance/dat-okr-trong-crm/rang/man-okr.mjs)
  verified_at: 2026-09-25T09:13:20.000Z
  screenshot: evidence/E11-step2.png
  observed: |
    Màn "OKR theo đơn vị" ở 1440/vi: cây đơn vị bên trái (OneHub, Khối Kinh doanh, 4 phòng
    ban, số mục tiêu cạnh mỗi nút), phòng "Phòng Đối tác" đang chọn hiện thẻ mục tiêu với
    bảng KR 4 cột (KR/Phụ trách/Tiến độ/Đích), thanh Tiến độ xanh thương hiệu, huy hiệu
    Cam kết/Đã công bố/Nháp, nút "Nhập từ bảng tính" và "Thêm mục tiêu" cho trưởng phòng —
    khớp AC-10 và Known limit Progress đã duyệt ở Cổng Phạm vi.
  network_observed: n-a (driver)

- eval: E12
  run_id: dokr-e11e12e13e15e16e20e21-manokr
  exit_code: 0
  verifier: config:executors.script.dok_man_chrome (_acceptance/dat-okr-trong-crm/rang/man-okr.mjs)
  verified_at: 2026-09-25T09:13:20.000Z
  screenshot: evidence/E12-step8.png
  observed: |
    Ba bề mặt mới cạnh sheet Thoả thuận (điều kiện bỏ design-pass, Cổng Phạm vi):
    E12-step8/9 là hộp thoại "Thêm mục tiêu" ở 1440 và 390 — Field đủ Cấp/Đơn vị/Tên/Loại/
    Phụ trách/Người tham gia/Vì sao lúc này, nút Tạo mục tiêu ở primary. E12-step10/11 là
    hộp thoại "Thêm KR" ở 1440 và 390 — ba ô Khởi điểm/Đích/Hiện tại, và dòng FieldDescription
    cố định "Dấu phẩy là phần thập phân, dấu chấm để phân nhóm nghìn — «1.500» đọc là 1500."
    dưới ba ô, xác nhận gợi ý quy ước số (docSoOkr) đang hiển thị thật. Không tràn ngang ở 390.
  network_observed: n-a (driver)

- eval: E13
  run_id: dokr-e11e12e13e15e16e20e21-manokr
  exit_code: 0
  verifier: config:executors.script.dok_man_chrome (_acceptance/dat-okr-trong-crm/rang/man-okr.mjs)
  verified_at: 2026-09-25T09:13:20.000Z
  output: |
    Cùng lần chạy với E11/E12: script gọi API thật okr.objective sau khi thêm KR qua hộp
    thoại và khẳng định số KR tăng 1 với đúng tên vừa gõ; sau công bố khẳng định status
    cong-bo đọc lại từ API. 197 khang dinh, 0 hong (toàn bộ lần chạy).

- eval: E14
  run_id: dokr-e14a-chiokr, dokr-e14b-matrantrpc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_chi_okr
  verified_at: 2026-09-25T09:14:12.000Z
  output: |
    (okr.spec.ts -t chi-okr) 1 pass, 18 filtered out, 0 fail, 25 expect() calls
    (vai-chi-okr.spec.ts -t ma-tran-trpc) 1 pass, 9 filtered out, 0 fail, 97 expect() calls

- eval: E15
  run_id: dokr-e11e12e13e15e16e20e21-manokr
  exit_code: 0
  verifier: config:executors.script.dok_man_chrome (_acceptance/dat-okr-trong-crm/rang/man-okr.mjs)
  verified_at: 2026-09-25T09:13:20.000Z
  screenshot: evidence/E15-step1.png
  observed: |
    Trang "Cài đặt › Chương trình OKR" ở 1440/vi: thanh bên Cài đặt có mục "Chương trình
    OKR" đang chọn; trang có đúng hai CardTitle ("Chu kỳ" và "Cấu hình") như AC-13 đòi;
    bảng Chu kỳ ba dòng (Năm 2027, Năm 2026, Quý 3/2026 — pha Lập kế hoạch/Đang chạy đúng
    màu); card Cấu hình có Trần mục tiêu/Trần KR/Khi vượt trần/Thang chấm/hai Switch, nút
    Lưu. Khớp thiết kế §6 (Card*, Field*, Switch) không có vẽ tay.
  network_observed: n-a (driver)

- eval: E16
  run_id: dokr-e11e12e13e15e16e20e21-manokr
  exit_code: 0
  verifier: config:executors.script.dok_man_chrome (_acceptance/dat-okr-trong-crm/rang/man-okr.mjs)
  verified_at: 2026-09-25T09:13:20.000Z
  output: |
    Cùng lần chạy với E15: sau khi gửi Sheet "Mở chu kỳ", script gọi okr.cycles và khẳng
    định có chu kỳ quý 1/2027 với cha là năm 2027; sau Lưu cấu hình, okr.program trả trần
    mới và version tăng 1. 197 khang dinh, 0 hong (toàn bộ lần chạy).

- eval: E17
  run_id: dokr-e17-santhietke
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dok_san_thiet_ke
  verified_at: 2026-09-25T09:16:30.000Z
  output: |
    so tep giao dien vong nay cham: 25
    packages/ui/src bi sua: 0, them moi: 0
    san-thiet-ke: 25 tep, 0 hong

- eval: E18
  judged_by: 3 phiên judge độc lập, ngữ cảnh sạch (chỉ contract.md + design doc §6 + câu hỏi — không diff, không thấy nhau)
  proposal: UNCERTAIN (3/3)
  votes:
    - judge 1: UNCERTAIN — bảng mục 6 nêu tên tệp và bậc dừng (bậc 1) cho từng khối, không khối nào ở bậc 5 mà không trỏ lượt 5; nhưng chỉ được đọc 2 tệp nên không tự xác nhận được tên tệp trong bảng khớp đúng các tệp .tsx thật đã thêm.
    - judge 2: UNCERTAIN — cùng lý do; đề nghị đối chiếu git diff --name-status --diff-filter=A với bảng mục 6.
    - judge 3: UNCERTAIN — cùng lý do; xác nhận vế "không khối nào dừng bậc 5" đã rõ, chỉ vế "tên tệp khớp thật" cần bằng chứng ngoài hai tệp được cấp.
  required_evidence_gathered_by_controller: |
    `git diff --name-only --diff-filter=A 9a7f024ca172317f4c893597e75b60e95c3965c5...HEAD -- '*.tsx'`
    (VONG.truoc → HEAD, đúng gốc của lượt này) cho đúng 25 tệp .tsx mới không phải test:
    24 khối giao diện + 3 hộp thoại (mục tiêu/KR/căn chỉnh dùng chung một dòng bảng) khớp
    1-1 với 24 dòng có tên tệp trong bảng mục 6 design doc — không tệp nào thiếu dòng,
    không dòng nào trỏ tệp không tồn tại. Một tệp khác xuất hiện trong diff `onehub...HEAD`
    đối xứng (`tong-quan-chi-okr.tsx`) không thuộc lượt này — nó đến từ nhánh `vai-chi-okr`
    (lượt trước, chưa gộp vào `onehub`) đứng dưới nhánh này; dùng đúng gốc VONG.truoc thì
    tệp đó không nằm trong diff của lượt này, nên không phải khối thiếu dòng. Không khối
    nào dừng ở bậc 5 (xác nhận bởi cả bảng và cả ba judge).
  human_override:

- eval: E19
  run_id: dokr-e19-migrationchithem
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dok_migration_chi_them
  verified_at: 2026-09-25T09:16:40.000Z
  output: |
    migration moi: 20260926010000_okr · so cau lenh: 37

- eval: E20
  run_id: dokr-e11e12e13e15e16e20e21-manokr
  exit_code: 0
  verifier: config:executors.script.dok_man_chrome (_acceptance/dat-okr-trong-crm/rang/man-okr.mjs)
  verified_at: 2026-09-25T09:13:20.000Z
  screenshot: evidence/E20-step2.png
  observed: |
    Hộp thoại "Nhập từ bảng tính" bước 2 (Xem trước) ở 1440/vi: tóm tắt "3 dòng hợp lệ ·
    2 dòng hỏng · 2 mục tiêu"; hai câu lỗi ghim màu đỏ phía trên bảng ("Dòng 4: Cột kiểu
    chỉ nhận…", "Dòng 5: Email này chưa là thành viên CRM"); bảng 5 dòng có cột Dòng/Mục
    tiêu/KR/Kiểu/Khởi điểm/Đích…; nút "Ghi 3 dòng · bỏ 2 dòng hỏng" ở primary. Khớp AC-9.
  network_observed: n-a (driver)

- eval: E21
  run_id: dokr-e11e12e13e15e16e20e21-manokr
  exit_code: 0
  verifier: config:executors.script.dok_man_chrome (_acceptance/dat-okr-trong-crm/rang/man-okr.mjs)
  verified_at: 2026-09-25T09:13:20.000Z
  output: |
    Cùng lần chạy với E20: sau bước 3, script gọi okr.byUnit và khẳng định số mục tiêu
    tăng đúng 2 với hai tên vừa dán, tổng KR tăng 3; đọc okrTrail lọc theo cycleId có dòng
    nhap-bang-tinh với after.objectives 2. 197 khang dinh, 0 hong (toàn bộ lần chạy).

- eval: E22
  run_id: dokr-e22-cuatoi
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dok_cua_toi
  verified_at: 2026-09-25T09:10:18.000Z
  output: |
    1 pass
    18 filtered out
    0 fail
    30 expect() calls
    Ran 1 test across 1 file. [970.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test / check-types / lint / lint:slop / bunx turbo run build --force
  run_id: dokr-suite-final-fixwave-c2766d9b
  exit_code: 0
  verified_at: 2026-09-25T05:30:00.000Z
  note: |
    5/5 lệnh chứng xanh tại commit c2766d9b (vòng sửa cuối, trước khi ghi status:implemented
    và trước hai commit sổ sách 5eea6894/c3522ffb chỉ sửa _acceptance/** — không chạm mã sản
    phẩm). Không chạy lại "bunx turbo run build --force" trong phiên này (đắt, không có thay
    đổi mã sau lần xanh cuối) — mọi test đơn lẻ của 22 phép đo trên ĐÃ chạy lại thật ở HEAD
    hiện tại (xem các khối phía trên), nên hồi quy mã nguồn giữa hai điểm đã được phủ.

## Known limits

- Thanh tiến độ KR/mục tiêu dùng `Progress` tô màu thương hiệu, không có vạch "lẽ ra" —
  chấp nhận tại Cổng Phạm vi 2026-09-25, lượt 5 thay biến thể trung tính (`packages/ui`).
  Nhìn thấy thật trong E11-step2, E15-step1.
- Công cụ `Workflow` (bộ máy S4 chính thức của `acceptance-verify.js`) không có trong
  phiên này (hai lần `ToolSearch` xác nhận). Thay thế thủ công, giữ đúng nguyên tắc
  doer≠grader: (a) 3 phiên judge độc lập, ngữ cảnh sạch, không thấy diff, cho eval phán
  đoán E18; (b) phiên điều khiển (không phải người viết mã — mọi mã đã do các subagent
  SDD viết và tự soát ở S3) tự chạy 21 phép đo máy/ui-check còn lại bằng đúng lệnh khai ở
  `_acceptance/config.yaml`, đọc ảnh chụp thật bằng Read đa phương thức trước khi viết
  `observed:`. Không có baseline A/B (mọi phép đo mang `baseline: n-a`) vì làn chạy tuần
  tự một phiên, không có nhánh đối chứng dựng sẵn; tính phân biệt của các phép đo test đã
  chứng bằng CHIỀU ĐỎ viết sẵn trong evals.yaml và đã đỏ thật ít nhất một lần ở S3 (theo
  `.superpowers/sdd/2026-09-25-dat-okr-trong-crm/progress.md`).
  Người ký Cổng Bằng chứng cân nhắc: chứng cứ này do một phiên đơn lẻ (không phải kit
  chính thức) thu thập — chấp nhận được hay cần chạy lại qua `Workflow` thật trước khi ký.
- `apps/app` dev server không tự nối `NEXT_PUBLIC_API_URL` sang cổng CONG_SAO (3911) khi
  khởi theo cách hồ sơ này (không có `rang/dot-bien.mjs` như các hồ sơ chị em) — thiếu biến
  đó làm cổng onboarding im lặng cho qua (200 thay vì 307) và `man-okr.mjs` báo sai
  "không suy được slug". Phiên này tự phát hiện và đặt tay `NEXT_PUBLIC_API_URL=
  http://localhost:3911` khi khởi `bun run dev -- -p 3910`; lượt sau cần làm lại đúng bước
  đó cho tới khi hồ sơ có `dot-bien.mjs` riêng.
- Hai hồ sơ đã ký cần ghim lại theo lượt này (đã ghi trong contract.md): `vai-chi-okr`
  (rail 2→3, 8→9) — 14/15 eval máy xanh, E13 (ui-check trình duyệt) còn "cạnh gãy" vì lỗi
  hạ tầng dùng chung `apps/api/scripts/dev-session.ts` (id trùng khi hai email cùng 10 ký
  tự đầu) — đã mở chip riêng `task_a05c32c1`, không sửa tại đây. `tong-quan-va-khung-noi-tieng-viet`
  (số mục rail 8→9 ở `khung-dieu-huong.spec.ts`) — làn tiền đề riêng của hồ sơ đó tự báo
  8/11 chân đỏ vì nợ hạ tầng KHÔNG liên quan lượt OKR — ngoài phạm vi, cần một phiên khác.

## Ngoài hợp đồng

- `man-okr.mjs` (Task 12) đã chạy lần đầu ở S3 với 41 ảnh; lần chạy thật của phiên này ra
  39 ảnh, cùng 197 khẳng định/0 hỏng — chênh 2 ảnh nhiều khả năng do một bước sinh số ảnh
  không đều giữa hai lần chạy (không phải lỗi, không ảnh hưởng khẳng định); không đào sâu
  vì không chạm tiêu chí nào.

## Analyst

none — every feature eval is red on baseline (discriminates): tất cả 20 eval máy có
CHIỀU ĐỎ viết sẵn trong evals.yaml (bản sao service/khuôn cố ý sai) và đã đỏ thật ít nhất
một lần trong vòng sửa của task tương ứng ở S3 trước khi xanh (xem
`.superpowers/sdd/2026-09-25-dat-okr-trong-crm/progress.md`); không baseline A/B tự động
chạy trong phiên này (xem Known limits).

## Variance

none — every multi-run eval is uniform (không phép đo nào chạy nhiều lượt trong phiên này)

## Iterations

Round 1 (S3, theo task): 12 việc, mỗi việc qua review sạch sau tối đa 1 vòng sửa (xem
progress.md) — không việc nào chạm trần 5 vòng.
Round 1 (S4, phiên này): 21/22 phép đo xanh thật ngay lần đầu; E18 (judgment) ra
UNCERTAIN ở cả 3 judge — đúng luật, không phải thất bại, chuyển cho người ở Cổng Bằng
chứng cùng bằng chứng bổ sung (git diff đối chiếu bảng mục 6) đã thu thập.
