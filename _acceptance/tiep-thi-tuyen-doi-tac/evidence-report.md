---
schema_version: 2
feature_slug: tiep-thi-tuyen-doi-tac
verdict: REJECT
failed_evals: [E21]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1ea2f9b1c08284a4a5aefc6869c82817ea507cad
human_signoff:
---

# Evidence Report: tiep-thi-tuyen-doi-tac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | ui-check | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | ui-check | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-12 | script | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-13 | script | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-14 | judgment | UNCERTAIN |
| E20 | AC-15 | script | PASS |
| E21 | AC-15 | script | FAIL |
| E22 | AC-13 | script | PASS |
| E23 | AC-16 | ui-check | PASS |
| E24 | AC-16 | test | PASS |
| E25 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tiep-thi-tuyen-doi-tac-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E2
  run_id: minted-tiep-thi-tuyen-doi-tac-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E3
  run_id: minted-tiep-thi-tuyen-doi-tac-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E4
  run_id: minted-tiep-thi-tuyen-doi-tac-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E5
  run_id: minted-tiep-thi-tuyen-doi-tac-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E6
  run_id: verE61788544238
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-05T01:15:00+07:00
  screenshot: /private/tmp/claude-503/-Users-manhphan-dev-crm-onehub/a3a4d756-e7e0-4af6-8622-0b817a8cefa3/scratchpad/evidence/E6-step2.png
  observed: |
    Frame 1 (E6-step2.png = evidence/E6-goc-nhin.png): man "Cá nhân" loc theo o tim kiem "RangverE61788544238" (nonce cua luot chay), hien dung 4 dong — Trâm, Diệp, Bảo, Quỳnh — tat ca co cot "Sản lượng" = Cao; chan trang ghi "trong số 4". Khop Expected: bang man hien dung so ket qua loc. Frame 2 (E6-step3.png = evidence/E6-tao.png): hop "Chiến dịch mới" dang mo, o "Tên" = "Chiến dịch verE61788544238", o "Phân khúc" da chon = "Sản lượng cao verE61788544238  4 cá nhân" (vien xanh, da chon), ghi chu "Chỉ hiện góc nhìn cá nhân đang dùng chung" — xac nhan goc nhin da luu dung chung va mang dung 4 ca nhân, khop voi so 4 o frame 1 va voi dong log "E6 THANH VIEN KHOP n=4".
  network_observed: n-a (driver)

