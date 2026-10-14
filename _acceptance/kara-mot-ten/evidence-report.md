---
schema_version: 2
feature_slug: kara-mot-ten
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0d382739508bfad5a082f1de511782b618fc63fc
human_signoff: Phan Le Manh 2026-10-13 — ký Cổng Bằng chứng trên vòng chấm 2 (mọi eval máy đạt, 17/17 gồm E2b và E15 mang từ vòng 1; vòng 1 REJECT đã sửa). E13 (hội đồng câu chữ đề xuất FAIL ở nhãn «Kara · theo bản đang dùng»): Đạt. Ngoài-4 (phép đếm nguồn kẹt dồn sai khi có cả câu cũ lẫn mới) mở hợp đồng mới; Ngoài-2 chấp nhận, không sửa; hai mươi mốt mục còn lại ghi Known limits, gồm Ngoài-23 (ghim lại khung-khong-con-dung-chu sau khi gộp). Đồng ý phần cắt/hoãn đã khai; phê hết các quyết định ghi sau Cổng Phạm vi.
---

# Evidence Report: kara-mot-ten

Round 2. Mọi eval máy đều xanh; còn một mục judgment (E13) do panel đề xuất FAIL nên người quyết ở Cổng 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS (carry-forward từ round 1) |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-9 | script | PASS |
| E15 | AC-7 | script | PASS (carry-forward từ round 1) |
| E16 | AC-1 | script | PASS |
| E13 | AC-1 | judgment | PENDING (panel đề xuất FAIL, chờ người) |
| E14 | AC-4 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-kara-mot-ten-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_ban_ghi
  verified_at: 2026-10-13T12:49:57Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-ban-ghi
    Ran 1 test across 1 file. [1.66s]

- eval: E2
  run_id: minted-kara-mot-ten-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_tom_tat
  verified_at: 2026-10-13T12:49:57Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-tom-tat
    Ran 1 test across 1 file. [1.77s]

- eval: E2b
  run_id: minted-kara-mot-ten-E2b-r1
  exit_code: 0
  verifier: config:executors.test.kmt_tin_nhac
  verified_at: 2026-10-13T10:18:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-kara-mot-ten-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_soan
  verified_at: 2026-10-13T12:49:57Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-soan
    Ran 1 test across 1 file. [1.56s]

- eval: E4
  run_id: minted-kara-mot-ten-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_cai_dat
  verified_at: 2026-10-13T12:49:57Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-cai-dat
    Ran 1 test across 1 file. [1.57s]

- eval: E5
  run_id: minted-kara-mot-ten-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_tai_lieu
  verified_at: 2026-10-13T12:49:57Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-tai-lieu
    Ran 1 test across 1 file. [1260.00ms]

- eval: E6
  run_id: minted-kara-mot-ten-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_dung_chung
  verified_at: 2026-10-13T12:49:57Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-dung-chung
    Ran 1 test across 1 file. [1347.00ms]

- eval: E7
  run_id: minted-kara-mot-ten-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmt_luat
  verified_at: 2026-10-13T12:49:57Z
  output: |
    cd apps/app && bun test ./test/kara-mot-ten.spec.ts -t kmt-luat
    Ran 4 tests across 1 file. [513.00ms]

- eval: E8
  run_id: minted-kara-mot-ten-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmt_dot_bien
  verified_at: 2026-10-13T12:49:57Z
  output: |
    node _acceptance/kara-mot-ten/rang/dot-bien.mjs
    dot-bien: 7/7 cap dat

- eval: E9
  run_id: minted-kara-mot-ten-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmt_giu
  verified_at: 2026-10-13T12:49:57Z
  output: |
    cd apps/app && bun test ./test/kara-mot-ten.spec.ts -t kmt-giu
    Ran 2 tests across 1 file. [218.00ms]

- eval: E10
  run_id: minted-kara-mot-ten-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmt_bai_cu_app
  verified_at: 2026-10-13T12:49:57Z
  output: |
    node _acceptance/kara-mot-ten/rang/bai-cu.mjs --app
    bai-cu --app: 28 bai, 0 cho do

- eval: E11
  run_id: minted-kara-mot-ten-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmt_bai_cu_may
  verified_at: 2026-10-13T12:49:57Z
  output: |
    node _acceptance/kara-mot-ten/rang/bai-cu.mjs --may
    bai-cu --may: 21 bai, 0 cho do

