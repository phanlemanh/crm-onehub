---
schema_version: 2
feature_slug: truong-mot-cach-cu-xu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 28dddaa456ba3804fd24b00614002fd5879e1f85
human_signoff: manh 2026-10-21 — ký Cổng Bằng chứng trên vòng chấm 2 (PASS, 13/13 eval máy gồm E2c, E3c, E8 mang từ vòng 1; vòng 1 REJECT đã sửa). Ngoài-5 (lỗi có lý do cụ thể của máy chủ bị thay bằng câu chung) mở hợp đồng mới; Ngoài-12, Ngoài-13 chấp nhận, không sửa; mười mục còn lại ghi Known limits. Đồng ý phần cắt/hoãn đã khai; phê hết các quyết định ghi sau Cổng Phạm vi.
---

# Evidence Report: truong-mot-cach-cu-xu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E2c | AC-2 | test | PASS (carry-forward tu round 1) |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS (carry-forward tu round 1) |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS (carry-forward tu round 1) |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-truong-mot-cach-cu-xu-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tmc_quet
  verified_at: 2026-10-21T02:15:10Z
  output: |
    tmc quet: dat — 10 tep, 1 ngoai tru co ten

- eval: E2
  run_id: minted-truong-mot-cach-cu-xu-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_doc_so
  verified_at: 2026-10-21T02:15:10Z
  output: |
    Ran 2 tests across 1 file. [18.00ms]

- eval: E2b
  run_id: minted-truong-mot-cach-cu-xu-E2b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_phieu_so
  verified_at: 2026-10-21T02:15:10Z
  output: |
    Ran 1 test across 1 file. [4.14s]

- eval: E2c
  run_id: minted-truong-mot-cach-cu-xu-E2c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_api_so
  verified_at: 2026-10-21T01:39:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-truong-mot-cach-cu-xu-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_loi_nhap
  verified_at: 2026-10-21T02:15:10Z
  output: |
    Ran 3 tests across 1 file. [3.16s]

- eval: E3b
  run_id: minted-truong-mot-cach-cu-xu-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_loi_may_chu
  verified_at: 2026-10-21T02:15:10Z
  output: |
    Ran 2 tests across 1 file. [4.57s]

- eval: E3c
  run_id: minted-truong-mot-cach-cu-xu-E3c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_api_tu_choi
  verified_at: 2026-10-21T01:39:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-truong-mot-cach-cu-xu-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_o_tich
  verified_at: 2026-10-21T02:15:10Z
  output: |
    Ran 1 test across 1 file. [3.08s]

- eval: E5
  run_id: minted-truong-mot-cach-cu-xu-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_lien_ket
  verified_at: 2026-10-21T02:15:10Z
  output: |
    Ran 3 tests across 1 file. [4.20s]

- eval: E6
  run_id: minted-truong-mot-cach-cu-xu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_truong_chuan
  verified_at: 2026-10-21T02:15:10Z
  output: |
    Ran 2 tests across 1 file. [2.99s]

- eval: E7
  run_id: minted-truong-mot-cach-cu-xu-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_o_bang
  verified_at: 2026-10-21T02:15:10Z
  output: |
    Ran 3 tests across 1 file. [4.36s]

