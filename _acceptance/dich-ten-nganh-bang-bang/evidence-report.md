---
schema_version: 2
feature_slug: dich-ten-nganh-bang-bang
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: da721a1238d7bacecc3913383b93a6b617eaafef
human_signoff: Manh Phan 2026-10-18
---

# Evidence Report: dich-ten-nganh-bang-bang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-5 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | judgment | UNCERTAIN (hội đồng đề xuất FAIL 3/3, chờ người quyết) |
| E8 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-dich-ten-nganh-bang-bang-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_bang
  verified_at: 2026-10-17T19:13:06Z
  output: |
    cd apps/app && bun test ./lib/ten-nganh.test.ts
    Ran 9 tests across 1 file. [12.00ms]
    __EXIT=0

- eval: E2
  run_id: minted-dich-ten-nganh-bang-bang-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_bang
  verified_at: 2026-10-17T19:13:06Z
  output: |
    cd apps/app && bun test ./lib/ten-nganh.test.ts
    Ran 9 tests across 1 file. [12.00ms]
    __EXIT=0

- eval: E3
  run_id: minted-dich-ten-nganh-bang-bang-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_man
  verified_at: 2026-10-17T19:13:06Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dich-ten-nganh-bang-bang.dom.tsx
    Ran 7 tests across 1 file. [1.94s]
    __EXIT=0

- eval: E4
  run_id: minted-dich-ten-nganh-bang-bang-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_man
  verified_at: 2026-10-17T19:13:06Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dich-ten-nganh-bang-bang.dom.tsx
    Ran 7 tests across 1 file. [1.94s]
    __EXIT=0

- eval: E5
  run_id: minted-dich-ten-nganh-bang-bang-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_man
  verified_at: 2026-10-17T19:13:06Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dich-ten-nganh-bang-bang.dom.tsx
    Ran 7 tests across 1 file. [1.94s]
    __EXIT=0

- eval: E6
  run_id: minted-dich-ten-nganh-bang-bang-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtn_man
  verified_at: 2026-10-17T19:13:06Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dich-ten-nganh-bang-bang.dom.tsx
    Ran 7 tests across 1 file. [1.94s]
    __EXIT=0

- eval: E8
  run_id: mvcs06ky
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dtn_chup
  verified_at: 2026-10-17T19:13:06Z
  screenshot: evidence/E8-bang-vi-1440.png
  observed: |
    E8-bang-vi-1440.png: Vietnamese "Công ty" table, Industry column in Vietnamese ("Hàng tiêu dùng nhanh", "Xây dựng & Hạ tầng", "Khách sạn & Du lịch", "Viễn thông", "Pháp lý & Tuân thủ", "Thể thao", "Ô tô & Phương tiện"). Long names cut with an ellipsis ("Logistics & Chuỗi cu…", "Tư vấn & Dịch vụ doa…", "Bất động sản & Prop…"). No horizontal scrollbar; the footer reads "1–24 trong số 24".
    E8-ngan-vi-1440.png: the sheet for "Ngành chụp E8 15" shows "Bất động sản & PropTech" in the sub-line. The Vietnamese tabs and labels are intact and nothing overflows. Some detail labels (Account type, Segment, Territory...) are still in English; that is outside the Industry check.
    E8-bang-vi-390.png: at 390 only the Name column shows, with no Industry column; the 24 rows fit with no horizontal overflow.
    E8-ngan-vi-390.png: the bottom sheet shows "Bất động sản & PropTech" under the domain; nothing overflows.
    E8-bang-en-1440.png: English "Companies" table, Industry column in the original text ("Consumer Packaged …", "Construction & Built …", "Hospitality & Tourism", "Telecommunications", "Real Estate & PropTe…"); some cut with an ellipsis; no horizontal overflow.
    E8-ngan-en-1440.png: the sheet shows "Real Estate & PropTech" in the sub-line; it fits.
    E8-bang-en-390.png: only the Company column shows; no overflow.
    E8-ngan-en-390.png: the sheet shows "Real Estate & PropTech"; it fits.
    This matches Expected: Vietnamese shows Vietnamese names, English shows the original, no horizontal overflow, ellipsis allowed in the column, and all four "E8 cat" lines are in the output.
  network_observed: n-a (driver)
  output: |
    - E8-ngan-en-390.png
    All in /Users/manhphan/dev/crm/.claude/worktrees/dich-ten-nganh-bang-bang/_acceptance/dich-ten-nganh-bang-bang/evidence/
    Network: the driver is a bun script that drives the browser itself, so I had no network reader (n-a driver). E8-network.txt was not written.

