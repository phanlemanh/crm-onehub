---
schema_version: 2
feature_slug: lien-quan-loc-ban-da-cat
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 55dc7eb39c6d2872ddbdb1620baac76d55430ec3
human_signoff: Phan Le Manh 2026-10-13
---

# Evidence Report: lien-quan-loc-ban-da-cat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-6 | test | PASS |
| E15 | AC-12 | ui-check | PASS |
| E16 | AC-13 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-lien-quan-loc-ban-da-cat-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_byid_cong_ty
  verified_at: 2026-10-13T03:49:51Z
  output: |
    bun run test -- "cd apps/api && bun test test/lien-quan-loc-ban-da-cat.spec.ts -t lqc-byid-cong-ty"
    test-run: dropped crm_mv6584qsnu26_test

- eval: E2
  run_id: minted-lien-quan-loc-ban-da-cat-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_byid_ca_nhan
  verified_at: 2026-10-13T03:49:51Z
  output: |
    bun run test -- "cd apps/api && bun test test/lien-quan-loc-ban-da-cat.spec.ts -t lqc-byid-ca-nhan"

- eval: E3
  run_id: minted-lien-quan-loc-ban-da-cat-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_byid_thoa_thuan
  verified_at: 2026-10-13T03:49:51Z
  output: |
    bun run test -- "cd apps/api && bun test test/lien-quan-loc-ban-da-cat.spec.ts -t lqc-byid-thoa-thuan"
    test-run: dropped crm_mv6584rmaqlw_test

- eval: E4
  run_id: minted-lien-quan-loc-ban-da-cat-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_chon_dong_nghiep
  verified_at: 2026-10-13T03:49:51Z
  output: |
    bun run test -- "cd apps/api && bun test test/lien-quan-loc-ban-da-cat.spec.ts -t lqc-chon-dong-nghiep"
    test-run: dropped crm_mv658402psz3_test

- eval: E5
  run_id: minted-lien-quan-loc-ban-da-cat-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_dong_gap
  verified_at: 2026-10-13T03:49:51Z
  output: |
    Ran 1 test across 1 file. [1.62s]

- eval: E6
  run_id: minted-lien-quan-loc-ban-da-cat-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_mo_ngan
  verified_at: 2026-10-13T03:49:51Z
  output: |
    Ran 1 test across 1 file. [1.70s]

- eval: E7
  run_id: minted-lien-quan-loc-ban-da-cat-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_so_dem
  verified_at: 2026-10-13T03:49:51Z
  output: |
    Ran 1 test across 1 file. [1062.00ms]

- eval: E8
  run_id: minted-lien-quan-loc-ban-da-cat-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_chi_cat
  verified_at: 2026-10-13T03:49:51Z
  output: |
    Ran 1 test across 1 file. [1358.00ms]

- eval: E9
  run_id: minted-lien-quan-loc-ban-da-cat-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_xoa_vinh_vien
  verified_at: 2026-10-13T03:49:51Z
  output: |
    Ran 1 test across 1 file. [1.75s]

- eval: E10
  run_id: minted-lien-quan-loc-ban-da-cat-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_chu
  verified_at: 2026-10-13T03:49:51Z
  output: |
    Ran 1 test across 1 file. [1103.00ms]

- eval: E11
  run_id: minted-lien-quan-loc-ban-da-cat-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.lqc_cap_chu
  verified_at: 2026-10-13T03:49:51Z
  output: |
    Ran 137 tests across 1 file. [877.00ms]

- eval: E12
  run_id: minted-lien-quan-loc-ban-da-cat-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lqc_ban_phim
  verified_at: 2026-10-13T03:49:51Z
  output: |
    Ran 1 test across 1 file. [977.00ms]

- eval: E13
  run_id: design-gate-a0c0f51e5a, design-gate-4260d593d7
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lqc_san_thiet_ke
  verified_at: 2026-10-13T03:49:51Z
  output: |
    design-gate.mjs --mode static chay lan luot tren record-parts.tsx, company-sheet.tsx, contact-sheet.tsx, deal-sheet.tsx; vong lap ket thuc khong dung giua chung.

