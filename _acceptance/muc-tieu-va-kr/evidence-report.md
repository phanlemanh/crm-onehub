---
schema_version: 2
feature_slug: muc-tieu-va-kr
verdict: REJECT
failed_evals: [E14]
reason:
verified_by: fresh-context verification subagent (round 4, phiên chấm độc lập)
enforcement_mode: strict
bypass_used: false
verified_commit: 934ee26d0c566969f017efe788622e4976d84576
human_signoff:
---

# Evidence Report: muc-tieu-va-kr

Round 4. 17 eval máy/ui-check có mã; 16 đạt, E14 (AC-11) thoát 1 với 5 dòng «hoi quy». E15 (judgment)
chưa chấm — phiên điều phối gửi ba giám khảo riêng. Bốn suite đều thoát 0.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | ui-check | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-10 | ui-check | PASS |
| E14 | AC-11 | script | FAIL |
| E15 | AC-12 | judgment | chưa chấm (phiên điều phối gửi ba giám khảo) |
| E16 | AC-12 | ui-check | PASS |
| E17 | AC-13 | test | PASS |
| E18 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: muc-tieu-va-kr-E1-20261002T125248Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that — PROTO_ROUTE=1 bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs" (log .acceptance-runs/muc-tieu-va-kr/s4-r4-man.log)
  verified_at: 2026-10-02T12:51:21Z
  screenshot: evidence/E1-1440-sang.png
  observed: |
    Ảnh sáng và tối 1440 px «OKR của tôi»: hai khung, mỗi khung mở bằng hàng mục tiêu (75% «Tính từ 2 KR», vạch kỳ vọng, «Đúng nhịp»; 33% «Tính từ 2 KR», «Chưa có kỳ vọng»)
    và ngay dưới là KR1, KR2 của chính nó trong cùng viền; không tiêu đề mục tiêu nào nằm ngoài khung; KR có dòng số «hiện tại / đích», %, thanh, nhịp. Khớp expected.
  network_observed: n-a (driver)
  output: |
    DUNG E1 1440 sang mau-okr-mt-q4-kd: mot table chua hang muc tieu va 2/2 hang KR
    DUNG E1 1440 sang mau-okr-mt-q4-kd: chu 75% == progress 75 cua API
    DUNG E1 1440 sang mau-okr-mt-q4-kd: vach [data-expected]=43 == expected 43 (lam tron 43)
    DUNG E1 1440 sang cmuqyp9hu0000qlty1n1v90ap: chu 33% == progress 33 cua API
    DUNG E1 1440 sang cmuqyp9hu0000qlty1n1v90ap: dong phu co «Tính từ 2 KR»
    GHI E1 1440 toi: ma tran 2 muc tieu (nguon) · 2 khoi tren trang · 4 KR da so
    KET LUAN: 86 DUNG, 0 SAI — ma thoat 0

- eval: E2
  run_id: muc-tieu-va-kr-E2-20261002T124151Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_bang_co_du_lieu
  verified_at: 2026-10-02T12:41:50Z
  output: |
    so ca co-du-lieu progress-api: 1
    so ca co-du-lieu: 2
    so ca co-du-lieu ky-vong: 3
     3 pass
     0 fail

- eval: E3
  run_id: muc-tieu-va-kr-E3-20261002T124158Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_theo_don_vi
  verified_at: 2026-10-02T12:41:57Z
  output: |
    so ca theo-don-vi: 3
     1 pass
     0 fail

- eval: E4
  run_id: muc-tieu-va-kr-E4-20261002T124200Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_thu_mo
  verified_at: 2026-10-02T12:41:58Z
  output: |
    so ca thu-mo: 6
    so ca thu-mo mo-lai: 2
    so ca thu-mo id-la: 2
    so ca thu-mo bam-ten: 1
     6 pass
     0 fail

- eval: E5
  run_id: muc-tieu-va-kr-E5-20261002T125248Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that (cùng lượt với E1, log .acceptance-runs/muc-tieu-va-kr/s4-r4-man.log)
  verified_at: 2026-10-02T12:51:21Z
  screenshot: evidence/E5-da-thu.png
  observed: |
    Mục tiêu đầu «Khối Kinh doanh về đích doanh thu quý 4» đã thu: mũi tên quay sang phải, khung chỉ còn hàng mục tiêu (75%, Tính từ 2 KR), không còn hàng KR;
    mục tiêu thứ hai vẫn mở với KR1, KR2. Khớp expected (trạng thái thu nhìn thấy được).
  network_observed: n-a (driver)
  output: |
    DUNG E5 1440 mau-okr-mt-q4-kd: sau bam con 0 hang [data-kr] (can 0)
    DUNG E5 1440 mau-okr-mt-q4-kd: aria-expanded=false (can false)
    GHI E5 1440: location.search sau bam «?thuMucTieu=mau-okr-mt-q4-kd»
    DUNG E5 1440 mau-okr-mt-q4-kd: sau tai lai con 0 hang [data-kr]
    DUNG E5 1440 mau-okr-mt-q4-kd: mo lai (true) → location.search «» khong con thuMucTieu
    DUNG E5 prefers-reduced-motion reduce: icon transition-duration 0s (can 0s) · property none

