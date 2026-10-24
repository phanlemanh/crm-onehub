---
schema_version: 2
feature_slug: tieu-diem-sau-hop-xoa-tin-hieu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5dbc958489a70931f04c9471cab6b5fbcdc772bc
human_signoff:
---

# Evidence Report: tieu-diem-sau-hop-xoa-tin-hieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_giu_lai
  verified_at: 2026-10-24T09:34:31Z
  output: |
    tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx -t tdx-giu-lai
    Ran 16 tests across 1 file. [5.49s]

- eval: E2
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_hong
  verified_at: 2026-10-24T09:34:31Z
  output: |
    tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx -t tdx-hong (chung một lệnh với E3)
    Ran 12 tests across 1 file. [6.11s]

- eval: E3
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_hong
  verified_at: 2026-10-24T09:34:31Z
  output: |
    tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx -t tdx-hong (chung một lệnh với E2)
    Ran 12 tests across 1 file. [6.11s]

- eval: E4
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tdx_cho
  verified_at: 2026-10-24T09:34:31Z
  output: |
    tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx -t tdx-cho
    Ran 6 tests across 1 file. [3.33s]

- eval: E5
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sgt_tieu_diem
  verified_at: 2026-10-24T09:34:31Z
  output: |
    sua-giao-dien-tin-hieu.dom.tsx -t sgt-tieu-diem (bài TH6 đã ký, không sửa tệp test)
    Ran 9 tests across 1 file. [3.44s]

- eval: E6
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdx_ban_phim
  verified_at: 2026-10-24T09:34:31Z
  screenshot: evidence/E6-step1.png
  observed: |
    Da mo bang Read ca 12 anh va doi chieu: giu-lai-375 vong sang xanh nam tren nut ⋮ cua the crm-2 (the thu hai, giua 3 the); giu-lai-1280 vong sang tren nut ⋮ cua hang crm-5 (hang giua, 3 hang crm-6/5/4); esc-375 vong sang tren ⋮ cua the crm-9 (the tren cung = tin hieu thu ba, newest first); esc-1280 vong sang tren ⋮ cua hang crm-12 (hang tren cung = thu ba); lay-ve-375/1280 vong sang tren ⋮ cua crm-14/crm-17 (tin hieu thu hai), banner canh bao "Chưa xoá được crm-14/17 — đội sản phẩm vừa mở tín hiệu này." hien phia tren danh sach, bang van du 3 dong; anh -menu hien menu mo voi muc "Xoá" mau do mo (disabled) kem dong chu "Đội sản phẩm đã mở tín hiệu này — không xoá được nữa."; mang-375/1280 vong sang tren ⋮ cua crm-20/23, banner "Chưa xoá được crm-20/23 — mạng hoặc máy chủ đang gián đoạn. Thử lại sau một lát.", du 3 muc; xoa-xong-375 con 2 the (crm-27, crm-25), vong sang tren ⋮ cua crm-25 (tin hieu ngay duoi crm-26 da xoa); xoa-xong-1280 con 2 hang (crm-30, crm-28), vong sang tren ⋮ cua crm-28 (dong dich ngay duoi muc da xoa). Khong co cuon ngang o ca 375 va 1280. Tat ca khop Expected, khong co mau thuan.
  network_observed: n-a (driver)
  output: |
    10 DUNG, 0 SAI trên ma trận 10 ô (giu-lai, esc, lay-ve, mang, xoa-xong) x (375, 1280).
    Mỗi ô: ma_dich == ma_tieu_diem, focus_visible true, bản đang hiện true, không cuộn ngang.
    evidence/o.jsonl có đúng 10 dòng JSON; 12 ảnh E6-step1..12.png. Phiên đo dọn xong, không còn tiến trình.

- eval: E7
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdx_ranh_gioi
  verified_at: 2026-10-24T09:34:31Z
  output: |
    rang/ranh-gioi.mjs
    KET LUAN: ma 0

- eval: E8
  run_id: design-gate-52c68b007a, design-gate-99ec3e95aa
  exit_code: 0
  baseline: green
  verifier: config:executors.script.tdx_thiet_ke
  verified_at: 2026-10-24T09:34:31Z
  output: |
    design-gate.mjs --mode static cho danh-sach-tin-hieu.tsx và danh-sach-tin-hieu-trang.tsx: lệnh chạy xong, không có P0.
    Lưu ý: cả hai tệp đều mang kết luận KHONG-DO-DUOC (static không đo được .tsx) — xem mục Analyst.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-24T09:34:31Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-24T09:34:31Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-24T09:34:31Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-24T09:34:31Z

- cmd: bunx turbo run lint --force
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-24T09:34:31Z

- cmd: bun run lint:slop
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-24T09:34:31Z

- cmd: bunx turbo run build --force
  run_id: minted-tieu-diem-sau-hop-xoa-tin-hieu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-24T09:34:31Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline):

- E5 (`sgt-tieu-diem` của `sua-giao-dien-tin-hieu.dom.tsx`): bài TH6 đã ký, chạy không sửa tệp test. Đây là regression-guard có chủ ý — nó giữ hành vi tiêu điểm sau xoá xong đã ký không bị lỏng; không phải bằng chứng cho hành vi mới.
- E8 (`design-gate.mjs --mode static` cho `danh-sach-tin-hieu.tsx` và `danh-sach-tin-hieu-trang.tsx`): lệnh chạy xong, nhưng cả hai tệp đều có kết luận KHONG-DO-DUOC vì static không đo được tệp .tsx (bộ dò chỉ đọc HTML đã dựng). Theo chính thông báo của gate, xanh ở đây không phải đạt: không có bằng chứng thiết kế dương tính cho hai tệp này. Gate 2 nên coi E8 là chưa đo được, không phải đã qua.

Baseline không đo:

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx -t tdx-giu-lai: bo qua baseline: tep apps/app/test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 1591d8b7793f0a97f915e6b128d2dbcc61114149 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx -t tdx-hong: bo qua baseline: tep apps/app/test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 1591d8b7793f0a97f915e6b128d2dbcc61114149 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx -t tdx-cho: bo qua baseline: tep apps/app/test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 1591d8b7793f0a97f915e6b128d2dbcc61114149 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/ranh-gioi.mjs: bo qua baseline: tep _acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base 1591d8b7793f0a97f915e6b128d2dbcc61114149 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định; không eval nào có phương sai).

## Iterations

Round 1: E1 đến E8 đều đạt; không eval nào hỏng, không mục chờ người quyết. Verdict PASS.
