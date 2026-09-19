---
schema_version: 2
feature_slug: ho-so-khai-dung-tieng
verdict: REJECT
failed_evals: ["E6", "E12"]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2ae60f42f6ce5ec806a9dce50592f81ee0ae92be
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
| E6 | AC-6 | script | FAIL |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-1 | script | PASS |
| E11 | AC-10 | judgment | FAIL |
| E12 | AC-11 | ui-check | FAIL |

## Evidence

- eval: E1
  run_id: minted-ho-so-khai-dung-tieng-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_gioi_thieu
  verified_at: 2026-09-19T10:00:00+07:00
  screenshot: evidence/ho-so-gioi-thieu.png
  observed: |
    Opened /Users/manh-macmini/dev/crm/.claude/worktrees/busy-chatterjee-fc04e2/_acceptance/ho-so-khai-dung-tieng/evidence/ho-so-gioi-thieu.png with Read: it shows the REAL company record sheet (not the list view) for "Attio" at http://localhost:3000/crm/companies/cmtruz664000jfkty8peooied, cookie lang=vi applied — page chrome is Vietnamese ("Tổng quan", "Cá nhân", "Thoả thuận", "Hoạt động", "Tác nhân", "CHI TIẾT", "GIỚI THIỆU" section header) while the intro paragraph under "GIỚI THIỆU" reads the English test string "One Mount is a Vietnamese technology and innovation group that builds comprehensive digital ecosystems for retail, banking and property services." exactly matching the value injected server-side for this run. This matches Expected: Vietnamese screen, English value present, nothing hand-typed into the checker.
  network_observed: clean
  output: |
    - _acceptance/ho-so-khai-dung-tieng/evidence/E1-network.txt (dump network tho)
    KET LUAN: MOI assertion cua 7 buoc deu PASS, xac nhan hai lan doc lap (script chinh thuc + script tu viet rieng), cong voi phep pha bat duoc dung loi (cap hai chieu dat). exitCode=0.

- eval: E2
  run_id: minted-ho-so-khai-dung-tieng-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_tom_tat_lien_he
  verified_at: 2026-09-19T10:00:00+07:00
  screenshot: evidence/ho-so-tom-tat.png
  observed: |
    evidence/ho-so-tom-tat.png (read via Read tool, image inspected directly): shows the REAL contact record sheet for "Quinn Ivanova" (IT Director · Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ), tab "Tổng quan" active, cookie lang=vi in effect (all chrome labels in Vietnamese: CHI TIẾT, QUÁ TRÌNH, MỨC THÂN QUEN, etc). The "QUÁ TRÌNH" (brief) section shows the English narrative in full: "Seasoned partnerships lead with a decade of experience building distribution networks across Southeast Asia, currently focused on retail technology adoption." — the exact brief.narrative value read from the server this run, rendered as running English prose next to Vietnamese labels. This matches Expected: a real profile sheet (not a list screen) with the agent narrative visible on it.
  network_observed: n-a (driver)
  output: |
    Network truth: driver for the browser steps is a standalone puppeteer-core script (both the official rang script and my independent verifier script), not a browser tool with a network-read capability -> networkObserved = "n-a (driver)". No HTTP-level network dump was produced for this eval; server-side correctness was instead confirmed via direct DB read (Prisma) of the same value shown on screen.
    Overall: exitCode=0 — every required assertion for E2/AC-2 passed on the current (unmodified) tree, and the two-way (mutation) check confirms the assertion is discriminating, not vacuous.

- eval: E3
  run_id: minted-ho-so-khai-dung-tieng-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_nganh
  verified_at: 2026-09-19T10:00:00+07:00
  screenshot: evidence/ho-so-nganh.png
  observed: |
    Doc file anh evidence/ho-so-nganh.png (mo bang Read, khong doan tu tri nho): day la TAM HO SO that cua cong ty "Attio" (sheet-content mo tren nen cong-ty/[id], khong phai man danh sach) — cac nhan giao dien deu tieng Viet: "Tong quan", "Ca nhan 3", "Thoa thuan 2", "Hoat dong", "Tac nhan", "GIOI THIEU", "CHI TIET", "Thanh pho", "Quoc gia", "Phu trach"... Dong meta ngay duoi ten cong ty doc: "attio.com · London, United Kingdom · Software" — gia tri nganh "Software" nam ngay tren dong meta nay, dung vi tri MetaLine ma AC-3 yeu cau kiem, va khop voi kiem tra DOM (phan tu chua no co closest('[lang="en"]') != null). Frame khop Expected: khong phai man danh sach, gia tri nganh hien dien va da duoc boc lang=en.
  network_observed: n-a (driver)
  output: |
    3) script rieng thu hai lam vet cap-hai-chieu tren chinh trang da tai (khong doi ma nguon) -> exit 0 (do dung).
    Khong sua code san pham. Khong tat may chu dang co san (chi dung chung theo dung quy tac).

