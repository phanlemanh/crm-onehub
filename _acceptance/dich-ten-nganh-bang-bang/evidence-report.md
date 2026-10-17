---
schema_version: 2
feature_slug: dich-ten-nganh-bang-bang
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dabcbd66ca04e8fb77b568de0b316fc1c2cdca3e
human_signoff:
---

# Evidence Report: dich-ten-nganh-bang-bang

Round 1. Verdict REJECT vì một lệnh suite đỏ mà không gắn eval nào: `bun run lint:slop` (chi tiết ở khối «Lệnh suite» bên dưới). Không eval nào của hợp đồng đỏ, nên `failed_evals` để trống. E7 (judgment) chờ người quyết.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-5 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | judgment | chờ người (hội đồng đề xuất FAIL) |
| E8 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-dich-ten-nganh-bang-bang-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_bang
  verified_at: 2026-10-17T18:45:18Z
  output: |
    cd apps/app && bun test ./lib/ten-nganh.test.ts
    Ran 9 tests across 1 file. [20.00ms]

- eval: E2
  run_id: minted-dich-ten-nganh-bang-bang-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_bang
  verified_at: 2026-10-17T18:45:18Z
  output: |
    cd apps/app && bun test ./lib/ten-nganh.test.ts
    Ran 9 tests across 1 file. [20.00ms]

- eval: E3
  run_id: minted-dich-ten-nganh-bang-bang-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_man
  verified_at: 2026-10-17T18:45:18Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dich-ten-nganh-bang-bang.dom.tsx
    Ran 7 tests across 1 file. [2.90s]

- eval: E4
  run_id: minted-dich-ten-nganh-bang-bang-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_man
  verified_at: 2026-10-17T18:45:18Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dich-ten-nganh-bang-bang.dom.tsx
    Ran 7 tests across 1 file. [2.90s]

- eval: E5
  run_id: minted-dich-ten-nganh-bang-bang-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_man
  verified_at: 2026-10-17T18:45:18Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dich-ten-nganh-bang-bang.dom.tsx
    Ran 7 tests across 1 file. [2.90s]

- eval: E6
  run_id: minted-dich-ten-nganh-bang-bang-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_man
  verified_at: 2026-10-17T18:45:18Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dich-ten-nganh-bang-bang.dom.tsx
    Ran 7 tests across 1 file. [2.90s]

