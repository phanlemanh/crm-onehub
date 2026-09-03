---
schema_version: 2
feature_slug: nhan-ung-dung-noi-tieng-viet
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7b8573d231d03492a4885317514408569ca87a74
human_signoff:
---

# Evidence Report: nhan-ung-dung-noi-tieng-viet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-12 | script | PASS |
| E14 | AC-13 | judgment | UNCERTAIN |
| E15 | AC-1 | script | PASS |
| E16 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_ba_man
  verified_at: 2026-09-03T06:00:00Z
  output: |
       CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan · be mat lech=0

- eval: E2
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_ho_so
  verified_at: 2026-09-03T06:00:00Z
  output: |
       CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan

- eval: E3
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_dong_thoi_gian
  verified_at: 2026-09-03T06:00:00Z
  output: |
       (b) KHONG phai chieu do — hop dong khai cau may chu van tieng Anh, vong ④

    ket qua: con lai=0 lan · duong hong (a) tieng Viet=co

- eval: E4
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_no_vong_1
  verified_at: 2026-09-03T06:00:00Z
  output: |
       khong hien     "Nothing found"                          · nhãn trạng thái bổ sung dữ liệu
       da dich        "2d ago"                                 · chữ thời gian tương đối
    ket qua: con tieng Anh=0 · khong hien de doi chieu=4 · tong=10

- eval: E5
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_trinh_doc_man_hinh
  verified_at: 2026-09-03T06:00:00Z
  output: |
    -- nhan chi trinh doc man hinh nghe: vi=196 lan, en=196 lan
    -- CON LAI: 0 chuoi / 0 lan
    ket qua: con lai=0 lan

- eval: E6
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T06:00:00Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    234ms >>> FULL TURBO

- eval: E7
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khai_tieng
  verified_at: 2026-09-03T06:00:00Z
  output: |
       boc du  Banking                2 cho, chua boc 0
       boc du  Accounting             1 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E8
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_doi_tieng
  verified_at: 2026-09-03T06:00:00Z
  output: |
    -- truoc: 1 dong chon · "CompaniesEvery company in the network.New company1 selectedActionsClea"
    -- sau:   1 dong chon · "Công tyMọi công ty trong mạng lưới.Công ty mớiĐã chọn 1 dòngHành độngB"
       chu doi theo:            co
       trang KHONG tai lai:     dung
       thanh chon dong con giu: co
       chu thoi gian sau khi doi: "5 phút trước" — tieng Viet
    ket qua: hong=0

- eval: E9
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_may_chu_ve
  verified_at: 2026-09-03T06:00:00Z
  output: |
       luot ve dau OK  /contacts — lang=vi · <title> mo dau Cá nhân · h1 la Cá nhân
       luot ve dau OK  /deals — lang=vi · <title> mo dau Thoả thuận · h1 la Thoả thuận
    ket qua: man hong=0/3

- eval: E10
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_be_rong
  verified_at: 2026-09-03T06:00:00Z
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    ket qua 1440px: cat tran=0 · cat kem ba cham=0 · tong=7 · hong=0
    ket qua: o hong=0/12

- eval: E11
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_du_lieu_bien
  verified_at: 2026-09-03T06:00:00Z
  output: |
       co      1 hang · ten phap nhan 40-60 ky tu
             vi du: "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ"
    ket qua: trang thai thieu=0/3

- eval: E12
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T06:00:00Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    234ms >>> FULL TURBO

- eval: E13
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_dot_bien
  verified_at: 2026-09-03T06:00:00Z
  output: |
       DAT · 190 khoa ngoai tam voi da co ten o rang/dot-bien-sot.txt

    ket qua: bat 236/236 khoa ve ra (100%) · do phu 55% · mu 0 · ngoai tam voi 190 · dot bien cun 0

- eval: E15
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khong_may_quet
  verified_at: 2026-09-03T06:00:00Z
  output: |
       qua ban-ve.mjs  be-rong.sh — cham san pham bang cach chay ban-ve.mjs
       dung vat that  may-chu-ve.sh
    ket qua: chan chi doc ma=0/7

