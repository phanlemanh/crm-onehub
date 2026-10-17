---
schema_version: 2
feature_slug: muc-tieu-va-kr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 91b4e246850c022b600b63901a2666a3aac8428e
human_signoff: Phan Le Manh 2026-10-03
---

# Evidence Report: muc-tieu-va-kr

Round 10, phiên chấm độc lập trên đỉnh 03861afa. Mọi eval máy và ui-check đều xanh, bảy lệnh suite đều xanh ngay lần đầu. E15 (judgment) chưa chấm trong phiên này: phiên điều phối gửi ba giám khảo riêng rồi trộn kết quả.

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
| E14 | AC-11 | script | PASS |
| E15 | AC-12 | judgment | PASS |
| E16 | AC-12 | ui-check | PASS |
| E17 | AC-13 | test | PASS |
| E18 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: muc-tieu-va-kr-E1-20261003T082959Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that
  verified_at: 2026-10-03T08:29:59Z
  output: |
    GHI TIEN DE okr.mine tran-quoc-bao: 2 muc tieu (mau-okr-mt-q4-kd:cong-bo:2KR, cmus4t4o4000041tyaqxpc2pq:cong-bo:2KR)
    DUNG E1 1440 sang: vung danh sach co 0 [data-slot=card-header] (can 0)
    DUNG E1 1440 sang mau-okr-mt-q4-kd: mot table chua hang muc tieu va 2/2 hang KR
    DUNG E1 1440 sang mau-okr-mt-q4-kd: chu 75% == progress 75 cua API
    DUNG E1 1440 sang mau-okr-mt-q4-kd: vach [data-expected]=44 == expected 44 (lam tron 44)
    DUNG E1 1440 sang cmus4t4o4000041tyaqxpc2pq: vach [data-expected]=null == expected 0 (vang)
    GHI E1 1440 toi: ma tran 2 muc tieu (nguon) · 2 khoi tren trang · 4 KR da so
    KET LUAN: 86 DUNG, 0 SAI — ma thoat 0
  screenshot: evidence/E1-1440-sang.png
  observed: |
    Sáng và tối (E1-1440-sang/toi): hai khung riêng, mỗi khung mở đầu bằng hàng mục tiêu có mũi tên, nhãn, người phụ trách, «Tính từ 2 KR», % (75%, 33%) và thanh tiến độ; KR1/KR2 nằm trong cùng khung ngay dưới.
    Mục tiêu 75% có vạch kỳ vọng và «Đúng nhịp»; mục tiêu 33% ghi «Chưa có kỳ vọng», không có vạch. Không có tiêu đề mục tiêu nào nằm ngoài khung, cũng không có cột «Đích».
  network_observed: n-a (driver)

- eval: E2
  run_id: muc-tieu-va-kr-E2-20261003T081803Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_bang_co_du_lieu
  verified_at: 2026-10-03T08:18:03Z
  output: |
    so ca co-du-lieu progress-api: 1
    so ca co-du-lieu: 2
    so ca co-du-lieu ky-vong: 3
     3 pass
     0 fail
    Ran 3 tests across 1 file.

- eval: E3
  run_id: muc-tieu-va-kr-E3-20261003T081805Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_theo_don_vi
  verified_at: 2026-10-03T08:18:05Z
  output: |
    so ca theo-don-vi: 3
     1 pass
     0 fail
    Ran 1 test across 1 file.

- eval: E4
  run_id: muc-tieu-va-kr-E4-20261003T081806Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_thu_mo
  verified_at: 2026-10-03T08:18:06Z
  output: |
    so ca thu-mo: 6
    so ca thu-mo mo-lai: 2
    so ca thu-mo id-la: 2
    so ca thu-mo trung-rong: 2
    so ca thu-mo bam-ten: 1
     6 pass
     0 fail

