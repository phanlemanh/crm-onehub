---
schema_version: 2
feature_slug: t1-ma-doc
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 01089942a15cecbdcc387d41e69bc032346524fc
human_signoff: manh 2026-10-18 — ký Cổng 2 trên verdict PASS 11/11 eval (S4 round 1, wf_b93d2838-c1f). Ngoài-1, 2, 3, 4, 5 ghi Known limits; Ngoài-6, 7 chấp nhận, không sửa; đồng ý phần cắt; phê hết các quyết định Treo.
---

# Evidence Report: t1-ma-doc

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7a | AC-7 | script | PASS |
| E7b | AC-7 | judgment | PASS |
| E8a | AC-8 | script | PASS |
| E8 | AC-9 | script | PASS |
| E9 | AC-10 | script | PASS |

không chạy theo hồ sơ: E8b

## Evidence

- eval: E1
  run_id: minted-t1-ma-doc-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tmd_phan_loai
  verified_at: 2026-10-18T08:30:17Z
  output: |
    node --test .github/scripts/test/phan-loai.test.mjs
    ℹ duration_ms 5779.030542

- eval: E2
  run_id: minted-t1-ma-doc-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tmd_phan_loai
  verified_at: 2026-10-18T08:30:17Z
  output: |
    node --test .github/scripts/test/phan-loai.test.mjs
    ℹ duration_ms 5779.030542

- eval: E3
  run_id: minted-t1-ma-doc-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmd_day
  verified_at: 2026-10-18T08:30:17Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/t1-ma-doc.spec.ts -t day
    Ran 7 tests across 1 file. [5.52s]

- eval: E4
  run_id: minted-t1-ma-doc-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmd_quet
  verified_at: 2026-10-18T08:30:17Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/t1-ma-doc.spec.ts -t quet-that
    Ran 1 test across 1 file. [610.00ms]

- eval: E5
  run_id: minted-t1-ma-doc-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmd_quet_do
  verified_at: 2026-10-18T08:30:17Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/t1-ma-doc.spec.ts -t quet-do
    Ran 13 tests across 1 file. [978.00ms]

- eval: E6
  run_id: minted-t1-ma-doc-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmd_quet_do
  verified_at: 2026-10-18T08:30:17Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/t1-ma-doc.spec.ts -t quet-do
    Ran 13 tests across 1 file. [978.00ms]

- eval: E7a
  run_id: minted-t1-ma-doc-E7a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tmd_khai
  verified_at: 2026-10-18T08:30:17Z
  output: |
    node _acceptance/t1-ma-doc/rang/khai.mjs
    dat khai

- eval: E8a
  run_id: minted-t1-ma-doc-E8a-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tmd_ho_so_cu
  verified_at: 2026-10-18T08:30:17Z
  output: |
    node --test .github/scripts/test/phan-loai.test.mjs && (cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t "phan-loai|mot-nguon") && node _acceptance/pre-push-t1/rang/mot-nguon.mjs
    BAT bo-qua-viet-tay

- eval: E8
  run_id: minted-t1-ma-doc-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tmd_dot_bien
  verified_at: 2026-10-18T08:30:17Z
  output: |
    node _acceptance/t1-ma-doc/rang/dot-bien.mjs
    BAT bo-loc-loi-goi-doc

- eval: E9
  run_id: minted-t1-ma-doc-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tmd_dau_ra_that
  verified_at: 2026-10-18T08:30:17Z
  output: |
    node _acceptance/t1-ma-doc/rang/dau-ra-that.mjs
    dat dau-ra-that

### Judgment

- eval: E7b
  judged_by: judge panel de xuat (3 judge, fresh context)
  verdict: PASS
  rationale: Ba judge cùng đề xuất PASS. Câu vi_sao của khối t1Only trong gate-shape.json và đoạn «PR mở ở dạng nháp» của CLAUDE.md khớp cả bốn ý của mục «Thiết kế».
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

Panel đề xuất và rationale từng judge:

