---
schema_version: 2
feature_slug: vong-doi-mot-cach-cat
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5766c379667b2431da8e63cf0e5792a8e8f15d17
human_signoff: Phan Le Manh 2026-10-09 — ký Cổng Bằng chứng trên vòng chấm 3 (15/15 eval đạt, 7/7 lệnh suite xanh, hội đồng E13 đạt, 0 phát hiện trong hợp đồng; vòng 1 và 2 REJECT đã sửa sản phẩm và phép đo). Tám mục ngoài hợp đồng: Ngoài-1, 2, 3 (Hoàn tác hàng loạt, cùng gốc) và Ngoài-7 (mảnh dùng chung) mở hợp đồng mới; Ngoài-4, 6, 8 ghi Known limits; Ngoài-5 chấp nhận, không sửa. Phạm vi cắt/hoãn đồng ý như đã khai; các quyết định ghi sau Cổng Phạm vi (bốn tệp chữ, đổi lời E13 theo ngả A) được phê toàn bộ.
---

# Evidence Report: vong-doi-mot-cach-cat

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
| E13 | AC-7 | judgment | PASS |
| E14 | AC-2 | test | PASS |
| E15 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_hoan_tac_loat
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-hoan-tac-loat
    Ran 1 test across 1 file. [2.42s]

- eval: E2
  run_id: minted-vong-doi-mot-cach-cat-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_may_chu
  verified_at: 2026-10-09T16:09:12Z
  output: |
    bun run test -- "cd apps/api && bun test test/vong-doi-mot-cach-cat.spec.ts"
    test-run: dropped crm_mv15ur1j2n1v_test

- eval: E3
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kts_hoan_tac
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-trang-thai-luu-tru.dom.tsx -t luu-tru-hoan-tac
    Ran 1 test across 1 file. [1.60s]

- eval: E4
  run_id: minted-vong-doi-mot-cach-cat-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_hoan_tac_loi
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-hoan-tac-loi
    Ran 1 test across 1 file. [1.98s]

- eval: E5
  run_id: minted-vong-doi-mot-cach-cat-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_dai_bao
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-dai-bao
    Ran 1 test across 1 file. [2.08s]

- eval: E6
  run_id: minted-vong-doi-mot-cach-cat-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_chi_doc
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-chi-doc
    Ran 1 test across 1 file. [2.69s]

- eval: E7
  run_id: minted-vong-doi-mot-cach-cat-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_kanban
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-kanban
    Ran 1 test across 1 file. [1338.00ms]

- eval: E8
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_chu
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-chu
    Ran 1 test across 1 file. [2.65s]

- eval: E9
  run_id: minted-vong-doi-mot-cach-cat-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vdc_cap_chu
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && bun test test/messages-guard.spec.ts
    Ran 134 tests across 1 file. [1.71s]

- eval: E10
  run_id: minted-vong-doi-mot-cach-cat-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_bang_so_0
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/bang-crm-loc-ro.dom.tsx -t so-0
    Ran 3 tests across 1 file. [3.05s]

- eval: E11
  run_id: minted-vong-doi-mot-cach-cat-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_bang_khong_loc
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/bang-crm-loc-ro.dom.tsx -t khong-loc
    Ran 2 tests across 1 file. [1186.00ms]

- eval: E12
  run_id: minted-vong-doi-mot-cach-cat-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vdc_man
  verified_at: 2026-10-09T16:09:12Z
  screenshot: evidence/E12-step1.png   # khung đầu; còn E12-step2.png, E12-step3a.png, E12-step3b.png, E12-step5.png
  observed: |
    Ngăn 1440 của thoả thuận đã cất có dải đầu «Đã lưu trữ ngày 15/09/2026» kèm nút «Khôi phục»; các ô mục Chi tiết xám, không có ô nhập mở. Trang /deals dạng Bảng cột có nút «Đã lưu trữ» cạnh Bảng / Bảng cột.
    Ở 390 ngăn không tràn ngang, dải báo và nút «Khôi phục», nút «Đã lưu trữ» nằm trong khung nhìn. Ở /contacts sau khi bấm Hoàn tác, bảng có lại đủ 3 dòng và toast xanh «Đã khôi phục 3 cá nhân.» hiện trong khung nhìn. Không khung nào mâu thuẫn với kỳ vọng.
  network_observed: n-a (driver)
  output: |
    Assertion theo log: bước 1 đạt (đối chứng đang dùng: mở cho sửa, ghi db); bước 2 đạt; bước 3 đạt (390: không tràn, nút trong khung); bước 4 đạt; bước 5 đạt.