- eval: E12
  run_id: minted-kara-mot-ten-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmt_khong_go_bai
  verified_at: 2026-10-13T12:49:57Z
  output: |
    node _acceptance/kara-mot-ten/rang/khong-go-bai.mjs
    khong-go-bai: 19 tep doi, 0 vi pham

- eval: E15
  run_id: minted-kara-mot-ten-E15-r1
  exit_code: 0
  verifier: config:executors.script.kmt_kiem_ke
  verified_at: 2026-10-13T10:18:35Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E16
  run_id: minted-kara-mot-ten-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmt_bang_chu
  verified_at: 2026-10-13T12:49:57Z
  output: |
    node _acceptance/kara-mot-ten/rang/bang-chu.mjs
    bang-chu: 186 dong

- eval: E14
  run_id: minted-kara-mot-ten-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmt_chup
  verified_at: 2026-10-13T12:49:57Z
  screenshot: evidence/E14-cai-dat-okr-1440.png
  observed: |
    E14-cai-dat-okr-1440.png: Cài đặt › Chương trình OKR, tối; tiêu đề thẻ «Kara · OKR», trạng thái Đang tắt, nhãn «Bật Kara» kèm công tắc; các mục Góp ý khi bấm, Tóm tắt tuần, Soạn OKR; không có chữ «Trợ lý». E14-cai-dat-okr-390.png: cùng thẻ ở khổ điện thoại, tiêu đề «Kara · OKR», «Bật Kara» + công tắc, không chữ «Trợ lý», không tràn ngang. E14-so-chi-phi-1440.png: «Sổ chi phí AI — tháng này», khối «Kara · OKR 0,05 US$ / 9 US$ (1%)», bảng Việc có Nghiên cứu danh bạ, Kara · hồ sơ, Hỏi qua Zalo, Tác nhân, Kara · OKR, Tổng 0,15 US$ (nhóm «Tác nhân» còn nguyên). E14-so-chi-phi-390.png: cùng khối sổ chi phí ở 390 với đủ các dòng nhóm. E14-soan-okr-1440.png: khung Soạn OKR (Kinh doanh miền Bắc · Quý 4 · mẫu) đã mở, hiện «Kara chưa được bật ở đây — Quản trị cần nối Kara · OKR trong Cài đặt trước khi soạn.»; đúng màn, không phải đăng nhập/onboarding, gọi AI là Kara. E14-tai-lieu-1440.png: Tài liệu thẻ Hỏi, «Kara chỉ trả lời từ bản đang dùng của các trang đã duyệt.», ô hỏi và gợi ý. E14-tab-kara-1440.png: khung bản ghi công ty Monzo, tab Kara, «Hỏi Kara về công ty này», nút «Nhờ Kara tra cứu». Tất cả khớp Expected, không thấy «Trợ lý» ở chỗ gọi AI.
  network_observed: n-a (driver)
  output: |
    Bảy frame đã lưu, đều đã mở bằng Read: E14-cai-dat-okr-1440.png, E14-cai-dat-okr-390.png, E14-so-chi-phi-1440.png, E14-so-chi-phi-390.png, E14-soan-okr-1440.png, E14-tai-lieu-1440.png, E14-tab-kara-1440.png (thư mục _acceptance/kara-mot-ten/evidence/).
    Driver là script chup.mjs, không đọc được network, nên không ghi E14-network.txt.
    Lưu ý: lượt chạy lại làm đổi hai tệp đã theo dõi dưới evidence/ (E14-tai-lieu-1440.png, ho-so-bai-doi.md), nằm trong thư mục được phép ghi.