### Judgment (đề xuất của hội đồng — chưa phải phán quyết)

- eval: E7
  judged_by: judge panel (3 lens, fresh context) — đề xuất panel: FAIL (3/3 lens)
  verdict: UNCERTAIN
  rationale: Hội đồng đề xuất FAIL một cách đồng thuận; máy không tự chốt phán quyết, người quyết ở Cổng 2 (ô human_override để trống).
  votes:
    - domain-correctness: FAIL — Phần lớn bảng đúng nghĩa và tự nhiên, nhưng có dòng sai nghĩa hoặc gây nhầm. Dòng 15 «Ô tô & Phương tiện» dịch Automotive & Transportation làm mất ngành vận tải (Transportation là «Vận tải», không phải «Phương tiện») và lẫn với dòng «Logistics & Chuỗi cung ứng». Dòng 11 «Phong cách sống & Sở thích» dịch Leisure thành «Sở thích» (hobby), lệch nghĩa, và nghe gần «Giải trí». Dòng 20 giữ «PropTech» bằng chữ Anh, còn CONTEXT.md không có mục nào cho tên ngành và CLAUDE.md chỉ cho giữ chữ Anh với thuật ngữ kỹ thuật.
    - operational-feasibility: FAIL — Hai dòng của BANG_NGANH dịch lệch nghĩa ngành gốc: "Automotive & Transportation" thành "Ô tô & Phương tiện" (dòng 15) và "Lifestyle & Leisure" thành "Phong cách sống & Sở thích" (dòng 16). "Phương tiện" không phải "vận tải" và dễ lẫn với "phương tiện truyền thông" ở dòng "Tin tức & Truyền thông". "Sở thích" (hobbies) không phải "Leisure" và chồng nghĩa với "Giải trí" và "Khách sạn & Du lịch". Các dòng còn lại đều tự nhiên và không có từ ghép tự đúc; "PropTech" và "Logistics" giữ chữ Anh, và chữ Anh ở hai dòng này đều là cách gọi thông dụng ở Việt Nam.
    - spec-alignment: FAIL — Phần lớn các dòng dịch đúng và tự nhiên. Ba dòng trong ten-nganh.ts có lỗi rõ. Dòng 15 "Ô tô & Phương tiện": Transportation dịch là "Phương tiện" là sai nghĩa, vì thông dụng phải là "Vận tải", và "phương tiện" còn dễ lẫn với "phương tiện truyền thông" ở dòng 18. Dòng 16 "Phong cách sống & Sở thích": Leisure không phải "sở thích", và tên này gần trùng "Giải trí" ở dòng 11. Dòng 20 "Bất động sản & PropTech": PropTech là chữ Anh không phải cách gọi thông dụng với nhân viên kinh doanh, trái mục «Ngôn ngữ sản phẩm» của CLAUDE.md.
  required_evidence:
    - (domain-correctness) Tệp /Users/manhphan/dev/crm/.claude/worktrees/dich-ten-nganh-bang-bang/apps/app/lib/ten-nganh.ts sau khi sửa dòng 15 thành «Ô tô & Vận tải» (hoặc tên khác chứa chữ «vận tải»), để Transportation không còn bị dịch thành «Phương tiện». Kèm lý do tách khỏi «Logistics & Chuỗi cung ứng». Với tên mới này verdict dòng 15 sẽ đổi.
    - (domain-correctness) Tệp ten-nganh.ts sau khi sửa dòng 16: «Leisure» không còn dịch thành «Sở thích» và không trùng nghĩa «Giải trí». Đề xuất: «Phong cách sống & Thư giãn» hoặc «Lối sống & Thời gian rảnh». Hoặc chủ kho ghi nhận tên cũ chấp nhận được.
    - (domain-correctness) Một trong hai thứ sau cho «PropTech» ở dòng 20. Một là mục ngành trong /Users/manhphan/dev/crm/.claude/worktrees/dich-ten-nganh-bang-bang/CONTEXT.md nêu «PropTech» là cách gọi thông dụng của nhân viên kinh doanh Việt. Hai là sửa dòng 20 thành «Bất động sản & Công nghệ bất động sản».
    - (domain-correctness) Tuỳ chọn (cấp thấp): dòng «Khách sạn & Du lịch» (Hospitality gồm cả nhà hàng) và «Tư vấn & Dịch vụ doanh nghiệp» (mất «Agencies») được chủ kho ghi chấp nhận hoặc đổi tên, ở ten-nganh.ts hoặc CONTEXT.md.
    - (operational-feasibility) Sửa dòng 15 của /Users/manhphan/dev/crm/.claude/worktrees/dich-ten-nganh-bang-bang/apps/app/lib/ten-nganh.ts: 'Automotive & Transportation' đổi 'Ô tô & Phương tiện' thành 'Ô tô & Vận tải'. Đọc lại tệp đó thấy đúng dòng này thì phán quyết về dòng này đổi.
    - (operational-feasibility) Sửa dòng 16 của cùng tệp: 'Lifestyle & Leisure' đổi 'Phong cách sống & Sở thích' thành một tên khớp 'Leisure' mà không trùng 'Giải trí', ví dụ 'Phong cách sống & Thư giãn' hoặc 'Lối sống & Nghỉ dưỡng'. Đọc lại tệp thấy dòng này không còn 'Sở thích' thì phán quyết đổi.
    - (operational-feasibility) Cân nhắc nhưng không bắt buộc: dòng 24 'Professional Services & Agencies' đang mất nghĩa 'Agencies'. Dòng 20 giữ 'PropTech' bằng chữ Anh, và dòng 27 'Hospitality' mới chỉ phủ khách sạn. Nếu chủ kho coi 'PropTech' không phải cách gọi thông dụng thì đổi thành 'Công nghệ bất động sản'. Ghi quyết định vào CONTEXT.md hoặc tệp ten-nganh.ts.
    - (spec-alignment) Dòng 15 của /Users/manhphan/dev/crm/.claude/worktrees/dich-ten-nganh-bang-bang/apps/app/lib/ten-nganh.ts: đổi "Ô tô & Phương tiện" thành "Ô tô & Vận tải". Khi đó verdict có thể đổi nếu hai dòng sau cũng được sửa.
    - (spec-alignment) Dòng 16 của cùng tệp: đổi "Phong cách sống & Sở thích" thành tên không mang nghĩa "sở thích" và không gần "Giải trí", ví dụ "Phong cách sống & Thư giãn". Hoặc chủ kho ghi quyết định giữ nguyên kèm lý do.
    - (spec-alignment) Dòng 20 của cùng tệp: đổi "Bất động sản & PropTech" thành "Bất động sản & Công nghệ bất động sản". Hoặc một mục trong CONTEXT.md xác nhận "PropTech" là chữ nhân viên OneHub vẫn dùng.
    - (spec-alignment) Tuỳ chọn, không bắt buộc cho PASS: dòng 24 "Tư vấn & Dịch vụ doanh nghiệp" bỏ mất nghĩa Agencies. Có thể đổi thành "Tư vấn & Dịch vụ chuyên môn (agency)", hoặc ghi lý do giữ nguyên.
  human_override: Manh Phan 2026-10-18 — Đạt

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-17T19:13:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-17T19:13:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-17T19:13:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-17T19:13:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-17T19:13:06Z

- cmd: bun run lint:slop
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-17T19:13:06Z

- cmd: bunx turbo run build --force
  run_id: minted-dich-ten-nganh-bang-bang-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-17T19:13:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round 1 — baseline không đo lại round này (evals.yaml không đổi từ lần đo baseline cuối, round 1).

Baseline không đo: mọi eval máy ghi `baseline: n-a` vì round này không đo lại.

Eval không-phân-biệt (xanh ở cả HEAD lẫn baseline): none. Lệnh suite xanh ở cả hai phía là regression-guard bình thường, không liệt kê.

Lệnh fail không gắn eval: none.

## Variance

none — mọi eval chạy một lần (deterministic), không eval nào có pass_rate lẫn.

## Iterations

Round 1: REJECT — hai finding trong hợp đồng ở AC-5 (ca ngành null chưa ghim được ô trống) và cổng lint:slop đỏ. Returned to implementation.
Round 2: mọi eval máy và mọi lệnh suite xanh; E7 (AC-6) hội đồng đề xuất FAIL 3/3 về dòng 15, 16, 20 của bảng ngành, chờ người quyết ở Cổng 2 (PENDING-JUDGMENT).
