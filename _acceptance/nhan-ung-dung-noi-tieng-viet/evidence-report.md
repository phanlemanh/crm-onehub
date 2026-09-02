---
schema_version: 2
feature_slug: nhan-ung-dung-noi-tieng-viet
verdict: REJECT
failed_evals: [E1, E10, E13, E15]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b0e0c45ced78356fc8efbb9c59ca538bc06c9178
human_signoff:
---

# Evidence Report: nhan-ung-dung-noi-tieng-viet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | FAIL |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | FAIL |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-12 | script | FAIL |
| E14 | AC-13 | judgment | UNCERTAIN |
| E15 | AC-1 | script | FAIL |
| E16 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E1-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.rang3_ba_man
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
    -- man companies · be mat khai=10 · da mo vi=10 en=10
       da mo: menu Bộ lọc · menu con facet 1 · menu con facet 2 · menu con facet 3 · menu con facet 4 · menu Sắp xếp · menu Cột · menu Views · thanh chọn dòng · hộp thoại tạo mới
       CON LAI: 0 chuoi / 0 lan
    TimeoutError: Waiting failed: 30000ms exceeded
        at new WaitTask (node_modules/.bun/puppeteer-core@25.9.0/node_modules/puppeteer-core/lib/puppeteer/common/WaitTask.js:46:34)
        at IsolatedWorld.waitForFunction (puppeteer-core/lib/puppeteer/api/Realm.js:49:26)
        at CdpFrame.waitForFunction (puppeteer-core/lib/puppeteer/api/Frame.js:585:43)
        at doc (_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs:598:16)
        at async file://.../rang/ban-ve.mjs:616:15
    Node.js v24.15.0

- eval: E2
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_ho_so
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
    CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan

- eval: E3
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_dong_thoi_gian
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
    (b) KHONG phai chieu do — hop dong khai cau may chu van tieng Anh, vong ④

    ket qua: con lai=0 lan · duong hong (a) tieng Viet=co

- eval: E4
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_no_vong_1
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
    da dich        "2d ago"                                 · chữ thời gian tương đối
    ket qua: con tieng Anh=0 · khong hien de doi chieu=4 · tong=10

- eval: E5
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_trinh_doc_man_hinh
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
    -- nhan chi trinh doc man hinh nghe: vi=196 lan, en=196 lan
    -- CON LAI: 0 chuoi / 0 lan
    ket qua: con lai=0 lan

- eval: E6
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
    Tasks:    11 successful, 11 total
    Cached:    10 cached, 11 total
      Time:    3.184s

- eval: E7
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_khai_tieng
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
       boc du  Banking                2 cho, chua boc 0
       boc du  Accounting             1 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E8
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_doi_tieng
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
       trang KHONG tai lai:     dung
       thanh chon dong con giu: co
    ket qua: hong=0

- eval: E9
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_may_chu_ve
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
       luot ve dau OK  /contacts — lang=vi · <title> mo dau Cá nhân · h1 la Cá nhân
       luot ve dau OK  /deals — lang=vi · <title> mo dau Thoả thuận · h1 la Thoả thuận
    ket qua: man hong=0/3

- eval: E10
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E10-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.rang3_be_rong
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
    TimeoutError: Waiting failed: 30000ms exceeded
        at new WaitTask (node_modules/.bun/puppeteer-core@25.9.0/node_modules/puppeteer-core/lib/puppeteer/common/WaitTask.js:46:34)
        at IsolatedWorld.waitForFunction (puppeteer-core/lib/puppeteer/api/Realm.js:49:26)
        at CdpFrame.waitForFunction (puppeteer-core/lib/puppeteer/api/Frame.js:585:43)
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    ket qua 1440px: cat tran=0 · cat kem ba cham=0 · tong=7 · hong=0
    ket qua: o hong=1/12

- eval: E11
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_du_lieu_bien
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
       co      1 hang · ten phap nhan 40-60 ky tu
             vi du: "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ"
    ket qua: trang thai thieu=0/3

- eval: E12
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
    Tasks:    11 successful, 11 total
    Cached:    10 cached, 11 total
      Time:    3.184s

