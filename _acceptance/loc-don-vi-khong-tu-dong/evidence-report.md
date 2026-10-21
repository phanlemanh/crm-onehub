---
schema_version: 2
feature_slug: loc-don-vi-khong-tu-dong
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e67b69563fbb95b175d5b17f2dcdb9e7eb9ba696
human_signoff:
---

# Evidence Report: loc-don-vi-khong-tu-dong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6s | AC-6 | script | PASS |
| E6 | AC-6 | test | PASS |
| E6m | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-1, AC-2, AC-3 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-loc-don-vi-khong-tu-dong-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T12:34:07Z
  output: |
    bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs"
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-loc-don-vi-khong-tu-dong-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T12:34:07Z
  output: |
    bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs"
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-loc-don-vi-khong-tu-dong-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T12:34:07Z
  output: |
    bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs"
    phien-do: xong — mã 0

- eval: E4
  run_id: minted-loc-don-vi-khong-tu-dong-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T12:34:07Z
  output: |
    bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs"
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-loc-don-vi-khong-tu-dong-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T12:34:07Z
  output: |
    bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs"
    phien-do: xong — mã 0

- eval: E6s
  run_id: minted-loc-don-vi-khong-tu-dong-E6s-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T12:34:07Z
  output: |
    bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs"
    phien-do: xong — mã 0

- eval: E6
  run_id: minted-loc-don-vi-khong-tu-dong-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldv_giu
  verified_at: 2026-10-21T12:34:07Z
  output: |
    cd apps/app && bun test ./test/loc-don-vi-giu-bang.spec.ts -t ldv-giu
    Ran 4 tests across 1 file. [23.00ms]

- eval: E6m
  run_id: minted-loc-don-vi-khong-tu-dong-E6m-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-21T12:34:07Z
  output: |
    bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs"
    phien-do: xong — mã 0

- eval: E7
  run_id: minted-loc-don-vi-khong-tu-dong-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldv_bang
  verified_at: 2026-10-21T12:34:07Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-tai-lai.dom.tsx -t ldv-bang
    Ran 3 tests across 1 file. [460.00ms]

- eval: E8
  run_id: minted-loc-don-vi-khong-tu-dong-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldv_man
  verified_at: 2026-10-21T12:34:07Z
  screenshot: evidence/E8-cho-1440.png
  observed: |
    E8-cho-1440.png (đọc trực tiếp): trang Mục tiêu, bộ Pháp chế, nút Lọc (1) đang mở. Menu cha liệt kê Người phụ trách / Loại (1) được chọn / Trạng thái / Mức tự tin / Góp ý của Kara. Menu con Loại mở bên trái với Bỏ chọn, Cam kết · 2 có dấu tích, Tham vọng · 1, Học tập · 0. Bảng bên dưới còn 3 dòng nhưng chữ mờ rõ (đo pixel: độ sáng chữ dòng 142), và Tất cả 3. Hàng công cụ (Lọc, Sắp xếp, Cột, chip Tất cả/Cần bàn/Chưa góp vào đâu) sáng đủ (237), không mờ. Nút Thêm mục tiêu thay bằng khung xương lúc chờ.
    E8-xong-1440.png: cùng menu Lọc và menu con Loại (Cam kết · 2 có tích) vẫn mở. Bảng đã thả: còn 2 dòng (Tất cả 2), chữ rõ (độ sáng 237) — dòng Tham vọng đã bị lọc mất. Hàng công cụ sáng như cũ. Nút Thêm mục tiêu hiện lại.
    E8-cho-390.png: khung Lọc mở rộng (Lọc (1), mũi tên lên), hiển thị Người phụ trách / Loại / Trạng thái / Mức tự tin / Góp ý của Kara, menu con Loại mở với Cam kết · 2 có tích. Bảng phía dưới (các dòng Cam kết ... Tham vọng) mờ (độ sáng 142), chip Tất cả 3 / Cần bàn 0 / Chưa góp vào đâu 1 và nút Lọc sáng (237), không mờ. Cả ba ảnh khớp Expected.
  network_observed: n-a (driver)
  output: |
    Chạy: bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs" (phiên đo riêng, kho crm_suspicious_matsumoto_c64c22_do, app :4491, api :4622) -> KET LUAN: dat.
    Assertion rang: AC-1 1440 (12 mẫu, menu đóng 0, menu con đóng 0, đã tích có, tích lần hai có) PASS; AC-3 1440 (bảng gỡ 0, khung chờ 0, bản sai 0, công cụ mờ 0, chưa mở 0, sau khi về bản 0) PASS; AC-2 390 (14 mẫu, khung thu 0, aria-expanded sai 0, đã tích có) PASS; AC-4, AC-5, AC-6 cũng đạt.
    Frame đã lưu trong evidence/: E8-cho-1440.png (=E8-step2.png), E8-xong-1440.png (=E8-step3.png), E8-cho-390.png (=E8-step4.png); thêm E8-network.txt, E8-run.log.
    Network: driver script, không đọc được -> n-a (driver). Server do tien-de tự dựng và tự dọn.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T12:34:07Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T12:34:07Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T12:34:07Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T12:34:07Z

- cmd: bunx turbo run lint --force
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T12:34:07Z

- cmd: bun run lint:slop
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T12:34:07Z

- cmd: bunx turbo run build --force
  run_id: minted-loc-don-vi-khong-tu-dong-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T12:34:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:

- cd apps/app && bun test ./test/loc-don-vi-giu-bang.spec.ts -t ldv-giu: bo qua baseline: tep apps/app/test/loc-don-vi-giu-bang.spec.ts co o cay dang kiem nhung chua co o merge-base 1f6757ba03dd84779cf51d2755161b1e25fd4768 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-tai-lai.dom.tsx -t ldv-bang: bo qua baseline: tep packages/ui/test/data-table-tai-lai.dom.tsx co o cay dang kiem nhung chua co o merge-base 1f6757ba03dd84779cf51d2755161b1e25fd4768 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ và không lệnh suite nào đỏ; verdict REJECT vì review có 5 phát hiện trong hợp đồng (AC-2, AC-3, AC-4, AC-7) — thước thiếu đối chứng dương nên chưa chứng minh được lời hứa (chi tiết ở review-findings.md). Returned to implementation.