- eval: E14
  run_id: minted-vong-doi-mot-cach-cat-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kts_hoan_tac_loi
  verified_at: 2026-10-09T16:09:12Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-trang-thai-luu-tru.dom.tsx -t hoan-tac-hong
    Ran 1 test across 1 file. [720.00ms]

- eval: E15
  run_id: minted-vong-doi-mot-cach-cat-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vdc_duong_luu_tru
  verified_at: 2026-10-09T16:09:12Z
  output: |
    vong-doi-mot-cach-cat duong-luu-tru: dat

- eval: E13
  judged_by: judge panel (3 lens, fresh context) — đề xuất của máy, người quyết ở Cổng 2
  verdict: PASS
  rationale: Panel đề xuất PASS với hai phiếu đạt và một phiếu chưa đủ căn cứ về hai điểm (2) và (5); các phiếu được liệt kê đầy đủ bên dưới.
  votes:
    - domain-correctness: PASS — (1) Ở cả 1440 và 390, dải đầu ngăn ghi «Đã lưu trữ ngày 15/09/2026» kèm nút «Khôi phục», nên rõ là thoả thuận đã cất chứ không bị xoá hay lỗi. (2) Các ô Chi tiết là chữ trơn, mờ, không có viền ô nhập, và thanh giai đoạn xám, nên trông chỉ đọc. (3) Trên Kanban, nút «Đã lưu trữ» có icon lưu trữ, đứng cạnh «Bảng / Bảng cột», đọc như chỗ xem. (4) Bộ chữ đúng `docs/vong-doi.md`: chỉ có «Đã lưu trữ» và «Khôi phục», không có «Lưu trữ» trần cho nút xem, không có «ẩn». (5) Ở 390 các chỗ cắt «…» ở hàng số liệu và thanh giai đoạn, cùng nhãn giai đoạn tràn thẻ Kanban, đều thuộc phần ngoài phạm vi đã nêu. Trang không tràn ngang; cột Kanban cuộn ngang trong bảng là cách bố trí sẵn của Kanban.
    - operational-feasibility: UNCERTAIN — Điểm (1), (3), (4) đạt: dải đầu ngăn ghi «Đã lưu trữ ngày 15/09/2026» kèm nút «Khôi phục» ở cả 1440 và 390, nút «Đã lưu trữ» có biểu tượng lưu trữ cạnh «Bảng | Bảng cột», không có «Lưu trữ» trần hay «ẩn». Điểm (2) ảnh tĩnh không chứng minh được các ô chỉ đọc (chỉ là chữ mờ, không có dấu hiệu rõ). Điểm (5) mơ hồ: trên thẻ Kanban tên người phụ trách bị cắt «…» («Ada Oka…», «Phan Kiể…») ở cả 1440 và 390 do nhãn giai đoạn tràn; chỗ cắt này không nằm trong danh sách miễn trừ nhưng có thể là hệ quả của lỗi nhãn tràn đã được miễn.
    - spec-alignment: PASS — Ảnh ngăn 1440 và 390 đều có dải «Đã lưu trữ ngày 15/09/2026» kèm nút «Khôi phục» ngay đầu ngăn, nên người đọc hiểu thoả thuận được cất và lấy lại bằng nút nào. Các ô Chi tiết và thanh giai đoạn mờ hẳn, không có khung nhập, còn các giá trị chỉ đọc ở mục «Đang tới đâu» thì sáng, nên trông là không sửa được. Nút «Đã lưu trữ» có icon lưu trữ, đứng cạnh «Bảng | Bảng cột» ở cả hai khổ và đọc như chỗ xem. Bộ chữ đúng `docs/vong-doi.md`: chỉ có «Đã lưu trữ» và «Khôi phục», không có «Lưu trữ» trần, không có «ẩn». Ở 390 chỉ thấy các chỗ cắt hoặc tràn đã được loại khỏi phạm vi AC-7 (hàng số liệu đầu ngăn, thanh giai đoạn, nhãn giai đoạn tràn thẻ Kanban). Tên người phụ trách bị «…» trên thẻ Kanban nằm cùng hàng với nhãn giai đoạn tràn nên tôi coi là hệ quả của lỗi đó, không chấm riêng.
  required_evidence:
    - Xác nhận của chủ kho (hoặc dòng bổ sung trong ghi chú người chấm của eval E13) rằng chữ tên người phụ trách bị cắt «…» ở chân thẻ Kanban (vdc-kanban-1440.png, vdc-kanban-390.png) nằm trong phạm vi miễn trừ cùng lỗi nhãn giai đoạn tràn; nếu không thì phiếu operational-feasibility không chấm đạt ở điểm (5)
    - Ảnh chụp ngăn thoả thuận đã lưu trữ ở khổ 1440 sau khi bấm thử vào một ô Chi tiết (ví dụ ô Tên hoặc Giá trị), cho thấy không mở ô nhập, hoặc đo DOM của các ô là disabled/readonly, lưu trong _acceptance/vong-doi-mot-cach-cat/evidence/ làm đầu vào của E13
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-09T16:09:12Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-09T16:09:12Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-09T16:09:12Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-09T16:09:12Z

