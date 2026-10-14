---
schema_version: 2
feature_slug: chu-man-tieng-viet-khong-tran
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6c378a8618aaa4889f30804776058cf2f6886091
human_signoff:
---

# Evidence Report: chu-man-tieng-viet-khong-tran

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | ui-check | PASS |
| E5m | AC-5 | script | PASS |
| E5j | AC-5 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-chu-man-tieng-viet-khong-tran-E1-r1
  exit_code: 0
  verifier: config:executors.test.cmt_breadcrumb
  verified_at: 2026-10-13T23:51:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-chu-man-tieng-viet-khong-tran-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmt_quet
  verified_at: 2026-10-14T01:58:35Z
  output: |
    Ran 5 tests across 1 file. [276.00ms]

- eval: E3
  run_id: minted-chu-man-tieng-viet-khong-tran-E3-r1
  exit_code: 0
  verifier: config:executors.test.cmt_nhan_kieu
  verified_at: 2026-10-13T23:51:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-chu-man-tieng-viet-khong-tran-E4-r1
  exit_code: 0
  verifier: config:executors.test.cmt_o_chon
  verified_at: 2026-10-13T23:51:19Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-chu-man-tieng-viet-khong-tran-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmt_man
  verified_at: 2026-10-14T01:58:35Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/blissful-jepsen-65fb89/.acceptance-runs/chu-man-tieng-viet-khong-tran/evidence/cmt-truong-vi-360.png
  observed: |
    Da mo bang Read ca 4 anh. cmt-truong-vi-360.png: trang /settings/fields the "Truong tu tao" o khung 360, 10 hang "Truong mau 1..10" cung nhan kieu tieng Viet (Chữ, Chữ dài, Số, Ngày, Ô đánh dấu, Chọn, URL, Email, Số điện thoại, Người) trong o nen toi, nhan deu tron chu, canh mep phai thang nhau, khong de len nut ba cham; hang thu 11 ten dai bi cat "Ngày gia hạn hợ…" con nhan "Số điện thoại" van tron chu; khong cuon ngang.
    cmt-truong-en-360.png: giong bo cuc, nhan Text, Long text, Number, Date, Checkbox, Select, URL, Email, Phone, User tron chu, hang ten dai bi cat "Ngày gia hạn hợp đồng…" nhan "Phone" tron.
    cmt-truong-vi-1280.png: co thanh ben Cai dat, tab Cong ty/Ca nhan/Thoa thuan, 11 hang, nhan kieu tieng Viet tron chu, mep phai cac o thang mot duong sat nut ba cham, ten dai hang cuoi bi cat bang dau "…" con nhan "Số điện thoại" nguyen.
    cmt-truong-en-1280.png: tuong tu voi tab Companies/Contacts/Deals va nhan tieng Anh (Text...User, Phone) tron chu, ten dai hang cuoi bi cat "…", mep phai thang. Tat ca khop Expected.
  network_observed: n-a (driver)
  output: |
    - tenDaiCat true o ca 4 anh (ten dai bi cat, nhan kieu cung hang tron chu): PASS
    - Buoc 2 nav breadcrumb aria-label: vi ["Vị trí trang"], en ["Breadcrumb"]: PASS

- eval: E5m
  run_id: minted-chu-man-tieng-viet-khong-tran-E5m-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cmt_man_do
  verified_at: 2026-10-14T01:58:35Z
  output: |
    phien-do: xong — mã 0

- eval: E5j
  judged_by: judge panel 3 lens (fresh context) — de xuat PASS
  verdict: PASS
  rationale: Ba lens deu cham PASS tren ca bon anh (vi/en x 360/1280); nhan kieu tron chu trong o, mep phai thang, ten dai bi cat con nhan kieu van tron, muoi nhan khop Bang ten ngan va AC-3.
  votes:
    - domain-correctness: PASS — Trên cả bốn ảnh, nhãn kiểu của mọi hàng nằm trọn trong ô, không bị cắt và không đè nút «…». Mép phải các ô thẳng một đường (x≈1202 ở 1280, x≈290 ở 360, cả vi và en), nên (1) và (2) đều đạt. Ở 360, tên trường dài bị cắt thành «Ngày gia hạn hợp…» trong khi «Số điện thoại» và «Phone» còn trọn chữ, nên (3) đạt. Mười nhãn khớp từng chữ với «Bảng tên ngắn» và AC-3 (Chữ, Chữ dài, Số, Ngày, Ô đánh dấu, Chọn, Người, URL, Email, Số điện thoại; Text, Long text, Number, Date, Checkbox, Select, User, URL, Email, Phone), không có dấu «—» và đủ nghĩa để nhận ra kiểu, nên (4) đạt.
    - operational-feasibility: PASS — Cả bốn ảnh đều đạt cả bốn ý. (1) Mọi nhãn kiểu nằm trọn trong ô, kể cả «Số điện thoại» và «Ô đánh dấu» ở 360, và không đè lên nút «⋮». (2) Ở 1280 mép phải mọi ô nhãn kiểu đều ở khoảng x=1202, vi và en. (3) Ở 360 hàng tên dài bị cắt («Ngày gia hạn hợ…», «Ngày gia hạn hợp đồng…») còn nhãn «Số điện thoại» và «Phone» vẫn trọn chữ. (4) Mười nhãn khớp «Bảng tên ngắn» và AC-3 (vi: Chữ, Chữ dài, Số, Ngày, Ô đánh dấu, Chọn, URL, Email, Số điện thoại, Người; en: Text, Long text, Number, Date, Checkbox, Select, URL, Email, Phone, User), không có dấu «—».
    - spec-alignment: PASS — Trên cả bốn ảnh, mọi nhãn kiểu (kể cả «Số điện thoại», «Ô đánh dấu», «Long text») đều trọn chữ trong ô và không đè nút «⋮». Ở 1280 (vi và en) mép phải các ô thẳng một đường. Ở 360 tên trường 60 ký tự trở lên bị cắt bằng «…» còn nhãn kiểu cùng hàng vẫn trọn chữ. Mười tên ngắn trên ảnh khớp «Bảng tên ngắn» của design doc và bảng AC-3 (Chữ, Chữ dài, Số, Ngày, Ô đánh dấu, Chọn, URL, Email, Số điện thoại, Người; en tương ứng), đủ nghĩa để nhận ra kiểu.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-14T01:58:35Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-14T01:58:35Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-14T01:58:35Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-14T01:58:35Z

- cmd: bunx turbo run lint --force
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-14T01:58:35Z

- cmd: bun run lint:slop
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-14T01:58:35Z

- cmd: bunx turbo run build --force
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-14T01:58:35Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- cd apps/app && bun test ./test/chu-man-tieng-viet.spec.ts: bo qua baseline: tep apps/app/test/chu-man-tieng-viet.spec.ts co o cay dang kiem nhung chua co o merge-base 60fc1b02dbd9de1abc1a7ece86fa2ec03a31cae1 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PENDING-JUDGMENT — ba loi thuoc trong hop dong (chup-truong.mjs do nham span an cua tay keo nen kiem «ten dai bi cat» luon dat; hai cho cua E2 kiem bang chuoi con thay vi quan he khoa-ngon ngu va chi do hai chuoi). Returned to implementation.
Round 2: E2, E5, E5m chay lai sau khi sua thuoc, deu dat; E1, E3, E4 giu tu round 1 (delta khong cham paths cua eval); suite xanh; E5j de xuat PASS, cho nguoi quyet o Cong 2.
