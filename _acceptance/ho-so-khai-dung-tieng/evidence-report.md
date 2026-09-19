---
schema_version: 2
feature_slug: ho-so-khai-dung-tieng
verdict: REJECT
failed_evals: ["E10"]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b81f3cefe9b02594a2aace575cc5a6a2fb77a429
human_signoff:
---

# Evidence Report: ho-so-khai-dung-tieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-1 | script | FAIL |
| E11 | AC-10 | judgment | PASS (đề xuất hội đồng — chưa cần human_override, tổng vòng đã REJECT vì E10) |
| E12 | AC-11 | ui-check | PASS |

Lệnh gây REJECT vòng này: `bun _acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs` (exit 1, phủ eval E10 — không phải một lệnh nằm ngoài mọi eval, nó chính là script đo của E10).

## Evidence

- eval: E1
  run_id: minted-ho-so-khai-dung-tieng-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_gioi_thieu
  verified_at: 2026-09-19T00:00:00Z
  screenshot: _acceptance/ho-so-khai-dung-tieng/evidence/E1-step4-independent.png
  observed: |
    Opened evidence/E1-step4-independent.png (real screenshot, 1440x1000, saved to disk, read with Read tool — not the inline preview_screenshot path): a real record-SHEET detail view is open over a dimmed company-list background (confirms a real record sheet was opened, not the list screen). Header shows "E1-Verify-verify-e1-19951-mu7pg7i6 · Independent-Verification". Vietnamese chrome confirms lang=vi rendering: "Công ty", "Tổng quan", "Cá nhân", "Thoả thuận", "Hoạt động", "Tác nhân", "Giá trị đang mở", "Thoả thuận đang mở". Under the "GIỚI THIỆU" heading the exact seeded English description is shown verbatim, including a unique marker suffix "[verify-e1-19951-mu7pg7i6]" — matching byte-for-byte the value fetched moments earlier from the live tRPC HTTP API (companies.byId, HTTP 200) and the value the DOM-read script located inside a <span> whose closest('[lang="en"]') was non-null. This matches Expected: description text visible on a real profile screen, sourced from the server in this same run, and visually consistent with it being wrapped as foreign-language content.
  output: |
    - The shared dev DB carries leftover un-cleaned "Vat Thu ..." fixture companies from other/previous runs, and one real seed company ("Attio") whose `description` now equals the fixture's canned text (apparent contamination from an older version of the fixture script). I did not rely on or touch these; I used my own freshly seeded-and-cleaned company for every assertion, and re-verified everything through the real HTTP API rather than trusting local DB state alone.

    All required E1 assertions PASS. exitCode=0.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-ho-so-khai-dung-tieng-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_tom_tat_lien_he
  verified_at: 2026-09-19T00:00:00Z
  screenshot: _acceptance/ho-so-khai-dung-tieng/evidence/ho-so-tom-tat.png
  observed: |
    Read evidence/ho-so-tom-tat.png (also saved identically as evidence/E2-step1.png): a dark-theme contact sheet is open over the Cá nhân (contacts) list. Sheet header shows "Quinn Vatthu7p8lhf · IT Director · Vat Thu 55008-mu7p8lhf" with Vietnamese chrome throughout (tabs "Tổng quan / Thoả thuận / Hoạt động / Tác nhân", section labels "CHI TIẾT", "QUÁ TRÌNH", field labels "Tên, Họ, Chức danh, Công ty, Vị trí hiện tại, Thâm niên, Cấp bậc, Mảng phụ trách" all in Vietnamese). Under "QUÁ TRÌNH" the agent-generated summary is rendered verbatim in English, matching Expected: a Vietnamese-language screen (document.documentElement.lang="vi", confirmed by DOM read) containing one foreign-language (English) span for the agent narrative. The programmatic DOM check confirmed this exact text node's nearest lang-ancestor is a SPAN with lang="en" (boc=true), i.e. AC-2 holds.
  output: |
    Don dep: da xoa toan bo fixture DB (cong ty/contact/deal/activity/brief) qua donRac() cua chinh du-lieu-thu.mjs; xac nhan lai 0 con sot. Khong tao/xoa file nao trong repo. git diff cho contact-sheet.tsx va packages/ui/test/ rong (da xac nhan bang git status --porcelain). Khong tu khoi dong hay tat server dev.

    Khong Bash call nao bi cong cu giet/cat output; khong dung timeout dai vi tat ca lenh deu ngan va hoan tat binh thuong.
  network_observed: clean