- cmd: bunx turbo run lint --force
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-09T16:09:12Z

- cmd: bun run lint:slop
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-09T16:09:12Z

- cmd: bunx turbo run build --force
  run_id: minted-vong-doi-mot-cach-cat-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-09T16:09:12Z

## Known limits

## Ngoài hợp đồng

## Analyst

Carried từ round 2 — baseline không đo lại round này (evals.yaml không đổi từ lần baseline cuối, round 2). Trường baseline của từng khối eval ghi n-a.

Không có eval không-phân-biệt được liệt kê (danh sách rỗng). Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không có phương sai)

## Iterations

Round 1: ghi nhận từ commit 7698e32ab («ảnh chụp lại sau sửa vòng 1») rằng đã có một vòng sửa; chi tiết kết quả vòng 1 không nằm trong dữ liệu round này.
Round 2: mọi eval máy xanh (E1 đến E12, E14, E15), E13 do panel đề xuất PASS với một phiếu chưa đủ căn cứ; lệnh suite `bun run lint:slop` đỏ vì lỗi anti-slop trong tệp test của tính năng; verdict REJECT, quay lại implementation.
Round 3: mọi eval máy và mọi lệnh suite xanh trên commit 23e2944080df4da17ad22093d6e974108aca04ed (kể cả `bun run lint:slop` và `bunx turbo run build --force`); E13 do panel đề xuất PASS, chờ người ở Cổng 2; verdict PASS.

### Re-pin lần 1 — 2026-10-09, do ghim lại sau chữ ký V2 và gộp onehub
run_id: repin-20261009T165002Z-86228
sha: cd0ba45e8e669ed07c4f5b54140fca4ef3d79311 · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12, E13 (E13 không khai paths) · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-7 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-09, do ghim lại sau chữ ký V2 và gộp onehub
run_id: repin-20261009T181420Z-43204
sha: d57bc47daea22b61664622c6c6f08f65f3f85ca8 · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12, E13 (E13 không khai paths) · AC không có chốt máy: AC-7 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-09, do ghim lại sau gộp onehub d089cb8d (K2e)
run_id: repin-20261009T182742Z-38686
sha: 5766c379667b2431da8e63cf0e5792a8e8f15d17 · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12, E13 (E13 không khai paths) · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-7 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