- eval: E6
  run_id: muc-tieu-va-kr-E6-20261002T124201Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_o_tien_do
  verified_at: 2026-10-02T12:42:00Z
  output: |
    so ca o-tien-do thead: 1
    so ca o-tien-do so-kr: 1
    so ca o-tien-do ban gon may: 2
     4 pass
     0 fail

- eval: E7
  run_id: muc-tieu-va-kr-E7-20261002T124201Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_chua_co_kr
  verified_at: 2026-10-02T12:42:01Z
  output: |
    so ca chua-co-kr: 2
     1 pass
     0 fail

- eval: E8
  run_id: muc-tieu-va-kr-E8-20261002T124202Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_sheet
  verified_at: 2026-10-02T12:42:01Z
  output: |
    so ca sheet-chi-tiet a: 1/4
    so ca sheet-chi-tiet b: 1/4
    so ca sheet-chi-tiet c: 1/4
    so ca sheet-chi-tiet chi-doc: 1/4
     4 pass
     0 fail

- eval: E9
  run_id: muc-tieu-va-kr-E9-20261002T124204Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_cham
  verified_at: 2026-10-02T12:42:02Z
  output: |
    so ca cham-diem: 2
    so ca cham-diem doi-chung: 1
    so ca cham-diem luu: 2
     3 pass
     0 fail

- eval: E10
  run_id: muc-tieu-va-kr-E10-20261002T124204Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_hang_ui
  verified_at: 2026-10-02T12:42:04Z
  output: |
    so ca hang: 4
     10 pass
     0 fail
    Ran 10 tests across 3 files.

- eval: E11
  run_id: muc-tieu-va-kr-E11-20261002T124204Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_khong_ve_tay
  verified_at: 2026-10-02T12:42:04Z
  output: |
    ma tran vien tran quan trong: bat — dung
    ma tran lop sach: khong bat — dung
    ma tran lop sach ngoac vuong: khong bat — dung
    tep da quet: 55, SimpleTableRow da quet: 17

- eval: E12
  run_id: muc-tieu-va-kr-E12-20261002T124205Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_diem_cam
  verified_at: 2026-10-02T12:42:04Z
  output: |
    so ca diem-cam a: 2 bien x (tr + khoi + 5 KR) = 14
    so ca diem-cam b: 12
    so ca diem-cam dang-mo: 1
    so ca diem-cam sheet: 6
     4 pass
     0 fail

- eval: E13
  run_id: muc-tieu-va-kr-E13-20261002T125248Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that (cùng lượt với E1, log .acceptance-runs/muc-tieu-va-kr/s4-r4-man.log)
  verified_at: 2026-10-02T12:51:21Z
  screenshot: evidence/E13-375-cua-toi-sang.png
  observed: |
    Tám ảnh 375 px (Của tôi, Theo đơn vị, sheet, Chấm điểm × sáng/tối): không thanh cuộn ngang; ở Của tôi/Theo đơn vị tiến độ mục tiêu và KR nằm dưới tên
    («Tính từ 2 KR» 75%, KR1 49%); sheet: tên KR 120 ký tự xuống dòng trong ô, «40 / 100» dưới tên; Chấm điểm: hàng mục tiêu «Điểm 0,85 · Cam kết chưa trọn» dưới tên. Khớp expected.
  network_observed: n-a (driver)
  output: |
    DUNG E13 375 cua-toi sang: scrollWidth 375 == innerWidth 375
    DUNG E13 375 theo-don-vi sang: 25/25 hang KR co tien do/diem hien cung td voi ten
    DUNG E13 375 sheet sang: 0/3 table-container trong khoi cuon ngang (scrollWidth <= clientWidth + 1)
    GHI E13 375 cham sang: 4 hang muc tieu · 9 hang KR (toi thieu 2 · 4)
    DUNG E13 375 cham toi: 0/4 table-container trong khoi cuon doc (scrollHeight <= clientHeight + 1)