- eval: E7
  run_id: minted-tiep-thi-tuyen-doi-tac-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E8
  run_id: minted-tiep-thi-tuyen-doi-tac-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E9
  run_id: ttmtn91ioe
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-05T01:15:00+07:00
  screenshot: /Users/manhphan/dev/crm-onehub/_acceptance/tiep-thi-tuyen-doi-tac/evidence/E9-bat-dau.png
  observed: |
    Frame 1 (E9-bat-dau.png): Trang "Chiến dịch ttmtn91ioe", badge trang thai "Đang chạy" (nut Bat dau da an, chi con "Kết thúc"), khoi "Chiến dịch này": Thành viên=4, Đã gọi=0, Tỷ lệ trả lời="—". Bang 4 dong (Trâm/Diệp/Báo/Quỳnh Rangttmtn91ioe), moi dong co du 5 nut ket qua (Không nghe/Trả lời/Hẹn gặp/Từ chối/Sai số) — khop dung "dem hoat dong Goi TRUOC → n0" va "bam Bat dau" cua buoc 2.
    Frame 2 (E9-ghi.png): Cung trang, sau khi bam "Trả lời" tren dong dau (Trâm): Đã gọi=1, Tỷ lệ trả lời=100%, dong Trâm nay hien mot pill "Trả lời" duy nhat thay cho 5 nut — khop dung "bam ket qua Trả lời tren dong dau" cua buoc 2.
    Frame 3 (E9-dong-thoi-gian.png): Ho so ca nhan "Trâm Rangttmtn91ioe" sau khi TAI LAI TRANG, tab "Hoạt động" (bo dem "Tất cả 1", "Ghi chú 1"): mot dong duy nhat trong nhom "HÔM NAY" doc "Trả lời · Chiến dịch ttmtn91ioe" luc 0:50, tac gia manh.phan — dung 1 hoat dong Goi, ten chua ca "Trả lời" (nhan ket qua) va "ttmtn91ioe" (nonce cua run nay) — khop chinh xac Expected "n1 - n0 = 1 SAU KHI TAI LAI, va muc moi mang ten chien dich cua dung luot nay". Ca ba frame khop hoan toan voi dong log "E9 CALL n0=0 n1=1 nonce=Chiến dịch ttmtn91ioe" ma script in ra.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-tiep-thi-tuyen-doi-tac-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E11
  run_id: minted-tiep-thi-tuyen-doi-tac-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E12
  run_id: minted-tiep-thi-tuyen-doi-tac-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-05T01:15:00+07:00
  screenshot: /Users/manhphan/dev/crm-onehub/_acceptance/tiep-thi-tuyen-doi-tac/evidence/E12-so-do.png
  observed: |
    Doc file E12-so-do.png (frame chinh, chup luc 00:50 5/9/2026, sau 3 luot ghi ket qua tren 2 ca nhan): panel 'Chien dich nay' hien Da goi=2, Ty le tra loi=100% (Tra loi 2), Ty le hen gap=50% (Hen gap 1) — dung bang 'da_goi=2 tra_loi=2 hen=1' ma script in ra, du co 3 luot ghi (dong Tram Rang... bi ghi hai lan: 'Tra loi' roi 'Khong nghe', badge cuoi cung hien 'Khong nghe' — chi dem MOT nguoi, khop dung Expected 'mot nguoi ghi hai lan van dem mot'). Panel 'Moi chien dich khac' (doi chung toan tap) dat CANH panel chien dich, hien Thanh vien='—' (dung dinh dang rong), Da goi=34 — khop dung so 'toan_tap_da_goi=34' script in. Bang thanh vien ben duoi hien 2 badge ket qua: 'Khong nghe' (Tram) va 'Hen gap' (Diep), dung voi 3 lan bam ghi tren 2 dong (dong 0 ghi 2 lan, dong 1 ghi 1 lan). Khong co dau hieu mau thuan Expected trong frame.
  network_observed: n-a (driver)

- eval: E13
  run_id: minted-tiep-thi-tuyen-doi-tac-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E14
  run_id: minted-tiep-thi-tuyen-doi-tac-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E15
  run_id: minted-tiep-thi-tuyen-doi-tac-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_chu
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
       da ghi _acceptance/tiep-thi-tuyen-doi-tac/evidence/E15-chu-may-chu.txt
    -- DU LIEU SAN KHONG DUOC DANH DAU translate="no" (0)
    E15 CHU 12ma=khai truoc 9ma=dung tren trinh duyet 3ma=do o muc don vi — E25 trung=0 translate_no=du cau_may_chu=ghi lai o E15-chu-may-chu.txt

- eval: E16
  run_id: minted-tiep-thi-tuyen-doi-tac-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     209 expect() calls
    Ran 30 tests across 2 files. [712.00ms]

- eval: E17
  run_id: minted-tiep-thi-tuyen-doi-tac-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_test
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
    Ran 20 tests in 0.070s

    OK

- eval: E18
  run_id: minted-tiep-thi-tuyen-doi-tac-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_live
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
    2026-09-05 00:57:00,209 WARNING 49/49 hồ sơ có tổng tin bằng tin mới 30 ngày — sàn chỉ công bố một con số
    2026-09-05 00:57:00,211 INFO đã ghi ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json (49 mục)

