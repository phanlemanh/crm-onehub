---
schema_version: 2
feature_slug: vong-doi-mot-cach-cat
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8eaa811914c499ab9e4c4c0627949bb819f46038
human_signoff:
---

# Evidence Report: vong-doi-mot-cach-cat

Round 1. Mọi eval máy đều xanh; hội đồng judgment E13 (AC-7) đề xuất FAIL ở cả ba lăng kính nên verdict tổng là REJECT. Không có lệnh fail nào không gắn eval.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-1 | test | PASS |
| E4 | AC-2 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-5 | test | PASS |
| E11 | AC-6 | test | PASS |
| E12 | AC-7 | ui-check | PASS |
| E13 | AC-7 | judgment | FAIL |
| E14 | AC-2 | test | PASS |
| E15 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_hoan_tac_loat
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-hoan-tac-loat
    Ran 1 test across 1 file. [2.41s]

- eval: E2
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_may_chu
  verified_at: 2026-10-09T11:24:53Z
  output: |
    bun run test -- "cd apps/api && bun test test/vong-doi-mot-cach-cat.spec.ts"
    test-run: dropped crm_mv0vp4ize08r_test

- eval: E3
  run_id: minted-vong-doi-mot-cach-cat-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kts_hoan_tac
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-trang-thai-luu-tru.dom.tsx -t luu-tru-hoan-tac
    Ran 1 test across 1 file. [2.05s]

- eval: E4
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_hoan_tac_loi
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-hoan-tac-loi
    Ran 1 test across 1 file. [2.40s]

- eval: E5
  run_id: minted-vong-doi-mot-cach-cat-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_dai_bao
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-dai-bao
    Ran 1 test across 1 file. [3.04s]

- eval: E6
  run_id: minted-vong-doi-mot-cach-cat-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_chi_doc
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-chi-doc
    Ran 1 test across 1 file. [3.47s]

- eval: E7
  run_id: minted-vong-doi-mot-cach-cat-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_kanban
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-kanban
    Ran 1 test across 1 file. [1.90s]

- eval: E8
  run_id: minted-vong-doi-mot-cach-cat-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_chu
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-chu
    Ran 1 test across 1 file. [2.65s]

- eval: E9
  run_id: minted-vong-doi-mot-cach-cat-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_cap_chu
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && bun test test/messages-guard.spec.ts
    Ran 134 tests across 1 file. [1.98s]

- eval: E10
  run_id: minted-vong-doi-mot-cach-cat-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_bang_so_0
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/bang-crm-loc-ro.dom.tsx -t so-0
    Ran 3 tests across 1 file. [4.01s]

- eval: E11
  run_id: minted-vong-doi-mot-cach-cat-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_bang_khong_loc
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/bang-crm-loc-ro.dom.tsx -t khong-loc
    Ran 2 tests across 1 file. [2.31s]