- eval: E14
  run_id: minted-lien-quan-loc-ban-da-cat-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.vdc_dai_bao
  verified_at: 2026-10-13T03:49:51Z
  output: |
    Ran 1 test across 1 file. [1.53s]

- eval: E15
  run_id: minted-lien-quan-loc-ban-da-cat-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lqc_man
  verified_at: 2026-10-13T03:49:51Z
  screenshot: evidence/E15-step1.png
  observed: |
    Đã mở từng frame bằng Read.
    - lqc-gap-1440 (E15-step1): ngăn bên phải 1440x900, tiêu đề "Công ty liên quan k658l8s c5vj", tab Thoả thuận có badge 1 đang chọn. Bảng chỉ 1 dòng "Thoả thuận đang chạy k658l8s" (Demo booked), dòng "+ Thoả thuận mới", và nút gập "> +2 đã lưu trữ" thu lại. Khớp expected (1 dòng đang dùng, +2).
    - lqc-mo-1440 (E15-step2): cùng ngăn, nút gập mở ("v +2 đã lưu trữ"), hiện 2 dòng mờ "Thoả thuận đã cắt hai k658l8s Đã lưu trữ ngày 13/10/2026" và "Thoả thuận đã cắt một k658l8s Đã lưu trữ ngày 13/10/2026". Khớp expected.
    - lqc-ngan-cat-1440 (E15-step3): ngăn thoả thuận "Thoả thuận đã cắt hai k658l8s", dưới tiêu đề là công ty. Có dải "Đã lưu trữ ngày 13/10/2026" kèm nút "Khôi phục". Dải này là [data-dai-luu-tru], script xác nhận. Khớp expected.
    - lqc-gap-390 (E15-step4): khung 390 rộng, tab Thoả thuận 1, một dòng đang dùng, "+ Thoả thuận mới", nút "> +2 đã lưu trữ" nằm gọn trong ngăn. Khớp expected.
    - lqc-mo-390 (E15-step5): nút gập mở, 2 dòng đã cắt "Thoả thuận đã cắt hai/một k658l8s Đã lưu trữ ngày 13/10/2026", chữ kết thúc quanh x≈357, không vượt mép 390. Khớp expected.
    Không có frame nào mâu thuẫn expected.
  network_observed: n-a (driver)
  output: |
    Frame đã lưu (evidence/): E15-step1.png=lqc-gap-1440, E15-step2.png=lqc-mo-1440, E15-step3.png=lqc-ngan-cat-1440, E15-step4.png=lqc-gap-390, E15-step5.png=lqc-mo-390 (đều trong _acceptance/lien-quan-loc-ban-da-cat/evidence/). Kịch bản man.mjs tự ghi đè 5 ảnh lqc-*.png vốn đã được theo dõi trong git; chỉ chép thêm E15-step*.png và E15-network.txt.

- eval: E16
  judged_by: judge-subagent (fresh context)
  verdict: UNCERTAIN
  rationale: Ba góc nhìn đều chốt được điểm 1, 2, 4, 5 (bảng chỉ có bản đang dùng kèm «+2 đã lưu trữ», chữ đúng bộ chữ vong-doi.md, ở 390 các dòng đã cất không cắt hay tràn) nhưng chưa chốt được điểm 3: ảnh tĩnh không cho thấy dấu hiệu bấm được trên dòng đã cất (không mũi tên, không gạch chân, không nền hover).
  required_evidence:
    - Ảnh chụp bằng kịch bản đo màn của E15 (qua bun scripts/lan-do/tien-de.mjs --chay), tên kiểu lqc-mo-hover-1440.png, ở tab Thoả thuận của ngăn công ty lúc «+n đã lưu trữ» đang mở và chuột rê hoặc focus bàn phím trên một dòng đã cất; nếu hiện nền sáng lên, con trỏ tay hoặc vòng focus thì điểm 3 đạt.
    - Hoặc ảnh lqc-mo-1440.png / lqc-mo-390.png chụp lại với dấu hiệu bấm được luôn hiện (mũi tên cuối dòng, tên dạng liên kết) thay cho dòng chữ phẳng hiện tại.
    - Hoặc, nếu thiếu cả hai, ghi rõ ở hợp đồng rằng dòng đã cất chỉ bấm được theo ngầm hiểu và người duyệt tự chốt.
  human_override: Phan Le Manh 2026-10-13 — Đạt