- eval: E13
  judged_by: judge panel (3 lens, fresh context)
  proposal: FAIL
  rationale: Ba lens cùng chỉ ra khoá tai-lieu.ts#hoi.nhanTraLoi (vi «Kara · theo bản đang dùng», en «Kara · from the version in use») là nhãn đặt trên câu trả lời với lời bổ nghĩa ghép cứng sau «Kara», không phải tên trang, tên nhóm hay tiêu đề; phần còn lại của bảng chữ đạt cả bốn tiêu chí.
  votes:
    - domain-correctness: FAIL — Gần như mọi dòng đạt cả bốn tiêu chí: một tên «Kara», giữ nghĩa (kể cả «trợ lý phụ» thành «Kara nhờ một trợ tác làm một phần việc»), và dạng «Kara · OKR» hoặc «Kara · hồ sơ» chỉ ở tên trang, tên nhóm, tiêu đề. Còn một dòng vi phạm tiêu chí 4: tai-lieu.ts#hoi.nhanTraLoi (vi «Kara · theo bản đang dùng», en «Kara · from the version in use»). Đó là nhãn gắn trên câu trả lời, không phải tên trang, tên nhóm hay tiêu đề. Phần sau dấu «·» cũng không phải một phần của Kara mà là điều kiện của câu trả lời, nên là cách ghép cứng như câu hỏi cảnh báo. Bảng thay chữ của design doc chỉ cho «Trợ lý AI» ở Tài liệu thành «Kara», không cho «Kara · <phần>».
    - operational-feasibility: FAIL — Gần như mọi dòng đạt cả bốn tiêu chí, kể cả «trợ lý phụ» → «Kara nhờ một trợ tác làm một phần việc» (giữ ý nhờ trợ tác). Riêng khoá tai-lieu.ts#hoi.nhanTraLoi (vi và en) vi phạm tiêu chí 4: «Kara · theo bản đang dùng» / «Kara · from the version in use» là nhãn đặt trên câu trả lời, không phải tên trang, tên nhóm hay tiêu đề. «theo bản đang dùng» cũng không phải một phần của Kara như OKR hay hồ sơ, mà là lời bổ nghĩa ghép cứng sau Kara. Bảng thay chữ của design doc chỉ cho dạng «Kara · <phần>» ở tên trang, tên nhóm và tiêu đề, còn «Trợ lý AI» ở Tài liệu thì đổi thành «Kara» trơn.
    - spec-alignment: FAIL — Khoá tai-lieu.ts#hoi.nhanTraLoi (vi và en) viết «Kara · theo bản đang dùng» / «Kara · from the version in use». Đây là ghép cứng «Kara · <mệnh đề>» trên nhãn câu trả lời, không phải «phần» của Kara (OKR, hồ sơ, Tài liệu) và không phải tên trang, nhóm hay tiêu đề. Bốn dòng tro-ly-okr.ts#so.thanh và so.rongMoTa (vi, en) còn bỏ phạm vi OKR của trần ngân sách khi sổ chi phí có thêm nhóm «Kara · hồ sơ».
  required_evidence:
    - domain-correctness: Sửa apps/app/lib/messages/tai-lieu.ts#hoi.nhanTraLoi (vi và en) về «Kara» hoặc «Kara trả lời theo bản đang dùng» / «Kara answers from the version in use», rồi cập nhật bang-chu.md. Nếu giữ dạng «Kara · …», cần mục Bảng thay chữ trong design doc cho phép nhãn trả lời dùng dạng này, và bằng chứng nhãn là tiêu đề của khối câu trả lời.
    - domain-correctness: Ảnh chụp màn Hỏi Kho tài liệu (chạy bun scripts/lan-do/tien-de.mjs --chay như eval E14 khai, ảnh ở _acceptance/kara-mot-ten/evidence/) có câu trả lời đang mang nhãn hoi.nhanTraLoi, để xét nhãn đó có phải tiêu đề không.
    - operational-feasibility: Dòng bang-chu.md cho apps/app/lib/messages/tai-lieu.ts#hoi.nhanTraLoi (vi và en) có chữ mới không còn dạng «Kara · <lời bổ nghĩa>». Ví dụ «Kara» trơn, hoặc «Kara trả lời theo bản đang dùng». Lấy từ bang-chu.md sau khi chạy lại kiểm kê trên cây đã sửa.
    - operational-feasibility: Hoặc một câu trong mục «Bảng thay chữ» của design doc (docs/superpowers/specs/2026-10-13-kara-mot-ten-design.md) cho phép dạng «Kara · <lời bổ nghĩa>» làm nhãn câu trả lời. Khi đó dòng này không còn vi phạm tiêu chí 4.
    - spec-alignment: Sửa tai-lieu.ts#hoi.nhanTraLoi (vi, en) thành câu tự nhiên, ví dụ nhãn «Kara» kèm «theo bản đang dùng» ở dòng riêng. Chạy lại bản in bảng chữ để bang-chu.md ở khoá này không còn dạng «Kara · theo bản đang dùng».
    - spec-alignment: Nếu giữ dạng «Kara · …» ở nhãn câu trả lời, ghi vào bảng «Bảng thay chữ» của docs/superpowers/specs/2026-10-13-kara-mot-ten-design.md rằng nhãn câu trả lời cũng là loại tiêu đề được phép dùng «Kara · <phần>». Khi đó «theo bản đang dùng» phải là tên một phần, không phải mệnh đề.
    - spec-alignment: Cho so.thanh và so.rongMoTa (tro-ly-okr.ts, vi và en) ghi rõ phạm vi OKR, ví dụ «Kara · OKR đã dùng trên trần tháng». Hoặc dẫn chứng từ chụp màn sổ chi phí rằng hai chuỗi này chỉ hiện dưới nhóm «Kara · OKR». Chụp bằng bun scripts/lan-do/tien-de.mjs --chay như eval E14 khai, ảnh nằm ở _acceptance/kara-mot-ten/evidence/.
  human_override: Đạt — Phan Le Manh 2026-10-13

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kara-mot-ten-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-13T12:49:57Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kara-mot-ten-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-13T12:49:57Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kara-mot-ten-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-13T12:49:57Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kara-mot-ten-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-13T12:49:57Z

