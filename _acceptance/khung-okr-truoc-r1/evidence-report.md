---
schema_version: 2
feature_slug: khung-okr-truoc-r1
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c5c66a2708ab112ccefd2acdb04cbb4ffce9c48e
human_signoff:
---

# Evidence Report: khung-okr-truoc-r1

Vòng 1. Verdict REJECT do một lệnh suite hồi quy đỏ và lệnh đó không gắn eval nào: `bun run test -- --filter=app --filter=@crm/ui` (mã thoát 1). Cả 17 eval máy (E1 đến E15, E17, E18) đều xanh, và E16 (judgment) được hội đồng đề xuất PASS. Chi tiết lệnh đỏ ở mục «Lệnh suite (hồi quy)» và Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | ui-check | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | ui-check | PASS |
| E9 | AC-8 | ui-check | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-10 | ui-check | PASS |
| E13 | AC-11 | ui-check | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-13 | ui-check | PASS |
| E16 | AC-14 | judgment | PASS |
| E17 | AC-10 | script | PASS |
| E18 | AC-4 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: r1a-E1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1a_man_khung
  verified_at: 2026-10-04T07:20:19Z
  screenshot: evidence/E1-kr-1440.png
  observed: |
    Đã mở cả 9 ảnh. Ở 1440, 390 và 375, khung bảng (KR, Căn chỉnh, Vết) cách mép khung đều hai bên khoảng 20 px và thẳng hàng với chữ «VÌ SAO LÚC NÀY» cùng tiêu đề. Bảng Vết ở điện thoại cuộn ngang bên trong khung nhưng không tràn ra ngoài ngăn kéo. Không frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)
  output: |
    Chiều xanh (--phan le): in 'le ok' cho 9 ô và 'so o: 9'.
    Chiều đỏ ghim (--kiem-do-do): in 'bang cham mep: kr 1440 (trai=0 phai=0 viSao=20)' và 'so o: 1', phien-do báo mã 1 đúng ý đồ.
    Ảnh do chính lệnh eval ghi vào evidence/ (E1-kr, E1-can-chinh, E1-vet cho 1440, 390, 375).

- eval: E2
  run_id: minted-khung-okr-truoc-r1-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1a_nut_soan
  verified_at: 2026-10-04T07:20:19Z
  output: |
    Ran 2 tests across 1 file. [1406.00ms]
    __EXIT=0

- eval: E3
  run_id: r1a-e3-main
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1a_man_thanh
  verified_at: 2026-10-04T07:20:19Z
  screenshot: evidence/E3-mo-duoc-truoc-tra.png
  observed: |
    Đã mở 8 ảnh (mo-duoc, tiep, che-do-an, het-cuoc, chua-cau-hinh). Ở mọi dạng, hàng nút «Danh sách, Cây căn chỉnh, Họp tuần, Lọc, Nhập từ bảng tính» cộng nhóm «Soạn OKR cùng Trợ lý» (và nút «i» khi đã có dữ liệu) nằm trên MỘT hàng ở y≈278. Nút soạn mờ ở mốc trước-trả rồi bật hoặc đổi chữ ở mốc sau-trả, khối trống bên dưới không dời.
  network_observed: n-a (driver)
  output: |
    Hai lượt phiên đo qua mot-luot.sh, mỗi lượt 'phien-do: xong — mã 0'.
    Lượt một: 'thanh ok chua-cau-hinh hang=1 lech=0', 'so dang: 1'.
    Lượt hai: 'dang tai da bat: mo-duoc' rồi 'thanh ok' hang=1 lech=0 cho mo-duoc, tiep, che-do-an, het-cuoc; 'so dang: 4'.
    Không có dòng 'thanh nhay' hay 'khong bat duoc dang tai' ở lượt thường. Chiều đỏ --kiem-do-do và --tat-chan KHÔNG chạy lại trong vòng này, chỉ đọc ghi chép cũ ở rang/do-do-man.txt nên chiều đỏ chưa được xác nhận độc lập.

- eval: E4
  run_id: minted-khung-okr-truoc-r1-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1a_popover_soan
  verified_at: 2026-10-04T07:20:19Z
  output: |
    Ran 1 test across 1 file. [1.57s]
    __EXIT=0

- eval: E5
  run_id: minted-khung-okr-truoc-r1-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1a_chua_cau_hinh
  verified_at: 2026-10-04T07:20:19Z
  output: |
    Ran 1 test across 1 file. [1037.00ms]
    __EXIT=0