- eval: E8
  run_id: mvcr2ju0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dtn_chup
  verified_at: 2026-10-17T18:45:18Z
  screenshot: evidence/E8-bang-vi-1440.png
  observed: |
    E8-bang-vi-1440.png: trang «Công ty», cột «Ngành» hiện tên Việt (Hàng tiêu dùng đóng…, Xây dựng & Công trình, Khách sạn & Du lịch, Logistics & Chuỗi cu…, Hoá chất & Vật liệu, Dịch vụ chuyên nghiệ…, Viễn thông, Pháp lý & Tuân thủ, Bất động sản & Công…, Thể thao…), một số bị cắt bằng dấu ba chấm; tiêu đề cột tiếng Việt (Tên, Tên miền, Ngành, Phụ trách...); không thanh cuộn ngang; «1–24 trong số 24». Khớp expected.
    E8-ngan-vi-1440.png: ngăn công ty «Ngành chụp E8 15», dòng phụ «e8-15-mvcr2ju0.dtn.vn · Bất động sản & Công nghệ bất động sản» đầy đủ, không cắt, không tràn; nhãn tiếng Việt (Tổng quan, Cá nhân, Thoả thuận...). Khớp.
    E8-bang-vi-390.png: ở 390 bảng chỉ còn cột Tên (24 hàng Ngành chụp E8 …), không cột Ngành, không tràn ngang, giao diện tiếng Việt. Khớp (dòng «E8 cat vi 390» ghi cột không hiện ở khổ này).
    E8-ngan-vi-390.png: ngăn dạng bottom sheet, dòng phụ xuống dòng hai: «e8-15-mvcr2ju0.dtn.vn · Bất động sản & Công nghệ bất động sản» đầy đủ tên Việt, không tràn. Khớp.
    E8-bang-en-1440.png: trang «Companies», cột «Industry» hiện chữ gốc tiếng Anh (Consumer Packaged …, Construction & Built …, Hospitality & Tourism, Logistics & Supply C…, Real Estate & PropTe…, Sports…), cắt bằng ba chấm ở một số hàng, không tràn ngang. Khớp.
    E8-ngan-en-1440.png: ngăn hiện «e8-15-mvcr2ju0.dtn.vn · Real Estate & PropTech», đầy đủ, không tràn. Khớp.
    E8-bang-en-390.png: chỉ cột Company, tiếng Anh, không tràn ngang. Khớp.
    E8-ngan-en-390.png: bottom sheet, dòng phụ «Real Estate & PropTech» xuống dòng, đầy đủ, không tràn. Khớp.
    Không frame nào mâu thuẫn expected.
  network_observed: n-a (driver)
  output: |
    - Cảnh cây trước màn đầu chạy không báo lệch (không mã 2).
    Frame đã lưu (_acceptance/dich-ten-nganh-bang-bang/evidence/): E8-bang-vi-1440.png, E8-ngan-vi-1440.png, E8-bang-vi-390.png, E8-ngan-vi-390.png, E8-bang-en-1440.png, E8-ngan-en-1440.png, E8-bang-en-390.png, E8-ngan-en-390.png; cộng E8-output.txt (output lệnh). Đã mở và đọc cả 8 ảnh.
    Không có capture bằng browser tool, driver là script bun nên không có dữ liệu network (n-a driver); E8-network.txt không tạo. Server do mot-luot tự dựng đã tắt (không còn port nghe 4274/4743).

### Judgment (E7, AC-6)