- eval: E4
  run_id: minted-ho-so-khai-dung-tieng-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_dong_thoi_gian
  verified_at: 2026-09-19T10:00:00+07:00
  screenshot: evidence/dong-thoi-gian.png
  observed: |
    Opened evidence/dong-thoi-gian.png (99444 bytes) with Read (image, viewed directly). It shows the deal record sheet "Attio — expansion" (Attio) in Vietnamese chrome: tabs "Tổng quan / Cá nhân 2 / Hoạt động (underlined, active) / Tác nhân", header pill "Qualified to buy" (top right), Vietnamese field labels "Giá trị / Ngày dự kiến chốt / Ở giai đoạn / Phụ trách", and the activity list grouped under Vietnamese date headers with a Vietnamese section header "CHƯA XONG". Inside that list, on the "THỨ 2, 7 THG 9, 2026" row there is a stage-change entry rendered as the headline "Demo booked → Qualified to buy" — both segments in plain English, exactly matching dealStageLabel() output for DEMO_BOOKED and QUALIFIED_TO_BUY, each independently confirmed by the DOM check to sit inside its own <span lang="en"> (so_phan_tu_khai=1 each, not one span covering both). This matches Expected exactly: selective English marking, not a whole-page or whole-sheet wrap. No content in the frame contradicts Expected.
  network_observed: n-a (driver)
  output: |
    Frame saved: _acceptance/ho-so-khai-dung-tieng/evidence/dong-thoi-gian.png (only 1 screenshot needed for this single-scene eval).
    networkObserved: n-a (driver) — the driver for both the executor script and the capture script is a raw puppeteer-core session (script-controlled), not the Claude_Browser MCP tool.

- eval: E5
  run_id: minted-ho-so-khai-dung-tieng-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_khong_khai_thua
  verified_at: 2026-09-19T10:00:00+07:00
  screenshot: evidence/khong-khai-thua.png
  observed: |
    evidence/khong-khai-thua.png: tam ho so cong ty "Attio" mo o tab Tong quan. MetaLine duoi ten hien "attio.com · London, United Kingdom · Software" — "London, United Kingdom" hien phang, khong co dau hieu boc rieng; khop voi Expected. evidence/khong-khai-thua-chuc-danh.png: tam ho so lien he "Quinn Ivanova". Ca o MetaLine va o truong "Chuc danh" trong khoi CHI TIET deu hien "IT Director" phang, tieng Anh nhung khong boc lang=en. Khop voi Expected. Ca hai anh xac nhan bang mat nhung gia tri da duoc DOM-check (script) xac nhan ve mat ky thuat: boc=false, so_phan_tu_khai=0 cho ca ba gia tri "Attio", "London, United Kingdom", "IT Director".
  network_observed: n-a (driver)
  output: |
    NETWORK TRUTH: driver cua eval nay la mot script node/puppeteer-core doc lap → networkObserved = "n-a (driver)". Khong tao evidence/E5-network.txt vi ly do nay.
    exitCode=0: MOI khang dinh cua AC-5 da PASS o lan chay sach cuoi cung, VA chieu nguoc (dot bien boc them lang=en cho dia danh) da CHUNG MINH chan do biet do dung nhu hop dong doi hoi.

- eval: E6
  run_id: minted-ho-so-khai-dung-tieng-E6-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.hskt_mot_duong
  verified_at: 2026-09-19T10:00:00+07:00
  output: |
    TIM THAY 8 tep di qua ForeignText:
      apps/app/app/(app)/[slug]/companies/companies-table.tsx
      apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx
      apps/app/app/(app)/[slug]/sales-dashboard.tsx
      apps/app/components/crm/deal-stage.tsx
      apps/app/components/crm/record-sheet/contact-sheet.tsx
      apps/app/components/crm/record-sheet/record-parts.tsx
      apps/app/components/crm/stage-stepper.tsx
      apps/app/components/crm/timeline/timeline-entry.tsx
    THIEU: apps/app/components/crm/record-sheet/company-sheet.tsx
    ket qua: so tep=8 (can 9) · thieu=1 · thua=0 · con viet tay=0

- eval: E7
  run_id: minted-ho-so-khai-dung-tieng-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hskt_component
  verified_at: 2026-09-19T10:00:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 3 tests across 1 file. [532.00ms]