- eval: E6
  run_id: minted-khung-okr-truoc-r1-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1a_tab_khung
  verified_at: 2026-10-04T07:20:19Z
  output: |
    Lệnh -t tab-khung kết thúc sạch (không có dòng lỗi), cuối log chỉ có dòng mã thoát 0.
    __EXIT=0

- eval: E7
  run_id: minted-khung-okr-truoc-r1-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1a_so_it
  verified_at: 2026-10-04T07:20:19Z
  output: |
    Ran 1 test across 1 file. [1120.00ms]
    __EXIT=0

- eval: E8
  run_id: r1a-e8-xanh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1a_man_khung_dt
  verified_at: 2026-10-04T07:20:19Z
  screenshot: evidence/E8-muc-tieu-dau-375.png
  observed: |
    Đã mở cả 6 ảnh. Khung Mục tiêu: ở đầu thì tên căn trái cạnh avatar GB, ba ô thống kê hiện trọn, thanh tab bên dưới; sau cuộn 400 px thì tên đã ra khỏi khung nhìn và thanh tab dính sát đỉnh vùng cuộn. Khung thoả thuận: tiêu đề, hàng thống kê và thanh tab đứng yên, chỉ thân tab cuộn. Ba ảnh 390 giống 375. Ngoài tiêu chí: tên thoả thuận «Stripe — Comp AI» bị ngắt 4 dòng hẹp.
  network_observed: n-a (driver)
  output: |
    Lệnh xanh in 'dien thoai ok 375' và 'dien thoai ok 390'. Ảnh do chính lệnh ghi lúc 14:40.
    Chiều đỏ ghim (--kiem-do-do, dòng 'tab khong dinh' và mã 1) KHÔNG chạy lại vì sẽ ghi đè ảnh bằng chứng; chiều đỏ chưa được xác nhận độc lập trong vòng này.

- eval: E9
  run_id: r1a-e9-20261004
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1a_man_khung_dt
  verified_at: 2026-10-04T07:20:19Z
  screenshot: evidence/E9-o-so-375.png
  observed: |
    Đã mở E9-o-so-375 và 390. Ô Tiến độ hiện «35% · lẽ ra 46%» đủ chữ và số kỳ vọng, không bị cắt. Ô Phụ trách hiện đủ «Nguyễn Thị Phương Thảo Hoàng», xuống năm dòng sau avatar NH, không có dấu «…». Tên Mục tiêu căn trái. Hai ảnh khớp Expected.
  network_observed: n-a (driver)
  output: |
    Chiều xanh in 'o so ok 375' và 'o so ok 390'.
    Chiều đỏ --kiem-do-do in 'o so bi cat: phu-trach 375' và 'o so bi cat: phu-trach 390', mã 1 đúng ý đồ.
    Chiều đỏ --kiem-do-doc in 'o so bi cat doc: phu-trach 375' và 'o so bi cat doc: phu-trach 390', mã 1 đúng ý đồ.
    Ảnh lưu là của lượt xanh cuối (hai lượt đỏ đã ghi đè rồi bị lượt xanh ghi lại).

- eval: E10
  run_id: r1a-e10-xanh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1a_man_khung_dt
  verified_at: 2026-10-04T07:20:19Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở cả 4 ảnh. Ở Mục tiêu 375 và 390, avatar «GB» nằm trái và tên căn trái ngay cạnh, khoảng cách nhỏ. Ở thoả thuận 375 và 390, logo vuông tím ở trái và tên căn trái sát logo (gãy dòng hẹp do cột chật). Không khung nào có tên căn giữa.
  network_observed: n-a (driver)
  output: |
    Chiều xanh in 'can trai ok' cho 5 ô viết trước.
    Chiều đỏ --kiem-do-do in 'ten can giua: muc-tieu 375', mã 1 đúng ý đồ (số textAlign và khoảng cách lấy từ output lệnh).
    Ảnh E10-step1..4 chép từ ảnh lượt xanh; E10-network.txt là log hai lượt.

- eval: E11
  run_id: minted-khung-okr-truoc-r1-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1a_chip
  verified_at: 2026-10-04T07:20:19Z
  output: |
    Ran 1 test across 1 file. [1340.00ms]
    __EXIT=0