- eval: E3
  run_id: minted-ho-so-khai-dung-tieng-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_nganh
  verified_at: 2026-09-19T00:00:00Z
  screenshot: _acceptance/ho-so-khai-dung-tieng/evidence/ho-so-nganh.png
  observed: |
    Doc 4 frame da luu bang Read (anh), doi chieu Expected (dong meta mang gia tri nganh, trang o lang=vi, phan tu khai lang=en boc gia tri do):
    - evidence/ho-so-nganh.png (cong ty "Vat Thu 55008-mu7p8lhf", nganh=Software): tam ho so mo, UI tieng Viet, dong meta duoi ten hien "· London, United Kingdom · Software" — gia tri nganh "Software" xuat hien dung vi tri, khop DOM-assert (boc trong <span lang="en">).
    - E3-step1.png: giong het ho-so-nganh.png (cung cong ty, chup lien tiep).
    - E3-step2.png (Supabase, nganh=Software): dong meta "supabase.com · Singapore, Singapore · Software", khop Expected.
    - E3-step3.png (Cal.com, nganh=Software): dong meta "cal.com · San Francisco, United States · Software", khop Expected.
    Ca 4 frame deu cho thay trang o lang=vi va gia tri nganh (tieng Anh) nam tren dong meta cua tam ho so (khong phai man danh sach) — dung nhu Expected. Khong co mau thuan.
  output: |
    NETWORK TRUTH: driver la puppeteer-core kich hoat qua script Node, thuoc nhom "curl+grep / capture-only" — khong doc duoc wire truc tiep => networkObserved = "n-a (driver)" (khong lam eval fail theo quy tac).

    exitCode=0: MOI assertion pass, ca hai chieu deu dung nhu hop dong mo ta.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-ho-so-khai-dung-tieng-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_dong_thoi_gian
  verified_at: 2026-09-19T00:00:00Z
  screenshot: _acceptance/ho-so-khai-dung-tieng/evidence/dong-thoi-gian.png
  observed: |
    Opened evidence/dong-thoi-gian.png (real screenshot file, 1440x1000). Page chrome is entirely Vietnamese: tabs "Tổng quan / Cá nhân / Hoạt động / Tác nhân" (Hoạt động active), composer placeholder tiếng Việt, filter row tiếng Việt, section header "HÔM NAY". Inside the timeline entry row: "Demo booked → Qualified to buy" with author/time "Ada Okafor · 8:19" — both the FROM label ("Demo booked") and the TO label ("Qualified to buy") appear as English text sitting inside the Vietnamese page, exactly as Expected describes (two English stage labels visible inside a lang=vi document).
  output: |
    Aside (not a criterion failure, noted for completeness): found 2 unrelated leftover `Vat Thu *` company rows predating this verification's own runs, both self-cleaned. Left untouched — out of scope for AC-4.

    Overall: exit 0. All AC-4 assertions pass — both the OLD and NEW stage labels are independently wrapped in their own lang="en" element inside the timeline, sourced from the real `dealStageLabel()`, not hardcoded.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-ho-so-khai-dung-tieng-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_khong_khai_thua
  verified_at: 2026-09-19T00:00:00Z
  screenshot: _acceptance/ho-so-khai-dung-tieng/evidence/khong-khai-thua.png
  observed: |
    evidence/khong-khai-thua.png: tấm hồ sơ công ty "Vat Thu 77812-mu7p9un9" mở ở tab Tổng quan. Dòng meta dưới tên hiện "· London, United Kingdom · Software" phẳng, một kiểu chữ, không có dấu hiệu boc lang=en — khác khối GIỚI THIỆU bên dưới (E1, ngoài phạm vi chấm này) hiện bằng kiểu chữ khác cho thấy nó CÓ bọc. evidence/khong-khai-thua-chuc-danh.png: hồ sơ liên hệ "Quinn Vatthu7p9un9" — trường "Chức danh" hiện "IT Director" bằng kiểu chữ thường, không khác các trường tiếng Việt quanh nó. Khớp Expected: ba giá trị (tên công ty, "London, United Kingdom", "IT Director") không có dấu hiệu bọc lang=en.
  output: |
    May chu dev: cong 3000/3001 DA CO NGUOI NGHE tu truoc (dung chung, KHONG tu khoi dong, KHONG tat sau khi xong).

    NETWORK TRUTH: driver la hai script Node/puppeteer chay qua Bash → khong doc duoc luong mang → "n-a (driver)", khong ghi evidence/E5-network.txt (khong ap dung).
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-ho-so-khai-dung-tieng-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_mot_duong
  verified_at: 2026-09-19T00:00:00Z
  output: |
         apps/app/components/crm/timeline/timeline-entry.tsx
    ket qua: so tep=9 (can 9) · thieu=0 · thua=0 · con viet tay=0
    EXIT_CODE=0

