---
schema_version: 2
feature_slug: tieng-viet-cho-crm
verdict: REJECT
failed_evals: [E6, E9]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f35482782cb298c96c9f5287245637aa987423af
human_signoff:
---

# Evidence Report: tieng-viet-cho-crm

Cây đã ghim: `f35482782cb298c96c9f5287245637aa987423af`. Lúc bắt đầu nghiệm thu
`git status --porcelain` **sạch** — không một file nào đổi. Sau nghiệm thu cây
mang thêm các file hồ sơ mới trong `_acceptance/tieng-viet-cho-crm/` (ảnh chụp,
`run-log.jsonl`, báo cáo này) và không gì khác; không file mã nào đổi.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E6 | AC-6 | ui-check | FAIL |
| E9 | AC-9 | ui-check | FAIL |
| E12 | AC-11 | judgment | UNCERTAIN |
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-12 | ui-check | PASS |

## Evidence

- eval: E6
  run_id: tieng-viet-cho-crm-E6-1788256356
  exit_code: 1
  baseline: n-a
  verifier: /private/tmp/claude-501/-Users-manhphan-dev-crm/20609c9a-7b0d-440b-9c9b-18ec9c53da84/scratchpad/uicheck.mjs
  verified_at: 2026-09-01T09:52:36Z
  screenshot: evidence/E6-step1.png
  observed: |
    Màn công ty ở `lang="vi"`: bảy tiêu đề cột là tiếng Việt (Tên · Tên miền ·
    Ngành · Phụ trách · Cá nhân · Thoả thuận mở · Hoạt động cuối), nhưng phần
    còn lại của màn vẫn tiếng Anh và nhìn thấy rõ: tiêu đề "Companies", câu
    "Every account in the pipeline.", nút "New company", ô tìm "Search companies
    by name or domain…", năm nút thanh công cụ "Filters · Sort · Columns (7) ·
    Views · Archived", dòng chân "Showing 1–15 of 15", và chip "Enriching" trên
    thanh đầu trang.
  network_observed: n-a (driver)
  output: |
    VISIBLE ENGLISH UI STRINGS ON THE COMPANIES SCREEN:
      * "Companies"
      * "Every account in the pipeline."
      * "New company"
      * "Filters" / "Sort" / "Columns" / "Views" / "Archived"
      * "Showing" ... "of 15"
      * "Enriching"
    count=11

- eval: E9
  run_id: tieng-viet-cho-crm-E9-1788256360
  exit_code: 1
  baseline: n-a
  verifier: /private/tmp/claude-501/-Users-manhphan-dev-crm/20609c9a-7b0d-440b-9c9b-18ec9c53da84/scratchpad/uicheck.mjs
  verified_at: 2026-09-01T09:52:40Z
  screenshot: evidence/E9-step1.png
  observed: |
    Ở 768px hai tiêu đề cột cuối bị chém ngang ở mép phải của bảng: "Thoả thuận
    mở" chỉ còn đọc được chữ "Thoả", "Hoạt động cuối" chỉ còn "Hoạt độ". Không
    có dấu ba chấm — chữ bị cắt trần, nên người đọc không có tín hiệu nào rằng
    còn chữ phía sau. Khung đối chiếu 1440px (`evidence/E9-step2.png`) vẫn cắt
    "Thoả thuận mở" thành "Thoả thuận n".
  network_observed: n-a (driver)
  output: |
    CLIPPED COLUMN HEADERS AT 768px:
      * {"header":"Thoả thuận mở","cellWidth":60,"textWidth":116}
      * {"header":"Hoạt động cuối","cellWidth":79,"textWidth":118}
    count=2

