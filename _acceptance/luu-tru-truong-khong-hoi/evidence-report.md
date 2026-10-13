---
schema_version: 2
feature_slug: luu-tru-truong-khong-hoi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c29f13bfe8ac9258a2d49629947909251ecefbd5
human_signoff:
---

# Evidence Report: luu-tru-truong-khong-hoi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-7 | ui-check | PASS |
| E11 | AC-8 | judgment | PASS |
| E12 | AC-5 | test | PASS |
| E13 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-luu-tru-truong-khong-hoi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltk_menu
  verified_at: 2026-10-13T11:44:57Z
  output: |
    Ran 1 test across 1 file. [1219.00ms]

- eval: E2
  run_id: minted-luu-tru-truong-khong-hoi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltk_trinh_sua
  verified_at: 2026-10-13T11:44:57Z
  output: |
    Ran 1 test across 1 file. [1469.00ms]

- eval: E3
  run_id: minted-luu-tru-truong-khong-hoi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltk_hoan_tac
  verified_at: 2026-10-13T11:44:57Z
  output: |
    Ran 2 tests across 1 file. [1.80s]

- eval: E4
  run_id: minted-luu-tru-truong-khong-hoi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltk_hoan_tac_loi
  verified_at: 2026-10-13T11:44:57Z
  output: |
    Ran 1 test across 1 file. [1481.00ms]

- eval: E5
  run_id: minted-luu-tru-truong-khong-hoi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltk_chu
  verified_at: 2026-10-13T11:44:57Z
  output: |
    Ran 1 test across 1 file. [697.00ms]

- eval: E6
  run_id: minted-luu-tru-truong-khong-hoi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ltk_cap_chu
  verified_at: 2026-10-13T11:44:57Z
  output: |
    Ran 140 tests across 1 file. [1.66s]

- eval: E7
  run_id: minted-luu-tru-truong-khong-hoi-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cqt_man_khoa
  verified_at: 2026-10-13T11:44:57Z
  output: |
    Ran 3 tests across 1 file. [1401.00ms]

- eval: E8
  run_id: minted-luu-tru-truong-khong-hoi-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cqt_sheet_khoa
  verified_at: 2026-10-13T11:44:57Z
  output: |
    Ran 1 test across 1 file. [1360.00ms]

- eval: E9
  run_id: minted-luu-tru-truong-khong-hoi-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ltk_man
  verified_at: 2026-10-13T11:44:57Z
  output: |
    phien-do: xong

- eval: E10
  run_id: minted-luu-tru-truong-khong-hoi-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltk_man
  verified_at: 2026-10-13T11:44:57Z
  screenshot: evidence/ltk-toast-1440.png
  observed: |
    ltk-toast-1440.png: trang Cai dat > Truong, tab Cong ty, danh sach "Truong tu tao"; truong "ZZ ltk 1 k6m7lu0" da roi khoi nhom dang dung, hang "Da luu tru" hien dem 1 (thu gon); toast xanh goc duoi-trai "Da luu tru ZZ ltk 1 k6m7lu0." co nut "Hoan tac"; khong thay hop thoai hoi lai, menu da dong. Khop Expected.
    ltk-hoan-tac-1440.png: cung trang, truong "ZZ ltk 1 k6m7lu0" tro lai cuoi nhom Truong tu tao, hang "Da luu tru" bien mat, toast "Da khoi phuc ZZ ltk 1 k6m7lu0." Khop Expected.
    ltk-toast-390.png: khung 390 (dien thoai), trinh sua da dong, khong co hop hoi lai, toast "Da luu tru ZZ ltk 2 k6m7lu0." va nut "Hoan tac" nam tron trong khung nhin; ZZ ltk 1 dang o nhom dang dung. Khop Expected.
    ltk-ngan-1440.png: ngan "Truong" ben phai van MO sau Hoan tac; ba truong ZZ ltk 1, 2, 3 deu o nhom dang dung, khong con nhom "Da luu tru"; toast "Da khoi phuc ZZ ltk 3 k6m7lu0." Khop Expected.
  network_observed: n-a (driver)

