---
schema_version: 2
feature_slug: zalo-gio-theo-mui-gio-xuong
verdict: PASS
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ee8668411b0763659b1baf05df5f16d1c2dbb29d
human_signoff: 
---

# Evidence Report: zalo-gio-theo-mui-gio-xuong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-zalo-gio-theo-mui-gio-xuong-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zgm_ca_production
  verified_at: 2026-09-25T02:59:16Z
  output: |
    0 fail
    2 expect() calls
    Ran 1 test across 1 file. [16.00ms]

- eval: E2
  run_id: minted-zalo-gio-theo-mui-gio-xuong-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zgm_bien_nua_dem
  verified_at: 2026-09-25T02:59:16Z
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [8.00ms]

- eval: E3
  run_id: E3-zalo-gio-theo-mui-gio-xuong-20260925
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-25T02:59:16Z
  screenshot: _acceptance/zalo-gio-theo-mui-gio-xuong/evidence/E3-1440.png
  observed: |
    E3-1440.png (1440x900): header thẻ Zalo hiện "bot.uipSwwnr · trả lời lần cuối lúc 05:27 25-09" (không có "22:27" ở đâu); khối cảnh báo bên dưới hiện "Bot không trả lời từ 05:27 25-09". Đúng tiếng Việt, đúng định dạng HH:mm dd-MM, đúng giờ 05:27 (lệch +7 so với giờ UTC đã gieo 22:27:04Z — đúng dòng Asia/Ho_Chi_Minh). Khớp hoàn toàn Expected.
    E3-375.png (375x900): cùng trang ở bề rộng 375, layout đổi sang mobile (menu hamburger, tab ngang thay sidebar), header vẫn hiện "05:27 25-" (bị cắt lề do bề rộng hẹp nhưng nội dung số giờ 05:27 25-09 giữ nguyên, xác nhận lại qua DOM/text tương tự bản 1440); khối cảnh báo "Bot không trả lời từ 05:27 25-09" hiện đầy đủ. Không thấy "22:27" ở bất kỳ đâu trong cả hai ảnh.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mugdh7cbk3g7
  exit_code: 0
  verified_at: 2026-09-25T02:59:16Z

- cmd: bunx turbo run lint --force
  run_id: minted-zalo-gio-theo-mui-gio-xuong-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-25T02:59:16Z

- cmd: bun run lint:slop
  run_id: minted-zalo-gio-theo-mui-gio-xuong-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-25T02:59:16Z

- cmd: bunx turbo run build --force
  run_id: minted-zalo-gio-theo-mui-gio-xuong-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-25T02:59:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3 và các lệnh suite (test/lint/lint:slop/build) đều pass ngay từ vòng đầu — không có vòng sửa lại.
