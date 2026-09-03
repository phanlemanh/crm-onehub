---
schema_version: 2
feature_slug: nhan-ung-dung-noi-tieng-viet
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e15c5777a3f18d06929152e05bdbce1791350dd1
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
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E1-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_ba_man
  verified_at: 2026-09-03T13:00:00Z
  output: |
       CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan · be mat lech=0

- eval: E2
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E2-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_ho_so
  verified_at: 2026-09-03T13:00:00Z
  output: |
       CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan

- eval: E3
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E3-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_dong_thoi_gian
  verified_at: 2026-09-03T13:00:00Z
  output: |
       (b) KHONG phai chieu do — hop dong khai cau may chu van tieng Anh, vong ④

    ket qua: con lai=0 lan · duong hong (a) tieng Viet=co

- eval: E4
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E4-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_no_vong_1
  verified_at: 2026-09-03T13:00:00Z
  output: |
       khong hien     "Nothing found"                          · nhãn trạng thái bổ sung dữ liệu
       da dich        "2d ago"                                 · chữ thời gian tương đối
    ket qua: con tieng Anh=0 · khong hien de doi chieu=4 · tong=10

- eval: E5
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E5-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_trinh_doc_man_hinh
  verified_at: 2026-09-03T13:00:00Z
  output: |
    -- nhan chi trinh doc man hinh nghe: vi=196 lan, en=196 lan
    -- CON LAI: 0 chuoi / 0 lan
    ket qua: con lai=0 lan

- eval: E6
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E6-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T13:00:00Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    63ms >>> FULL TURBO

- eval: E7
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E7-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khai_tieng
  verified_at: 2026-09-03T13:00:00Z
  output: |
       boc du  Banking                2 cho, chua boc 0
       boc du  Accounting             1 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E8
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E8-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_doi_tieng
  verified_at: 2026-09-03T13:00:00Z
  output: |
       thanh chon dong con giu: co
       chu thoi gian sau khi doi: "5 phút trước" — tieng Viet
    ket qua: hong=0

- eval: E9
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E9-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_may_chu_ve
  verified_at: 2026-09-03T13:00:00Z
  output: |
       luot ve dau OK  /contacts — lang=vi · <title> mo dau Cá nhân · h1 la Cá nhân
       luot ve dau OK  /deals — lang=vi · <title> mo dau Thoả thuận · h1 la Thoả thuận
    ket qua: man hong=0/3

- eval: E10
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E10-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_be_rong
  verified_at: 2026-09-03T13:00:00Z
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    ket qua 1440px: cat tran=0 · cat kem ba cham=0 · tong=6 · hong=0
    ket qua: o hong=0/12

- eval: E11
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E11-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_du_lieu_bien
  verified_at: 2026-09-03T13:00:00Z
  output: |
       co      1 hang · ten phap nhan 40-60 ky tu
             vi du: "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ"
    ket qua: trang thai thieu=0/3

- eval: E12
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E12-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T13:00:00Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    63ms >>> FULL TURBO

- eval: E13
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E13-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_dot_bien
  verified_at: 2026-09-03T13:00:00Z
  output: |
       do phu de doi chieu, khong phai nguong: 46% (240/519)

    ket qua: bat 240/240 khoa ve ra (100%) · do phu 46% · mu 0 · khong quy ket 14 · ngoai tam voi 265 · dot bien cun 0

- eval: E15
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E15-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khong_may_quet
  verified_at: 2026-09-03T13:00:00Z
  output: |
       qua ban-ve.mjs  be-rong.sh — cham san pham bang cach chay ban-ve.mjs
       dung vat that  may-chu-ve.sh
    ket qua: chan chi doc ma=0/7

