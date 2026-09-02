---
schema_version: 2
feature_slug: nhan-ung-dung-noi-tieng-viet
verdict: REJECT
failed_evals: [E13]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fccef6f236f6b5edb760d65e6554c74f69e5f9c5
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
| E13 | AC-12 | script | FAIL |
| E14 | AC-13 | judgment | FAIL |
| E15 | AC-1 | script | PASS |
| E16 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_ba_man
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan · be mat lech=0

- eval: E2
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_ho_so
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan

- eval: E3
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_dong_thoi_gian
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    (b) KHONG phai chieu do — hop dong khai cau may chu van tieng Anh, vong ④

    ket qua: con lai=0 lan · duong hong (a) tieng Viet=co

- eval: E4
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_no_vong_1
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    khong hien     "Nothing found"                          · nhãn trạng thái bổ sung dữ liệu
    da dich        "2d ago"                                 · chữ thời gian tương đối
    ket qua: con tieng Anh=0 · khong hien de doi chieu=4 · tong=10

- eval: E5
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_trinh_doc_man_hinh
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    -- nhan chi trinh doc man hinh nghe: vi=196 lan, en=194 lan
    -- CON LAI: 0 chuoi / 0 lan
    ket qua: con lai=0 lan

- eval: E6
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    app:test:  0 fail
    app:test:  585 expect() calls
    app:test: Ran 193 tests across 19 files. [815.00ms]

- eval: E7
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khai_tieng
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    boc du  Banking                2 cho, chua boc 0
    boc du  Accounting             1 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E8
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_doi_tieng
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    trang KHONG tai lai:     dung
    thanh chon dong con giu: co
    ket qua: hong=0

- eval: E9
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_may_chu_ve
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    luot ve dau OK  /contacts — lang=vi · <title> mo dau Cá nhân · h1 la Cá nhân
    luot ve dau OK  /deals — lang=vi · <title> mo dau Thoả thuận · h1 la Thoả thuận
    ket qua: man hong=0/3

- eval: E10
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_be_rong
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    ket qua 1440px: cat tran=0 · cat kem ba cham=0 · tong=7 · hong=0
    ket qua: o hong=0/12

- eval: E11
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_du_lieu_bien
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    co      1 hang · ten phap nhan 40-60 ky tu
          vi du: "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ"
    ket qua: trang thai thieu=0/3

- eval: E12
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    app:test:  0 fail
    app:test:  585 expect() calls
    app:test: Ran 193 tests across 19 files. [815.00ms]

- eval: E13
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E13-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.rang3_dot_bien
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    -- do phu: bon chan ve ra 236/426 khoa (55%)
       190 khoa nam ngoai bon chan — hop thoai tao, man trong, man luu tru, thao tac hang loat
    -- bat tren khoa CO ve ra: 236/236 (100%)

    -- cham theo dung loi da ky o E13
       nguong khai: bat >= 95% SO KHOA — dat 236/426 = 55%
       KHONG DAT · moi khoa khong bat duoc da co ten o rang/dot-bien-sot.txt
       LECH LOI KY: E13 doi 'mot khoa mot luot, dung 1 dong khac ban goc'.

    ket qua: bat 236/426 khoa (55%) · ve ra 236 · mu 0 · ngoai phu 190 · dot bien cun 0

