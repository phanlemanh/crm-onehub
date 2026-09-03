---
schema_version: 2
feature_slug: nhan-ung-dung-noi-tieng-viet
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 30d38f2ace5aca893108f0a3bccbc7f35a3fd652
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
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_ba_man
  verified_at: 2026-09-03T02:36:45Z
  output: |
       CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan · be mat lech=0

- eval: E2
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_ho_so
  verified_at: 2026-09-03T02:36:45Z
  output: |
       CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan

- eval: E3
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_dong_thoi_gian
  verified_at: 2026-09-03T02:36:45Z
  output: |
       (b) KHONG phai chieu do — hop dong khai cau may chu van tieng Anh, vong ④

    ket qua: con lai=0 lan · duong hong (a) tieng Viet=co

- eval: E4
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_no_vong_1
  verified_at: 2026-09-03T02:36:45Z
  output: |
       khong hien     "Nothing found"                          · nhãn trạng thái bổ sung dữ liệu
       da dich        "2d ago"                                 · chữ thời gian tương đối
    ket qua: con tieng Anh=0 · khong hien de doi chieu=4 · tong=10

- eval: E5
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_trinh_doc_man_hinh
  verified_at: 2026-09-03T02:36:45Z
  output: |
    -- nhan chi trinh doc man hinh nghe: vi=196 lan, en=193 lan
    -- CON LAI: 0 chuoi / 0 lan
    ket qua: con lai=0 lan

- eval: E6
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T02:36:45Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    586ms >>> FULL TURBO

- eval: E7
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_khai_tieng
  verified_at: 2026-09-03T02:36:45Z
  output: |
       boc du  Banking                2 cho, chua boc 0
       boc du  Accounting             1 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E8
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_doi_tieng
  verified_at: 2026-09-03T02:36:45Z
  output: |
       thanh chon dong con giu: co
       chu thoi gian sau khi doi: "5 phút trước" — tieng Viet
    ket qua: hong=0

- eval: E9
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_may_chu_ve
  verified_at: 2026-09-03T02:36:45Z
  output: |
       luot ve dau OK  /contacts — lang=vi · <title> mo dau Cá nhân · h1 la Cá nhân
       luot ve dau OK  /deals — lang=vi · <title> mo dau Thoả thuận · h1 la Thoả thuận
    ket qua: man hong=0/3

- eval: E10
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_be_rong
  verified_at: 2026-09-03T02:36:45Z
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    ket qua 1440px: cat tran=0 · cat kem ba cham=0 · tong=7 · hong=0
    ket qua: o hong=0/12

- eval: E11
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_du_lieu_bien
  verified_at: 2026-09-03T02:36:45Z
  output: |
       co      1 hang · ten phap nhan 40-60 ky tu
             vi du: "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ"
    ket qua: trang thai thieu=0/3

- eval: E12
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T02:36:45Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    586ms >>> FULL TURBO

- eval: E13
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E13-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_dot_bien
  verified_at: 2026-09-03T02:36:45Z
  output: |
       Hau qua: quy ket theo khoa suy tu chuoi hien ra, khong tu tung luot rieng.

    ket qua: bat 236/236 khoa ve ra (100%) · do phu 55% · mu 0 · ngoai tam voi 190 · dot bien cun 0

