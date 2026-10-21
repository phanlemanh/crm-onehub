---
schema_version: 2
feature_slug: sort-moi-truong
verdict: REJECT
failed_evals: [E9]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a4b1845be92f2fc4f9d6a711a94046840d9334a6
human_signoff:
---

# Evidence Report: sort-moi-truong

Round 1. Tổng: 10 eval máy đạt, E9 (ui-check) rớt do đối chiếu bằng mắt mâu thuẫn Expected dù lệnh đo thoát 0. Lệnh rớt không gắn eval: không có; lệnh ui-check:E9 (thoát 1) gắn eval E9.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | FAIL |

## Evidence

- eval: E1
  run_id: mvho2uowf1ou
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_sap
  verified_at: 2026-10-21T05:16:01Z
  output: |
    test-run: dropped crm_mvho2uowf1ou_test

- eval: E1b
  run_id: minted-sort-moi-truong-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_trang
  verified_at: 2026-10-21T05:16:01Z
  output: |
    test-run: dropped crm_mvho2ubn2r04_test

- eval: E2
  run_id: minted-sort-moi-truong-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_cty_lh
  verified_at: 2026-10-21T05:16:01Z
  output: |
    test-run: dropped crm_mvho2ttvfgta_test

- eval: E3
  run_id: minted-sort-moi-truong-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_khoa_chet
  verified_at: 2026-10-21T05:16:01Z
  output: |
    test-run: dropped crm_mvho2ug9sjjn_test

- eval: E4
  run_id: minted-sort-moi-truong-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_board
  verified_at: 2026-10-21T05:16:01Z
  output: |
    test-run: dropped crm_mvho2tw5n2eg_test

- eval: E5
  run_id: minted-sort-moi-truong-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_cot_sap
  verified_at: 2026-10-21T05:16:01Z
  output: |
    Ran 1 test across 1 file. [1123.00ms]

- eval: E5b
  run_id: minted-sort-moi-truong-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.smt_quet
  verified_at: 2026-10-21T05:16:01Z
  output: |
    smt quet: dat 6 tep

- eval: E6
  run_id: minted-sort-moi-truong-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_an_theo_kieu
  verified_at: 2026-10-21T05:16:01Z
  output: |
    Ran 1 test across 1 file. [965.00ms]

- eval: E7
  run_id: mvho2ti530km
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_the
  verified_at: 2026-10-21T05:16:01Z
  output: |
    test-run: dropped crm_mvho2ti530km_test

- eval: E7b
  run_id: minted-sort-moi-truong-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_the_kanban
  verified_at: 2026-10-21T05:16:01Z
  output: |
    Ran 1 test across 1 file. [833.00ms]

- eval: E8
  run_id: minted-sort-moi-truong-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_toc_do
  verified_at: 2026-10-21T05:16:01Z
  output: |
    test-run: dropped crm_mvho2ua59inp_test

