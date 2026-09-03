---
schema_version: 2
feature_slug: nhan-ung-dung-noi-tieng-viet
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0b054f8536f479f06c0ed7ba065d07e37494ab0e
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
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E1-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_ba_man
  verified_at: 2026-09-03T08:57:13Z
  output: |
       CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan · be mat lech=0

- eval: E2
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E2-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_ho_so
  verified_at: 2026-09-03T08:57:13Z
  output: |
       CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan

- eval: E3
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E3-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_dong_thoi_gian
  verified_at: 2026-09-03T08:57:13Z
  output: |
    ket qua: con lai=0 lan · duong hong (a) tieng Viet=co

- eval: E4
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E4-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_no_vong_1
  verified_at: 2026-09-03T08:57:13Z
  output: |
       khong hien     "Nothing found"                          · nhãn trạng thái bổ sung dữ liệu
       da dich        "2d ago"                                 · chữ thời gian tương đối
    ket qua: con tieng Anh=0 · khong hien de doi chieu=4 · tong=10

- eval: E5
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E5-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_trinh_doc_man_hinh
  verified_at: 2026-09-03T08:57:13Z
  output: |
    -- nhan chi trinh doc man hinh nghe: vi=196 lan, en=194 lan
    -- CON LAI: 0 chuoi / 0 lan
    ket qua: con lai=0 lan

- eval: E6
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E6-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T08:57:13Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    57ms >>> FULL TURBO

- eval: E7
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E7-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khai_tieng
  verified_at: 2026-09-03T08:57:13Z
  output: |
       boc du  Banking                2 cho, chua boc 0
       boc du  Accounting             1 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E8
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E8-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_doi_tieng
  verified_at: 2026-09-03T08:57:13Z
  output: |
       thanh chon dong con giu: co
       chu thoi gian sau khi doi: "5 phút trước" — tieng Viet
    ket qua: hong=0

- eval: E9
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E9-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_may_chu_ve
  verified_at: 2026-09-03T08:57:13Z
  output: |
       luot ve dau OK  /contacts — lang=vi · <title> mo dau Cá nhân · h1 la Cá nhân
       luot ve dau OK  /deals — lang=vi · <title> mo dau Thoả thuận · h1 la Thoả thuận
    ket qua: man hong=0/3

- eval: E10
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E10-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_be_rong
  verified_at: 2026-09-03T08:57:13Z
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    ket qua 1440px: cat tran=0 · cat kem ba cham=0 · tong=7 · hong=0
    ket qua: o hong=0/12

- eval: E11
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E11-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_du_lieu_bien
  verified_at: 2026-09-03T08:57:13Z
  output: |
       co      1 hang · ten phap nhan 40-60 ky tu
             vi du: "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ"
    ket qua: trang thai thieu=0/3

- eval: E12
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E12-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T08:57:13Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    57ms >>> FULL TURBO

- eval: E13
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E13-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_dot_bien
  verified_at: 2026-09-03T08:57:13Z
  output: |
       Hau qua: quy ket theo khoa suy tu chuoi hien ra, khong tu tung luot rieng.

    ket qua: bat 242/242 khoa ve ra (100%) · do phu 46% · mu 0 · khong quy ket 14 · ngoai tam voi 275 · dot bien cun 0

- eval: E15
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E15-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khong_may_quet
  verified_at: 2026-09-03T08:57:13Z
  output: |
       qua ban-ve.mjs  be-rong.sh — cham san pham bang cach chay ban-ve.mjs
       dung vat that  may-chu-ve.sh
    ket qua: chan chi doc ma=0/7