- eval: E7
  run_id: minted-ho-so-khai-dung-tieng-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hskt_component
  verified_at: 2026-09-19T00:00:00Z
  output: |
     0 fail
     5 expect() calls
    Ran 3 tests across 1 file. [319.00ms]

- eval: E8
  run_id: minted-ho-so-khai-dung-tieng-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_ho_so_trong
  verified_at: 2026-09-19T00:00:00Z
  screenshot: _acceptance/ho-so-khai-dung-tieng/evidence/ho-so-trong.png
  observed: |
    evidence/ho-so-trong.png: sheet opened for "Vat Thu Trong 30069-mu7pcl7c", cookie lang=vi applied. Page chrome is genuine Vietnamese. The main content column under "Tổng quan" — where an enriched company shows a "Giới thiệu" heading + paragraph — is completely empty: no heading, no placeholder, no residual box. The "CHI TIẾT" panel shows every enrichment-derived field as "—"/None and a footnote "Chưa biết: ngành, mô tả, liên kết mạng xã hội", consistent with a company that has description=null, industry=null, enrichmentStatus=PENDING.
  output: |
    Network: driver for both runs is a standalone Puppeteer script launched from Bash, so there is no read_network_requests/read_console_messages channel available — networkObserved correctly reported as "n-a (driver)".

    VERDICT: exitCode=0 — every assertion in both the canonical registered eval and the independent re-implementation passed; the Introduction block is reported absent, and 0 empty lang="en" elements were found.
  network_observed: n-a (driver)