- eval: E14
  run_id: muc-tieu-va-kr-E14-20261002T180341Z
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.mtkr_ho_so_cham — node _acceptance/muc-tieu-va-kr/rang/ho-so-cham.mjs (log .acceptance-runs/muc-tieu-va-kr/s4-r4-ho-so-cham.log, sổ ho-so-cham/ket-qua-934ee26d0c56-mac-dinh.jsonl)
  verified_at: 2026-10-02T18:03:41Z
  output: |
    danh sach 237 eval = se chay 234 (qua 160 lenh rieng) + khong chay duoc 3
    hoi quy: do-man-tren-kho-rieng/E11
    hoi quy: doi-ten-onehub-center/E14 (mien khong du: van do ma 1 khi tra apps/app/app/proto/_modules/muc-tieu-va-kr ve 923f5717)
    hoi quy: neo-dan-so-khong-cung/E7
    hoi quy: slack-thieu-quyen-email/E10
    hoi quy: tro-ly-okr-de-xuat/E4
    tong 234 eval: xanh o HEAD 149 · chap chon 5 · do san o B 75 · mien 0 · hoi quy 5
    EXIT 1

- eval: E15
  judged_by: chưa chấm — phiên điều phối gửi ba giám khảo riêng và trộn kết quả
  inputs: bảy ảnh evidence/E1-1440-{sang,toi}.png, E16-1440-{theo-don-vi,sheet}-{sang,toi}.png, E16-hien-tai.png (đã sinh lại round 4, đủ cả bảy)

- eval: E16
  run_id: muc-tieu-va-kr-E16-20261002T125248Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that (cùng lượt với E1, log .acceptance-runs/muc-tieu-va-kr/s4-r4-man.log)
  verified_at: 2026-10-02T12:51:21Z
  screenshot: evidence/E16-1440-theo-don-vi-sang.png
  observed: |
    Theo đơn vị (Pháp chế, 3 mục tiêu) sáng/tối: ba khung, mỗi khung hàng mục tiêu 75%/24%/48% rồi KR1..KRn của nó, không hàng tiêu đề cột nhìn thấy.
    Sheet «Giữ đà tăng trưởng bán lẻ miền Bắc» sáng/tối: «VÌ SAO LÚC NÀY», «GÓP VÀO … qua KR «Doanh thu hợp đồng mới đạt 48 tỷ đồng»», bảng KR1–KR3, «Tiến độ mục tiêu 35% tính từ 3 KR.», nút Thêm KR. E16-hien-tai là bố cục cũ (tiêu đề ngoài khung, cột Đích). Khớp expected.
  network_observed: n-a (driver)
  output: |
    DUNG E16 theo-don-vi: sha256 sang b85752ed2ff95c6a… != toi 519925c30c4107ab…
    DUNG E16 sheet mau-okr-mt-q4-kd-bac-1 sang: [data-khu=vi-sao] hien trong anh
    DUNG E16 sheet mau-okr-mt-q4-kd-bac-1 toi: [data-khu=gop-vao] hien trong anh
    DUNG E16 sheet: sha256 sang 52cc0e684daeeb5f… != toi c2db1c60cfa6cb01…
    DUNG E16 hien-tai: _acceptance/muc-tieu-va-kr/evidence/E16-hien-tai.png 114 KB > 10 KB

- eval: E17
  run_id: muc-tieu-va-kr-E17-20261002T124212Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_trang_thai_cu
  verified_at: 2026-10-02T12:42:11Z
  output: |
    giao E13: ST-mtkr-hep
    trang-thai da so: ST-donvi-dangtai
    trang-thai da so: ST-donvi-loi
    trang-thai da so: ST-donvi-chuakychay
     17 pass
     0 fail

- eval: E18
  run_id: muc-tieu-va-kr-E18-20261002T124212Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_san_thiet_ke (design-gate --mode static, bảy tệp)
  verified_at: 2026-10-02T12:42:12Z
  output: |
    7 tệp đích, mỗi tệp "verdict": "PASS", "p0_count": 0, "blocking": []
    simple-table.tsx, bang-muc-tieu.tsx, khoi-muc-tieu.tsx, bang-kr.tsx, tien-do-kr.tsx, cham-diem.tsx, objective-sheet.tsx

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muc-tieu-va-kr-SUITE-test-20261002T125006Z
  exit_code: 0
  verified_at: 2026-10-02T12:42:24Z