- eval: E1
  run_id: tieng-viet-cho-crm-E1-1788255997
  exit_code: 0
  baseline: n-a
  verifier: /private/tmp/claude-501/-Users-manhphan-dev-crm/20609c9a-7b0d-440b-9c9b-18ec9c53da84/scratchpad/lang.sh
  verified_at: 2026-09-01T09:46:37Z
  screenshot: evidence/E1-step1.html
  observed: |
    Bản chụp là lượt trả về ĐẦU TIÊN của máy chủ, lấy bằng curl nên không có
    JavaScript nào chạy. Không cookie, header `Accept-Language: vi-VN,vi;q=0.9`.
    Dòng thẻ gốc đọc được trong file: `<html lang="vi" …>`.
  network_observed: n-a (driver)
  output: |
    html element: <html lang="vi" class="… h-full antialiased">
    OK: server first render carries lang=vi

- eval: E2
  run_id: tieng-viet-cho-crm-E2-1788255997
  exit_code: 0
  baseline: n-a
  verifier: /private/tmp/claude-501/-Users-manhphan-dev-crm/20609c9a-7b0d-440b-9c9b-18ec9c53da84/scratchpad/lang.sh
  verified_at: 2026-09-01T09:46:37Z
  screenshot: evidence/E2-step1.html
  observed: |
    Lượt trả về đầu tiên của máy chủ, không cookie, header
    `Accept-Language: en-US,en;q=0.9`. Thẻ gốc trong file đọc `<html lang="en" …>`.
  network_observed: n-a (driver)
  output: |
    html element: <html lang="en" class="… h-full antialiased">
    OK: server first render carries lang=en

- eval: E3
  run_id: tieng-viet-cho-crm-E3-1788255998
  exit_code: 0
  baseline: n-a
  verifier: /private/tmp/claude-501/-Users-manhphan-dev-crm/20609c9a-7b0d-440b-9c9b-18ec9c53da84/scratchpad/lang.sh
  verified_at: 2026-09-01T09:46:38Z
  screenshot: evidence/E3-step1.html
  observed: |
    Cookie `lang=vi` cùng header tiếng Anh. Lượt trả về đầu tiên — curl, không
    JavaScript — đã mang `<html lang="vi" …>`, nên thứ tiếng có từ máy chủ chứ
    không đến sau một lượt vẽ lại. Khung sau khi hydrate
    (`evidence/E3-step2.png`, màn công ty) hiện đúng cùng thứ tiếng: các tiêu đề
    cột vẫn là Tên · Tên miền · Ngành · Phụ trách, không có lượt nháy đổi tiếng.
  network_observed: n-a (driver)
  output: |
    html element: <html lang="vi" class="… h-full antialiased">
    OK: server first render carries lang=vi

- eval: E11
  run_id: tieng-viet-cho-crm-E11-1788255998
  exit_code: 0
  baseline: n-a
  verifier: /private/tmp/claude-501/-Users-manhphan-dev-crm/20609c9a-7b0d-440b-9c9b-18ec9c53da84/scratchpad/lang.sh
  verified_at: 2026-09-01T09:46:38Z
  screenshot: evidence/E11-step1.html
  observed: |
    Cookie `lang=en` cùng header `Accept-Language: vi-VN,vi;q=0.9`. Thẻ gốc trong
    lượt trả về đầu tiên đọc `<html lang="en" …>`: lựa chọn đã lưu thắng ngôn ngữ
    trình duyệt, và phép đo nằm ở tầng vẽ của máy chủ.
  network_observed: n-a (driver)
  output: |
    html element: <html lang="en" class="… h-full antialiased">
    OK: server first render carries lang=en

- eval: E4
  run_id: tieng-viet-cho-crm-E4-1788255927
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_ngon_ngu_la
  verified_at: 2026-09-01T09:45:27Z
  output: |
    -- chieu duong: gia tri khong hop le -> en
        "zz-ZZ-nonsense" -> en
        "" -> en
        "viet" -> en
    -- chieu do: ban sao bo buoc kiem hop le
        "zz-ZZ-nonsense" -> zz-ZZ-nonsense
    rang-ngon-ngu la: hai chieu dung, gia tri rac bi chan boi dung buoc kiem hop le