- eval: E19
  criterion: AC-14
  executor: judgment
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: PASS
  votes:
  - domain-correctness: PASS — (1) Có — bị chặn thấp: bi_chan=1/50 gieo (2%), lan_thu_hong=6/68 lần thử (~8.8%); tổng lần thử đếm đủ vì 13 (sitemap) + 5 (danh bạ) + 50 (hồ sơ) = 68 = lan_thu, không sót tầng nào. (2) Không rõ ràng hợp lý — trung vị tin đăng = 61, sát ngay ngưỡng "Cao" = 60, tức khoảng phân nửa mẫu 49 hồ sơ đã rơi vào "Cao" (không chọn lọc); ngưỡng 20 và 1 hoàn toàn chưa được mẫu kiểm chứng vì giá trị nhỏ nhất trong mẫu là 37 (> 20) — đúng như hợp đồng đã tự khai "chưa có phân phối" và cần owner duyệt lại. (3) Có, đủ — 49/49 hồ sơ lấy được đều có trường số điện thoại (100%, co_so_dien_thoai=49=lay_duoc), thừa cho một chiến dịch gọi điện đầu tiên. Số liệu trong log và json khớp nhau, tứ phân vị tính đúng (kiểm tay: q1=43, trung vị=61, q3=84 khớp dữ liệu thô), và AC-14 là loại "judgment" — việc in ra các số này để người ký Cổng Phạm vi tự quyết ngưỡng là đúng vai trò của nó, không phải lỗi.
  - operational-feasibility: PASS — (1) Không — 49/50 gieo lấy được (98%), chỉ 1 bị chặn (2%), quá thấp để cho thấy sàn chặn bot ở mức làm hỏng chi phí thuê hàng tháng; tổng kết đếm đủ mọi lần thử: 13(sơ đồ)+5(danh bạ)+50(hồ sơ)+0(lộ số)=68=lan_thu, và 49(lay_duoc)+1(bi_chan)=50=gieo, cả hai chiều đều khớp. (2) Trung vị tin đăng (61) nằm sát ngay ngưỡng «cao»=60 nên khoảng một nửa mẫu rơi vào tier cao — đáng ngờ về độ chọn lọc — nhưng hợp đồng đã tự khai ngưỡng 60/20/1 "chưa có phân phối" và mức sản lượng thật xếp theo tổng tin đang đăng (không phải tin mới 30 ngày, vì sàn chỉ công bố một con số cho cả hai trường); AC-14 chỉ đòi in tứ phân vị để owner tự chỉnh trước chiến dịch đầu, và bằng chứng đã làm đúng việc đó (49/49 hồ sơ có min=37, q1=43, median=61, q3=84, max=436, đủ cho owner thấy ngưỡng cần xét lại). (3) Có — 49/49 hồ sơ lấy được có số điện thoại (100%), thừa đủ để mở một chiến dịch gọi điện.
  - spec-alignment: UNCERTAIN — (1) Có — 49/50 lấy được (98%), 1/50 bị chặn (2%); tổng lần thử ghi 68 khớp đúng tổng ba loại trang (so_do 13 + danh_ba 5 + ho_so 50 = 68), tổng kết đếm đủ và không cho thấy sàn chặn bot ở mức làm hỏng thuê hàng tháng. (2) Không đủ căn cứ — ngưỡng "60" nằm sát ngay trung vị mẫu (trung_vi=61), khiến 26/49 hồ sơ (53%) rơi vào mức Cao, quá rộng cho mức cao nhất; mẫu có min=37 nên ngưỡng "20" và "1" hoàn toàn không có dữ liệu nào trong lô này để kiểm — hợp đồng cũng tự khai ngưỡng "chưa có phân phối" và để owner chỉnh, nên phần này cần người quyết chứ log không đủ chứng minh hợp lý hay không. (3) Có về số lượng — log ghi co_so_dien_thoai=49/49 lay_duoc (100%), nhưng live-batch.json không mang giá trị số thật để đối chiếu: cả 49 mục đều là cùng một chuỗi che "09xxxxxxxx", nên tỷ lệ 100% chỉ xác nhận trường có giá trị, không xác nhận đó là số thật/khác nhau đủ gọi được.
    required_evidence:
    - Danh sách 49 số điện thoại thật (chưa che) hoặc một bản ghi kiểm định dạng số (ví dụ script kiểm regex số di động VN) từ pipeline cào, để xác nhận co_so_dien_thoai=49 là 49 số thật khác nhau chứ không phải placeholder — nếu thấy số thật hợp lệ, câu 3 đổi từ 'không kiểm chứng được' sang 'có'.
    - Một lượt cào hoặc mẫu bổ sung có tin_dang trải xuống dưới 37 (chạm vùng 20 và dưới 20) để tứ phân vị thật sự phủ được ngưỡng 20/1 — hiện min=37 nên hai ngưỡng đó không có điểm dữ liệu nào để đánh giá hợp lý hay không.
    - Ghi chú quyết định của owner (trong opportunity.md hoặc decisions.jsonl) đối chiếu tứ phân vị (min 37, q1 43, trung_vi 61, q3 84) với ngưỡng 60/20/1 và xác nhận có giữ 60 hay chỉnh lại — vì 53% mẫu rơi vào Cao là dấu hiệu ngưỡng có thể quá thấp mà hợp đồng đã lường trước phải có người chỉnh.
  human_override:

- eval: E20
  run_id: minted-tiep-thi-tuyen-doi-tac-E20-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_thiet_ke
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
    E20 THIET KE _acceptance/tiep-thi-tuyen-doi-tac/evidence/E20-danh-sach.html verdict=PASS
    E20 THIET KE _acceptance/tiep-thi-tuyen-doi-tac/evidence/E20-chien-dich.html verdict=PASS
    EXIT_CODE=0

- eval: E21
  run_id: minted-tiep-thi-tuyen-doi-tac-E21-r2
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.tt_ui_be_rong
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
    RANG CUN: khong suy duoc slug — http://localhost:3000/ tra 200 ma khong co Location. Phien hong hoac kho chua co noi lam viec.

- eval: E22
  run_id: minted-tiep-thi-tuyen-doi-tac-E22-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_to_ingest
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [257.00ms]

- eval: E23
  run_id: ttmtn91fe7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_trang_thai
  verified_at: 2026-09-05T01:15:00+07:00
  screenshot: /Users/manhphan/dev/crm-onehub/_acceptance/tiep-thi-tuyen-doi-tac/evidence/E23-nhap.png
  observed: |
    3 frame da mo bang Read, doi chieu tung buoc:
    - E23-nhap.png (buoc 1, chien dich moi tao "Chiến dịch trạng thái ttmtn91fe7"): header co badge "Nháp" va nut "Bắt đầu" (xanh); KHONG thay nut "ket qua" nao trong header. Khop "khong co nut ket qua" cua buoc 1.
    - E23-ket-thuc-bam.png (buoc 2, ngay sau khi bam Bat dau roi bam Ket thuc, truoc khi tai lai): header doi thanh badge "Đã kết thúc", dong phu hien "Bắt đầu lúc 0:50 5 thg 9, 2026 · Kết thúc lúc 0:50 5 thg 9, 2026"; khong con nut Bat dau, khong thay nut ket qua rieng.
    - E23-ket-thuc.png (buoc 3, SAU KHI TAI LAI TRANG): van giu nguyen badge "Đã kết thúc" + moc gio bat dau/ket thuc y het frame truoc (0:50 5 thg 9, 2026); KHONG co nut "Bắt đầu"; KHONG co nut ket qua nao trong header. Dung nhu Expected "huy hieu Đã kết thúc + moc, KHONG nut Bat dau, KHONG nut ket qua doc SAU KHI TAI LAI". Ca 3 frame nhat quan, khong mau thuan Expected.
  network_observed: n-a (driver)

- eval: E24
  run_id: minted-tiep-thi-tuyen-doi-tac-E24-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E25
  run_id: minted-tiep-thi-tuyen-doi-tac-E25-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     209 expect() calls
    Ran 30 tests across 2 files. [712.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run db:test && bun run test
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bun_run_db_test_bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

- cmd: bunx turbo run check-types --force
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bunx_turbo_run_check_types_force-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

- cmd: bun run lint:slop
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round trước — baseline không đo lại round này.

none — round này không đo lại baseline (P2, evals.yaml không đổi từ lần baseline cuối); danh sách eval không-phân-biệt giữ nguyên rỗng theo dữ liệu round trước, không có phép đo mới nào để xếp vào đây.

## Variance

none — không có eval nào mang field runs > 1 trong round này (mọi eval deterministic, runs=1).

## Iterations

Round 1: E15, E20 BLOCKED — bộ rang UI (chien-dich.mjs chu / thiet-ke) không dựng được, exit không trả về (cannot_run). Trả về triển khai.
Round 2: E15, E20 đã chạy được và PASS; nhưng E21 (AC-15, bề rộng 1024/768px) FAIL — RANG CUN: không suy được slug từ http://localhost:3000/ (trả 200 mà không có header Location), phiên hỏng hoặc kho chưa có nơi làm việc. Verdict REJECT — trả về triển khai.