- domain-correctness: PASS — Cả bốn ý đều khớp mục «Thiết kế». Chỉ bỏ test và build khi mọi tệp khớp t1_skip_globs và không tệp nào khớp t1_ma_doc. t1_ma_doc được định nghĩa là tệp T1 mà bài kiểm, bản dựng hay runtime đọc. Câu «không đổi đầu vào nào» có kèm điều kiện «mà bộ quét thấy» và «Giới hạn» về tên ghép lúc chạy hoặc đọc qua hai bậc gọi. check-types, lint, lint:slop vẫn chạy; vi_sao nói rõ điều này, và đoạn CLAUDE.md chỉ nói bỏ «job nặng» nên không mâu thuẫn.
- operational-feasibility: PASS — Câu vi_sao ở khối t1Only của gate-shape.json và đoạn «PR mở ở dạng nháp» trong CLAUDE.md đều khớp mục «Thiết kế», cả bốn ý. (1) Chỉ bỏ test và build khi mọi tệp khớp t1_skip_globs và không tệp nào khớp t1_ma_doc. CLAUDE.md thêm đúng ngoại lệ `.github/` và t1_ma_doc. (2) t1_ma_doc được mô tả là tệp T1 mà bài kiểm, bản dựng hay runtime đọc, và bộ quét `.github/scripts/t1-ma-doc.mjs` giữ danh sách. Design doc mô tả cùng vậy: bộ quét chạy trong `@crm/ui#test`, `LO-TRINH.html` là runtime. (3) Không câu nào hứa «không mất chiều đo nào» vô điều kiện. Chỉ có «không đổi đầu vào nào của test hay build mà bộ quét thấy», kèm giới hạn về tên ghép lúc chạy và đường đọc qua hai bậc gọi. (4) Câu vi_sao nói thẳng check-types, lint, lint:slop vẫn chạy, và đẩy rỗng hay phân loại hỏng đều chạy đủ.
- spec-alignment: PASS — Câu `vi_sao` trong `gate-shape.json` và đoạn «PR mở ở dạng nháp» của `CLAUDE.md` khớp mục «Thiết kế». Cả hai đặt điều kiện nhẹ là mọi tệp khớp `t1_skip_globs` và không tệp nào khớp `t1_ma_doc`. `t1_ma_doc` được định nghĩa là tệp T1 mà bài kiểm, bản dựng hay runtime đọc. Lời hứa «không đổi đầu vào nào» có điều kiện «mà bộ quét thấy» kèm một dòng Giới hạn, và `CLAUDE.md` không có câu «không mất chiều đo nào» nào. `check-types`, `lint`, `lint:slop` được ghi rõ là vẫn chạy.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-t1-ma-doc-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-18T08:30:17Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-t1-ma-doc-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-18T08:30:17Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-t1-ma-doc-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-18T08:30:17Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-t1-ma-doc-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-18T08:30:17Z

- cmd: bunx turbo run lint --force
  run_id: minted-t1-ma-doc-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-18T08:30:17Z

- cmd: bun run lint:slop
  run_id: minted-t1-ma-doc-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-18T08:30:17Z

- cmd: bunx turbo run build --force
  run_id: minted-t1-ma-doc-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-18T08:30:17Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:

- cd packages/ui && bun test --timeout 120000 ./test/t1-ma-doc.spec.ts -t day: bo qua baseline: tep packages/ui/test/t1-ma-doc.spec.ts co o cay dang kiem nhung chua co o merge-base b4492f36eabe70902caceb328513ad214b7d1270 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/t1-ma-doc.spec.ts -t quet-that: bo qua baseline: tep packages/ui/test/t1-ma-doc.spec.ts co o cay dang kiem nhung chua co o merge-base b4492f36eabe70902caceb328513ad214b7d1270 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/t1-ma-doc.spec.ts -t quet-do: bo qua baseline: tep packages/ui/test/t1-ma-doc.spec.ts co o cay dang kiem nhung chua co o merge-base b4492f36eabe70902caceb328513ad214b7d1270 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/t1-ma-doc/rang/khai.mjs: bo qua baseline: tep _acceptance/t1-ma-doc/rang/khai.mjs co o cay dang kiem nhung chua co o merge-base b4492f36eabe70902caceb328513ad214b7d1270 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/t1-ma-doc/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/t1-ma-doc/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base b4492f36eabe70902caceb328513ad214b7d1270 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/t1-ma-doc/rang/dau-ra-that.mjs: bo qua baseline: tep _acceptance/t1-ma-doc/rang/dau-ra-that.mjs co o cay dang kiem nhung chua co o merge-base b4492f36eabe70902caceb328513ad214b7d1270 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy đều đạt; E7b có đề xuất PASS từ panel ba judge; E8b không chạy theo hồ sơ. Không có eval hỏng.

### Re-pin lần 1 — 2026-10-18, do t1-ma-doc đổi phan-loai.mjs, gate-shape.json, t1_ma_doc, bộ quét và spec trong packages/ui; gộp onehub 76e8fb215 (#475); thước E17 và E11 neo lần gộp của hồ sơ
run_id: repin-20261018T111331Z-21656
sha: 01089942a15cecbdcc387d41e69bc032346524fc · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E8b · ngoài làn máy: E7b (E7b không khai paths) · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