- eval: E5
  run_id: tieng-viet-cho-crm-E5-1788255943
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_cookie
  verified_at: 2026-09-01T09:45:43Z
  output: |
    -- chieu duong: du ba thuoc tinh cookie
        du ca ba: Max-Age, Path, SameSite
    -- chieu do: ban sao bo Max-Age
        ban sao mat Max-Age, va phep do goi ten dung thuoc tinh do
    rang-ngon-ngu cookie: hai chieu dung

- eval: E7
  run_id: tieng-viet-cho-crm-E7-1788255947
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_du_lieu_khong_dich
  verified_at: 2026-09-01T09:45:47Z
  output: |
    -- chieu duong: CHINH phan tu ve ten cong ty mang translate=no
        translate=no dung tren phan tu chua {row.name}
    -- chieu do: ban sao go thuoc tinh khoi phan tu do
    rang-ngon-ngu du-lieu-khong-dich: hai chieu dung

- eval: E8
  run_id: tieng-viet-cho-crm-E8-1788255952
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_dinh_dang
  verified_at: 2026-09-01T09:45:52Z
  output: |
    -- chieu duong A: ma tran 5 ham x 2 ngon ngu, chuoi ghim san
      10/10 o khop chuoi ghim san
    -- chieu duong B: dem cho khai cung vung trong pham vi
        0 cho khai cung vung
    -- chieu do: ban sao tra formatDay ve en-US
      formatDay bi tra ve en -> "Sep 1, 2026" (dung ten ham: formatDay)
    rang-ngon-ngu dinh-dang: ba chieu dung

- eval: E10
  run_id: tieng-viet-cho-crm-E10-1788256364
  exit_code: 0
  baseline: n-a
  verifier: /private/tmp/claude-501/-Users-manhphan-dev-crm/20609c9a-7b0d-440b-9c9b-18ec9c53da84/scratchpad/uicheck.mjs
  verified_at: 2026-09-01T09:52:44Z
  screenshot: evidence/E10-step1.png
  observed: |
    Khung 1 cắt sát nút tài khoản "V" ở góc phải thanh đầu trang: một vòng tiêu
    điểm màu xanh thương hiệu vẽ trọn quanh nút, thấy rõ trên nền tối. Khung 2
    (`evidence/E10-step2.png`) là menu đã mở sau khi nhấn Enter, gồm bốn dòng —
    verify@localhost · Light mode · English · Sign out. Dòng "English" chính là
    hàng đổi tiếng.
  network_observed: n-a (driver)
  output: |
    Tab #3 lands on the account menu control
    focus ring painted: true
    menu after Enter: ["Light mode","English","Sign out"]
    language row inside the menu: true

- eval: E12
  judged_by: judge-subagent (fresh context)
  verdict: UNCERTAIN
  rationale: Tám nhãn thật sự hiện trong bản mẫu đọc đúng giọng người trong nghề — không calque, dùng đúng từ điển (`Cá nhân` chứ không `Liên hệ`), ngày và số theo quy ước Việt. Nhưng bản mẫu thiếu hai trong mười nhãn đã khai: `Bổ sung` chỉ nằm trong đoạn chú thích và `Lưu trữ` không xuất hiện ở đâu, nên hội đồng chỉ chấm được 8/10. Về câu hỏi thứ hai, hội đồng gọi tên `Ngày tạo` là nhãn lặp danh từ mà màn hình đã cấp: ô dưới cột đã là một ngày và cột kề `Hoạt động cuối` cũng là ngày mà không cần chữ "Ngày".
  required_evidence:
    - Bản mẫu hoặc ảnh chụp bản chạy hiện đủ mười tiêu đề cột tiếng Việt như tiêu đề THẬT — gồm `Bổ sung` và `Lưu trữ` — ở cả khổ rộng và 768px; sửa `_acceptance/tieng-viet-cho-crm/evidence/ban-mau-man-cong-ty.html` hoặc chụp `/crm/companies` khi đã bật cột ẩn.
    - Một biên bản đọc của một nhân viên quan hệ đối tác OneHub (tên, ngày, kết luận trên từng nhãn), lưu trong `_acceptance/tieng-viet-cho-crm/evidence/`.
  human_override:

### Lệnh suite (hồi quy)

- cmd: bun run db:test && bun run test
  run_id: tieng-viet-cho-crm-SUITE-test-1788256490
  exit_code: 0
  verified_at: 2026-09-01T09:54:50Z

- cmd: bunx turbo run check-types --force
  run_id: tieng-viet-cho-crm-SUITE-check-types-1788256496
  exit_code: 0
  verified_at: 2026-09-01T09:54:56Z

- cmd: bunx turbo run lint --force
  run_id: tieng-viet-cho-crm-SUITE-lint-1788256507
  exit_code: 0
  verified_at: 2026-09-01T09:55:07Z

- cmd: bun run lint:slop
  run_id: tieng-viet-cho-crm-SUITE-lint-slop-1788256512
  exit_code: 1
  verified_at: 2026-09-01T09:55:12Z
  output: |
    apps/app/components/app-header.tsx:115:71: error anti-slop(no-known-value-widening):
    The known initializer supplying binding `OTHER_LOCALE` carries established type
    evidence, but the explicit open dictionary target type discards it.

## Known limits

- **AC-10 được duyệt với câu chữ khác với hình hài đã dựng.** Sổ quyết định
  (`decisions.jsonl`, `d-20260901T091154Z-25773`) khai: nút đổi tiếng là MỘT DÒNG
  trong menu tài khoản, cạnh dòng sáng/tối, không phải một nút riêng trên thanh
  đầu trang. AC-10 viết như thể nó là nút riêng. Ý kiến của phiên nghiệm thu:
  **chất của tiêu chí đạt.** Ba điều AC-10 đòi đều đo được và đều đúng — người
  chỉ dùng bàn phím tới được điều khiển ở lượt Tab thứ ba, nút mang vòng tiêu
  điểm nhìn thấy được trong ảnh, và Enter mở ra menu chứa hàng đổi tiếng. Điều
  AC-10 không lường là đường đi dài thêm một nấc: từ nút tiêu điểm tới hàng đổi
  tiếng còn một lần nhấn nữa trong menu. Đó là chi phí một phím, không phải một
  rào chắn. Phiên này chấm E10 PASS theo chất và ghi lệch câu chữ ở đây; người
  chốt ở Cổng 2 xem câu chữ AC-10 có cần viết lại cho vòng sau không.
- **Vòng này chạy đường nghiệm thu TUẦN TỰ, không chạy workflow fan-out mà vòng
  lặp thường điều phối.** Lý do: bộ tham số đã dựng sẵn là một object 11KB, và
  gọi workflow đòi chép tay trọn object đó vào lời gọi công cụ. Hệ quả: mọi eval
  chạy trong một phiên chứ không mỗi eval một agent sạch. Riêng E12 vẫn đi đúng
  luật doer ≠ grader — nó do một agent context sạch chấm, không nhận diff, không
  nhận lý lẽ của phiên dựng.
- **Ba chuỗi bảng dùng chung mới bắt được một.** Trạng thái rỗng của bảng hiện
  đúng chuỗi tiếng Việt đã truyền vào (`Chưa có công ty nào khớp bộ lọc này.` —
  `evidence/E6-step4.png`). Hai chuỗi kia (`facet.empty`, `tabs.allLabel`) không
  bắt được: bảng thả xuống "Filters" không mở trong Chrome không giao diện, cả
  khi bấm bằng chuột thật lẫn khi gọi `.click()`. Bước phụ đó của E6 chưa đo.
- **E6 và E9 chỉ đo ở màn công ty đã đăng nhập.** Phiên tự cấp phiên đăng nhập
  bằng `apps/api` `dev:session` — đúng đường kho khai. Không có phép đo nào lấy
  từ việc grep mã nguồn.