- cmd: bunx turbo run lint --force
  run_id: minted-kara-mot-ten-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-13T12:49:57Z

- cmd: bun run lint:slop
  run_id: minted-kara-mot-ten-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-13T12:49:57Z

- cmd: bunx turbo run build --force
  run_id: minted-kara-mot-ten-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-13T12:49:57Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:

- cd apps/app && bun test ./test/kara-mot-ten.spec.ts -t kmt-luat: bo qua baseline: tep apps/app/test/kara-mot-ten.spec.ts co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/kara-mot-ten/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/kara-mot-ten.spec.ts -t kmt-giu: bo qua baseline: tep apps/app/test/kara-mot-ten.spec.ts co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/bai-cu.mjs --app: bo qua baseline: tep _acceptance/kara-mot-ten/rang/bai-cu.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/bai-cu.mjs --may: bo qua baseline: tep _acceptance/kara-mot-ten/rang/bai-cu.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/khong-go-bai.mjs: bo qua baseline: tep _acceptance/kara-mot-ten/rang/khong-go-bai.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/bang-chu.mjs: bo qua baseline: tep _acceptance/kara-mot-ten/rang/bang-chu.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E14 failed and two in-contract findings (kmt-giu gọi git show trên sha cố định đỏ ở checkout nông của CI; dem-ket.ts không nhận hàng mồ côi mới) — verdict REJECT. Returned to implementation.
Round 2: mọi eval máy xanh sau commit ad559db91 (câu Kara · OKR trong câu, kmt-giu với checkout nông, dem-ket nhận chữ mồ côi mới, E14 chụp đúng màn); E13 do panel đề xuất FAIL ở khoá tai-lieu.ts#hoi.nhanTraLoi nên verdict PENDING-JUDGMENT, chờ người ở Cổng 2.

### Re-pin lần 1 — 2026-10-13, do K6a trước gộp: gộp onehub 60fc1b02d, răng dem-ket nhận chữ mồ côi mới, sửa YAML E6 bo-ca-mau-quy-4
run_id: repin-20261013T233009Z-75646
sha: 13204dd159930a2913e1a176dba82bf70efa3ad3 · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E13, E14 · diff chạm vật đo ngoài làn máy: E14 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-14, do gộp onehub 4b7f07936 (lô 02:00Z: #397, #393, #398) trước khi gộp #389
run_id: repin-20261014T034928Z-89109
sha: a5e30dc320fe6d7d3236e31833b7b703780b6db6 · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E13, E14 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-14, do gộp onehub c4c8ab0ab (#391 l3b) trước khi gộp #389; tai-lieu-lich-su.ts gọi Kara
run_id: repin-20261014T051016Z-89088
sha: 0d382739508bfad5a082f1de511782b618fc63fc · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E13, E14 · diff chạm vật đo ngoài làn máy: E14 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