Đề xuất panel E16 (ba góc nhìn, mỗi góc UNCERTAIN, người quyết ở Cổng 2):

- domain-correctness: UNCERTAIN — Bốn trong năm điểm đạt rõ. (1) Bảng chỉ có một thoả thuận đang dùng, khớp với thẻ «Thoả thuận 1», ô «Thoả thuận đang mở 1» và dòng «+2 đã lưu trữ» bên dưới (lqc-gap-1440/390). (2) «+2 đã lưu trữ» có mũi tên gập, nằm dưới «+ Thoả thuận mới», đọc như chỗ xem bản đã cất chứ không như nút cất. (4) Chữ là «Đã lưu trữ» và «Khôi phục», khớp bộ chữ của docs/vong-doi.md, không có «ẩn». (5) Ở 390 dòng «+2 đã lưu trữ» và hai dòng đã cất, kể cả «Đã lưu trữ ngày 13/10/2026», không bị cắt hay tràn (lqc-mo-390). Điểm (3) chưa đủ căn cứ: các dòng mở ra mờ hơn dòng đang dùng, không có cột giai đoạn, giá trị hay phụ trách, và có ngày cất. Nhưng ảnh tĩnh không có dấu hiệu bấm được nào, như mũi tên cuối dòng, gạch chân hay nền khi rê chuột. Chỉ ảnh lqc-ngan-cat-1440 cho thấy dòng đó mở được ngăn, còn bản thân dòng không tự nói điều đó.
  - Bằng chứng cần: Ảnh chụp bằng kịch bản đo màn của E15 (qua bun scripts/lan-do/tien-de.mjs --chay), có tên kiểu lqc-mo-hover-1440.png, ở tab Thoả thuận của ngăn công ty lúc dòng «+n đã lưu trữ» đang mở và chuột đang rê hoặc focus bàn phím trên một dòng đã cất. Nếu ảnh hiện nền sáng lên, con trỏ tay hoặc vòng focus thì dòng đó đọc là bấm được và điểm (3) đạt.
  - Hoặc: ảnh lqc-mo-1440.png chụp lại với dấu hiệu bấm được luôn hiện, ví dụ mũi tên cuối dòng, thay cho dòng chữ phẳng hiện tại.
- operational-feasibility: UNCERTAIN — Điểm (1), (2), (4), (5) đạt rõ trong năm ảnh: bảng chỉ có bản đang dùng kèm «+2 đã lưu trữ», chữ đúng bộ chữ vong-doi.md, ở 390 các dòng đã cất không bị cắt hay tràn. Điểm (3) chưa chốt được: dòng đã cất có mờ và có ngày cất, nhưng ảnh tĩnh không có mũi tên, gạch chân hay trạng thái hover nào cho thấy dòng bấm được để mở.
  - Bằng chứng cần: Ảnh chụp ở 1440 (cùng kịch bản đo màn của E15, ghi vào _acceptance/lien-quan-loc-ban-da-cat/evidence/) lúc con trỏ rê lên một dòng đã cất khi «+2 đã lưu trữ» đang mở, cho thấy nền hover hoặc dấu hiệu bấm được. Có ảnh này mà dòng đổi trạng thái rõ ràng thì điểm (3) đạt.
  - Hoặc: ảnh có chú thích con trỏ (cursor-pointer) hoặc mũi tên/chevron ngay trên dòng đã cất, cùng nguồn với bộ ảnh lqc-*. Thiếu cả hai thì phải ghi rõ ở hợp đồng rằng dòng đã cất chỉ bấm được theo ngầm hiểu, và người duyệt tự chốt.