- eval: E12
  run_id: r1a-E12-20261004-1454
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1a_man_chip
  verified_at: 2026-10-04T07:20:19Z
  screenshot: evidence/E12-cua-toi.png
  observed: |
    Đã mở E12-cua-toi và E12-theo-don-vi (1440×1000). Mục tiêu A có hàng nhãn «Cam kết», «Đã công bố» và chip «Kara · 3 góp ý» cùng một hàng, chip cao bằng nhãn và bo cùng kiểu, đang có vòng focus xanh lục. Mục tiêu B không có chip. Không tràn ngang. Chip hiện «3 góp ý» trong khi bước seed nói 2 dòng chờ; Expected không khẳng định con số nên không tính là mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    Chiều xanh in 'chip ok' cho từng màn; không có dòng lỗi nào trong log.
    Chiều đỏ --kiem-do-do (dòng 'chip lech nhan: cua-toi' và mã 1) KHÔNG chạy lại trong vòng này; chỉ có ghi chép cũ ở rang/do-do-man.txt, nên chiều đỏ chưa được xác nhận độc lập.
    Ảnh hover không có (script đo màu nền hover bằng số, không chụp).

- eval: E13
  run_id: r1a-e13-main
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1a_man_chip
  verified_at: 2026-10-04T07:20:19Z
  screenshot: evidence/E13-theo-don-vi-1440.png
  observed: |
    Đã mở 4 ảnh. Ở 1440, nhãn «Cam kết», «Đã công bố» và chip «Kara · 3 góp ý» nằm cùng một hàng, chip ở cuối nhóm nhãn. Ở 375, nhãn một hàng và chip xuống hàng kế bên trong nhóm, căn trái cùng mép nhãn, cùng độ lệch dọc ở hai màn (script in 'cung cho ok 375'). Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Chiều xanh in 'cung hang ok' cho đủ 4 ô, 'cung cho ok 375' và 'so o: 4'.
    Chiều đỏ --kiem-do-do in 'chip rot dong: cua-toi 1440' và 'chip rot dong: theo-don-vi 1440', mã 1 đúng ý đồ.
    Lượt đỏ ghi đè ảnh 1440; ảnh xanh đã được khôi phục từ bản chép trước đó (so byte khớp).

- eval: E14
  run_id: minted-khung-okr-truoc-r1-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1a_lien_ket_cheo
  verified_at: 2026-10-04T07:20:19Z
  output: |
    Ran 1 test across 1 file. [1.79s]
    __EXIT=0

- eval: E15
  run_id: r1a-E15-main (log /tmp/r1a-E15-main.log); chieu do: /tmp/r1a-E15-do.log, /tmp/r1a-E15-vai.log
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1a_man_bon_vai
  verified_at: 2026-10-04T07:20:19Z
  screenshot: evidence/E15-step3-quan-tri.png
  observed: |
    E15-step3-quan-tri (1440, sáng, Theo đơn vị): hàng nút có «Soạn OKR cùng Trợ lý» ở trạng thái mờ (disabled) kèm biểu tượng thông tin. E15-step3-nhân-viên: hàng nút chỉ còn Danh sách, Cây căn chỉnh, Họp tuần, Lọc, không có nút soạn và không có chữ «chưa cấu hình». Không tràn ngang ở cả hai ảnh.
  network_observed: n-a (driver)
  output: |
    Chiều xanh: 'so o: 72' và 'vai soan ok' cho 4 vai.
    Chiều đỏ --kiem-do-do in 'tran ngang: quan-tri khung 375 sang' và 'so o: 1', mã 1 đúng ý đồ.
    Chiều đỏ --kiem-do-vai in 'nguoi thuong thay nut: truong-phong', mã 1 đúng ý đồ; ba vai còn lại vẫn in 'vai soan ok'.
    Bước 72 ô chỉ chụp khi ô lỗi nên không có ảnh. Lượt đỏ của vai ghi đè E18-truong-phong.png nên ảnh đó không dùng làm bằng chứng xanh.

- eval: E16
  judged_by: judge panel (3 lens, fresh context)
  verdict: PASS
  rationale: Cả ba góc nhìn cùng đối chiếu ảnh trước/sau và thấy ba lỗi nhìn thấy được đã được sửa; đây là đề xuất của máy, chưa phải chữ ký người.
  human_override:  # chi nguoi ghi
  votes:
    - domain-correctness: PASS — (1) Bảng KR trước lệch mép, sau (E1-kr-1440.png) thẳng hàng với «VÌ SAO LÚC NÀY» và cách mép phải 20px. (2) Trước cắt «35% · lẽ ra 4…» và «Nguyễ…», sau (E8, E9) hiện trọn, tên Mục tiêu căn trái cạnh avatar «GB». (3) Thanh nút trước chia ba hàng, sau (E3-chua-cau-hinh-sau-tra.png) một hàng ở y≈278.
    - operational-feasibility: PASS — (1) Bảng KR trước bắt đầu đúng mép khung, sau thẳng hàng chữ và còn lề phải ~20px. (2) E8-muc-tieu-dau-375.png và E9 đọc trọn số «lẽ ra 46%» và tên đầy đủ (xuống bốn dòng), tên Mục tiêu căn trái. (3) Chín nút gồm cả «Soạn OKR» và biểu tượng thông tin nằm trên một hàng.
    - spec-alignment: PASS — (1) Bảng KR sau thụt vào ngang chữ «Vì sao lúc này», cách mép trái và phải khoảng 20px. (2) Trên điện thoại sau sửa, số và tên hiện đủ (tên xuống năm dòng, xấu nhưng đọc trọn), tên Mục tiêu căn trái. (3) Thanh nút trước vỡ thành bốn dòng, sau còn một hàng.