- eval: E12
  run_id: minted-vong-doi-mot-cach-cat-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vdc_man
  verified_at: 2026-10-09T11:24:53Z
  screenshot: evidence/E12-step1.png
  observed: |
    Đã mở từng ảnh bằng Read. (1) vdc-ngan-da-cat-1440: ngăn bản ghi "Thoả thuận đã cắt k0vpnub 3561" tab Tổng quan; có dải "Đã lưu trữ ngày 15/09/2026" kèm nút «Khôi phục»; ô Tên trong Chi tiết hiển thị chữ thường (không có input mở). Khớp Expected. (2) vdc-kanban-1440: trang Thoả thuận view Bảng cột, thanh công cụ có nút «Đã lưu trữ» cạnh Bảng/Bảng cột. Khớp. (3) vdc-ngan-da-cat-390: ngăn dạng drawer ở 390 px, dải "Đã lưu trữ ngày 15/09/2026" và nút «Khôi phục» nằm gọn trong khung nhìn, không thấy tràn ngang. Khớp. (4) vdc-kanban-390: Kanban 390 px, nút «Đã lưu trữ» nằm trong khung nhìn, các cột cuộn ngang bên trong bảng, trang không tràn. Khớp. (5) vdc-hoan-tac-loat-1440: trang Cá nhân lọc k0vpnub, hiện đủ 3 dòng (Lan 1/2/3 Hoàn tác k0…) sau Hoàn tác, toast "Đã khôi phục 3 cá nhân." ở góc trái dưới trong khung nhìn. Khớp. Không có frame mâu thuẫn Expected (frame sau-click của «Đã lưu trữ» và chi tiết db do script tự assert, không có ảnh riêng).
  network_observed: n-a (driver)
  output: |
    Assertion (do script man.mjs in): buoc 1 dat (thoả thuận đã cắt, 1440; ảnh vdc-ngan-da-cat-1440.png); buoc 2 dat (Kanban 1440; ảnh vdc-kanban-1440.png); buoc 3 dat ("390: khong tran, nut trong khung"; ảnh vdc-ngan-da-cat-390.png, vdc-kanban-390.png); buoc 4 dat (Khôi phục -> dải mất, archivedAt null); buoc 5 dat (3 cá nhân lưu trữ hàng loạt rồi Hoàn tác; ảnh vdc-hoan-tac-loat-1440.png).
    Frame đã lưu: vdc-ngan-da-cat-1440.png (=E12-step1), vdc-kanban-1440.png (=E12-step2), vdc-ngan-da-cat-390.png (=E12-step3a), vdc-kanban-390.png (=E12-step3b), vdc-hoan-tac-loat-1440.png (=E12-step5).
    Ghi chú: 3 png (hoan-tac-loat-1440, ngan-da-cat-1440, ngan-da-cat-390) đổi so với bản đã commit vì script ghi đè; không commit. Chưa chạy chiều đối chứng --chieu-do. Driver là script bun nên không đọc được network (n-a); E12-network.txt chỉ ghi chú điều đó.