- eval: E16
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E16-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_giai_doan
  verified_at: 2026-09-03T13:00:00Z
  output: |
       boc du  Closed lost          3 cho, chua boc 0
       boc du  Unqualified          3 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E14
  judged_by: judge panel (fresh context) — 3 lens: domain-correctness, operational-feasibility, spec-alignment
  proposal: UNCERTAIN
  votes:
    - domain-correctness: PASS — (1) Bảng đọc như tiếng Việt bản địa của người quan hệ đối tác: neo danh từ nhất quán cho mọi nhãn ngày (Ngày mở/Ngày chốt/Ngày tạo/Ngày dự kiến chốt/Ngày lưu trữ), tránh giọng bán hàng ("đang bán" → "đang trao đổi/cần gì"), và có bằng chứng tự sửa sau khi test người dùng thật (mục "Bổ sung"). (2) Rà toàn bộ các khoá `headers.*` và các trường ngày khác trong hồ sơ (deal.opened, deal.expectedClose, labels.createdDate/archivedDate) — không tìm thấy nhãn nào lệch loại từ so với dữ liệu dưới nó; ghi chú tại `deal.expectedClose` cho thấy đội dịch đã chủ động bắt và sửa đúng lớp lỗi này. (3) Theo đúng chữ thật đo ở E10 (không đoán ảnh chụp), ở 768px chỉ có một nhãn bị cắt mỗi màn (companies: "Số thoả thuận đan…"; contacts: "Hoạt động gần…"), không có cặp nhãn liền kề nào cùng bị cắt tới mức trông giống nhau.
    - operational-feasibility: UNCERTAIN — Phần lớn 537 dòng đọc tự nhiên, đúng giọng hợp tác (không phải bán hàng), có lý lẽ từng dòng — câu (1) nghiêng PASS. Nhưng câu (2) và (3) không đủ căn cứ chắc để chốt: `contact.lastReply` (`last reply` → `trả lời gần nhất`) dùng "trả lời" thay vì mẫu danh từ hoá đã dùng nhất quán ở chỗ khác cùng bảng (`Hoạt động gần nhất` dùng "Hoạt động"), nhưng "trả lời" cũng có thể đọc như danh từ nén trong nhãn UI — ranh giới, không "rõ ràng vi phạm". Câu (3) chỉ có căn cứ E10 cho hai bảng companies/contacts; cặp gần nhất tìm được (`Số lượng cá nhân` / `Số thoả thuận đang mở`, cột 5-6 companies, cùng mở đầu "Số") chỉ cùng hiện đủ chữ ở 1024px+ — ở 768px `Số lượng cá nhân` vắng mặt hẳn nên rủi ro không xảy ra đúng lúc "khổ hẹp", và E10 không đo bảng deals hay record-sheet nên có thể có cặp rõ hơn ngoài tầm nhìn.
      required_evidence:
        - Một phép thử người thật (2 nhân viên quan hệ đối tác chưa từng thấy bảng dịch) đọc riêng nhãn `trả lời gần nhất` ở đúng vị trí nó hiện trên hồ sơ cá nhân, trả lời: đọc như một nhãn dữ liệu (giống 'Hoạt động gần nhất') hay như một câu lệnh/động từ? — nếu ≥1 người đọc ra động từ, câu (2) đổi sang FAIL; nếu cả hai đọc đúng như nhãn, câu (2) đổi sang PASS.
        - Chạy lại script đo 'chữ thật hiện ra' kiểu E10 (rang/kiem-ke.mjs hoặc script đo bề rộng tương tự) cho bảng deals và các cột record-sheet (company.dealColumns, contact.dealColumns, deal.contactColumns) ở 768/1024/1280/1440px — hiện chưa có dữ liệu đo cho hai vùng này nên không loại được khả năng có cặp nhãn dễ lẫn rõ hơn cặp đã tìm.
        - Xác nhận `deal.inCurrency` (`In ${cur}` → `Quy đổi ${cur}`) hiện cạnh một GIÁ TRỊ tĩnh (số tiền đã quy đổi) hay là một nút/hành động bấm được — nếu là giá trị tĩnh thì 'Quy đổi' (động từ) sai loại từ so với ô giá trị bên cạnh, củng cố câu (2) sang FAIL.
    - spec-alignment: UNCERTAIN — Câu 1 rõ: bảng đọc như tiếng Việt bản xứ, không như máy dịch — thấy rõ ở cách viết lại câu chứ không dịch từng chữ (`company.noDealsBody`: "Nothing is being sold to X" → "Chưa có thoả thuận hợp tác nào với X", bỏ khung bán hàng gốc), đảo trật tự họ-tên, và ba lần tự sửa nhãn từ câu/cụm động từ sang danh từ có ghi chú rõ lý do (`section.onIt`, `contact.weKnowThem`, `deal.expectedClose`). Câu 2 không đủ căn cứ để chốt: rà toàn bộ `headers.*`/`dealColumns.*`/`contactColumns.*` (các CỘT bảng thật) thì mọi nhãn đều là danh từ khớp đúng loại ô (ngày → "Ngày X", số → "Số X"); nghi vấn duy nhất là `deal.inStageSince` = "Ở giai đoạn này từ" (cụm giới từ, không neo danh từ "Ngày" như các nhãn ngày anh em `Ngày mở`/`Ngày chốt`/`Ngày tạo` mà chính tài liệu liệt kê) nhưng đây là nhãn trường trên hồ sơ chi tiết chứ không phải tiêu đề CỘT, và không file nào trong phạm vi xác nhận ô cạnh nó có mang giá trị ngày hay không. Câu 3 không có bằng chứng: E10 chỉ đo tiêu đề bảng companies/contacts (đủ 4 khổ) và deals (chỉ 768px), ba chuỗi bị cắt ("Số thoả thuận đan…", hai bản "Hoạt động gần…"/"Hoạt động gần …") đều khác nhau và không đứng cạnh một nhãn nào dễ lẫn trên cùng một màn theo đúng chữ đã đo — không đủ dữ liệu để khẳng định có hay không cặp nhãn lẫn nhau khi cắt.
      required_evidence:
        - Bản ghi 'chữ thật hiện ra' kiểu E10 cho khu vực chi tiết thoả thuận (record-sheet) đo nhãn `deal.inStageSince` ('Ở giai đoạn này từ') cạnh giá trị thật hiển thị ngay dưới/cạnh nó — nếu giá trị đó là một ngày thì câu 2 có một nhãn sai loại từ (cụm giới từ thay vì danh từ neo 'Ngày'), đổi verdict sang có căn cứ FAIL cho câu 2.
        - Bản ghi 'chữ thật hiện ra' kiểu E10 đầy đủ bốn khổ (768/1024/1280/1440px) cho bảng deals (hiện chỉ có 768px) cộng các nhãn facet/bộ lọc cạnh nhau ở khổ hẹp — nếu xuất hiện hai chuỗi bị cắt trùng hoặc gần trùng nhau trên cùng một màn thì câu 3 có căn cứ trả lời cụ thể thay vì để trống.
  human_override:

### Lệnh suite (hồi quy)

- cmd: bunx turbo run check-types --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r6
  exit_code: 0
  verified_at: 2026-09-03T13:00:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    10.762s

- cmd: bunx turbo run lint --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r6
  exit_code: 0
  verified_at: 2026-09-03T13:00:00Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    581ms

- cmd: bun run lint:slop
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bun_run_lint_slop-r6
  exit_code: 0
  verified_at: 2026-09-03T13:00:00Z
  output: |
    $ oxlint

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 3 — baseline khong do lai round nay
none — không có eval nào được đánh dấu không-phân-biệt round này (baseline không đo lại round 6; xem round 3 cho lần đo baseline gần nhất)

## Variance

none — không có eval nào chạy nhiều lần (runs > 1) round này

## Iterations

Round 1: E1 failed — bản vẽ ba màn chưa mở đủ bề mặt ẩn trước khi đối chiếu. Returned to implementation.
Round 2: E13 failed — chặn đột biến báo tỷ lệ bắt dưới ngưỡng khớp mới. Returned to implementation.
Round 3: 16 eval máy PASS; E14 (AC-13) UNCERTAIN ở hai lens (domain-correctness, operational-feasibility) — verdict PENDING-JUDGMENT, chờ người quyết.
Round 4: 16/16 tiêu chí máy đạt, 0 lệnh đỏ, 0 bị chặn, hội đồng E14 PASS. Verdict REJECT vì bảy phát hiện trong-hợp-đồng, cả bảy nhắm vào THƯỚC chứ không vào sản phẩm. Lượt đầu của vòng 4 bị BLOCKED oan ở E16 — chân khai tiếng ném lỗi trần khi máy chủ nghẽn nên người kiểm chẩn đoán sai thành 'API chưa chạy'; API thật ra đã sống 20 giờ. Đã vá chân để nó tự phân biệt hai ca, và chạy lại cùng vòng.
Round 5: E13 failed — chặn đột biến chỉ bắt được 240/254 khoá bốn chân có vẻ ra (94%, dưới ngưỡng 100% đã sửa ở Cổng 2 S4-r2); 265 khoá ngoài tầm với đã ghi tên đủ ở rang/dot-bien-sot.txt. 15/16 eval máy còn lại PASS, hội đồng E14 giữ nguyên PASS ở cả ba lens. Verdict REJECT vì có eval máy thất bại thật (E13), chưa tính tới sáu phát hiện trong-hợp-đồng khác vẫn còn treo từ round 4. Returned to implementation.
Round 6: 16/16 eval máy PASS (E13 nay bắt đủ 240/240 khoá bốn chặn có vẻ ra = 100%, đạt đúng ngưỡng đã sửa ở Cổng 2 S4-r2). Hội đồng E14 lật từ PASS (round 4, round 5) sang UNCERTAIN ở hai lens (operational-feasibility, spec-alignment) — domain-correctness vẫn PASS; cả hai lens UNCERTAIN đều thiếu bằng chứng đo "chữ thật hiện ra" cho record-sheet/deals mà E10 chưa phủ. Verdict REJECT vì một phát hiện trong-hợp-đồng mức cao khớp AC-2: mười vị trí chữ Anh cứng còn sót trên hồ sơ công ty, hồ sơ thoả thuận, dòng thời gian, danh sách trường và hộp thoại lưu view — khoá dịch đã tồn tại sẵn trong kho chuỗi nhưng chưa được nối vào JSX; guard test chỉ soi kho chuỗi chứ không đọc JSX nên không bắt được lớp lỗi này. Returned to implementation.