- **Không phép đo nào đọc được lưu lượng mạng.** Trình lái là Chrome không giao
  diện chạy qua puppeteer và curl; cả hai không ghi trạng thái từng yêu cầu ở
  vòng này, nên mọi ô `network_observed` là `n-a (driver)`.
- **Đường chuẩn A/B chỉ chạy được cho bốn phép đo máy.** Bốn ràng (E4 · E5 · E7 ·
  E8) đều ĐỎ trên cây gốc `6def4a19` — chúng phân biệt được tính năng. Bảy phép
  đo qua trình duyệt không có đường chuẩn: cây gốc chưa có `apps/app/lib/locale`
  và dựng một máy chủ dev thứ hai cho cây đó nằm ngoài phạm vi vòng nghiệm thu.
- **Bản ghi chạy đã che một giá trị.** `run-log.jsonl` mang lệnh nguyên văn, và
  ba lệnh trong đó chứa cookie phiên đăng nhập dev. Phiên thay giá trị đó bằng
  `<dev-session-redacted>` trước khi lưu; phần còn lại của lệnh giữ nguyên.

## Ngoài hợp đồng

- **`bun run lint:slop` đỏ, và nó đỏ vì mã của chính vòng này.**
  `apps/app/components/app-header.tsx:115` khai `OTHER_LOCALE` bằng
  `Record<Locale, …>` tường minh, và luật `no-known-value-widening` chặn đúng chỗ
  đó. `pre-push` của kho chạy `lint:slop`, nên vòng này chưa đẩy lên được. Đây
  không phải một AC nào, nên nó nằm ngoài `failed_evals` — nhưng nó chặn đường ra
  của tính năng.
- **Trang đăng nhập vẫn nguyên tiếng Anh** (`evidence/E3-step2.png` lượt chụp đầu
  cho thấy "No way in yet" và toàn bộ đoạn hướng dẫn). Hợp đồng chỉ hứa màn công
  ty, nên đây không tính là trượt — ghi lại vì trang đó là màn đầu tiên một nhân
  viên nhìn thấy.
- **Menu tài khoản còn ba chuỗi tiếng Anh**: `Light mode` / `Dark mode`,
  `Sign out`, và nhãn cho trình đọc màn hình `Account menu`. Hàng đổi tiếng ghi
  `English` là đúng ý — nó gọi tên thứ tiếng sẽ chuyển sang. Ba chuỗi kia thì
  không.
- **Cột `Ngành` đổ ra giá trị tiếng Anh** — Software · Financial Services ·
  Human Resources · Banking · Accounting. Chúng đến từ cơ sở dữ liệu, nên lọc bỏ
  theo đúng bước 3 của E6. Người chốt cần biết: nếu đó là danh sách khai cứng
  chứ không phải chữ người nhập, nó là chuỗi giao diện và sẽ tính ở vòng sau.

## Analyst

Mọi phép đo máy chạy được đường chuẩn (E4 · E5 · E7 · E8) đều ĐỎ trên cây gốc —
không phép đo nào xanh-trên-cả-hai, nên không có phép đo nào chỉ chứng minh bộ
giàn. Bảy phép đo qua trình duyệt không có đường chuẩn: xem mục Known limits.

## Variance

không — không phép đo nào chạy nhiều lượt.

## Iterations

Round 1: E6, E9 trượt. E6 — màn công ty ở tiếng Việt còn 11 chuỗi giao diện
tiếng Anh nhìn thấy được (tiêu đề trang, câu mô tả, nút tạo mới, ô tìm, năm nút
thanh công cụ, dòng đếm chân bảng): vòng này dịch tiêu đề cột, không dịch phần
vỏ của màn. E9 — ở 768px hai tiêu đề cột "Thoả thuận mở" và "Hoạt động cuối" bị
chém trần ở mép bảng, không có dấu ba chấm. Trả về bước dựng.