- spec-alignment: UNCERTAIN — Điểm 1, 2, 4, 5 đạt: bảng chỉ có một thoả thuận đang dùng kèm dòng «+2 đã lưu trữ» có mũi tên gập; chữ chỉ có «đã lưu trữ», «Đã lưu trữ ngày 13/10/2026», «Khôi phục», không có «ẩn»; ở 390 hai dòng đã cất nằm gọn, không cắt, không tràn. Điểm 3 chưa đủ căn cứ: dòng mở ra có mờ hơn dòng đang dùng và có ngày cất, nhưng ảnh tĩnh không cho thấy dấu hiệu bấm được (không mũi tên, không nền khi rê chuột, không gạch chân).
  - Bằng chứng cần: Ảnh chụp ở 1440 của một dòng đã cất đang ở trạng thái rê chuột hoặc focus bàn phím (ví dụ lqc-mo-hover-1440.png cạnh lqc-mo-1440.png trong _acceptance/lien-quan-loc-ban-da-cat/evidence/), cho thấy nền đổi, con trỏ tay hoặc vòng focus trên dòng «Thoả thuận đã cất hai k655n09»; có ảnh này thì điểm 3 chốt được và verdict thành PASS.
  - Hoặc: ảnh lqc-mo-1440 / lqc-mo-390 chụp lại với dòng đã cất có dấu hiệu nhìn thấy ngay là bấm được (mũi tên cuối dòng, tên dạng liên kết); có thì điểm 3 chốt được và verdict thành PASS.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lien-quan-loc-ban-da-cat-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T03:49:51Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lien-quan-loc-ban-da-cat-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T03:49:51Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lien-quan-loc-ban-da-cat-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T03:49:51Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lien-quan-loc-ban-da-cat-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T03:49:51Z

- cmd: bunx turbo run lint --force
  run_id: minted-lien-quan-loc-ban-da-cat-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T03:49:51Z

- cmd: bun run lint:slop
  run_id: minted-lien-quan-loc-ban-da-cat-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T03:49:51Z

- cmd: bunx turbo run build --force
  run_id: minted-lien-quan-loc-ban-da-cat-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T03:49:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline; là regression-guard có chủ ý hay cần viết lại để assert hành vi mới):
- E11: cd apps/app && bun test test/messages-guard.spec.ts
- E13: vòng lặp design-gate.mjs --mode static trên 4 tệp record-parts.tsx, company-sheet.tsx, contact-sheet.tsx, deal-sheet.tsx
- E14: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-dai-bao

Baseline khong do:
- bun run test -- "cd apps/api && bun test test/lien-quan-loc-ban-da-cat.spec.ts -t lqc-byid-cong-ty": bo qua baseline: tep apps/api/test/lien-quan-loc-ban-da-cat.spec.ts co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/lien-quan-loc-ban-da-cat.spec.ts -t lqc-byid-ca-nhan": bo qua baseline: tep apps/api/test/lien-quan-loc-ban-da-cat.spec.ts co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/lien-quan-loc-ban-da-cat.spec.ts -t lqc-byid-thoa-thuan": bo qua baseline: tep apps/api/test/lien-quan-loc-ban-da-cat.spec.ts co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/lien-quan-loc-ban-da-cat.spec.ts -t lqc-chon-dong-nghiep": bo qua baseline: tep apps/api/test/lien-quan-loc-ban-da-cat.spec.ts co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lien-quan-loc-ban-da-cat.dom.tsx -t lqc-dong-gap: bo qua baseline: tep apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lien-quan-loc-ban-da-cat.dom.tsx -t lqc-mo-ngan: bo qua baseline: tep apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lien-quan-loc-ban-da-cat.dom.tsx -t lqc-so-dem: bo qua baseline: tep apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lien-quan-loc-ban-da-cat.dom.tsx -t lqc-chi-cat: bo qua baseline: tep apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lien-quan-loc-ban-da-cat.dom.tsx -t lqc-xoa-vinh-vien: bo qua baseline: tep apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lien-quan-loc-ban-da-cat.dom.tsx -t lqc-chu: bo qua baseline: tep apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lien-quan-loc-ban-da-cat.dom.tsx -t lqc-ban-phim: bo qua baseline: tep apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx co o cay dang kiem nhung chua co o merge-base 4abc05e07db68c3a3265f8150a45680ffee933cf — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E15 xanh; E16 (phán đoán AC-13) còn UNCERTAIN ở điểm 3 «dòng đã cất bấm được» — chờ người quyết ở Cổng 2.