- eval: E5
  run_id: muc-tieu-va-kr-E5-20261003T082959Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that
  verified_at: 2026-10-03T08:29:59Z
  output: |
    DUNG E5 1440 mau-okr-mt-q4-kd: sau bam con 0 hang [data-kr] (can 0)
    DUNG E5 1440 mau-okr-mt-q4-kd: aria-expanded=false (can false)
    GHI E5 1440: location.search sau bam «?thuMucTieu=mau-okr-mt-q4-kd»
    DUNG E5 1440 mau-okr-mt-q4-kd: sau tai lai con 0 hang [data-kr]
    DUNG E5 1440 mau-okr-mt-q4-kd: mo lai (true) → location.search «» khong con thuMucTieu
    GHI E5 no-preference: icon transition-duration 0.24s · property transform
    DUNG E5 prefers-reduced-motion reduce: icon transition-duration 0s (can 0s) · property none
    KET LUAN: 86 DUNG, 0 SAI — ma thoat 0
  screenshot: evidence/E5-da-thu.png
  observed: |
    E5-da-thu: mục tiêu đầu «Khối Kinh doanh về đích doanh thu quý 4» chỉ còn hàng mục tiêu (75%, mũi tên quay sang phải), không còn hàng KR nào bên dưới.
    Mục tiêu thứ hai vẫn mở với KR1/KR2 — đúng với thu một mục tiêu.
  network_observed: n-a (driver)

- eval: E6
  run_id: muc-tieu-va-kr-E6-20261003T081813Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_o_tien_do
  verified_at: 2026-10-03T08:18:13Z
  output: |
    so khang dinh o-tien-do: 7
    so ca o-tien-do thead: 1
    so ca o-tien-do so-kr: 1
    so ca o-tien-do ban gon may: 2
     4 pass
     0 fail

- eval: E7
  run_id: muc-tieu-va-kr-E7-20261003T081814Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_chua_co_kr
  verified_at: 2026-10-03T08:18:14Z
  output: |
    so ca chua-co-kr: 2
     1 pass
     0 fail
    Ran 1 test across 1 file.

- eval: E8
  run_id: muc-tieu-va-kr-E8-20261003T081815Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_sheet
  verified_at: 2026-10-03T08:18:15Z
  output: |
    so ca sheet-chi-tiet a: 1/4
    so ca sheet-chi-tiet b: 1/4
    so ca sheet-chi-tiet c: 1/4
    so ca sheet-chi-tiet chi-doc: 1/4
     4 pass
     0 fail

- eval: E9
  run_id: muc-tieu-va-kr-E9-20261003T081816Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_cham
  verified_at: 2026-10-03T08:18:16Z
  output: |
    so ca cham-diem: 2
    so ca cham-diem doi-chung: 1
    so ca cham-diem luu: 2
     3 pass
     0 fail

- eval: E10
  run_id: muc-tieu-va-kr-E10-20261003T081825Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_hang_ui
  verified_at: 2026-10-03T08:18:25Z
  output: |
    so ca hang: 4
     10 pass
     0 fail
    Ran 10 tests across 3 files.

- eval: E11
  run_id: muc-tieu-va-kr-E11-20261003T081825Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_khong_ve_tay
  verified_at: 2026-10-03T08:18:25Z
  output: |
    ma tran dieu kien: bat — dung
    ma tran bien the ngoac vuong: bat — dung
    ma tran bien the data-[]: bat — dung
    ma tran vien tran: bat — dung
    ma tran lop sach: khong bat — dung
    tep da quet: 61, SimpleTableRow da quet: 17

- eval: E12
  run_id: muc-tieu-va-kr-E12-20261003T081825Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_diem_cam
  verified_at: 2026-10-03T08:18:25Z
  output: |
    so ca diem-cam a: 2 bien x (tr + khoi + 5 KR) = 14
    so ca diem-cam b: 12
    so ca diem-cam dang-mo: 1
    so ca diem-cam sheet: 6
     4 pass
     0 fail