- eval: E14
  judged_by: judge panel — domain-correctness, operational-feasibility, spec-alignment (fresh context)
  verdict: FAIL
  rationale: |
    Panel không carried, không ungrounded — chấm mới trên round này, đề xuất chung của panel là FAIL. Ba lens:

    - domain-correctness: FAIL — (1) Ba phần đầu của bảng (companies/contacts/deals/crm/record-sheet gốc) đọc như tiếng Việt của người trong nghề, có lý lẽ ngữ cảnh rõ cho từng lựa chọn — không phải dịch máy. Nhưng chính ban-dich.md tự khai ở mục "Bổ sung ở vòng sửa S4-r1" (dòng 532-546): 199/537 khoá (37%) được viết SAU khi mã đã chạm, nên "KHÔNG mang tính chất 'chốt trước khi chạm mã' mà AC-13 đòi" — đây là vi phạm trực tiếp, tự thừa nhận, cho đúng câu hỏi (1). (2) Trong phạm vi ba file được cấp, không thấy nhãn nào dùng cụm động từ trên cột chứa ngày — các nhãn ngày đều neo danh từ "Ngày" nhất quán (Ngày tạo, Ngày chốt, Ngày mở, Ngày dự kiến chốt, Ngày lưu trữ). (3) Theo đúng chữ thật đo ở E10, chỉ hai nhãn bị cắt (ở 768px: "Số thoả thuận đan…" và "Hoạt động gần…"/"Hoạt động gần …"), và chúng không giống nhau đủ để gây lẫn khi đứng cạnh nhau trên cùng màn. Vi phạm ở câu (1) đã đủ căn cứ rõ ràng, tự bản dịch xác nhận, nên verdict tổng thể là FAIL.
    - operational-feasibility: FAIL — Câu 1: chính bảng dịch tự thú — mục "Bổ sung ở vòng sửa S4-r1" khai 199/537 khoá (37%) được thêm SAU khi mã đã chạm, và nói thẳng phần đó "KHÔNG mang tính chất 'chốt trước khi chạm mã' mà AC-13 đòi". Ba mục gốc (companies/contacts/deals đầu file) đọc như tiếng Việt tự nhiên của người trong nghề quan hệ đối tác, không như dịch máy — nhưng phần bổ sung phá đúng điều kiện "chốt trước" mà câu hỏi 1 hỏi, nên không thể PASS toàn bộ. Câu 3 (chỉ dựa E10): ở màn công ty 768px có hai nhãn liền kề cùng bị cắt cùng lúc — "Số thoả thuận đan…" (cắt ngay giữa từ "đang", dừng đúng ở một từ thật khác là "đan") và "Hoạt động gần…" — cặp này đứng cạnh nhau trên cùng một màn hẹp và cùng mất nghĩa. Câu 2: rà các nhãn cột có bằng chứng thật (E10) thì không thấy cụm động từ nào dùng sai trên cột chứa ngày/số — các nhãn còn lại trong bảng (vd. closing→"Sắp chốt", contact.based→"Làm việc tại") là suy đoán cấu trúc màn hình không có trong phạm vi input nên không dùng làm căn cứ.
    - spec-alignment: UNCERTAIN — Chữ trong bảng dịch (cả phần gốc lẫn phần bổ sung S4-r1) đọc tự nhiên như tiếng Việt người trong nghề viết, không như bản dịch máy — nhưng chính file này tự khai 199/537 khoá (37%) chỉ được chốt SAU khi mã đã viết, và nói thẳng "KHÔNG mang tính chất 'chốt trước khi chạm mã' mà AC-13 đòi... không được đọc như thể có" (ban-dich.md, mục "Bổ sung ở vòng sửa S4-r1"). Không có contract.md trong phạm vi input để biết "vòng này" mà AC-13 nói có bao trùm phần bổ sung đó hay không, nên câu 1 không đủ căn cứ chốt PASS hay FAIL. Câu 2 không tìm được nhãn nào hiện còn sai loại từ so với ô dưới nó (các trường hợp tương tự — section.onIt, contact.weKnowThem — đã được ghi nhận là đã sửa); câu 3 chỉ có bằng chứng E10 cho companies/contacts ở 768px và một phần deals ở 768px, không đủ để khẳng định hay bác bỏ cặp nhãn dễ lẫn trên các khổ/màn khác mà bảng dịch có nhắc tới.

    Đề xuất panel: FAIL — hai trong ba lens chốt FAIL trên cùng một căn cứ tự-khai của ban-dich.md (199/537 khoá chốt SAU khi mã đã chạm), lens thứ ba giữ UNCERTAIN vì thiếu contract.md để xác nhận phạm vi "vòng này" của AC-13.
  required_evidence:
    - "(domain-correctness) Bằng chứng đảo verdict: log/timestamp git cho thấy 199 khoá ở mục 'Bổ sung ở vòng sửa S4-r1' (ban-dich.md dòng 548-773) thực sự được chốt trong hồ sơ TRƯỚC commit mã UI tương ứng, mâu thuẫn với chính lời tự khai ở dòng 539-542 của ban-dich.md rằng chúng viết SAU khi mã đã viết — nếu chứng minh được điều này thì câu hỏi (1) đổi từ FAIL sang PASS."
    - "(operational-feasibility) Đọc contract.md (ngoài phạm vi input hiện tại) mục AC-13: nếu điều khoản chỉ đòi bảng dịch có mặt ĐẦY ĐỦ trong hồ sơ TRƯỚC KHI hội đồng chấm — không đòi mọi khoá phải được liệt kê trước khi chạm mã — thì 199 khoá bổ sung ở S4-r1 vẫn hợp lệ và câu 1 đổi từ FAIL sang PASS/UNCERTAIN."
    - "(spec-alignment) Đọc _acceptance/nhan-ung-dung-noi-tieng-viet/contract.md mục AC-13 để xác nhận 'vòng này' có bao gồm 199 khoá bổ sung ở S4-r1 hay không — nếu AC-13 chỉ áp cho 357 khoá gốc (vòng ③a) và phần bổ sung được chấm ở eval khác, câu 1 đổi thành PASS; nếu AC-13 áp cho toàn bộ 537 khoá hiện có trong file, câu 1 đổi thành FAIL rõ ràng."
    - "(spec-alignment) Chạy lại script đo chữ thật hiện ra (kiểu E10) cho bảng deals ở 1024/1280/1440px và cho các nhãn khác được nêu trong ban-dich.md (vd. facets, tabs, record-sheet) — hiện E10 chỉ có deals·768px và hai bảng companies/contacts, không đủ để trả lời câu 3 về cặp nhãn dễ lẫn trên toàn bộ màn hình liên quan."
  human_override:

- eval: E15
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khong_may_quet
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    qua ban-ve.mjs  be-rong.sh — cham san pham bang cach chay ban-ve.mjs
    dung vat that  may-chu-ve.sh
    ket qua: chan chi doc ma=0/7

- eval: E16
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_giai_doan
  verified_at: 2026-09-03T01:20:00+07:00
  output: |
    boc du  Closed lost          3 cho, chua boc 0
    boc du  Unqualified          3 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

### Lệnh suite (hồi quy)

- cmd: bunx turbo run check-types --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r2
  exit_code: 0
  verified_at: 2026-09-03T01:20:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-03T01:20:00+07:00

- cmd: bun run lint:slop
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-03T01:20:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round trước — baseline không đo lại round này.

none — round này không đo baseline (P2, evals.yaml không đổi từ lần baseline cuối); danh sách eval không-phân-biệt kế thừa nguyên trạng từ round trước và rỗng ở đầu vào round này. Lệnh suite (check-types, lint, lint:slop) xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — không có eval nào mang field `runs > 1` trong vòng này; không eval nào chạy nhiều lần.

## Iterations

Round 1: E1, E10, E13, E15 failed. E1 và E10 cùng vỡ ở `TimeoutError: Waiting failed: 30000ms exceeded` trong puppeteer — E1 khi bóc bề mặt ẩn trên màn companies (menu Views), E10 khi đo bề rộng chữ ở 1440px. E13 chỉ bắt được đột biến 231/390 khoá (59%), dưới ngưỡng khai 95%. E15 (chặn chống-lách) chỉ xác nhận 2/7 chặn E1-E11 dùng trình duyệt/trình biên dịch thật. Trả về S3 implementation.
Round 2: E1, E10, E15 đã xanh (timeout puppeteer hết, và 7/7 chặn E1-E11 nay xác nhận dùng vật thật). E13 vẫn đỏ — đột biến bắt được 236/426 khoá (55%), vẫn dưới ngưỡng khai 95%, phạm vi bàn chân đo chưa phủ 190 khoá nằm ở hộp thoại tạo/màn trống/màn lưu trữ/thao tác hàng loạt. E14 (judgment) chấm FAIL — ban-dich.md tự khai 199/537 khoá (37%) chốt SAU khi mã đã chạm, vi phạm điều kiện "chốt trước khi chạm mã" mà AC-13 đòi. Trả về S3 implementation.