- eval: E13
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E13-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.rang3_dot_bien
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
       nguong khai: bat >= 95% SO KHOA — dat 231/390 = 59%
       KHONG DAT · moi khoa khong bat duoc da co ten o rang/dot-bien-sot.txt
       LECH LOI KY: E13 doi 'mot khoa mot luot, dung 1 dong khac ban goc'.
       Chan nay dot bien ca kho mot luot va kiem 2 dong x so khoa.
       Ly do: 390 luot x 4 chan x ~3 phut = ~20 gio may chu that.
       Hau qua: quy ket theo khoa suy tu chuoi hien ra, khong tu tung luot rieng.

    ket qua: bat 231/390 khoa (59%) · ve ra 231 · mu 0 · ngoai phu 159 · dot bien cun 0

- eval: E14
  judged_by: judge panel — domain-correctness, operational-feasibility, spec-alignment (fresh context)
  verdict: UNCERTAIN
  rationale: |
    Panel không carried, không ungrounded — chấm mới trên round này, dùng ban-dich.md và E10-chu-hien-ra.txt làm hai đầu vào bắt buộc.
    - domain-correctness: UNCERTAIN — (1) Trong phạm vi các mục CÓ mặt, bảng dịch đọc như tiếng Việt của người trong nghề quan hệ hợp tác — có lý do rõ cho từng chỗ lệch khỏi nghĩa đen, né giọng bán hàng ("đang bán" → "đang cần"/"đang trao đổi"), không có dấu hiệu dịch máy. Nhưng đối chiếu với E10 (đầu vào bắt buộc), hai tiêu đề cột thật đang hiện trên màn companies — "Số lượng cá nhân" và "Số thoả thuận đang mở" (đo ở mọi khổ 1024px trở lên) — KHÔNG có mặt ở bất cứ đâu trong ban-dich.md, dù tài liệu tự nhận đã liệt kê đủ 357 chuỗi qua đúng năm mục (11+32+34+170+110=357 khớp). Nghĩa là bảng "đã chốt TRƯỚC khi chấm" không phủ hết chữ thật đang chạy, nên không thể xác nhận hai nhãn này đã qua đúng luật từ điển của CONTEXT.md. (2) Trong các mục có mặt, không thấy nhãn cột nào lệch loại từ so với ô ngày dưới nó — mọi tiêu đề cột-ngày đều là cụm danh từ có "Ngày" tường minh (Ngày tạo, Ngày chốt, Ngày lưu trữ). (3) Với đúng chữ thật đo ở E10, hai tiêu đề bị cắt trên cùng màn companies@768px ("Số thoả thuận đan…" và "Hoạt động gần…") vẫn phân biệt rõ, không có cặp nhãn cạnh nhau nào dễ lẫn.
    - operational-feasibility: UNCERTAIN — Bảng đọc như tiếng Việt tự nhiên có căn cứ rõ cho từng lựa chọn từ, không như bản dịch máy (Q1 đạt); trong các nhãn cột companies/contacts đo ở E10, không thấy cặp nhãn liền kề nào dễ lẫn dù bị cắt ở 768px — "Số thoả thuận đan…" và "Hoạt động gần…" không trùng nhau và không trùng nhãn nào khác trên cùng màn (Q3 đạt). Nhưng deal.expectedClose dịch thành "Dự kiến chốt", bỏ neo danh từ "Ngày" mà mọi nhãn ngày anh em khác trong cùng file đều giữ (deal.opened→"Ngày mở", headers.closeDate→"Ngày chốt", labels.createdDate→"Ngày tạo", labels.archivedDate→"Ngày lưu trữ") — dòng này không có Ghi chú giải thích, và "chốt" trong tiếng Việt lưỡng tính danh từ/động từ nên không đủ căn cứ để nói chắc nhãn này đọc như danh từ ngày ("dự kiến [ngày] chốt") hay như cụm động từ lơ lửng ("dự kiến [sẽ] chốt") — đúng dạng vi phạm câu hỏi 2 nêu ví dụ, nhưng chưa đủ bằng chứng để chốt PASS hay FAIL.
    - spec-alignment: PASS — (1) Bảng dịch đọc như tiếng Việt của người trong nghề: nhiều chỗ né sát nghĩa gốc để đúng giọng hợp tác (vd. "trao đổi" thay "đang bán", "Mức thân quen" thay câu "We know them", "Vì sao không thành?" thay "mất vào tay ai") — không phải khuôn dịch máy. (2) Trong các nhãn cột có nêu rõ loại ô dưới nó (Ngày tạo/Ngày lưu trữ/Ngày chốt, đều đứng trước ô ngày), tất cả đều là cụm danh từ đúng loại từ, không thấy cụm động từ đặt trên cột ngày. (3) Trong đúng phạm vi chữ thật đã đo ở E10 (companies/contacts, 4 khổ rộng), không có cặp nhãn liền kề nào — kể cả bản bị cắt bớt dấu ba chấm ("Số thoả thuận đan…", "Hoạt động gần…") — trùng hoặc dễ lẫn nhau; tiền tố còn lại của mỗi nhãn vẫn phân biệt rõ.
  required_evidence:
    - "Khoá i18n và bản dịch đã rà theo luật CONTEXT.md cho hai tiêu đề cột companies đo tại E10 — 'Số lượng cá nhân' và 'Số thoả thuận đang mở' (ví dụ: grep khoá trong file i18n nguồn của module companies, hoặc một dòng bổ sung trong ban-dich.md ghi rõ khoá + lý do) — nếu xuất hiện và tuân đúng luật (không đúc từ ghép, đúng từ điển), câu hỏi (1) đổi từ UNCERTAIN sang PASS."
    - "Đo 'chữ thật hiện ra' (kiểu bảng E10) cho khu vực hồ sơ thoả thuận (record-sheet) ở các khổ 768/1024/1280/1440px, riêng nhãn deal.expectedClose ('Dự kiến chốt') đặt cạnh giá trị ngày — file hiện chưa tồn tại, cần sinh thêm vào _acceptance/nhan-ung-dung-noi-tieng-viet/evidence/ song song E10."
    - "Một dòng Ghi chú trong ban-dich.md giải thích lựa chọn 'Dự kiến chốt' (thay vì 'Ngày dự kiến chốt') cho hàng deal.expectedClose, xác nhận nó đọc như danh từ neo ngày nhất quán với các nhãn ngày anh em khác trong cùng bảng — nếu thêm dòng này với lý lẽ hợp lý, verdict đổi sang PASS cho câu hỏi 2."
  human_override:

- eval: E15
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E15-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.rang3_khong_may_quet
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
    dung vat that  ban-ve.mjs
    CHI DOC MA     dot-bien.mjs — chan nay khong cham toi san pham dang chay
    dung vat that  du-lieu-bien.mjs
    dung vat that  khai-tieng.mjs
    dung vat that  no-vong-1.mjs
    CHI DOC MA     be-rong.sh — chan nay khong cham toi san pham dang chay
    dung vat that  may-chu-ve.sh
    ket qua: chan chi doc ma=2/7

- eval: E16
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_giai_doan
  verified_at: 2026-09-02T23:58:00+07:00
  output: |
       boc du  Closed lost          3 cho, chua boc 0
       boc du  Unqualified          3 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

### Lệnh suite (hồi quy)

- cmd: bunx turbo run check-types --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r1
  exit_code: 0
  verified_at: 2026-09-02T23:58:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-02T23:58:00+07:00

- cmd: bun run lint:slop
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-02T23:58:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

E6, E12 — `bun run db:test && bun run test` xanh trên cả HEAD lẫn baseline (diffBase): hai eval này không phân biệt được feature khỏi code cũ. Đây là bài kiểm hồi quy có chủ ý (regression-guard) đã tồn tại trước vòng này, không phải bằng chứng riêng cho AC-6/AC-12 — nên đọc như một guard bình thường, không phải một chỗ hổng của E6/E12.

## Variance

none — không có eval nào mang field `runs > 1` trong vòng này; không eval nào chạy nhiều lần.

## Iterations

Round 1: E1, E10, E13, E15 failed. E1 và E10 cùng vỡ ở `TimeoutError: Waiting failed: 30000ms exceeded` trong puppeteer — E1 khi bóc bề mặt ẩn trên màn companies (menu Views), E10 khi đo bề rộng chữ ở 1440px. E13 chỉ bắt được đột biến 231/390 khoá (59%), dưới ngưỡng khai 95%. E15 (chặn chống-lách) chỉ xác nhận 2/7 chặn E1-E11 dùng trình duyệt/trình biên dịch thật, 5 chặn còn lại chưa được đóng dấu "dung vat that" qua phép kiểm hiện có. Trả về S3 implementation.