- eval: E13
  run_id: muc-tieu-va-kr-E13-20261003T082959Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that
  verified_at: 2026-10-03T08:29:59Z
  output: |
    DUNG E13 375 cua-toi sang: scrollWidth 375 == innerWidth 375
    DUNG E13 375 cua-toi sang: 4/4 hang KR co tien do/diem hien cung td voi ten
    GHI E13 375 theo-don-vi sang: 12 hang muc tieu · 25 hang KR (toi thieu 2 · 4)
    DUNG E13 375 sheet toi: scrollWidth 375 == innerWidth 375
    GHI E13 375 cham sang: 4 hang muc tieu · 9 hang KR (toi thieu 2 · 4)
    DUNG E13 375 cham toi: 9/9 hang KR co tien do/diem hien cung td voi ten
    KET LUAN: 86 DUNG, 0 SAI — ma thoat 0
  screenshot: evidence/E13-375-cua-toi-sang.png
  observed: |
    Tám ảnh 375 px (của tôi, theo đơn vị, sheet, chấm điểm × sáng/tối): không màn nào lộ thanh cuộn ngang hay chữ tràn mép; «Tính từ 2 KR», %, thanh và nhịp nằm dưới tên mục tiêu/KR chứ không thành cột.
    Sheet 375: tên KR dài xuống dòng, số «40 / 100» dưới tên. Ảnh chấm điểm chỉ thấy hàng mục tiêu đầu («Mở rộng tệp đối tác bán lẻ miền Bắc», «Điểm 0,85» dưới tên) vì khung chụp chỉ bằng viewport; hàng KR nằm dưới vạch gập, chỉ dòng DUNG ở trên chứng chúng.
  network_observed: n-a (driver)

- eval: E14
  run_id: muc-tieu-va-kr-E14-20261003T083116Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_ho_so_cham
  verified_at: 2026-10-03T08:31:16Z
  output: |
    bo ra: khung-tao-okr-nhu-deal/E18 — thuoc chay thuoc: rang/thuoc-cu.mjs tu chay eval cua ba ho so khac
    bo ra: okr-soat-anh-luot-3/E12 — luat pham vi vong: rang/san-thiet-ke.mjs do diff merge-base cua vong do
    bo ra: okr-soat-anh-luot-3/E13 — luat pham vi vong: rang/soi-ma.mjs do dong moi trong diff merge-base cua vong do
    merge-base 9660bf6c · dinh 03861afa6417 · danh sach 41 eval = se chay 41 (qua 22 lenh rieng) + khong chay duoc 0 · bo ra 3
    da chay 41/41 eval
    do san o B (14): toan-canh-okr E2 E3 E14 E23 · hop-thoai-giu-cho-dang-nhap E9 · dat-okr-trong-crm E11 E12 E13 E20 · so-okr-tu-chay E11 E12 E13 · cap-nhat-tuan-okr E18 E29
    tong 41 eval: xanh o HEAD 27 · chap chon 0 · do san o B 14 · hoi quy 0
    khong eval nao do o HEAD ma xanh o 9660bf6c

- eval: E15
  judged_by: ba giám khảo riêng context sạch (domain-correctness, operational-feasibility, spec-alignment), Acceptance Judge v1, chỉ đọc contract.md và bảy ảnh round 10
  verdict: PASS
  rationale: Cả ba giám khảo PASS. Ở cả ảnh sáng lẫn tối, mỗi mục tiêu là hàng đầu của một khung riêng mang % (75/33 ở Của tôi; 75/24/48 ở Theo đơn vị; 35 ở sheet) kèm «Tính từ N KR», các KR1…KRn nằm gọn trong khung, giữa các khung có khoảng trống nên không KR nào lửng giữa hai mục tiêu; số KR khớp «3 mục tiêu · 5 KR»; so với E16-hien-tai (tiêu đề ngoài khung, không có %) liên kết rõ hơn hẳn. Ghi chú không đổi phán quyết: ở theme tối nền hàng mục tiêu gần nền hàng KR, nhóm tách nhờ khung và khoảng cách; chữ «qua KR «…»» ở khu Góp vào có thể khiến người mới đọc hai lần.
  human_override:

- eval: E16
  run_id: muc-tieu-va-kr-E16-20261003T082959Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that
  verified_at: 2026-10-03T08:29:59Z
  output: |
    DUNG E16 theo-don-vi sang: don vi co 3 muc tieu (>= 3)
    DUNG E16 theo-don-vi: sha256 sang 9cc017e809c24d18… != toi 5450a65c46cb263c…
    DUNG E16 sheet mau-okr-mt-q4-kd-bac-1 sang: [data-khu=vi-sao] hien trong anh
    DUNG E16 sheet mau-okr-mt-q4-kd-bac-1 toi: [data-khu=gop-vao] hien trong anh
    DUNG E16 sheet: sha256 sang 95fe221cc6f9cf84… != toi 47816caa5da3842f…
    DUNG E16 hien-tai: _acceptance/muc-tieu-va-kr/evidence/E16-hien-tai.png 114 KB > 10 KB
    KET LUAN: 86 DUNG, 0 SAI — ma thoat 0
  screenshot: evidence/E16-1440-theo-don-vi-sang.png
  observed: |
    Theo đơn vị (Pháp chế, sáng/tối): ba khung mục tiêu (75%, 24%, 48%), mỗi khung có hàng mục tiêu rồi KR1…KRn, không có hàng tiêu đề cột nhìn thấy. Sheet sáng/tối: «VÌ SAO LÚC NÀY», «GÓP VÀO» (… qua KR «Doanh thu hợp đồng mới đạt 48 tỷ đồng»), bảng KR1–KR3 có ô tiến độ gộp, «Tiến độ mục tiêu 35% tính từ 3 KR.», nút Thêm KR.
    E16-hien-tai: bố cục cũ, tiêu đề mục tiêu nằm ngoài bảng và còn cột «Đích». Cặp sáng/tối khác nhau rõ về nền.
  network_observed: n-a (driver)

- eval: E17
  run_id: muc-tieu-va-kr-E17-20261003T081834Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mtkr_trang_thai_cu
  verified_at: 2026-10-03T08:18:34Z
  output: |
    trang-thai: 16 id tu docs/superpowers/specs/2026-10-02-muc-tieu-va-kr-design.md
    giao E13: ST-mtkr-hep
    trang-thai da so: ST-cuatoi-rong
    trang-thai da so: ST-donvi-dangtai
    trang-thai da so: ST-donvi-loi
    trang-thai da so: ST-donvi-chuakychay
     17 pass
     0 fail

- eval: E18
  run_id: design-gate-23fb210b4e
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_san_thiet_ke
  verified_at: 2026-10-03T08:18:36Z
  output: |
    simple-table.tsx verdict PASS p0_count 0 (run design-gate-23fb210b4e)
    bang-muc-tieu.tsx verdict PASS p0_count 0
    khoi-muc-tieu.tsx verdict PASS p0_count 0
    bang-kr.tsx verdict PASS p0_count 0
    tien-do-kr.tsx verdict PASS p0_count 0
    cham-diem.tsx verdict PASS p0_count 0
    objective-sheet.tsx verdict PASS p0_count 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: muc-tieu-va-kr-SUITE-test-api-20261003T081846Z
  exit_code: 0
  verified_at: 2026-10-03T08:18:46Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: muc-tieu-va-kr-SUITE-test-app-ui-20261003T082159Z
  exit_code: 0
  verified_at: 2026-10-03T08:21:59Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: muc-tieu-va-kr-SUITE-test-agent-auth-db-20261003T082439Z
  exit_code: 0
  verified_at: 2026-10-03T08:24:39Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: muc-tieu-va-kr-SUITE-test-agent-okr-env-ai-tele-val-20261003T082749Z
  exit_code: 0
  verified_at: 2026-10-03T08:27:49Z

- cmd: bunx turbo run lint --force
  run_id: muc-tieu-va-kr-SUITE-lint-20261003T082859Z
  exit_code: 0
  verified_at: 2026-10-03T08:28:59Z

- cmd: bun run lint:slop
  run_id: muc-tieu-va-kr-SUITE-lint-slop-20261003T082908Z
  exit_code: 0
  verified_at: 2026-10-03T08:29:08Z

- cmd: bunx turbo run build --force
  run_id: muc-tieu-va-kr-SUITE-build-20261003T082914Z
  exit_code: 0
  verified_at: 2026-10-03T08:29:14Z

## Known limits