- eval: E9
  run_id: minted-ho-so-khai-dung-tieng-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_tieng_trang
  verified_at: 2026-09-19T00:00:00Z
  screenshot: _acceptance/ho-so-khai-dung-tieng/evidence/E9-step1.png
  observed: |
    E9-step1.png: company record sheet ("Attio") open in the dark theme, all chrome Vietnamese ("Tổng quan","Cá nhân","Thoả thuận","Hoạt động","Tác nhân", section header "GIỚI THIỆU"), with the English company description paragraph rendered underneath. E9-step2.png: identical frame with the real Vietnamese heading "Giới thiệu" outlined in green by the verifier script to mark it as the exact node measured; the outline sits only around that h3, not around the English paragraph below it, consistent with the assertion that this Vietnamese string has no lang=en ancestor.
  output: |
      E9-step1.png, E9-step2.png, E9-network.txt, E9-verify-log.txt, E9-check.json, vung-khai.json (written by the official script's own run against the real tree).

    exitCode = 0: all four required assertions passed on the unmutated tree AND the two-way falsifiability mutation failed exactly as the contract demands.
  network_observed: clean

- eval: E10
  run_id: minted-ho-so-khai-dung-tieng-E10-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.hskt_pha_thu
  verified_at: 2026-09-19T00:00:00Z
  output: |
    ket qua: 1 dot bien KHONG dat tren 20 dot bien

    KHONG DAT: cay dang xet DOI sau khi chay - phep pha da ro ri ra khoi ban sao.
    truoc:
     M _acceptance/ho-so-khai-dung-tieng/s4-args.json
    sau:
     M _acceptance/ho-so-khai-dung-tieng/evidence/vung-khai.json
     M _acceptance/ho-so-khai-dung-tieng/s4-args.json

- eval: E11
  judged_by: judge panel — 3 lens (domain-correctness, operational-feasibility, spec-alignment), fresh context
  verdict: PASS (đề xuất hội đồng)
  verifier: judgment (executor "judgment" không khai script ref trong evals.yaml; hội đồng đọc evidence/vung-khai.json)
  verified_at: 2026-09-19T00:00:00Z
  rationale: |
    - domain-correctness: PASS — mỗi giá trị mong bọc (gioi-thieu, tom-tat-lien-he, nganh, cả hai mục dong-thoi-gian) có so_phan_tu_khai=1 với duong_the là mảng một phần tử ["SPAN"] — nằm trong đúng một vùng khai liền. Mục tieng-trang báo tieng_viet_lot: [] (rỗng).
    - operational-feasibility: PASS — cùng dữ liệu: so_phan_tu_khai=1, duong_the một phần tử SPAN duy nhất ở mọi mục mong_boc:true; tieng_viet_lot: [] ở mục tieng-trang.
    - spec-alignment: PASS — mọi entry mong_boc:true đều show boc:true, so_phan_tu_khai:1, duong_the:["SPAN"], không mục nào có so_phan_tu_khai>1 hay nhiều duong_the; tieng_viet_lot: [] ở tieng-trang.
  required_evidence:
    - (hội đồng không nêu bằng-chứng-thiếu — cả ba lens đều PASS thống nhất)
  human_override:

- eval: E12
  run_id: minted-ho-so-khai-dung-tieng-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_hoi_quy_nam_cho
  verified_at: 2026-09-19T00:00:00Z
  screenshot: _acceptance/nhan-ung-dung-noi-tieng-viet/evidence/E12-step1.png
  observed: |
    E12-step1.png (màn Công ty / companies list, lang=vi): sidebar + header tiếng Việt, cột 'Ngành' hiện các giá trị tiếng Anh Software / Real Estate / Financial Services / Human Resources / Banking / Accounting xen giữa nội dung tiếng Việt. E12-step2.png (màn Thoả thuận / deals list): cột 'Giai đoạn' hiện các nhãn tiếng Anh Qualified to buy / Closed lost / Demo booked / Contract sent xen giữa UI tiếng Việt — khớp Expected (hai màn danh sách, dán số ngành/giai đoạn từ máy chủ), không mâu thuẫn Expected.
  output: |
    NETWORK TRUTH: driver la Node script goi puppeteer-core truc tiep qua Bash => "n-a (driver)", khong lam eval fail.

    KET LUAN: moi assertion bat buoc cua E12/AC-11 PASS — canh cay truoc man dau, ca hai chan-cu (khai-tieng, giai-doan) exit 0 kem ten tung gia tri, va cap hai chieu xac nhan chan DO dung khi ForeignText mat attribute lang. Ghi chu minh bach: lenh config.yaml THO (khong qua hoi-quy-nam-cho.mjs) hien exit 2 vi DB dev dang thieu 1 deal CLOSED_WON — day la tien de du lieu, khong phai loi cua rang/san pham, va thuoc hoi-quy-nam-cho.mjs (co san, khong tu viet) da tu seed+don dung quy trinh de do duoc.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-ho-so-khai-dung-tieng-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-19T00:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-ho-so-khai-dung-tieng-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-19T00:00:00Z

- cmd: bun run lint:slop
  run_id: minted-ho-so-khai-dung-tieng-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-19T00:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-ho-so-khai-dung-tieng-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-19T00:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Không có eval nào được đo lại trên baseline ở vòng này (mọi trường `baseline:` bên trên ghi `n-a`), nên không có mục nào được xếp vào diện "không-phân-biệt" cho vòng này — danh sách rỗng.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: verdict REJECT (ghi vào kho theo commit 689ef9a4) — chi tiết nguyên nhân nằm trong evidence-report.md của round 1, không lặp lại ở đây.
Round 2 (vòng này): E10 (AC-1, `rang/pha-thu.mjs`) FAIL — thông điệp "cay dang xet DOI sau khi chay: phep pha da ro ri ra khoi ban sao" (trước chạy: chỉ s4-args.json bẩn; sau chạy: thêm evidence/vung-khai.json bẩn); 11 eval còn lại (E1-E9, E12) PASS bằng máy và E11 được hội đồng đề xuất PASS. Không tiến tới round 3 — verdict tổng vòng này là REJECT, quay lại S3 để cách ly triệt để phép phá của E10 khỏi cây đang xét.