- eval: E7
  judged_by: hội đồng ba lăng kính (fresh context) — ĐỀ XUẤT, chưa phải quyết định
  proposal: FAIL
  votes:
    - domain-correctness: FAIL — Phần lớn bảng BANG_NGANH đúng và tự nhiên, nhưng có bốn dòng có vấn đề thật. "Consumer Packaged Goods (CPG)" thành "Hàng tiêu dùng đóng gói" là bản dịch từng chữ, người Việt không gọi vậy. "Lifestyle & Leisure" thành "...& Thư giãn" lệch nghĩa. "Professional Services & Agencies" giữ nguyên "Agency" nên nhãn lẫn hai thứ tiếng. "Construction & Built Environment" thành "Xây dựng & Công trình" thì hai nửa gần như trùng nghĩa. CONTEXT.md không có mục nào về tên ngành, nên phán quyết dựa vào mục «Ngôn ngữ sản phẩm» của CLAUDE.md và kiến thức tiếng Việt thông dụng.
    - operational-feasibility: FAIL — Phần lớn bảng đúng nghĩa và tự nhiên, nhưng có vài dòng đọc gượng hoặc dễ lẫn. CLAUDE.md «Ngôn ngữ sản phẩm» cấm tự đúc từ ghép cho thuật ngữ và đòi «chữ thường ai cũng hiểu», còn CONTEXT.md không có mục nào cho tên ngành. Dòng có vấn đề: «Lifestyle & Leisure» → «Phong cách sống & Thư giãn» («Thư giãn» không phải nghĩa của leisure và gần trùng «Giải trí»; đề xuất «Phong cách sống & Sở thích»). «Consumer Packaged Goods (CPG)» → «Hàng tiêu dùng đóng gói» («đóng gói» là dịch sát chữ; đề xuất «Hàng tiêu dùng»). «Professional Services & Agencies» → «Dịch vụ chuyên nghiệp & Agency» (dịch sát chữ và lẫn tiếng; đề xuất «Dịch vụ tư vấn & Agency» hoặc «Dịch vụ chuyên môn & Công ty dịch vụ»). «Real Estate & PropTech» → «Bất động sản & Công nghệ bất động sản» (dài, lặp, lẫn với «Công nghệ»; đề xuất «Bất động sản & PropTech» hoặc «Bất động sản»). «Logistics & Supply Chain» so với «Automotive & Transportation» («Vận tải» và «Logistics» gần trùng; đề xuất «Ô tô & Phương tiện» hoặc «Ô tô & Giao thông vận tải»). Nhẹ: «Government & Nonprofit» → «Nhà nước & Phi lợi nhuận» nên là «Cơ quan nhà nước & Phi lợi nhuận». «Công nghệ» và «Công nghiệp» chỉ khác chữ thứ hai nhưng vẫn đọc phân biệt được.
    - spec-alignment: FAIL — Phần lớn các dòng đúng nghĩa và tự nhiên (Y tế, Giáo dục, Viễn thông, Bán lẻ & Thương mại điện tử, Hàng không vũ trụ & Quốc phòng, Hoá chất & Vật liệu). Bốn dòng có vấn đề trong `ten-nganh.ts`. Dòng 29 «Hàng tiêu dùng đóng gói» là từ ghép đúc từ chữ CPG, không ai nói vậy, và CLAUDE.md «Ngôn ngữ sản phẩm» cấm tự đúc từ ghép. Dòng 16 «Phong cách sống & Thư giãn» dịch Leisure thành «Thư giãn», nghĩa lệch và gần «Giải trí» ở dòng 11. Dòng 24 «Dịch vụ chuyên nghiệp & Agency» dịch sát chữ Professional Services nên đọc gượng, lại để một nửa là chữ Anh. Dòng 15 «Ô tô & Vận tải» và dòng 26 «Logistics & Chuỗi cung ứng» gần trùng với một công ty vận tải hàng hoá. CONTEXT.md không có mục nào cho tên ngành để làm chỗ dựa.
  required_evidence:
    - (domain-correctness) Dòng 29 ten-nganh.ts, "Consumer Packaged Goods (CPG)": "Hàng tiêu dùng đóng gói" là cách gọi tự đúc. Đổi thành "Hàng tiêu dùng (CPG)" hoặc "Hàng tiêu dùng nhanh". Nếu chủ kho xác nhận bằng tài liệu (ví dụ tên ngành trong tài liệu nội bộ OneHub) rằng "hàng tiêu dùng đóng gói" là cách gọi đang dùng thì mục này bỏ.
    - (domain-correctness) Dòng 16, "Lifestyle & Leisure": "Phong cách sống & Thư giãn". "Thư giãn" nghĩa là relaxation, không phải leisure. Đề xuất "Phong cách sống & Giải trí cá nhân" hoặc "Phong cách sống & Nghỉ ngơi". Phải xác nhận tên mới không trùng "Giải trí" (Entertainment, dòng 11) và "Khách sạn & Du lịch" (dòng 27).
    - (domain-correctness) Dòng 24, "Professional Services & Agencies": "Dịch vụ chuyên nghiệp & Agency" giữ chữ Anh cho một tên ngành, không phải thuật ngữ kỹ thuật. Đề xuất "Dịch vụ chuyên môn & Công ty dịch vụ (quảng cáo, tư vấn)". Hoặc thêm mục "Agency" vào CONTEXT.md nói rõ đây là cách gọi thông dụng của nhân viên kinh doanh OneHub, theo luật «từ chưa có mục thì thêm mục trước».
    - (domain-correctness) Dòng 28, "Construction & Built Environment": "Xây dựng & Công trình" gần như lặp nghĩa nên người đọc không phân biệt được hai nửa. Đề xuất "Xây dựng & Hạ tầng" hoặc "Xây dựng & Kiến trúc". Lỗi nhẹ hơn ba dòng trên.
    - (domain-correctness) Hai dòng nhẹ, nên cân nhắc: dòng 27 "Hospitality" thành "Khách sạn" hẹp hơn nghĩa gốc, vì hospitality gồm cả nhà hàng và lưu trú; dòng 13 "Government" thành "Nhà nước" nên đổi thành "Chính phủ & Phi lợi nhuận" hoặc "Cơ quan nhà nước & Phi lợi nhuận".
    - (operational-feasibility) Bản ten-nganh.ts mới (/Users/manhphan/dev/crm/.claude/worktrees/dich-ten-nganh-bang-bang/apps/app/lib/ten-nganh.ts) đã sửa các dòng «Lifestyle & Leisure», «Consumer Packaged Goods (CPG)», «Professional Services & Agencies», «Real Estate & PropTech», cùng cặp «Logistics & Supply Chain» / «Automotive & Transportation». Judge đọc lại bảng đó thì verdict đổi.
    - (operational-feasibility) Hoặc một ghi chú ký tên của người nói tiếng Việt làm kinh doanh, đặt trong hồ sơ _acceptance/ của vòng. Ghi chú nêu cho từng dòng trên rằng tên hiện tại được dùng thông dụng, kèm lý do vì sao «Thư giãn», «đóng gói» và «Dịch vụ chuyên nghiệp» không gây lẫn. Judge đọc ghi chú đó thì verdict đổi.
    - (spec-alignment) Dòng 29 của ten-nganh.ts được đổi từ «Hàng tiêu dùng đóng gói» sang tên thông dụng, ví dụ «Hàng tiêu dùng» hoặc «Hàng tiêu dùng nhanh (FMCG)». Nếu giữ nguyên thì cần một mục trong CONTEXT.md ghi lý do giữ tên này và nêu nguồn cho thấy người Việt gọi vậy.
    - (spec-alignment) Dòng 16 «Phong cách sống & Thư giãn» được đổi, ví dụ thành «Phong cách sống & Sở thích», để không còn gần «Giải trí» ở dòng 11.
    - (spec-alignment) Dòng 24 «Dịch vụ chuyên nghiệp & Agency» được đổi sang cách gọi Việt tự nhiên hơn, ví dụ «Dịch vụ chuyên môn & Agency» hoặc «Tư vấn & Dịch vụ doanh nghiệp». Hoặc có ghi chú trong CONTEXT.md rằng «Agency» là cách gọi thông dụng được giữ có chủ đích.
    - (spec-alignment) Có một cách phân biệt hai dòng 15 «Ô tô & Vận tải» và 26 «Logistics & Chuỗi cung ứng». Ví dụ đổi dòng 15 thành «Ô tô & Phương tiện» và để «Vận tải» ở dòng 26, hoặc có ghi chú nêu ranh giới.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-17T18:45:18Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-17T18:45:18Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-17T18:45:18Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-17T18:45:18Z