- eval: E8
  run_id: minted-ho-so-khai-dung-tieng-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_ho_so_trong
  verified_at: 2026-09-19T10:00:00+07:00
  screenshot: evidence/ho-so-trong.png
  observed: |
    evidence/ho-so-trong.png (company sheet for "Rang Khai Tieng — cong ty chua giau du lieu", cookie lang=vi, tab Tong quan): the main content column (where the "GIOI THIEU" section renders for an enriched company) is completely blank — no heading, no text, no placeholder box. The right-hand "CHI TIET" panel shows a "Chua biet" note listing "nganh, mo ta, lien ket mang xa hoi" as the only reference to the missing data. Side-by-side comparison with evidence/ho-so-gioi-thieu.png (a company WITH a description, same layout) confirms the Introduction block for the empty company is genuinely absent from the layout, not merely emptied-but-present.
  network_observed: n-a (driver)
  output: |
    Network: driver la mot script Puppeteer rieng do bun scripts/lan-do/tien-de.mjs spawn, khong co duong doc console/network tu day — ghi "n-a (driver)" dung quy uoc.
    KET LUAN: ca 4 buoc cua E8 va cap hai chieu (mutation) deu DAT. exitCode=0.

- eval: E9
  run_id: minted-ho-so-khai-dung-tieng-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hskt_tieng_trang
  verified_at: 2026-09-19T10:00:00+07:00
  screenshot: evidence/E9-step1.png
  observed: |
    E9-step1.png: tấm hồ sơ công ty "Attio" đã mở trên localhost:3000/crm/companies/cmtruz664000jfkty8peooied, cookie lang=vi. Toàn bộ khung giao diện là tiếng Việt thật (tab, nhãn, tiêu đề mục "GIỚI THIỆU" và "CHI TIẾT"). Đoạn mô tả công ty hiển thị bằng tiếng Anh ngay dưới tiêu đề "GIỚI THIỆU" — giá trị được bọc lang=en, không phải giao diện. E9-step2.png (cùng trang, tô khung màu bằng JS): tiêu đề "GIỚI THIỆU" được khoanh khung XANH LÁ (không tìm thấy tổ tiên [lang=en]) — không có khung ĐỎ nào xuất hiện ở bất kỳ đâu trên trang. Khớp Expected: chuỗi giao diện tiếng Việt không nằm trong phạm vi lang=en.
  network_observed: clean
  output: |
    - _acceptance/ho-so-khai-dung-tieng/evidence/E9-step2.png (khoanh XANH quanh "GIOI THIEU", khong co khung DO nao)
    - _acceptance/ho-so-khai-dung-tieng/evidence/E9-check.json (htmlLang, danh sach 25 chuoi tieng Viet, leaked=[])
    - _acceptance/ho-so-khai-dung-tieng/evidence/E9-network.txt (network + console dump)

- eval: E10
  run_id: minted-ho-so-khai-dung-tieng-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.hskt_pha_thu
  verified_at: 2026-09-19T10:00:00+07:00
  output: |
    E12             | 1        | co                 | co
    ket qua: 0 dot bien KHONG dat tren 20 dot bien