- eval: E9
  run_id: minted-sort-moi-truong-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.smt_man
  verified_at: 2026-10-21T05:16:01Z
  screenshot: evidence/smt-bang-thoa-thuan-sap-1280.png
  observed: |
    1) smt-bang-thoa-thuan-sap-1280.png: bang Thoa thuan loc 'smtman', 3 hang, thu tu 5, 1.234,5, '—' (tang dan, trong cuoi) dung dap an. Nhung tieu de cot 'Số smt…' bi cat o hai dong, KHONG thay mui ten sap o cot nay, khi cac cot Ngay smt, Chu smt, Ghi chu smt hien mui ten ↑↓. Mau thuan Expected muc 0 (cot So phai co mui ten). Phong to vung tieu de da xac nhan.
    2) smt-bang-thoa-thuan-768.png: cot hien: Ten, Cong ty, Giai doan, Gia tri, Phu trach, Số smt, Lien ket smt, Email smt (cuon ngang tiep); khong thay cot Chu, Ngay, Chon, O tich. Khop Expected muc 1.
    3) smt-bang-cong-ty-768.png: bang Cong ty, cot Phu trach, So thoa thuan, Hoat dong gan nhat, Số smt, Lien ket smt hien; khong co Chu/Ngay/Chon/O tich. Khop.
    4) smt-bang-thoa-thuan-375-menu.png: menu 'Sắp xếp theo' co Ten, Cong ty, Giai doan, Gia tri, Phu trach, Ngay chot, Ngay tao (tick), Hoat dong gan nhat, Số smt, Ngày smt, Chữ smt, Ghi chú smt, Chọn smt, Liên kết smt, Email smt, Điện thoại smt, Người smt, roi Tăng dần / Giảm dần (tick); khong co Ô tích. Khop (menu dinh sat mep trai man hinh, ghi chu phu).
    5) smt-kanban-1280.png: cot Demo booked 2 the (Beta, Alpha), Qualified to buy 1 the (Gamma). The Gamma: 'Số smt 5' va 'Ngày smt 5 thg 11, 2026' duoi dong Gia tri/Ngay chot, tren Nguoi phu trach va Giai doan; the Alpha: 'Số smt 1.234,5', 'Ngày smt 1 thg 12, 2026'; the Beta khong co dong truong nao (trong). Cung le trai va co chu voi cac dong co san, khong de len. Khop muc 2.
    6) smt-kanban-375.png: bang cot 375, the Beta va Alpha day du chu, Alpha co hai dong truong 'Số smt 1.234,5' / 'Ngày smt 1 thg 12, 2026', khong vo chu, khong cuon ngang trang (cot ke tiep bi cat trong bang la cuon trong bang). Khop muc 3.
  network_observed: n-a (driver)
  output: |
    Lenh: BANG_CHUNG=_acceptance/sort-moi-truong/evidence bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/sort-moi-truong/rang/do-man.mjs". Lenh do thoat ma 0 o rang (dong cuoi 'smt man: dat', 'KET LUAN AC-9: 38 DUNG, 0 SAI'), nhung buoc doi chieu bang mat sau khi Read du sau anh cho thay mot muc mau thuan Expected nen eval rot (ma thoat ghi nhan cua lenh ui-check:E9 la 1).
    Phien do tu dung kho crm_sad_newton_c859c0_do, app :4292, api :4217, da don xong; khong co server nao do toi start nen khong can tat.
    THAT BAI (1): Expected muc 0 noi 'tieu de cot So co mui ten'. Anh 1280 khong co mui ten o cot So: tieu de hien 'So smt...' (hai dong, bi cat bang dau ba cham), trong khi cot Ngay/Chu/Ghi chu hien mui ten. Nguyen nhan doc tu packages/ui/src/components/data-table.tsx dong 181-186 va 808-840: nhan cot nam trong span line-clamp-2, SortIndicator dat sau chu, nen cot hep cat luon mui ten cua cot dang sap. DOM co aria-sort=ascending (rang do-man.mjs chi kiem thuoc tinh nay, khong kiem mui ten nhin thay) nen rang xanh nhung nguoi dung khong thay cot nao dang sap.
    Cac muc khac (768, menu 375, kanban 1280, kanban 375) khop Expected. Network: driver la script do-man.mjs, khong dump E9-network.txt.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sort-moi-truong-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T05:16:01Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sort-moi-truong-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T05:16:01Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sort-moi-truong-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T05:16:01Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sort-moi-truong-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T05:16:01Z

- cmd: bunx turbo run lint --force
  run_id: minted-sort-moi-truong-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T05:16:01Z

- cmd: bun run lint:slop
  run_id: minted-sort-moi-truong-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T05:16:01Z

- cmd: bunx turbo run build --force
  run_id: minted-sort-moi-truong-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T05:16:01Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-sap": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-trang": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-cty-lh": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-khoa-chet": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-board": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/sort-moi-truong.dom.tsx -t smt-cot-sap: bo qua baseline: tep apps/app/test/sort-moi-truong.dom.tsx co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sort-moi-truong/rang/quet-bang-kieu.mjs: bo qua baseline: tep _acceptance/sort-moi-truong/rang/quet-bang-kieu.mjs co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/sort-moi-truong.dom.tsx -t smt-an-theo-kieu: bo qua baseline: tep apps/app/test/sort-moi-truong.dom.tsx co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-the": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/sort-moi-truong.dom.tsx -t smt-the-kanban: bo qua baseline: tep apps/app/test/sort-moi-truong.dom.tsx co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && SMT_TOC_DO=1 bun test --timeout 600000 test/sort-moi-truong-toc-do.spec.ts -t smt-toc-do": bo qua baseline: tep apps/api/test/sort-moi-truong-toc-do.spec.ts co o cay dang kiem nhung chua co o merge-base 898503a8b4bc7b6c43b6f35384332cb1ad1888af — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E9 failed — tiêu đề cột Số đang sắp không hiện mũi tên ở 1280 (nhãn cột trong span line-clamp-2 cắt mất SortIndicator của cột hẹp), dù aria-sort là ascending và rang do-man.mjs chỉ kiểm thuộc tính, không kiểm mũi tên nhìn thấy. Returned to implementation.