- cmd: bunx turbo run lint --force
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-17T18:45:18Z

- cmd: bun run lint:slop
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bun_run_lint_slop-r1
  exit_code: 1
  verified_at: 2026-10-17T18:45:18Z
  output: |
    oxlint báo 0 cảnh báo và 1 lỗi: rule anti-slop/no-known-value-widening tại apps/app/lib/ten-nganh.ts:5:51 — BANG_NGANH khai kiểu Record<string, string> đè lên giá trị đã biết. Lệnh này không gắn eval nào; chi tiết ở review-findings.md mục «Ngoài hợp đồng».

- cmd: bunx turbo run build --force
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-17T18:45:18Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Baseline không đo:

- cd apps/app && bun test ./lib/ten-nganh.test.ts: bo qua baseline: tep apps/app/lib/ten-nganh.test.ts co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dich-ten-nganh-bang-bang.dom.tsx: bo qua baseline: tep apps/app/test/dich-ten-nganh-bang-bang.dom.tsx co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất

## Iterations

Round 1: không eval máy nào đỏ; REJECT vì lệnh suite `bun run lint:slop` đỏ mà không gắn eval (BANG_NGANH vi phạm rule anti-slop/no-known-value-widening). E7 hội đồng đề xuất FAIL, chờ người quyết. Hai phát hiện trong hợp đồng ở AC-5 (ca industry null chỉ có assertion phủ định) nằm ở review-findings.md. Giờ trong verified_at lấy theo ngày chạy (giờ không ghi nhận). Trả về cho khâu thực hiện.
