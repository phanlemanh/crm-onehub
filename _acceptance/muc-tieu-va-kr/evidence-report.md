---
schema_version: 2
feature_slug: muc-tieu-va-kr
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e1c9c063282e5c0aa29adc99c371ad9fb1be340f
human_signoff:
---

# Evidence Report: muc-tieu-va-kr

Round 5. Lệnh suite `bun run test` đỏ và không gắn eval nào: gói api#test có 1 ca đỏ (nguon-khoa > "moi ket qua kiem ra dung nguonKhoa, bang rut tu KET_QUA_KIEM_SAN_SANG"), 1403 ca xanh, 3 ca bỏ qua. Mọi eval máy khai báo của hợp đồng đều xanh; E15 (judgment) chờ người chốt.

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
| E15 | AC-12 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |
| E16 | AC-12 | ui-check | PASS |
| E17 | AC-13 | test | PASS |
| E18 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: s4-man (mot-luot.sh, EXIT 0, KET LUAN: 86 DUNG, 0 SAI)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that
  verified_at: 2026-10-02T23:13:27Z
  output: |
    Frames da luu: evidence/E1-1440-sang.png va evidence/E1-1440-toi.png.
    Chua kiem trong luot nay: chieu do ghim --kiem-do-do (khong thuoc lenh eval).
  screenshot: evidence/E1-1440-sang.png
  observed: |
    Đã mở E1-1440-sang.png và E1-1440-toi.png: /okr 1440 px, mỗi mục tiêu là một bảng liền mạch (hàng mục tiêu rồi các hàng KR trong cùng khung). Khối 1: 75%, «Tính từ 2 KR», có vạch kỳ vọng, KR1 49% và KR2 100%; khối 2: 33%, nhãn «Chưa có kỳ vọng», không vạch, KR 40% và 25%, tên KR 120 ký tự không tràn. Không có card-header trong vùng danh sách; bản tối cùng bố cục và số liệu.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-muc-tieu-va-kr-E2-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mtkr_bang_co_du_lieu
  verified_at: 2026-10-02T23:13:27Z
  output: |
    Ran 3 tests across 1 file. [1122.00ms]
    __EXIT=0

- eval: E3
  run_id: minted-muc-tieu-va-kr-E3-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mtkr_theo_don_vi
  verified_at: 2026-10-02T23:13:27Z
  output: |
    Ran 1 test across 1 file. [1075.00ms]
    __EXIT=0

- eval: E4
  run_id: minted-muc-tieu-va-kr-E4-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mtkr_thu_mo
  verified_at: 2026-10-02T23:13:27Z
  output: |
    Ran 6 tests across 1 file. [1363.00ms]
    __EXIT=0

- eval: E5
  run_id: s4-man (luot chung E1/E5/E13/E16, phien-do app :4836 api :4768, kho crm_muc_tieu_va_kr_do)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that
  verified_at: 2026-10-02T23:13:27Z
  output: |
    Luot chung xong: KET LUAN: 86 DUNG, 0 SAI. Moi dong assertion E5 DUNG (thu, aria-expanded, thuMucTieu trong URL, reload, mo lai, reduced-motion 0s).
    Chieu do ghim --kiem-do-do da chay rieng: 4/4 thong diep ghim do dung.
  screenshot: evidence/E5-da-thu.png
  observed: |
    Đã mở E5-da-thu.png (1440 px, OKR của tôi, sau khi bấm): mục tiêu đầu «Khối Kinh doanh về đích doanh thu quý 4» (75%) đang thu gọn, mũi tên chỉ sang phải, không còn hàng KR nào dưới nó; mục tiêu thứ hai (33%) vẫn mở với KR1 và KR2. Các giá trị aria-expanded, location.search, reload, mở lại và reduced-motion đọc từ log, không có ảnh.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-muc-tieu-va-kr-E6-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mtkr_o_tien_do
  verified_at: 2026-10-02T23:13:27Z
  output: |
    Ran 4 tests across 1 file. [1011.00ms]
    __EXIT=0

