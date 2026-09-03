---
schema_version: 2
feature_slug: nhan-ung-dung-noi-tieng-viet
verdict: REJECT
failed_evals: [E13]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 422ea73b4b8737f5cf454e7536aedb62488954e2
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
| E14 | AC-13 | judgment | UNCERTAIN |
| E15 | AC-1 | script | PASS |
| E16 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E1-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_ba_man
  verified_at: 2026-09-03T11:00:00Z
  output: |
    ket qua: con lai=0 lan · be mat lech=0

- eval: E2
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E2-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_ho_so
  verified_at: 2026-09-03T11:00:00Z
  output: |
       CON LAI: 0 chuoi / 0 lan

    ket qua: con lai=0 lan

- eval: E3
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E3-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_dong_thoi_gian
  verified_at: 2026-09-03T11:00:00Z
  output: |
       (b) KHONG phai chieu do — hop dong khai cau may chu van tieng Anh, vong ④

    ket qua: con lai=0 lan · duong hong (a) tieng Viet=co

- eval: E4
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E4-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_no_vong_1
  verified_at: 2026-09-03T11:00:00Z
  output: |
       khong hien     "Nothing found"                           · nhãn trạng thái bổ sung dữ liệu
       da dich        "2d ago"                                  · chữ thời gian tương đối
    ket qua: con tieng Anh=0 · khong hien de doi chieu=4 · tong=10

- eval: E5
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E5-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_trinh_doc_man_hinh
  verified_at: 2026-09-03T11:00:00Z
  output: |
    -- nhan chi trinh doc man hinh nghe: vi=196 lan, en=196 lan
    -- CON LAI: 0 chuoi / 0 lan
    ket qua: con lai=0 lan

- eval: E6
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E6-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T11:00:00Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    32ms >>> FULL TURBO

- eval: E7
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E7-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khai_tieng
  verified_at: 2026-09-03T11:00:00Z
  output: |
       boc du  Banking                2 cho, chua boc 0
       boc du  Accounting             1 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E8
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E8-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_doi_tieng
  verified_at: 2026-09-03T11:00:00Z
  output: |
       thanh chon dong con giu: co
       chu thoi gian sau khi doi: "5 phút trước" — tieng Viet
    ket qua: hong=0

- eval: E9
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E9-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_may_chu_ve
  verified_at: 2026-09-03T11:00:00Z
  output: |
       luot ve dau OK  /contacts — lang=vi · <title> mo dau Cá nhân · h1 la Cá nhân
       luot ve dau OK  /deals — lang=vi · <title> mo dau Thoả thuận · h1 la Thoả thuận
    ket qua: man hong=0/3

- eval: E10
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E10-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_be_rong
  verified_at: 2026-09-03T11:00:00Z
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    ket qua 1440px: cat tran=0 · cat kem ba cham=0 · tong=7 · hong=0
    ket qua: o hong=0/12

- eval: E11
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E11-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_du_lieu_bien
  verified_at: 2026-09-03T11:00:00Z
  output: |
       co      1 hang · ten phap nhan 40-60 ky tu
             vi du: "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ"
    ket qua: trang thai thieu=0/3

- eval: E12
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E12-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-03T11:00:00Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    32ms >>> FULL TURBO

- eval: E13
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E13-r5
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.rang3_dot_bien
  verified_at: 2026-09-03T11:00:00Z
  output: |
    -- cham theo dung loi da ky o E13 (ban thu pham vi, Cong 2 S4-r2)
       nguong: bat 100% khoa BON CHAN CO VE RA — dat 240/254 = 94%
       KHONG DAT · 265 khoa ngoai tam voi da co ten o rang/dot-bien-sot.txt
       do phu de doi chieu, khong phai nguong: 49% (254/519)
       LECH DA KHAI (E13 ban thu pham vi chap nhan, va doi in ra):
       E13 goc doi 'mot khoa mot luot'.
       Chan nay dot bien ca kho mot luot va kiem 2 dong x so khoa.
       Ly do: 519 luot x 4 chan x ~3 phut = ~104 gio may chu that.
       Hau qua: quy ket theo khoa suy tu chuoi hien ra, khong tu tung luot rieng.

    ket qua: bat 240/254 khoa ve ra (94%) · do phu 49% · mu 14 · ngoai tam voi 265 · dot bien cun 0