- eval: E13
  judged_by: judge panel (3 lăng kính, fresh context)
  proposal: FAIL
  rationale: Ba lăng kính cùng chấm trượt AC-7. Điểm 1, 3, 4 đạt (dải «Đã lưu trữ ngày 15/09/2026» kèm «Khôi phục», nút «Đã lưu trữ» trên Kanban, không có «Lưu trữ» trần hay «ẩn»). Điểm 5 trượt: ở 390 nhiều chữ bị cắt hoặc tràn, và nhãn giai đoạn tràn mép thẻ Kanban. Điểm 2 yếu: ngăn đã cất vẫn có ô chọn giai đoạn kèm mũi tên, bánh răng «Chi tiết», ô Mô tả dạng gợi ý.
  votes:
    - domain-correctness: FAIL — Điểm 1, 3 và 4 đạt. Điểm 5 trượt: ở 390 nhiều chữ bị cắt hoặc tràn (nhãn «Ngày dự …», «Ở giai đo…», tên giai đoạn «Demo boo…», «Qualified t…», «Contract s…», «P…» ở ngăn; «Demo booked» tràn khỏi viền thẻ ở Kanban 390, «Contract sent» tràn ở 1440). Điểm 2 yếu: ô chọn giai đoạn «Demo booked» kèm mũi tên, biểu tượng bánh răng ở «Chi tiết» và ô Mô tả dạng gợi ý trông như sửa được.
    - operational-feasibility: FAIL — Điểm (1), (3), (4) đạt. Điểm (5) không đạt: ở 390 ngăn đã cất có chữ bị cắt bằng dấu «…» («Ngày dự …», «Ở giai đo…», «P…», «Demo boo…», «Qualified t…»), và ở Kanban nhãn giai đoạn tràn ngoài mép thẻ (Demo booked, Qualified to buy, Contract sent ở cả hai khổ). Điểm (2) chưa rõ: ô giai đoạn còn mũi tên chọn, bánh răng «Chi tiết», ô mô tả dạng gợi ý.
    - spec-alignment: FAIL — Điểm 1, 3 và 4 đạt; nút «Đã lưu trữ» trên Kanban đứng riêng cạnh «Bảng | Bảng cột». Điểm 5 trượt: ở 390 nhiều chữ bị cắt hoặc tràn, tiêu đề thoả thuận bị bẻ 5 dòng hẹp. Điểm 2 chưa chắc: dòng mô tả mờ trông như ô gợi ý nhập, ô giai đoạn còn mũi tên, bánh răng ở «Chi tiết» vẫn hiện. Phụ: dải ghi «Đã lưu trữ ngày 15/09/2026» trong khi «Ngày mở» là 9 thg 10, 2026, tức cất trước khi mở.
  required_evidence:
    - Ảnh vdc-ngan-da-cat-390.png chụp lại sau sửa: hàng bốn ô (Giá trị, Ngày dự kiến chốt, Ở giai đoạn, Phụ trách), thanh giai đoạn và tên người phụ trách không còn chữ bị cắt bằng dấu «…» (hoặc xuống dòng đủ chữ), lấy từ lượt chụp lại bằng lệnh tien-de.mjs --chay của eval này; hoặc một ghi chú trong hợp đồng AC-7 (contract.md) nói rõ phép cắt «…» ở các ô số liệu và nhãn thẻ Kanban là có chủ ý và nằm ngoài phạm vi AC-7.
    - Ảnh vdc-kanban-390.png và vdc-kanban-1440.png chụp lại cho thấy nhãn giai đoạn trong thẻ («Demo booked», «Qualified to buy», «Contract sent») nằm gọn trong viền thẻ, không tràn ra ngoài; hoặc chủ kho xác nhận bằng chữ rằng lỗi này có từ trước và ngoài phạm vi AC-7.
    - Ảnh vdc-ngan-da-cat-1440.png chụp lại, hoặc đoạn mã component ngăn thoả thuận, cho thấy khi đã lưu trữ thì ô chọn giai đoạn bị khoá (disabled hoặc không còn mũi tên), bánh răng «Chi tiết» ẩn hoặc mờ, ô Mô tả hiện như chữ đọc chứ không như ô nhập có gợi ý; hoặc docs/vong-doi.md / hợp đồng ghi rõ các điều khiển đó cố ý để nguyên sau khi cất.
    - Phụ: sửa dữ liệu mẫu của ảnh để ngày lưu trữ không đứng trước «Ngày mở».
  human_override:  # chi nguoi ghi

- eval: E14
  run_id: minted-vong-doi-mot-cach-cat-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kts_hoan_tac_loi
  verified_at: 2026-10-09T11:24:53Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-trang-thai-luu-tru.dom.tsx -t hoan-tac-hong
    Ran 1 test across 1 file. [812.00ms]

- eval: E15
  run_id: minted-vong-doi-mot-cach-cat-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vdc_duong_luu_tru
  verified_at: 2026-10-09T11:24:53Z
  output: |
    bun _acceptance/vong-doi-mot-cach-cat/rang/duong-luu-tru.mjs
    vong-doi-mot-cach-cat duong-luu-tru: dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T11:24:53Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T11:24:53Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-09T11:24:53Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T11:24:53Z

- cmd: bunx turbo run lint --force
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-09T11:24:53Z

- cmd: bun run lint:slop
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T11:24:53Z

- cmd: bunx turbo run build --force
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T11:24:53Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay.

none — không có eval nào được liệt kê là không-phân-biệt; lệnh suite xanh-cả-hai-phía là regression-guard bình thường.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E13 (judgment, AC-7) bị hội đồng đề xuất FAIL ở cả ba lăng kính — ở 390 chữ bị cắt hoặc tràn (ngăn và nhãn thẻ Kanban), ngăn đã cất vẫn còn ô giai đoạn, bánh răng và ô Mô tả trông sửa được. Mọi eval máy đều xanh. Returned to implementation.