- eval: E16
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E16-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_giai_doan
  verified_at: 2026-09-03T08:57:13Z
  output: |
       boc du  Closed lost          3 cho, chua boc 0
       boc du  Unqualified          3 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E14
  judged_by: judge panel (fresh context) — 3 lens: domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  votes:
    - domain-correctness: PASS — Bảng dịch đọc như tiếng Việt của người trong nghề quan hệ đối tác: nhất quán đổi giọng bán hàng sang giọng hợp tác (vd. "đang bán cho" → "đang trao đổi", "đang mua" → "đang cần"), xử lý đúng ngữ pháp Việt (không thêm hậu tố số nhiều ở "thư", "vị trí", "người"), và có lý do tường minh cho mỗi chỗ lệch khỏi bản Anh — không đọc như dịch máy. Rà hết mọi nhãn cột bảng (headers.*, *Columns.* ở companies/contacts/deals và bốn bảng con của record-sheet) không thấy nhãn nào sai loại từ so với ô dưới nó: mọi cột chứa ngày đều neo danh từ "Ngày" nhất quán (Ngày tạo, Ngày lưu trữ, Ngày chốt, Ngày mở, Ngày dự kiến chốt), kể cả một ghi chú tường minh ở `deal.expectedClose` giải thích chủ động cách tránh đúng lỗi này. Dữ liệu đo thật ở E10 (companies 4 khổ rộng, contacts 3 khổ rộng) không cho thấy cặp nhãn liền kề nào đọc trùng hay lẫn nhau, kể cả hai tiêu đề bị cắt ở 768px ("Số thoả thuận đan…" và "Hoạt động gần…" — khác từ đầu, không lẫn); cặp "Tên"/"Tên miền" có chung tiền tố nhưng "Tên miền" không bao giờ bị cắt ngắn tới mức trùng ở bất cứ khổ nào được đo.
    - operational-feasibility: PASS — Đọc tự nhiên, đúng giọng nghề quan hệ đối tác, không có dấu vết dịch máy (chủ động hoá, thành ngữ như "dùng chung cả đội", "một cú bấm", xử lý đúng số ít/nhiều tiếng Việt). Không có nhãn cột nào sai loại từ so với ô dưới nó — mọi cột chứa ngày đều neo danh từ "Ngày" nhất quán, 7/7 trường hợp (`headers.created/archived/closeDate`, `deal.expectedClose`, `deal.opened`, `labels.createdDate/archivedDate`), kể cả có dòng tự giải trình đúng rủi ro câu hỏi này nêu. Theo đúng chữ đo ở E10 trên cả 3 bảng và 4-5 khổ (768-1440px), không cặp tiêu đề cột cạnh nhau nào trùng hay lẫn kể cả khi bị cắt bớt; cặp gần nhất về hình thức (`Tên`/`Tên miền`, companies) không thực sự lẫn vì `Tên miền` không bao giờ bị cắt ở mọi khổ đo được.
    - spec-alignment: UNCERTAIN — Câu (1) PASS rõ: giọng quan hệ đối tác tự nhiên, nhiều chỗ diễn giải lại thay vì dịch sát chữ (vd. `company.noDealsBody`/`contact.notOnDealsBody` bỏ khung "đang bán cho"; tên đặt chỗ đổi Stripe→Đất Xanh, Jane Cooper→Nguyễn Thị Lan), không đọc như dịch máy. Câu (2) và (3) mỗi câu có một ứng viên thật nhưng mức nghiêm trọng chưa đủ rõ để chốt: năm nhãn `closing.overdue/thisMonth/nextMonth/later/none` cùng một nhóm hạn chốt trộn loại từ (`Quá hạn`/`Muộn hơn` là tính từ, `Chốt trong tháng này`/`Chốt tháng sau` là cụm động từ); và `Số lượng cá nhân` / `Số thoả thuận đang mở` đứng cạnh nhau ở bảng Companies (1024–1440px, chữ không bị cắt theo E10) dùng chung tiền tố "Số". Không tìm thấy nhãn nào sai loại từ trên một cột NGÀY cụ thể — mọi nhãn ngày trong bảng đều neo bằng "Ngày" đúng như ví dụ câu (2) nêu, kể cả `deal.expectedClose` tự giải thích lý do neo.
      required_evidence:
        - Ảnh chụp hoặc DOM của khối lọc/nhóm 'Hạn chốt' trên màn Deals, tiếng Việt, hiện đồng thời cả 5 nhãn closing.overdue/thisMonth/nextMonth/later/none — nếu hai nhãn cụm động từ (Chốt trong tháng này, Chốt tháng sau) không đứng cùng khối hiển thị với ba nhãn tính từ/mệnh đề kia (Quá hạn, Muộn hơn, Chưa có ngày chốt) thì câu (2) hết vướng, verdict đổi PASS.
        - Ảnh chụp thật (không phải bảng số đo) của bảng Companies tiếng Việt ở 1024px trở lên, đủ 7 cột tiêu đề, để xác nhận bằng mắt cặp 'Số lượng cá nhân' / 'Số thoả thuận đang mở' đứng cạnh nhau có thật sự dễ đọc lẫn khi lướt nhanh hay tách bạch rõ — nếu tách bạch rõ thì câu (3) hết vướng, verdict đổi PASS.
  human_override:

### Lệnh suite (hồi quy)

- cmd: bunx turbo run check-types --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r7
  exit_code: 0
  verified_at: 2026-09-03T08:57:13Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    10.914s

- cmd: bunx turbo run lint --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r7
  exit_code: 0
  verified_at: 2026-09-03T08:57:13Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    409ms

- cmd: bun run lint:slop
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bun_run_lint_slop-r7
  exit_code: 0
  verified_at: 2026-09-03T08:57:13Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 1.9s on 786 files with 9 rules using 14 threads.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 3 — baseline khong do lai round nay
none — không có eval nào được đánh dấu không-phân-biệt round này (baseline không đo lại round 7; xem round 3 cho lần đo baseline gần nhất)

