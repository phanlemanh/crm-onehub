---
schema_version: 2
feature_slug: thuoc-lai-ra-man-phai-do
verdict: REJECT
failed_evals: [E1, E2, E3, E7]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d43d79e6e0d115a14e67ba9008d7e5acd68b5c17
human_signoff:
---

# Evidence Report: thuoc-lai-ra-man-phai-do

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | FAIL |
| E2 | AC-2 | script | FAIL |
| E3 | AC-3 | script | FAIL |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-thuoc-lai-ra-man-phai-do-E1-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tlr_mot_nguon
  verified_at: 2026-09-23T10:39:32Z
  output: |
    CHIEU-DUONG ma=0
    CHIEU-DO ma=1
    CHIEU-DO thong-diep=MOT-NGUON: ben ve con tro packages/ui/src/components/ai-elements/artifact.tsx, packages/ui/src/components/ai-elements/chain-of-thought.tsx, packages/ui/src/components/ai-elements/checkpoint.tsx, packages/ui/src/components/ai-elements/model-selector.tsx, packages/ui/src/components/ai-elements/prompt-input.tsx, packages/ui/src/components/ai-elements/suggestion.tsx ma cay khong con

- eval: E2
  run_id: minted-thuoc-lai-ra-man-phai-do-E2-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tlr_hong_mot_chieu
  verified_at: 2026-09-23T10:39:32Z
  output: |
    CHIEU-DUONG ma=0
    CHIEU-DO ma=1
    CHIEU-DO thong-diep=HONG-MOT-CHIEU: packages/ui/src/components/ai-elements/shimmer.tsx hong nhung lot luoi phan nhom

- eval: E3
  run_id: minted-thuoc-lai-ra-man-phai-do-E3-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tlr_bo_ve_chet
  verified_at: 2026-09-23T10:39:32Z
  output: |
    CHIEU-DUONG ma=0
    CHIEU-DO ma=1
    CHIEU-DO thong-diep=BO-VE-CHET: buoc ve thoat 1, khong cham tiep

- eval: E4
  run_id: minted-thuoc-lai-ra-man-phai-do-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlr_dem_du
  verified_at: 2026-09-23T10:39:32Z
  output: |
    CHIEU-DO ma=1
    CHIEU-DO thong-diep=DEM-DU: ve duoc 42/47, ngoai khai: khong"
    EXIT_CODE=0

- eval: E5
  run_id: minted-thuoc-lai-ra-man-phai-do-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlr_khong_ban_cay
  verified_at: 2026-09-23T10:39:32Z
  output: |
    CHIEU-DUONG ma=0
    CHIEU-DO ma=1
    CHIEU-DO thong-diep=KHONG-BAN-CAY: M _acceptance/chan-lai-component-ra-man/evidence/ve-that.json

- eval: E6
  run_id: minted-thuoc-lai-ra-man-phai-do-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlr_cap_hai_chieu
  verified_at: 2026-09-23T10:39:32Z
  output: |
    vo-hieu-tiem dem-du: chieu-do ma=0
    XANH: moi ca deu co cap hai chieu do bang ma thoat.

- eval: E7
  run_id: minted-thuoc-lai-ra-man-phai-do-E7-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tlr_qua_lenh_cong
  verified_at: 2026-09-23T10:39:32Z
  output: |
    CHIEU-DUONG ma=0
    CHIEU-DO ma=1
    CHIEU-DO thong-diep=QUA-CONG: lenh-cong thoat 1

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-thuoc-lai-ra-man-phai-do-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-23T10:39:32Z

- cmd: bunx turbo run lint --force
  run_id: minted-thuoc-lai-ra-man-phai-do-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-23T10:39:32Z

- cmd: bun run lint:slop
  run_id: minted-thuoc-lai-ra-man-phai-do-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-23T10:39:32Z

- cmd: bunx turbo run build --force
  run_id: minted-thuoc-lai-ra-man-phai-do-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-23T10:39:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — mọi eval đã đo baseline ở round 1 đều đỏ trên baseline (discriminate); round này không đo lại baseline.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E7 failed — lệnh cổng (`cl_tieng_viet_den_man`) không thoát khác 0 khi một component thật bị phá, thông điệp không ghim nhãn "QUA-CONG" kèm tên ca đã đỏ; E1-E6 và bốn lệnh suite đều xanh. Trả lại cho implementation.
Round 2: E1, E2, E3, E7 failed sau khi gộp `onehub` (7cbea46c) và canh lại neo lái-ra-màn 460 file (d43d79e6) — E1: bên vẽ còn trỏ 6 file AI Elements đã xoá từ trước (artifact, chain-of-thought, checkpoint, model-selector, prompt-input, suggestion), ghim sẵn trong evidence/mac-dinh.json cũ; E2: shimmer.tsx (0 export) lọt lưới hỏng-một-chiều; E3: bước vẽ thoát 1, không chấm tiếp; E7: lệnh cổng thoát 1 trên bản đã phá một component thật. E4-E6 và bốn lệnh suite vẫn xanh. Trả lại cho implementation.