- eval: E15
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E15-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_khong_may_quet
  verified_at: 2026-09-03T11:00:00Z
  output: |
       qua ban-ve.mjs  be-rong.sh — cham san pham bang cach chay ban-ve.mjs
       dung vat that  may-chu-ve.sh
    ket qua: chan chi doc ma=0/7

- eval: E16
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E16-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_giai_doan
  verified_at: 2026-09-03T11:00:00Z
  output: |
       boc du  Closed lost          3 cho, chua boc 0
       boc du  Unqualified          3 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E14
  judged_by: judge panel (fresh context) — 3 lens: domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  votes:
    - domain-correctness: PASS — (1) Bảng đọc như tiếng Việt của người trong nghề quan hệ đối tác: các ghi chú giải thích chọn "đối tác đã có bên hợp tác khác" thay vì dịch sát "budget pulled", đổi khung "đang bán/selling" thành "đang trao đổi", và né "thắng-thua" bằng "không thành" — đây là lý luận ngữ nghĩa chủ động, không phải máy dịch từng chữ. (2) Rà toàn bộ headers.*, labels.*, và các *dealColumns/*contactColumns liên quan tới ngày (Ngày tạo, Ngày lưu trữ, Ngày chốt, Ngày mở, Ngày dự kiến chốt) đều neo danh từ đúng loại; ghi chú ở deal.expectedClose cho thấy người dịch chủ động phòng đúng lỗi "chốt" lửng giữa danh/động từ mà câu hỏi nêu làm ví dụ — không tìm được cụm động từ nào đặt trên cột ngày. (3) Theo đúng chữ thật đo ở E10 (không đoán ảnh chụp): tại 768px chỉ hai tiêu đề bị cắt ở bảng companies — "Số thoả thuận đan…" và "Hoạt động gần…" — hai chuỗi này không giống nhau nên không gây lẫn; các cặp còn lại trong E10 hiện đầy đủ, không cắt.
    - operational-feasibility: PASS — (1) Bảng đọc như tiếng Việt của người trong nghề: mỗi dòng có lý do ngữ nghĩa cụ thể (bỏ chữ đã cấp bởi ngữ cảnh, đổi khung "bán hàng" sang khung "hợp tác", giữ tên riêng), không phải suy luận từ-đối-từ; đúng như luật đã khai, 199 dòng S4-r1 được chấm theo chất lượng chữ chứ không bị trừ vì chấm sau khi chạm mã. (2) Rà hết các khoá headers.* của ba bảng (companies/contacts/deals) trong ban-dich.md thì mọi nhãn cột ngày đều là cụm danh từ neo bằng "Ngày" (Ngày chốt, Ngày tạo, Ngày lưu trữ) — không thấy cụm động từ nào đứng trên cột ngày; "Phụ trách" đứng trên cột tên người là cách dùng tỉnh lược quen thuộc trong UI tiếng Việt, không phải lỗi sai loại từ rõ ràng. (3) Đối chiếu đúng CHỮ THẬT trong E10: chỉ ba ô bị cắt (Số thoả thuận đan…, Hoạt động gần… ở companies 768px; Hoạt động gần… ở contacts 768px) và không cặp nào trong số đó đứng cạnh nhau đọc giống nhau hay dễ lẫn.
    - spec-alignment: PASS — (1) Bảng đọc như tiếng Việt của người trong nghề: đổi khung "bán hàng" sang "hợp tác" nhất quán (VD company.noDealsBody, deal.descriptionHint), dùng ví dụ Việt hoá ("Đất Xanh", "Nguyễn Thị Lan"), và tự nêu rủi ro chữ lửng danh/động từ ("chốt" ở deal.expectedClose) rồi neo "Ngày" để sửa — dấu hiệu người bản ngữ cân nhắc, không phải máy dịch. (2) Rà hết các nhãn cột đứng trên ô ngày (headers.created, headers.archived, headers.closeDate, deal.opened, deal.expectedClose) đều neo danh từ "Ngày ..." đúng loại từ với ô ngày bên dưới; không thấy nhãn nào là cụm động từ trần đặt trên cột chứa ngày. (3) Theo đúng chữ thật đo ở E10 (không đoán ảnh), cặp nhãn liền kề duy nhất có nguy cơ lẫn là "Tên" và "Tên miền" trên màn companies (cột 2 mang nguyên tiền tố cột 1) ở mọi khổ đo — nhưng cả hai luôn hiện đủ chữ, không bị cắt, nên mức lẫn thấp và không phải lỗi cắt chữ; không có cặp nào bị "…" cắt tới mức đọc thành nghĩa khác của nhau.
  human_override:

### Lệnh suite (hồi quy)

- cmd: bunx turbo run check-types --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r5
  exit_code: 0
  verified_at: 2026-09-03T11:00:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    9.678s

- cmd: bunx turbo run lint --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-09-03T11:00:00Z
  output: |
      Time:    702ms

    Linting completed across all 10 packages with warnings (noBarrelFile, noImportantStyles, noUnusedImports, noDocumentCookie patterns detected in @crm/auth, @crm/telemetry, @crm/ui, @crm/db, agent, api, and app). All tasks succeeded despite warnings.

- cmd: bun run lint:slop
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-09-03T11:00:00Z
  output: |
    $ oxlint

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 3 — baseline khong do lai round nay
none — không có eval nào được đánh dấu không-phân-biệt round này (baseline không đo lại round 5; xem round 3 cho lần đo baseline gần nhất)

## Variance

none — không có eval nào chạy nhiều lần (runs > 1) round này

## Iterations

Round 1: E1 failed — bản vẽ ba màn chưa mở đủ bề mặt ẩn trước khi đối chiếu. Returned to implementation.
Round 2: E13 failed — chặn đột biến báo tỷ lệ bắt dưới ngưỡng khớp mới. Returned to implementation.
Round 3: 16 eval máy PASS; E14 (AC-13) UNCERTAIN ở hai lens (domain-correctness, operational-feasibility) — verdict PENDING-JUDGMENT, chờ người quyết.
Round 4: 16/16 tiêu chí máy đạt, 0 lệnh đỏ, 0 bị chặn, hội đồng E14 PASS. Verdict REJECT vì bảy phát hiện trong-hợp-đồng, cả bảy nhắm vào THƯỚC chứ không vào sản phẩm. Lượt đầu của vòng 4 bị BLOCKED oan ở E16 — chân khai tiếng ném lỗi trần khi máy chủ nghẽn nên người kiểm chẩn đoán sai thành 'API chưa chạy'; API thật ra đã sống 20 giờ. Đã vá chân để nó tự phân biệt hai ca, và chạy lại cùng vòng.
Round 5: E13 failed — chặn đột biến chỉ bắt được 240/254 khoá bốn chân có vẻ ra (94%, dưới ngưỡng 100% đã sửa ở Cổng 2 S4-r2); 265 khoá ngoài tầm với đã ghi tên đủ ở rang/dot-bien-sot.txt. 15/16 eval máy còn lại PASS, hội đồng E14 giữ nguyên PASS ở cả ba lens. Verdict REJECT vì có eval máy thất bại thật (E13), chưa tính tới sáu phát hiện trong-hợp-đồng khác vẫn còn treo từ round 4. Returned to implementation.