- eval: E8
  run_id: minted-truong-mot-cach-cu-xu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_ten_goi
  verified_at: 2026-10-21T01:39:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-truong-mot-cach-cu-xu-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tmc_man
  verified_at: 2026-10-21T02:15:10Z
  screenshot: evidence/E9-step1.png
  observed: |
    Da mo tung frame bang Read. step1 (phieu thoa-thuan 1280): the Tong quan, muc CHI TIET luoi hai cot; hang chuan (Ten, Gia tri, Tien te, Quy doi USD, Ngay chot, Cong ty, Phu trach, Chu tmc) va hang tu tao (Ghi chu tmc, Số tmc 1.234,5, Ngay tmc 15 thg 11 2026, Ô tich tmc co o tich xanh ben phai nhan, Chon tmc Vang, Lien ket tmc onehub.vn, Email tmc lienhe@onehub.vn, Dien thoai tmc 0901 234 567, Nguoi tmc Ada Okafor) cung cot nhan, cung co chu, khong tieu de nhom; lien ket/email/dien thoai tu tao co bieu tuong but chi nhu Website/Email chuan. step2 (cong-ty 1280): cot phai CHI TIET, Website/Dien thoai/Email chuan va Chu tmc, Ghi chu tmc, Số tmc 1.234,5, Ngay tmc, Ô tich tmc tiep ngay duoi cac hang chuan (Account type, Segment...) trong cung cot, khong tach nhom; khoang trong ben trai la bo cuc cua the, khong phai khoi rieng. step3 (lien-he 1280): Chu tmc, Ghi chu tmc, Số tmc 1.234,5, Ô tich co nhan trai, Lien ket tmc onehub.vn, Email tmc, Dien thoai tmc 0901 234 567, Nguoi tmc xep cung luoi voi Email/Dien thoai/LinkedIn chuan, khong tieu de nhom. step4-6 (375): ba phieu mot cot, nhan ben trai gia tri ben phai, khong cuon ngang, hang tu tao nam sau hang chuan (anh cat o hang Chu tmc/Segment theo viewport). step7-9 (bang 1280): bang thoa-thuan/cong-ty/lien-he co mười cot tmc (Chu, Ghi chu, Số 1.23…, Ngay 15 th…, Ô tich 'Co', Chon 'Vang', Lien ket onehub…, Email lienhe…, Dien thoai 0…) o dong dau, cac dong khac hien '—' o cac o trong; Số dung tabular, Ô tich 'Có'. Khong mau thuan Expected.
  network_observed: n-a (driver)
  ghi_chu: |
    Frames luu (9, ban chinh tmc-*.png va ban sao E9-step1..9.png cung thu muc evidence): E9-step1=tmc-phieu-thoa-thuan-1280, step2=tmc-phieu-cong-ty-1280, step3=tmc-phieu-lien-he-1280, step4=tmc-phieu-thoa-thuan-375, step5=tmc-phieu-cong-ty-375, step6=tmc-phieu-lien-he-375, step7=tmc-bang-thoa-thuan-1280, step8=tmc-bang-cong-ty-1280, step9=tmc-bang-lien-he-1280. Duong dan: /Users/manhphan/dev/crm-onehub/.claude/worktrees/cool-elbakyan-61bdff/_acceptance/truong-mot-cach-cu-xu/evidence/.
    Doi chieu mat: phieu khong co tieu de nhom, trong cung luoi hai cot voi truong chuan; che nhan khong chi ra duoc hang tu tao ngoai hai diem nho ghi duoi. Network: driver la script Playwright-style cua harness, khong co read_network_requests -> n-a (driver), khong tao E9-network.txt.
    Luu y nho (khong mau thuan Expected): (1) hang Ghi chu tmc (Chu dai) cao hon va gia tri thut vao ~9px so voi hang khac; (2) o bang, cot Số tmc canh trai (tabular-nums) trong khi Gia tri (Tien) canh phai; 'can chu so' duoc hieu la tabular-nums theo docs/design.md bang kieu (Số: Intl, tabular-nums) va rang kiem td .tabular-nums.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-21T02:15:10Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-21T02:15:10Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-21T02:15:10Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-21T02:15:10Z

- cmd: bunx turbo run lint --force
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-21T02:15:10Z

- cmd: bun run lint:slop
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-21T02:15:10Z

- cmd: bunx turbo run build --force
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-21T02:15:10Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi, round 1). Moi block eval ghi baseline n-a vi round nay khong do lai.

Eval khong-phan-biet: none — khong eval nao duoc liet ke. Lenh suite xanh-ca-hai-phia la regression-guard binh thuong, khong liet ke.

## Variance

none — moi eval chay mot lan (deterministic), khong eval nao ngau nhien hay flaky.

## Iterations

Round 1: REJECT — 3 finding trong hợp đồng (AC-3: lỗi lưu mất khi có lượt lưu chồng hoặc phiếu đã đóng; AC-3: trường tự tạo bắt buộc nhận câu lỗi sai; AC-7: cột Chọn hiện dấu gạch khi giữ lựa chọn đã lưu trữ). Returned to implementation.
Round 2: PASS — E1, E2, E2b, E3, E3b, E4, E5, E6, E7, E9 chạy lại và xanh; E2c, E3c, E8 carry-forward từ round 1 (delta không chạm paths của eval); bảy lệnh suite xanh.
