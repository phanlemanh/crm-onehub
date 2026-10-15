---
schema_version: 2
feature_slug: khung-soan-chan-lien-ket
verdict: REJECT
failed_evals: ["E8","E7"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cdf58124b9c22b1f95d43df713e97ca2858c36a3
human_signoff:
---

# Evidence Report: khung-soan-chan-lien-ket

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | FAIL |
| E8 | AC-1 | script | FAIL |
| E9 | AC-3 | script | PASS |

Hai eval đỏ: E8 (phép đột biến, mã thoát 2) và E7 (phép đo màn thật, mã thoát 1). Cả hai lệnh đỏ đều đã gắn eval, không có lệnh đỏ nào không gắn eval. Các lệnh suite đều xanh.

## Evidence

- eval: E1
  run_id: minted-khung-soan-chan-lien-ket-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcl_soan
  verified_at: 2026-10-15T11:25:22Z
  output: |
    Ran 3 tests across 1 file. [1495.00ms]

- eval: E2
  run_id: minted-khung-soan-chan-lien-ket-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcl_go_do
  verified_at: 2026-10-15T11:25:22Z
  output: |
    Ran 5 tests across 1 file. [1.81s]

- eval: E3
  run_id: minted-khung-soan-chan-lien-ket-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcl_roi
  verified_at: 2026-10-15T11:25:22Z
  output: |
    Ran 6 tests across 1 file. [694.00ms]

- eval: E4
  run_id: minted-khung-soan-chan-lien-ket-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcl_khong_do
  verified_at: 2026-10-15T11:25:22Z
  output: |
    Ran 3 tests across 1 file. [688.00ms]

- eval: E5
  run_id: minted-khung-soan-chan-lien-ket-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcl_khong_chan
  verified_at: 2026-10-15T11:25:22Z
  output: |
    Ran 10 tests across 1 file. [727.00ms]

- eval: E6
  run_id: minted-khung-soan-chan-lien-ket-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kcl_hoi_quy
  verified_at: 2026-10-15T11:25:22Z
  output: |
    Ran 12 tests across 1 file. [1258.00ms]

- eval: E7
  run_id: minted-khung-soan-chan-lien-ket-E7-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.kcl_man
  verified_at: 2026-10-15T11:25:22Z
  screenshot: evidence/kcl-dang-soan-1280.png
  observed: |
    Đã mở từng ảnh bằng Read. (1) kcl-dang-soan-1280.png: hộp «Kara đang soạn. Đóng khung?» + «Lượt này vẫn chạy khi bạn đóng. Mở lại cuộc soạn để xem bản nháp mới.» + nút «Ở lại» và «Đóng» (đỏ), chữ đọc trọn, hộp ở giữa; nhưng nền sau hộp là mảng xám phẳng, không thấy khung soạn phía sau (không chứng minh được «hộp nằm trên khung» bằng mắt; có thể do lớp phủ). Góc dưới trái có badge dev «2 Issues» của Next.
    (2) kcl-go-do-1280.png: hộp «Bỏ những gì vừa nhập?» + «Những gì bạn vừa nhập trong hộp này sẽ mất.» + «Tiếp tục sửa» / «Bỏ», chữ trọn, nền xám phẳng không thấy khung, badge «1 Issue».
    (3) kcl-dang-soan-375.png: hộp «Kara đang soạn. Đóng khung?» rộng gần hết chiều ngang 375, hai nút xếp dọc «Đóng» (đỏ) và «Ở lại», chữ trọn không tràn ngang; nền xám phẳng, badge «1 Issue». (4) kcl-go-do-375.png: hộp «Bỏ những gì vừa nhập?» với «Bỏ» (đỏ) và «Tiếp tục sửa» xếp dọc, chữ trọn, không tràn ngang; nền xám phẳng.
    Nội dung hộp khớp Expected về tiêu đề và nút; chỉ phần «hộp nằm trên khung» không xác nhận được vì khung không thấy trong ảnh. Riêng log man.mjs: khung 1280 có lỗi console hydration mới (aria-hidden trên nút «Menu tài khoản») nên mâu thuẫn Expected «console không lỗi» nên eval này không đạt.
  network_observed: n-a (driver)
  output: |
    Lệnh kcl_man chạy nguyên văn ở tiền cảnh (log: .acceptance-runs/khung-soan-chan-lien-ket/log-kcl-man.log). Dòng tổng kết: «KET LUAN: 1 SAI — ma thoat 1».
    Assertion: «kcl 1280 a: dat», «kcl 1280 b: dat», «kcl 1280 c: dat» (Enter trên liên kết, hộp hiện, URL còn record=soan:<id>, khung:true), «kcl 375 a: dat», «kcl 375 b: dat» đều đạt.
    Sai: Expected «console không lỗi» không đạt. man.mjs in «kcl 1280: console loi A tree hydrated but some attributes of the server rendered HTML didn't match the client properties...» (khác biệt: HTML server có aria-hidden=true / data-aria-hidden=true trên nút «Menu tai khoan» (Button size=icon, dropdown-menu-trigger) trong AppLayout, client không có).
    Lỗi này không nằm trong bộ lọc LOI_CO_SAN (2 lỗi hydration có sẵn của «Theo đơn vị», P1-19, đã loại không tính) nên bị tính là sai mới. Chỉ khổ 1280 có lỗi mới; khổ 375 chỉ có 2 lỗi có sẵn.
    Chưa xác định được đây là lỗi của tính năng hay do Radix aria-hidden của hộp soạn/khung (chưa đối chiếu); không chạy lại để đoán flake.
    Chiều đỏ (--kiem-do-do khong-chan) không nằm trong steps của lần chạy này nên không chạy.
    Khung hình do man.mjs tự chụp (không có ui:capture qua lệnh này); bản sao ở .acceptance-runs/khung-soan-chan-lien-ket/evidence/; bốn ảnh gốc: kcl-dang-soan-1280.png, kcl-go-do-1280.png, kcl-dang-soan-375.png, kcl-go-do-375.png trong _acceptance/khung-soan-chan-lien-ket/evidence/. Không lưu được E7-stepN.png đúng tên vì rào chỉ cho ghi dưới .acceptance-runs/; tên gốc của man.mjs được giữ.
    Không còn server nào do mình start (phiên đo tự dọn, «phien-do: xong»). Mạng: driver là script, không đọc được network riêng.

- eval: E8
  run_id: minted-khung-soan-chan-lien-ket-E8-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.kcl_dot_bien
  verified_at: 2026-10-15T11:25:22Z
  output: |
    kcl dot-bien: doi chung kcl_soan xanh
    kcl dot-bien: doi chung kcl_go_do xanh
    kcl dot-bien: doi chung kcl_roi xanh
    kcl dot-bien: doi chung kcl_khong_do xanh
    kcl dot-bien: doi chung kcl_khong_chan xanh
    cặp a: cắn (bỏ lời gọi chặn liên kết trong khung soạn)
    cặp b: cắn (nút rời đóng hộp thay vì đi tiếp)
    cặp c: cắn (hrefNoiBo bỏ kiểm metaKey)
    cặp d: cắn (bật chặn không xét có thay đổi)
    kcl dot-bien: cay that bi doi
    Cả bốn cặp đều cắn, nhưng script kết thúc ở dòng «cay that bi doi» thay vì in «kcl dot-bien: 4/4 cắn»; Expected đòi dòng 4/4 cắn nên eval không đạt. Nguyên nhân dòng báo cây thật bị đổi: chưa rõ (không có dòng log nào nói tệp nào đổi).

- eval: E9
  run_id: minted-khung-soan-chan-lien-ket-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcl_man_luot
  verified_at: 2026-10-15T11:25:22Z
  output: |
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-15T11:25:22Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-15T11:25:22Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-15T11:25:22Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-15T11:25:22Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-15T11:25:22Z

- cmd: bun run lint:slop
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-15T11:25:22Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-soan-chan-lien-ket-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-15T11:25:22Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Baseline không đo:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-soan-chan-lien-ket.dom.tsx -t kcl-soan: bỏ qua baseline: tệp apps/app/test/khung-soan-chan-lien-ket.dom.tsx có ở cây đang kiểm nhưng chưa có ở merge-base eb5ab4269cdbd393b6087ae461ca6814b767724d — eval mới, chạy trên code cũ không phân biệt gì
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-soan-chan-lien-ket.dom.tsx -t kcl-go-do: bỏ qua baseline: tệp apps/app/test/khung-soan-chan-lien-ket.dom.tsx có ở cây đang kiểm nhưng chưa có ở merge-base eb5ab4269cdbd393b6087ae461ca6814b767724d — eval mới, chạy trên code cũ không phân biệt gì
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-soan-chan-lien-ket.dom.tsx -t kcl-roi && cd ../.. && cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/giu-thay-doi-lien-ket.dom.tsx -t '^kcl-hop ': bỏ qua baseline: tệp apps/app/test/khung-soan-chan-lien-ket.dom.tsx có ở cây đang kiểm nhưng chưa có ở merge-base eb5ab4269cdbd393b6087ae461ca6814b767724d — eval mới, chạy trên code cũ không phân biệt gì
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-soan-chan-lien-ket.dom.tsx -t kcl-khong-do && cd ../.. && cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/giu-thay-doi-lien-ket.dom.tsx -t kcl-hop-sach: bỏ qua baseline: tệp apps/app/test/khung-soan-chan-lien-ket.dom.tsx có ở cây đang kiểm nhưng chưa có ở merge-base eb5ab4269cdbd393b6087ae461ca6814b767724d — eval mới, chạy trên code cũ không phân biệt gì
- cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/giu-thay-doi-lien-ket.dom.tsx -t kcl-khong-chan: bỏ qua baseline: tệp packages/ui/test/giu-thay-doi-lien-ket.dom.tsx có ở cây đang kiểm nhưng chưa có ở merge-base eb5ab4269cdbd393b6087ae461ca6814b767724d — eval mới, chạy trên code cũ không phân biệt gì
- node _acceptance/khung-soan-chan-lien-ket/rang/dot-bien.mjs: bỏ qua baseline: tệp _acceptance/khung-soan-chan-lien-ket/rang/dot-bien.mjs có ở cây đang kiểm nhưng chưa có ở merge-base eb5ab4269cdbd393b6087ae461ca6814b767724d — eval mới, chạy trên code cũ không phân biệt gì

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (không eval nào chạy nhiều lần)

## Iterations

Round 1: E8, E7 failed — E8: phép đột biến cắn đủ bốn cặp nhưng script dừng ở dòng «cay that bi doi» thay vì «4/4 cắn»; E7: man.mjs ghi lỗi console hydration mới ở khổ 1280 (aria-hidden trên nút «Menu tai khoan»), ngoài bộ lọc LOI_CO_SAN, nên Expected «console không lỗi» không đạt dù năm bước a/b/c đạt. Returned to implementation.