- eval: E16
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E16-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_giai_doan
  verified_at: 2026-09-03T06:00:00Z
  output: |
       boc du  Closed lost          3 cho, chua boc 0
       boc du  Unqualified          3 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E14
  judged_by: judge panel (fresh context) — 3 lens: domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  votes:
    - domain-correctness: PASS — (1) Bảng dịch đọc tự nhiên, đúng giọng người trong nghề quan hệ hợp tác — các câu bán hàng gốc ("selling to", "Nothing is being sold to X") được viết lại thành ngôn ngữ đối tác ("chưa có thoả thuận hợp tác nào với X", "những người bạn đang trao đổi"), không phải dịch máy bám chữ. (2) Rà toàn bộ nhãn cột/nhãn trường trong ban-dich.md, không thấy cụm động từ đặt trên cột chứa ngày hay giá trị danh từ khác loại — các nhãn ngày đều neo "Ngày"/"Lần" thành danh từ (Ngày dự kiến chốt, Lần chốt gần nhất), và trường hợp cận biên duy nhất tìm được (contact.based → "Làm việc tại") là cách gọi hồ sơ cá nhân tiếng Việt quen thuộc, không phải lỗi sai loại từ. (3) Theo đúng chữ thật đo ở E10, hai tiêu đề từng bị cắt ("Số thoả thuận đan…", "Hoạt động gần…") không bao giờ đứng cạnh một tiêu đề "Số…" khác cũng đang bị cắt trong cùng ảnh chụp — ở khổ hẹp chỉ một cột "Số…" xuất hiện, ở khổ rộng cả hai hiện đủ chữ — nên không có cặp nhãn nào đọc thành nhau ở dạng bị cắt.
    - operational-feasibility: UNCERTAIN — Câu (1) có căn cứ tốt: bảng dịch đọc như tiếng Việt người trong nghề viết, có lý lẽ ngữ cảnh riêng cho từng dòng khác biệt với bản Anh (vd. bỏ khung "bán hàng" thắng-thua, không thêm đuôi số nhiều, đảo trật tự chủ ngữ), không phải văn phong dịch máy. Câu (2): rà hết các cột bảng thật (companies/contacts/deals/company.dealColumns/…) thì mọi tiêu đề cột đều là danh từ khớp loại dữ liệu bên dưới, kể cả cột hành động deal.contactColumns.remove="Gỡ" (động từ hợp lệ vì đó là nút bấm) — không tìm được nhãn sai loại từ trong phạm vi cột thật; nhưng phạm vi "ô dưới nó" có thể còn bao gồm các nhãn field dạng label-giá trị (contact.based="Làm việc tại", deal.inStageSince="Ở giai đoạn này từ") mà tài liệu đưa vào không đủ để phân định chắc đây có tính là "cột" hay không. Câu (3): E10 chỉ đo companies và contacts ở các khổ rộng, KHÔNG đo bảng deals — trong khi bảng deals có hai cột liền kề cùng bắt đầu bằng "Ngày " (headers.closeDate="Ngày chốt" và headers.created="Ngày tạo"), đúng dạng cặp dễ lẫn khi bị cắt ở khổ hẹp, nhưng không có chữ thật hiện ra nào đo được cho cặp này nên không thể kết luận PASS hay FAIL theo đúng luật "chỉ dựa chữ thật hiện ra ở E10".
      required_evidence:
        - Đo "chữ thật hiện ra" kiểu E10 cho bảng deals ở 768px (và các khổ hẹp khác) cho các cột headers.closeDate ("Ngày chốt") và headers.created ("Ngày tạo") khi đứng liền kề — chạy lại script đo cột (kiểu rang/chu-hien-ra hoặc tương đương) trên màn Deals và xuất file evidence giống E10-chu-hien-ra.txt; nếu hai cột này cắt còn cùng một tiền tố ("Ngày…") thì câu (3) đổi sang có cặp nhãn dễ lẫn.
        - Chụp hoặc trích DOM khu vực "About" của hồ sơ cá nhân (field contact.based) và khu vực giai đoạn của hồ sơ thoả thuận (field deal.inStageSince) để xác định các nhãn này có hiển thị dạng cột bảng (nhãn trên, giá trị dưới) hay dạng câu nhãn:giá trị nội tuyến — nếu là dạng cột bảng thì "Làm việc tại" (cụm động từ) đứng trên giá trị là tên địa danh (danh từ) sẽ là một nhãn sai loại từ theo câu (2).
    - spec-alignment: PASS — (1) Bảng dịch đọc tự nhiên như tiếng Việt sản phẩm ngành đối tác — câu ngắn gọn, đúng giọng quan hệ hợp tác (không phải "bán hàng"), có lý do rõ cho từng lựa chọn từ (vd. "moved" → "chuyển sang công ty khác", tránh "khách hàng"/"liên hệ"); không có dấu hiệu dịch máy word-by-word. (2) Mọi nhãn cột chứa ngày đều neo danh từ "Ngày" nhất quán (Ngày tạo, Ngày chốt, Ngày lưu trữ, Ngày mở), kể cả deal.expectedClose có ghi chú tường minh về việc tránh đọc "chốt" như động từ — quét toàn bộ headers.* và *.dealColumns.closeDate không thấy cụm động từ nào đứng trên cột ngày. (3) Theo đúng chữ thật đo ở E10 (768px companies/contacts), hai tiêu đề bị cắt cùng màn ("Số thoả thuận đan…" và "Hoạt động gần…") không giống nhau, không có cặp nhãn liền kề nào cắt xuống còn dễ lẫn.
  human_override:

### Lệnh suite (hồi quy)

- cmd: bunx turbo run check-types --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r4
  exit_code: 0
  verified_at: 2026-09-03T06:00:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    13.324s

- cmd: bunx turbo run lint --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-03T06:00:00Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    946ms

- cmd: bun run lint:slop
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-03T06:00:00Z
  output: |
    $ oxlint

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 3 — baseline khong do lai round nay
none — không có eval nào được đánh dấu không-phân-biệt round này (baseline không đo lại round 4; xem round 3 cho lần đo baseline gần nhất)

## Variance

none — không có eval nào chạy nhiều lần (runs > 1) round này

## Iterations

Round 1: E1 failed — bản vẽ ba màn chưa mở đủ bề mặt ẩn trước khi đối chiếu. Returned to implementation.
Round 2: E13 failed — chặn đột biến báo tỷ lệ bắt dưới ngưỡng khớp mới. Returned to implementation.
Round 3: 16 eval máy PASS; E14 (AC-13) UNCERTAIN ở hai lens (domain-correctness, operational-feasibility) — verdict PENDING-JUDGMENT, chờ người quyết.