- eval: E7
  run_id: minted-muc-tieu-va-kr-E7-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mtkr_chua_co_kr
  verified_at: 2026-10-02T23:13:27Z
  output: |
    Ran 1 test across 1 file. [1095.00ms]
    __EXIT=0

- eval: E8
  run_id: minted-muc-tieu-va-kr-E8-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mtkr_sheet
  verified_at: 2026-10-02T23:13:27Z
  output: |
    Ran 4 tests across 1 file. [1.51s]
    __EXIT=0

- eval: E9
  run_id: minted-muc-tieu-va-kr-E9-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mtkr_cham
  verified_at: 2026-10-02T23:13:27Z
  output: |
    (lenh khong in dong tom tat)
    __EXIT=0

- eval: E10
  run_id: minted-muc-tieu-va-kr-E10-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.mtkr_hang_ui
  verified_at: 2026-10-02T23:13:27Z
  output: |
    Ran 10 tests across 3 files. [899.00ms]
    __EXIT=0

- eval: E11
  run_id: minted-muc-tieu-va-kr-E11-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mtkr_khong_ve_tay
  verified_at: 2026-10-02T23:13:27Z
  output: |
    tep da quet: 55, SimpleTableRow da quet: 17
    __EXIT=0

- eval: E12
  run_id: minted-muc-tieu-va-kr-E12-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mtkr_diem_cam
  verified_at: 2026-10-02T23:13:27Z
  output: |
    (lenh khong in dong tom tat)
    __EXIT=0

- eval: E13
  run_id: s4-man (lượt đo chung E1/E5/E13/E16, phiên đo kho crm_muc_tieu_va_kr_do, app :4836, api :4768)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that
  verified_at: 2026-10-02T23:13:27Z
  output: |
    KET LUAN: 86 DUNG, 0 SAI. scrollWidth == innerWidth 375 o 8/8 phep do (4 man x sang/toi).
    So hang do: cua-toi 2 mục tiêu · 4 KR, theo-don-vi 12 · 25, sheet 1 · 2, cham 4 · 9; 0 bảng cuộn ngang/dọc; 0 chữ tên vượt mép phải.
  screenshot: evidence/E13-375-cua-toi-sang.png
  observed: |
    Đã mở cả 8 ảnh E13-375-* (4 màn × sáng/tối): khung 375 px, không cuộn ngang, chữ không tràn mép phải. Mỗi hàng mục tiêu/KR có thanh tiến độ hoặc ô điểm cùng ô với tên; ở sheet, tên KR 120 ký tự không dấu cách bị bẻ nhiều dòng trong khung (scrollWidth sheet 375 = clientWidth 375); chấm điểm hiện «Đã chấm cả 9 KR của đơn vị». Ảnh chấm điểm/sheet chỉ chụp phần đầu khung nhìn; hàng dưới màn hình dựa vào số đo DOM trong log. Chiều đỏ ghim không chạy ở lượt này.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-muc-tieu-va-kr-E14-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mtkr_ho_so_cham
  verified_at: 2026-10-02T23:13:27Z
  output: |
    khong eval nao do o HEAD ma xanh o 923f5717
    __EXIT=0

- eval: E15
  judged_by: judge panel (3 lens, fresh context) — đề xuất, không phải chữ ký
  verdict: PASS
  rationale: Cả ba lens thấy ở ba màn và hai theme mỗi mục tiêu là một khối riêng, KR thụt vào ngay dưới, % mục tiêu khớp trung bình KR; không KR nào nằm lửng giữa hai mục tiêu.
  human_override:  # chi nguoi ghi