- eval: E17
  run_id: design-gate
  exit_code: 0
  baseline: green
  verifier: config:executors.script.r1a_san_thiet_ke
  verified_at: 2026-10-04T07:20:19Z
  output: |
    design-gate --mode static chạy lần lượt trên tám tệp: detail-sheet.tsx, objective-sheet.tsx, objective-hien-thi.tsx, record-parts.tsx, chip-gop-y.tsx, khoi-muc-tieu.tsx, soan/nut-soan.tsx, theo-don-vi/theo-don-vi.tsx.
    Không tệp nào có P0.
    __EXIT=0

- eval: E18
  run_id: r1a-e18-xanh.log / r1a-e18-do.log
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1a_man_bon_vai
  verified_at: 2026-10-04T07:20:19Z
  screenshot: evidence/E18-quan-tri.png
  observed: |
    Đã mở 4 ảnh (1440 px, sáng). Quản trị (Kinh doanh miền Bắc): hàng nút có «Soạn OKR cùng Trợ lý» mờ kèm biểu tượng thông tin. Nhân viên và chỉ OKR: không có nhóm soạn và không có câu «chưa cấu hình». Ảnh trưởng phòng là của lượt đỏ (có nút «x» chèn tay), không phải bằng chứng xanh của vai đó.
  network_observed: n-a (driver)
  output: |
    Chiều xanh: 'vai soan ok' cho quan-tri, truong-phong, nhan-vien, chi-okr.
    Chiều đỏ --kiem-do-vai in 'nguoi thuong thay nut: truong-phong', mã 1 đúng ý đồ; ba vai còn lại vẫn in 'vai soan ok'.
    Do lượt đỏ chạy sau lượt xanh và ghi đè cùng tên tệp, bằng chứng xanh của trưởng phòng chỉ còn ở log.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-okr-truoc-r1-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-04T07:20:19Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-okr-truoc-r1-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-04T07:20:19Z

Lệnh suite đỏ nói trên không gắn eval nào. Đuôi log: tệp `apps/app/test/soan-okr-song-lai.dom.tsx` có 19 ca đỏ trên 37 ca; ca `nut-chua-cau-hinh — so cuoc: k=3` báo «so cuoc tren nut lech: 3», mong «3/3 cuộc», nhận null (dòng 126). Turbo báo app#test là tác vụ lỗi duy nhất, ba tác vụ còn lại xanh. Khớp với việc vòng này chuyển nút «N/3 cuộc» vào popover (AC-3) mà bài kiểm cũ vẫn tìm nó ngay trên nút.

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-okr-truoc-r1-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-04T07:20:19Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-okr-truoc-r1-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-04T07:20:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-okr-truoc-r1-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-04T07:20:19Z

- cmd: bun run lint:slop
  run_id: minted-khung-okr-truoc-r1-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-04T07:20:19Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-okr-truoc-r1-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-04T07:20:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

E17: design-gate xanh trên cả nhánh lẫn baseline, tức nó không phân biệt tính năng mà chỉ chặn P0 của tám tệp giao diện đã chạm. Cần người xác nhận đây là regression-guard có chủ ý hay viết lại để khẳng định điều mới (chip đi qua biến thể của Badge).

Các eval ui-check khác không có baseline chạy được (n-a). Chiều đỏ của E3, E8, E12 không được chạy lại trong vòng này, chỉ đọc ghi chép cũ; E9, E10, E13, E15, E18 có chạy chiều đỏ.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ (không gắn eval nào): soan-okr-song-lai.dom.tsx có 19 ca đỏ vì bài kiểm cũ vẫn đọc «N/3 cuộc» trên nút soạn trong khi thiết kế mới đưa nó vào popover. Toàn bộ eval máy và panel E16 đều xanh. Trả về implementation để cập nhật hoặc đổi chỗ bài kiểm cũ.