- eval: E11
  judged_by: judge-panel (fresh context, 3 judge: domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: Ba judge cung PASS tren bon khung ltk-toast-1440, ltk-hoan-tac-1440, ltk-toast-390, ltk-ngan-1440; de xuat cua panel la PASS, cho nguoi chot o Cong 2.
  votes:
    - domain-correctness: PASS — Toast "Đã lưu trữ …" cùng mục gập "Đã lưu trữ 1 · giữ giá trị, cất khỏi mọi nơi" cho thấy trường được cất chứ không bị xoá; "Hoàn tác" là nút trắng nổi bật trên toast tối, ở cả 1440 lẫn 390; bấm xong thì toast "Đã khôi phục …" và trường quay lại danh sách; bộ chữ khớp docs/vong-doi.md, không có "xoá"; ở 390 toast và nút nằm gọn một dòng. Lưu ý nhỏ: chữ "ẩn" trong dòng "Trường chuẩn · chỉ sắp lại thứ tự và ẩn" là việc ẩn trường chuẩn, không phải lời gọi việc lưu trữ; nhãn kiểu trường bị cắt chữ nằm ngoài toast và nút nên không ảnh hưởng.
    - operational-feasibility: PASS — Toast và dòng "Đã lưu trữ · 1 · giữ giá trị, cắt khỏi mọi nơi" hiện ngay trên danh sách nên hiểu là trường được cất; "Hoàn tác" là nút trắng trên nền toast xanh đậm cùng hàng với toast, bấm xong trường quay lại; chữ dùng đúng "Lưu trữ", "Đã lưu trữ", "Khôi phục", "Hoàn tác", không có "xoá"; chữ "ẩn" chỉ còn ở dòng ẩn trường chuẩn có sẵn; ở 390 toast vừa khung, nút không bị cắt hay tràn.
    - spec-alignment: PASS — Toast ghi "Đã lưu trữ …", trường biến khỏi "Trường tự tạo", dòng "Đã lưu trữ · 1 · giữ giá trị, cất khỏi mọi nơi" hiện ngay dưới; "Hoàn tác" là nút trắng đặc trên nền toast tối ở cả hai bề rộng, sau khi bấm trường quay lại cuối danh sách; chữ toast đúng bộ chữ của docs/vong-doi.md; ở 390 toast vừa khít một dòng, chỉ chồng lên nút "Trường mới" phía sau, đó là hành vi của lớp phủ.
  human_override:  # chi nguoi ghi

- eval: E12
  run_id: minted-luu-tru-truong-khong-hoi-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.vdc_chu
  verified_at: 2026-10-13T11:44:57Z
  output: |
    Ran 1 test across 1 file. [2.44s]

- eval: E13
  run_id: design-gate-e1e8026a41
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ltk_san_thiet_ke
  verified_at: 2026-10-13T11:44:57Z
  output: |
    design-gate.mjs --mode static qua ca field-editor.tsx va fields-list.tsx.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T11:44:57Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T11:44:57Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T11:44:57Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T11:44:57Z

- cmd: bunx turbo run lint --force
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T11:44:57Z

- cmd: bun run lint:slop
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T11:44:57Z

- cmd: bunx turbo run build --force
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T11:44:57Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline; chứng minh harness chứ không chứng minh tính năng, là regression-guard có chủ ý hoặc cần viết lại để assert hành vi mới):

- E6 (messages-guard của kho)
- E7 (cqt-man-khoa của hồ sơ chi-quan-tri-truong)
- E8 (cqt-sheet-khoa của hồ sơ chi-quan-tri-truong)
- E12 (vdc-chu của hồ sơ vong-doi-mot-cach-cat)
- E13 (design-gate static trên field-editor.tsx và fields-list.tsx)

Baseline khong do:

- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/luu-tru-truong-khong-hoi.dom.tsx -t ltk-menu: bo qua baseline: tep apps/app/test/luu-tru-truong-khong-hoi.dom.tsx co o cay dang kiem nhung chua co o merge-base 6791dc049dea023c018b6f252b9d4b491b45cd60 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/luu-tru-truong-khong-hoi.dom.tsx -t ltk-trinh-sua: bo qua baseline: tep apps/app/test/luu-tru-truong-khong-hoi.dom.tsx co o cay dang kiem nhung chua co o merge-base 6791dc049dea023c018b6f252b9d4b491b45cd60 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/luu-tru-truong-khong-hoi.dom.tsx -t ltk-hoan-tac: bo qua baseline: tep apps/app/test/luu-tru-truong-khong-hoi.dom.tsx co o cay dang kiem nhung chua co o merge-base 6791dc049dea023c018b6f252b9d4b491b45cd60 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/luu-tru-truong-khong-hoi.dom.tsx -t ltk-hoan-tac-loi: bo qua baseline: tep apps/app/test/luu-tru-truong-khong-hoi.dom.tsx co o cay dang kiem nhung chua co o merge-base 6791dc049dea023c018b6f252b9d4b491b45cd60 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/luu-tru-truong-khong-hoi.dom.tsx -t ltk-chu: bo qua baseline: tep apps/app/test/luu-tru-truong-khong-hoi.dom.tsx co o cay dang kiem nhung chua co o merge-base 6791dc049dea023c018b6f252b9d4b491b45cd60 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval máy (E1–E10, E12, E13) và bảy lệnh suite đều đạt; E11 do panel ba judge đề xuất PASS, chờ người chốt ở Cổng 2.