## Variance

none — không có eval nào chạy nhiều lần (runs > 1) round này

## Iterations

Round 1: E1 failed — bản vẽ ba màn chưa mở đủ bề mặt ẩn trước khi đối chiếu. Returned to implementation.
Round 2: E13 failed — chặn đột biến báo tỷ lệ bắt dưới ngưỡng khớp mới. Returned to implementation.
Round 3: 16 eval máy PASS; E14 (AC-13) UNCERTAIN ở hai lens (domain-correctness, operational-feasibility) — verdict PENDING-JUDGMENT, chờ người quyết.
Round 4: 16/16 tiêu chí máy đạt, 0 lệnh đỏ, 0 bị chặn, hội đồng E14 PASS. Verdict REJECT vì bảy phát hiện trong-hợp-đồng, cả bảy nhắm vào THƯỚC chứ không vào sản phẩm. Lượt đầu của vòng 4 bị BLOCKED oan ở E16 — chân khai tiếng ném lỗi trần khi máy chủ nghẽn nên người kiểm chẩn đoán sai thành 'API chưa chạy'; API thật ra đã sống 20 giờ. Đã vá chân để nó tự phân biệt hai ca, và chạy lại cùng vòng.
Round 5: E13 failed — chặn đột biến chỉ bắt được 240/254 khoá bốn chân có vẻ ra (94%, dưới ngưỡng 100% đã sửa ở Cổng 2 S4-r2); 265 khoá ngoài tầm với đã ghi tên đủ ở rang/dot-bien-sot.txt. 15/16 eval máy còn lại PASS, hội đồng E14 giữ nguyên PASS ở cả ba lens. Verdict REJECT vì có eval máy thất bại thật (E13), chưa tính tới sáu phát hiện trong-hợp-đồng khác vẫn còn treo từ round 4. Returned to implementation.
Round 6: 16/16 eval máy PASS (E13 nay bắt đủ 240/240 khoá bốn chặn có vẻ ra = 100%, đạt đúng ngưỡng đã sửa ở Cổng 2 S4-r2). Hội đồng E14 lật từ PASS (round 4, round 5) sang UNCERTAIN ở hai lens (operational-feasibility, spec-alignment) — domain-correctness vẫn PASS; cả hai lens UNCERTAIN đều thiếu bằng chứng đo "chữ thật hiện ra" cho record-sheet/deals mà E10 chưa phủ. Verdict REJECT vì một phát hiện trong-hợp-đồng mức cao khớp AC-2: mười vị trí chữ Anh cứng còn sót trên hồ sơ công ty, hồ sơ thoả thuận, dòng thời gian, danh sách trường và hộp thoại lưu view — khoá dịch đã tồn tại sẵn trong kho chuỗi nhưng chưa được nối vào JSX; guard test chỉ soi kho chuỗi chứ không đọc JSX nên không bắt được lớp lỗi này. Returned to implementation.
Round 7: 16/16 eval máy PASS (E13 giữ đúng ngưỡng, bắt đủ 242/242 khoá bốn chặn có vẻ ra = 100%), 0 lệnh suite đỏ, 0 bị chặn. Hội đồng E14: operational-feasibility quay lại PASS (round 6 từng UNCERTAIN), domain-correctness giữ PASS, nhưng spec-alignment tiếp tục UNCERTAIN — hai câu hỏi mới: nhãn nhóm 'Hạn chốt' (Quá hạn/Muộn hơn là tính từ, Chốt trong tháng này/Chốt tháng sau là cụm động từ) và cặp 'Số lượng cá nhân'/'Số thoả thuận đang mở' cùng tiền tố 'Số' trên bảng Companies; verdict eval vẫn UNCERTAIN, chờ người quyết. Verdict REJECT vì năm phát hiện trong-hợp-đồng: hai hộp thoại xoá (thoả thuận, cá nhân) còn nguyên câu tiếng Anh cứng dù khoá dịch tương ứng đã có sẵn trong kho chuỗi nhưng chưa được gọi (AC-2); huy hiệu kiểu trường trong tấm Trường vẫn tiếng Anh vì máy chủ đúc sẵn chuỗi hiển thị thay vì gửi khoá cho client dịch (AC-2); companies.ts lệch khuôn `satisfies` so với bốn kho chuỗi anh em, mất chốt biên dịch cho khoá thiếu (AC-12); và menu 'Change stage' trong thao tác hàng loạt trên màn Deals — chính màn round này tuyên bố phủ — chưa có khoá dịch (AC-1). Thêm mười ba phát hiện ngoài-hợp-đồng, phần lớn chỉ ra các chân đo (E2, E4, E9, E11, E15, E16, messages-guard) chứng minh yếu hơn lời hứa của chúng; ghi ở review-findings.md cho Cổng 2. Returned to implementation.