- eval: E11
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: FAIL
  votes:
    - domain-correctness: FAIL — Trong vung-khai.json, muc "tieng-trang" tu bao cao tieng_trang: "vi" va tieng_viet_lot: ["Gioi thieu"] — tuc chinh du lieu ket xuat tu DOM ghi nhan mot chuoi tieng Viet ("Gioi thieu") da lot vao ben trong pham vi duoc ky vong la lang=en. Rieng phan "moi gia tri tieng Anh nam trong dung mot vung lien" co ve on (moi "cho" co so_phan_tu_khai la 0 hoac 1, khong co gia tri nao bi boc thanh nhieu hon 1 manh), nhung vi cau hoi doi hoi ca hai dieu kien dung, va dieu kien thu hai bi vi pham ro rang boi chinh bang chung trong file, ket luan la FAIL.
    - operational-feasibility: FAIL — Trong vung-khai.json, khoi "tieng-trang" ghi "tieng_viet_lot": ["Giới thiệu"] — mot chuoi tieng Viet duoc chinh cong cu do dong xac dinh la lot vao vung da khai (ung voi muc "gioi-thieu"), tuc vi pham truc tiep ve tieng Viet lot vao pham vi lang=en. Rieng phan lien mach cua cac gia tri E1-E5 chinh co ve on: so_phan_tu_khai=0 va duong_the=[] deu nhat quan; entry duy nhat co so_phan_tu_khai=1/duong_the=["SPAN"] ("London, United Kingdom") lai nam trong muc "khong-khai-thua" (mong_boc:false) nen la loi khac (khai thua), khong phai loi phan manh. Nhung vi tieu chi cau hoi la ghep ca hai ve, va ve thu hai co bang chung ro rang vi pham, nen tong the la FAIL.
    - spec-alignment: FAIL — Trong vung-khai.json, 8/9 gia tri tieng Anh nam gon trong dung mot vung khai (boc:false, so_phan_tu_khai:0, duong_the:[]), nhung muc "London, United Kingdom" trong nhom "khong-khai-thua" co boc:true, so_phan_tu_khai:1, duong_the:["SPAN"] — tuc bi boc thanh nhieu manh du nhom nay mong_boc:false. Dong thoi muc "tieng-trang" ghi ro tieng_viet_lot:["Giới thiệu"] — mot chuoi tieng Viet da lot vao pham vi dang xet (lang=en).
  required_evidence:
    - "[domain-correctness] Muc 'tieng-trang' trong evidence/vung-khai.json (dong 107-112) da the hien 'tieng_viet_lot': ['Gioi thieu'] — neu truong nay luon la mang rong ([]) sau khi vung khai da wrap dung DOM that, thi ket luan se doi tu FAIL sang PASS."
    - "[operational-feasibility] Bản chụp DOM thật (hoặc outerHTML) của mục 'gioi-thieu' tại thời điểm capture vung-khai.json, cho thấy text node 'Giới thiệu' nằm BÊN NGOÀI phần tử mang lang=\"en\" (là anh em/sibling, không phải con cháu) — nếu vậy ket luan đổi thành PASS."
    - "[spec-alignment] File evidence/vung-khai.json, khoá 'khong-khai-thua' → phần tử thứ 3 (gia_tri: 'London, United Kingdom'): boc=true, so_phan_tu_khai=1, duong_the=['SPAN'] — bằng chứng giá trị bị bóc làm 2 mảnh trái với mong_boc=false của nhóm đó; và khoá 'tieng-trang' → 'tieng_viet_lot': ['Giới thiệu']."
  human_override:

- eval: E12
  run_id: minted-ho-so-khai-dung-tieng-E12-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.hskt_hoi_quy_nam_cho
  verified_at: 2026-09-19T10:00:00+07:00
  screenshot: evidence/E12-step2.png
  observed: |
    canhCay (fallback text, khong co frame anh): E12-step1-canh-cay.txt ghi dung output console "may chu o http://localhost:3000 dang phuc vu dung cay dang xet." — khop cay dang xet. E12-step2.png (man Cong ty, chan mac dinh): man hinh tieng Viet day du, cot "Nganh" hien 6 gia tri tieng Anh chua boc: Software, Real Estate, Financial Services, Human Resources, Banking, Accounting — dung 6 gia tri ma script bao "boc du". Khop voi Expected cua chan nay. E12-step3.png (man Thoa thuan, chan giai-doan): man hinh tieng Viet, cot "Giai doan" hien Qualified to buy, Closed lost, Demo booked, Contract sent — KHONG thay "Closed Won" trong bat ky hang nao cua trang 1/2, xac nhan tap du lieu thu khong co thoa thuan nao o giai doan CLOSED_WON (tien de thieu du lieu seed, khong phai loi component/AC-14).
  network_observed: n-a (driver)
  output: |
    Buoc 3 — chan 'giai-doan' (man thoa thuan): enum co 7 ma, du lieu thu chi phu 6. Chua phu: CLOSED_WON. Exit: 2 -> KHONG coi la dat (dung quy uoc cua chinh eval nay: "chan cu thoat ma 2 (tap rong, du lieu thu thieu) -> ma 2, KHONG coi la dat"). Day la thieu du lieu seed, khong phai regression cua ForeignText/attribute — nhung van lam FAIL assertion buoc 4 ("ca hai chan exit 0").
    Buoc 4 — Khang dinh ca hai chan exit 0: Buoc 2 = 0. Buoc 3 = 2. => Assertion tong KHONG dat.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mu7ndtepo1rt
  exit_code: 0
  verified_at: 2026-09-19T10:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-ho-so-khai-dung-tieng-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 1
  verified_at: 2026-09-19T10:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-ho-so-khai-dung-tieng-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-19T10:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-ho-so-khai-dung-tieng-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-19T10:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6, E12 failed (E6 — mot-duong.mjs khong tim thay ForeignText o company-sheet.tsx, thieu 1/9 cho khai tieng; E12 — chan hoi-quy 'giai-doan' thoat ma 2 vi du lieu thu thieu CLOSED_WON), va hoi dong E11 de xuat FAIL (chuoi tieng Viet "Giới thiệu" lot vao pham vi lang=en trong vung-khai.json) — REJECT, tra ve implementation.