- AC-11 (E14) không chứng được cho 14 eval của danh sách viết sẵn vì chúng đỏ cả ở merge-base 9660bf6c: toan-canh-okr E2 E3 E14 E23, hop-thoai-giu-cho-dang-nhap E9, dat-okr-trong-crm E11 E12 E13 E20, so-okr-tu-chay E11 E12 E13, cap-nhat-tuan-okr E18 E29 — đúng danh sách Known limits của hợp đồng, xử ở đợt ghim lại theo mốc.
- AC-11 không đo, có tên trong hợp đồng (Out of scope, Notes): phần cộng theo glob paths của mọi hồ sơ đã ký, eval tự chạy eval khác (khung-tao-okr-nhu-deal/E18 và các bản ho-so-cham, khong-hoi-quy, repin-lane), luật phạm vi diff/commit của vòng khác (okr-soat-anh-luot-3 E12 E13 và các eval cùng loại).
- ux-lai-thu-8c-okr/E15 (một phép đo màn của hồ sơ khác trong E14) đỏ hai lần ở round 6 khi máy tải nặng; chạy riêng trên máy yên xanh 131/0; round 7–10 E14 chạy sau khi máy hết tải và xanh.
- Ảnh chấm điểm 375 px chỉ chụp theo viewport nên chỉ thấy hàng mục tiêu đầu; hàng KR dưới vạch gập được chứng bằng dòng DUNG trong log, không bằng ảnh.
- Tệp evidence/E1-network.txt, E5-network.txt, E16-network.txt và E5-step1.png là đồ của lượt cũ, round 10 không sinh lại và báo cáo không dẫn chúng; network_observed của ui-check là n-a (driver).
- Một số bài DOM in cảnh báo React «not wrapped in act(...)» (E2, E7, E8, E12, E17) nhưng không làm đỏ.

## Ngoài hợp đồng

13 mục, chi tiết và đề xuất từng mục ở review-findings.md (mục mang nhãn «(r<N>)» là phát hiện của round trước, round 10 chấm tuần tự không có bên soát nên được mang lên): nút số KR trên điện thoại mất móc data-so-kr (cao, hồi quy thật của móc mà AC-11 hứa giữ); tên KR ở khu Góp vào thiếu translate="no"; câu tiếng Anh «from 1 KRs»; NhipGon chép PaceIndicator; AN_DUOI_MD khai hai nơi; proto đặt màu hàng bằng className; thu/mở xoá trạng thái thu của mục tiêu bị lọc ẩn; ô tiến độ đầu sheet 375 px «lẽ ra …» bị cắt chữ; bốn điểm yếu của thước (E14 thiếu the-gop-y-okr, bộ đếm M tự quy chiếu, lỗi môi trường thoát 1, E13 cuộn dọc không có chiều đỏ) và chiều đỏ E1 đỏ vì thiếu móc.

## Analyst

Baseline không đo lại ở round này; trường baseline của từng khối ghi n-a. Mang từ round 5: E10 xanh cả ở nhánh lẫn baseline (không phân biệt) — cần viết lại để khẳng định hành vi mới, hoặc xác nhận đó là chốt chống hồi quy có chủ ý.

## Variance

none — mọi eval chạy một lần, không eval nào có pass_rate hỗn hợp.

## Iterations

Round 1–4: trước khi thu hẹp AC-11; E14 chiếm ~9,6 giờ máy và không ra hồi quy sản phẩm nào.
Round 5 (sau Cổng Phạm vi duyệt lại 03/10): BLOCKED/REJECT vì ca api nguon-khoa cũ.
Round 6: REJECT vì ux-lai-thu-8c-okr/E15 đỏ dưới tải.
Round 7–9: BLOCKED vì agent chết. Nhánh đã gộp onehub 9660bf6c có bản vá nguon-khoa.
Round 10: mọi eval máy và ui-check xanh, bảy suite xanh lần đầu, E14 hoi quy 0 (14 eval đỏ sẵn ở merge-base đúng danh sách Known limits của hợp đồng); E15 chưa chấm → PENDING-JUDGMENT.

### Re-pin lần 1 — 2026-10-17, do ve-sinh-do-san-onehub: sửa gốc đỏ sẵn onehub (hydration record=, 403, moi-chuoi, neo F8, E16) + thước DH1/DH3 trên onehub 21b709411
run_id: repin-20261017T062808Z-56916
sha: 38ba7b5e8cdb6e285227092dfd7afb9ec9fcda2c · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E1, E5, E13, E15, E16 · diff chạm vật đo ngoài làn máy: E1, E5, E13, E15, E16 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10, AC-12 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-17, do ve-sinh-do-san-onehub: ghim lại bảy hồ sơ sau gộp onehub 9dfdf0628 (#459, #462, #463, #465) trước khi đẩy
run_id: repin-20261017T113609Z-76485
sha: 91b4e246850c022b600b63901a2666a3aac8428e · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E1, E5, E13, E15, E16 · diff chạm vật đo ngoài làn máy: E16 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10, AC-12 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