- eval: E14
  judged_by: judge panel — domain-correctness, operational-feasibility, spec-alignment (fresh context)
  verdict: UNCERTAIN
  rationale: |
    Hội đồng 3 lăng kính: domain-correctness UNCERTAIN, operational-feasibility UNCERTAIN,
    spec-alignment PASS. Toàn bộ phiếu và lý lẽ từng lăng kính chép nguyên văn dưới đây
    (votes), không rút gọn hay viết lại.
  votes:
    - lens: domain-correctness
      verdict: UNCERTAIN
      rationale: |
        Giọng dịch nhìn chung tự nhiên, đúng chất quan hệ đối tác (vd "Chốt ${n} là không
        thành" thay vì dịch sát nghĩa thắng-thua), không đọc như bản dịch máy — câu (1)
        nghiêng PASS. Ba bảng cột đo ở E10 (companies/contacts/deals, 768–1440px) không cho
        ra cặp nhãn nào lẫn nhau kể cả sau khi bị cắt ("Số thoả thuận đan…", "Hoạt động
        gần…" đều tách bạch với các cột còn lại) — câu (3) không tìm được bằng chứng vi
        phạm trong đúng phạm vi E10. Câu (2) có một ứng viên thật — `contact.lastReply`:
        "last reply" → "trả lời gần nhất" (dòng 752) — bỏ từ phân loại danh từ mà mẫu song
        song "Hoạt động gần nhất" (dùng lặp lại có chủ đích trên ba màn) luôn giữ; nhưng
        "trả lời" cũng có thể đọc như danh từ tỉnh lược tự nhiên trong tiếng Việt, và không
        có file nào trong phạm vi cho thấy nhãn này thật sự đứng cạnh ô giá trị gì — nên
        không đủ căn cứ để chốt đây là SAI LOẠI TỪ rõ ràng hay một lựa chọn hợp lệ.
    - lens: operational-feasibility
      verdict: UNCERTAIN
      rationale: |
        Câu (1): bảng dịch đọc tự nhiên, có lý lẽ rõ về đăng ký giọng hợp tác (vd "Chốt
        ${n} là không thành" thay vì "thua", "Đã đổi người phụ trách cho ${n}" thay vì câu
        bị động máy móc) — không như bản dịch máy. Câu (3): dựa đúng chữ thật ở E10, không
        thấy cặp nhãn liền kề nào có nguy cơ lẫn nhau kể cả khi cắt (companies·768 hai cột
        bị cắt là "Số thoả thuận đan…" và "Hoạt động gần…", không giống nhau). Câu (2) là
        điểm mù: bảng tự đặt luật "nhãn mục phải là danh từ, không phải câu hỏi" (áp cho
        `section.onIt`) nhưng `section.whereItStands` = "Đang tới đâu" — chính nó là một
        câu hỏi/cụm động từ — nằm ngay cạnh trong cùng bảng "Mục và nhãn chung", trong khi
        các nhãn mục anh em (`Giới thiệu`, `Liên kết`, `Quá trình`, `Người tham gia`) đều là
        danh từ. Đây không khớp khuôn "cột bảng — ô dưới" mà câu hỏi ví dụ (cột chứa ngày)
        nêu, nên tôi không đủ chắc để tính nó là vi phạm hay chỉ là nhãn mục (không phải cột
        dữ liệu) nằm ngoài phạm vi câu hỏi.
    - lens: spec-alignment
      verdict: PASS
      rationale: |
        (1) Chữ đọc như tiếng Việt của người trong nghề quan hệ đối tác, không như bản dịch
        máy: các câu được cải biên theo ngữ cảnh chứ không dịch sát nghĩa đen — ví dụ
        "Budget pulled for the quarter" → "Đối tác hoãn sang quý sau" (đổi hẳn nội dung ví
        dụ, không phải dịch từng chữ), "Everyone you talk to at X" → "Mọi người bạn trao
        đổi ở X" (né khung "bán hàng" của bản gốc theo đúng CONTEXT.md). (2) Rà toàn bộ các
        nhãn cột (headers.*, dealColumns.*, contactColumns.*) đối chiếu với nội dung ô bên
        dưới: không tìm thấy nhãn nào lệch loại từ so với ô dưới nó — mọi nhãn cột trên
        ngày (`headers.closeDate`, `headers.created`, `headers.archived`, `deal.opened`,
        `deal.expectedClose`...) đều là cụm danh từ neo bằng "Ngày"/"Lần", và bảng còn tự
        ghi lý do neo để tránh đúng lỗi "chốt" đọc lửng giữa danh từ/động từ — cho thấy vấn
        đề này đã được xử lý chủ động, không phải bỏ sót. (3) Theo đúng chữ đo ở E10 (không
        đoán ảnh chụp): duy nhất một trường hợp hai nhãn cột đứng cạnh nhau cùng bị cắt trên
        cùng một màn là bảng companies ở 768px ("Số thoả thuận đan…" và "Hoạt động gần…") —
        nhưng hai chuỗi cắt này KHÔNG dễ lẫn vào nhau (khác chữ rõ ràng), và CONTEXT.md đã
        tự khai đúng hiện tượng này ("768px vẫn có hai trong năm tiêu đề bị cắt") kèm cơ chế
        giảm nhẹ đã có (dấu ba chấm + `title` cho trình đọc màn hình, xác nhận ở cột "title:
        co" trong E10). Không có cặp nhãn nào thật sự gây nhầm lẫn theo đúng nghĩa câu hỏi
        (3) đòi hỏi.
  required_evidence:
    - "(domain-correctness) Ảnh chụp (hoặc bản đo kiểu E10) màn hồ sơ cá nhân, mục hiện contact.lastReply, chụp đúng lúc nhãn \"trả lời gần nhất\" đứng cạnh giá trị thời gian thật của nó — nếu giá trị là một mốc thời gian/ngày thì câu (2) có căn cứ chốt SAI LOẠI TỪ; nếu là một đoạn trích trả lời (nội dung) thì nhãn hợp lệ."
    - "(domain-correctness) Chạy một bản mở rộng của rang/kiem-ke.mjs hoặc kiem-ban-dich.mjs đối chiếu toàn bộ 537 khoá (không chỉ ba bảng companies/contacts/deals đã đo ở E10) để xác nhận không còn nhãn nào khác lẫn loại từ với ô bên dưới, đặc biệt trong khối record-sheet (dòng 701–773) chưa được E10 đo tới."
    - "(operational-feasibility) Người quyết có tính section.whereItStands = \"Đang tới đâu\" (ban-dich.md, bảng \"Mục và nhãn chung\", dòng gần section.onIt) là một trường hợp \"sai loại từ\" theo câu hỏi (2) hay không — vì nó là nhãn MỤC chứ không phải nhãn CỘT bảng có ô dữ liệu bên dưới như ví dụ đề bài nêu; nếu tính là vi phạm thì verdict thành FAIL, nếu không tính thì câu (2) sạch và cần xét lại verdict tổng."
  human_override: 

- eval: E15
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khong_may_quet
  verified_at: 2026-09-03T02:36:45Z
  output: |
       qua ban-ve.mjs  be-rong.sh — cham san pham bang cach chay ban-ve.mjs
       dung vat that  may-chu-ve.sh
    ket qua: chan chi doc ma=0/7

- eval: E16
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E16-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_giai_doan
  verified_at: 2026-09-03T02:36:45Z
  output: |
       boc du  Closed lost          3 cho, chua boc 0
       boc du  Unqualified          3 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

### Lệnh suite (hồi quy)

- cmd: bunx turbo run check-types --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r3
  exit_code: 0
  verified_at: 2026-09-03T02:36:45Z

- cmd: bunx turbo run lint --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-03T02:36:45Z

- cmd: bun run lint:slop
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-03T02:36:45Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E10, E13, E15 failed — bề mặt ẩn chưa mở hết, bề rộng cột 768px thiếu vế title/ba chấm, độ phủ đột biến và chân chống-lách chưa đạt. Returned to implementation.
Round 2: E13 failed — độ phủ đột biến (mutation coverage) chưa đạt ngưỡng cổng 2. Returned to implementation.