- cmd: bunx turbo run lint --force
  run_id: muc-tieu-va-kr-SUITE-lint-20261002T125017Z
  exit_code: 0
  verified_at: 2026-10-02T12:50:16Z
- cmd: bun run lint:slop
  run_id: muc-tieu-va-kr-SUITE-slop-20261002T125024Z
  exit_code: 0
  verified_at: 2026-10-02T12:50:23Z
- cmd: bunx turbo run build --force
  run_id: muc-tieu-va-kr-SUITE-build-20261002T125043Z
  exit_code: 0
  verified_at: 2026-10-02T12:50:30Z

## Known limits

- network_observed của bốn ui-check là n-a (driver): rang/man-mtkr.mjs là script Playwright không xuất request/console. Hai tệp evidence/E1-network.txt và E16-network.txt có trong thư mục là bản của một round trước (07:50), không do lượt round 4 sinh ra.
- Không chạy baseline A/B ở round 4 (baseline: n-a). Sổ round 3 ghi E10 xanh cả trên diffBase (không phân biệt).
- E14: 75 eval «do san o B» — đỏ cả ở HEAD lẫn ở merge-base 923f5717, nên E14 không nói được gì về chúng; trong số đó có nhiều eval của chính danh sách viết trước (dat-okr-trong-crm E11 E12 E13 E20, so-okr-tu-chay E11 E12 E13, cap-nhat-tuan-okr E18 E29, toan-canh-okr E2 E3 E14 E23, khung-tao-okr-nhu-deal E18, hop-thoai-giu-cho-dang-nhap E9, okr-soat-anh-luot-3 E9 E13).
- E14 ghi «chap chon» cho 5 eval (đỏ lần đầu ở HEAD, xanh khi chạy lại): ux-lai-thu-8c-okr/E15, khung-tao-okr-nhu-deal/E17, sua-an-chu-ky-okr/E15, tro-ly-okr-tom-tat/E9, va-tro-ly-okr-sau-thu/E13.

## Ngoài hợp đồng

- Bốn trong năm dòng «hoi quy» của E14 là thước giữ phạm vi diff/commit của hồ sơ khác, không đo hành vi sản phẩm: do-man-tren-kho-rieng/E11 (cấm tệp dưới _acceptance/<slug khác>/ — nhánh này có 69 tệp như vậy), doi-ten-onehub-center/E14 (mục (e) cấm diff chạm apps/app/app/proto/_modules/muc-tieu-va-kr/*; mục miễn trả thư mục về B vẫn đỏ), neo-dan-so-khong-cung/E7 (--ca pham-vi: diff ngoài _acceptance và T1 gồm các tệp okr của vòng này), slack-thieu-quyen-email/E10 (khong-sua-tep-hang: commit không mang tên, gồm 934ee26d). Ở B cả bốn xanh vì diff rỗng.
- Dòng thứ năm, tro-ly-okr-de-xuat/E4, ở HEAD là «KHONG DO DUOC» ở bước dựng (lần 1: okr:mau thoát 1 trong phiên đo lồng có tác tử; lần chạy lại: prisma/seed.ts thoát với P2039), không phải một khẳng định sai; ở B xanh. Cùng okr:mau đó chạy được trong lượt ui-check của chính hồ sơ này ở HEAD.
- Ảnh E13-375-sheet: dải tóm tắt đầu sheet ở 375 px bị cắt chữ («33% · lẽ ra …», «Chưa có kỳ v», «Trần Q…»), và cột «Việc» chiếm khoảng nửa bề rộng nên tên KR dài bị bẻ thành nhiều dòng hẹp. Không vi phạm AC-10 (không tràn ngang, tiến độ dưới tên).

## Analyst

Không đánh giá phân biệt ở round 4 (không chạy baseline). Round 3 ghi E10 không phân biệt (xanh trên diffBase).

## Variance

none — không eval nào chạy nhiều lần; E14 tự báo 5 eval chập chờn của hồ sơ khác (liệt ở Known limits).

## Iterations

Round 1: BLOCKED — E14 (ho-so-cham.mjs) chạy dài chưa xong, không lấy được kết quả cuối.
Round 2: REJECT.
Round 3: BLOCKED — E14 vẫn đang chạy và lint --force không có kết quả.
Round 4: REJECT — E14 thoát 1 với 5 «hoi quy» (4 thước phạm vi diff/commit của hồ sơ khác + tro-ly-okr-de-xuat/E4 «KHONG DO DUOC» ở bước dựng); mọi eval máy khác và bốn suite đạt; E15 chưa chấm.