- eval: E16
  run_id: s4-man (lượt dùng chung E1/E5/E13/E16, log .acceptance-runs/muc-tieu-va-kr/s4-man.log)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_man_that
  verified_at: 2026-10-02T23:13:27Z
  output: |
    KET LUAN: 86 DUNG, 0 SAI. Chieu do ghim --kiem-do-do (in 'thieu khu vi-sao trong anh') chua chay lai trong luot nay.
  screenshot: evidence/E16-1440-theo-don-vi-sang.png
  observed: |
    Đã mở cả năm ảnh. Theo-don-vi sáng/tối: «3 mục tiêu · 5 KR», ba khối bảng, mỗi KR nằm trong khối mục tiêu của nó (75%, 24%, 48%). Sheet sáng/tối: có «VÌ SAO LÚC NÀY» và «GÓP VÀO», bảng 3 KR, dòng «Tiến độ mục tiêu 35% tính từ 3 KR». E16-hien-tai.png: bản cũ, bảng KR phẳng, tên mục tiêu là tiêu đề rời, không có % mục tiêu. Khớp expected.
  network_observed: n-a (driver)

- eval: E17
  run_id: minted-muc-tieu-va-kr-E17-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mtkr_trang_thai_cu
  verified_at: 2026-10-02T23:13:27Z
  output: |
    (lenh khong in dong tom tat)
    __EXIT=0

- eval: E18
  run_id: minted-muc-tieu-va-kr-E18-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtkr_san_thiet_ke
  verified_at: 2026-10-02T23:13:27Z
  output: |
    design-gate --mode static dat tren 7 tep da doi
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-muc-tieu-va-kr-SUITE-bun_run_test-r5
  exit_code: 1
  verified_at: 2026-10-02T23:13:27Z

- cmd: bunx turbo run lint --force
  run_id: minted-muc-tieu-va-kr-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-10-02T23:13:27Z

- cmd: bun run lint:slop
  run_id: minted-muc-tieu-va-kr-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-10-02T23:13:27Z

- cmd: bunx turbo run build --force
  run_id: minted-muc-tieu-va-kr-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-10-02T23:13:27Z

## Known limits

## Ngoài hợp đồng

## Analyst

E10 (cd packages/ui && bun test ... simple-table-hang.dom.tsx simple-table-hang-phu.dom.tsx luoi-va-khong-dich.dom.tsx): xanh trên cả HEAD lẫn baseline, không phân biệt được bằng chạy máy. Cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Judge panels

E15 (đề xuất: PASS; human_override để TRỐNG cho người chốt ở Cổng 2):
- domain-correctness: PASS — Ở cả ba màn và hai theme, mỗi mục tiêu là một thẻ riêng, KR1..KRn thụt vào ngay dưới trong cùng khung; tiến độ mục tiêu khớp trung bình KR (75%, 33%, 24%, 35%); sheet có dòng «Tiến độ mục tiêu 35% tính từ 3 KR». Lưu ý phụ: với KR kiểu «Phần trăm · từ X%» chỉ riêng ảnh không cho biết công thức tính tiến độ.
- operational-feasibility: PASS — Ở 6 ảnh sáng và tối, mỗi mục tiêu là hàng cha trong cùng một khung viền với KR thụt vào ngay dưới; tiến độ khớp phép tính từ KR (75%, 33%, 24%, sheet 35% lẽ ra 44%); so với bản cũ, liên kết mục tiêu–KR rõ hơn hẳn.
- spec-alignment: PASS — Mỗi mục tiêu là một khối có viền, hàng đầu mang tên, nhãn và «Tính từ N KR», KR nằm trong cùng khối; các khối cách nhau bằng khoảng trống nên không KR nào trông như thuộc mục tiêu khác; bản cũ không hiện tiến độ mục tiêu.

## Iterations

Round 5: 17 eval máy xanh, E15 chờ người; REJECT vì lệnh suite `bun run test` đỏ (api#test, 1 ca nguon-khoa) không gắn eval nào. Các round trước xem run-log.jsonl.
