---
schema_version: 2
feature_slug: hop-tuan-tren-bang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2da26f0da9bd8cfe3c56a0050e7ca85c7c72dc0b
human_signoff:
---

# Evidence Report: hop-tuan-tren-bang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hop-tuan-tren-bang-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_api
  verified_at: 2026-10-28T09:03:54Z
  output: |
    bun run test -- "cd apps/api && bun test test/hop-tuan-tren-bang.spec.ts -t htb-muc-doi"
    test-run: dropped crm_mvrw1f5or3zi_test

- eval: E2
  run_id: minted-hop-tuan-tren-bang-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_ghi_chu
  verified_at: 2026-10-28T09:03:54Z
  output: |
    cd apps/app && bun test ./test/hop-tuan-tren-bang.dom.tsx -t htb-ghi-chu
    Ran 1 test across 1 file. [1.93s]

- eval: E3
  run_id: minted-hop-tuan-tren-bang-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_muc_doi_chu
  verified_at: 2026-10-28T09:03:54Z
  output: |
    cd apps/app && bun test ./test/hop-tuan-tren-bang.dom.tsx -t htb-muc-doi-chu
    Ran 1 test across 1 file. [1.70s]

- eval: E4
  run_id: minted-hop-tuan-tren-bang-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_cap_nhat
  verified_at: 2026-10-28T09:03:54Z
  output: |
    cd apps/app && bun test ./test/hop-tuan-tren-bang.dom.tsx -t htb-cap-nhat
    Ran 1 test across 1 file. [2.01s]

- eval: E5
  run_id: minted-hop-tuan-tren-bang-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_sang
  verified_at: 2026-10-28T09:03:54Z
  output: |
    cd apps/app && bun test ./test/hop-tuan-tren-bang.dom.tsx -t htb-sang
    Ran 1 test across 1 file. [3.49s]

- eval: E6
  run_id: minted-hop-tuan-tren-bang-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_nguon
  verified_at: 2026-10-28T09:03:54Z
  output: |
    cd apps/app && bun test ./test/hop-tuan-tren-bang.dom.tsx -t htb-nguon
    bun _acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs
    DUNG

- eval: E7
  run_id: minted-hop-tuan-tren-bang-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_sau_gui
  verified_at: 2026-10-28T09:03:54Z
  output: |
    cd apps/app && bun test ./test/hop-tuan-tren-bang.dom.tsx -t htb-sau-gui
    Ran 1 test across 1 file. [2.10s]

- eval: E8
  run_id: minted-hop-tuan-tren-bang-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.httb_man
  verified_at: 2026-10-28T09:03:54Z
  screenshot: evidence/htb-bang-1440-sang.png
  observed: |
    Đã mở và đọc cả 12 ảnh vừa chụp (ghi lúc 16:05–16:06).
    1440 sáng (htb-bang): đầu trang Mục tiêu, tab Họp tuần đang chọn, ô chọn đơn vị Chăm sóc đối tác; hàng số 4/5, 2, 1, 54. «Đang bàn tuần này 2» và «Còn lại 3 KR — không có gì mới» đã mở. Bảng năm cột: KR và vì sao, Tiến độ, Ghi chú mới nhất, Mức đổi, nút «Cập nhật» nằm trọn trong khung ở mép phải. Cả 5 dòng có ghi chú hoặc «Chưa có ghi chú» (dòng có ghi chú dài hiện kèm ngày 28/10, dòng «Thiếu một người trực ca tối» kèm 05/10) và ô mức đổi hai dòng (ví dụ «+0,3 điểm» / «4,7 → 5 · so với 19/10»; «−0,9%» / «25,4 → 24,5 · so với 19/10»; «Chưa đổi» / «Chưa xong · so với 19/10»). Không chữ nào bị cắt.
    1440 sáng (htb-ngan): ngăn bên phải KR «Giữ điểm hài lòng trên 4,5», đầu ngăn «2/5 · theo thứ tự bảng», hai nút ‹ ›, nút xanh «Cập nhật», nút đóng; thẻ Hiện tại 5 điểm, Tiến độ 100%, biểu đồ lịch sử và danh sách cập nhật.
    1440 tối: cùng bố cục trên nền đen; tên KR, ghi chú, mức đổi chữ sáng, đường viền các ô và bảng vẫn nhìn rõ, không chìm vào nền; ngăn tối có «2/5 · theo thứ tự bảng», ‹ ›, Cập nhật, biểu đồ chấm trắng đọc được.
    768 sáng (htb-bang): hàng số xếp 2×2; mỗi dòng KR có tên, tiến độ và nút Cập nhật bên phải; ghi chú mới nhất và mức đổi hai dòng nằm DƯỚI tên KR (nhãn «Ghi chú mới nhất», «Mức đổi»), đủ 5 dòng (Đang bàn 2, Còn lại 3), không tràn ngang, nút Cập nhật trong khung. 768 sáng (ngan): đầu ngăn «2/5 · theo thứ tự bảng», ‹ ›, Cập nhật đủ, tiêu đề KR hai dòng không đè nút.
    768 tối: cùng bố cục, chữ và viền rõ trên nền tối; ngăn tối cũng đủ «2/5…», ‹ ›, Cập nhật.
    375 sáng (htb-bang): dạng danh sách thẻ một cột; mỗi thẻ gồm tên KR, thanh tiến độ, nhãn tự tin, «Ghi chú mới nhất» (hoặc «Chưa có ghi chú» và ngày), «Mức đổi» hai dòng, nút «Cập nhật» trọn trong thẻ; không cuộn ngang. 375 sáng (ngan): ngăn dạng tấm trượt từ dưới, đầu ngăn «2/5 · theo thứ tự bảng», hai nút ‹ ›, nút Cập nhật (xuống dòng thứ hai của đầu ngăn nhưng đọc trọn).
    375 tối: cùng thẻ trên nền đen, viền thẻ và chữ ghi chú/mức đổi rõ; ngăn tối có «2/5 · theo thứ tự bảng», ‹ ›, Cập nhật.
    Không ảnh nào mâu thuẫn Expected. Ghi nhận phụ (ngoài phạm vi đo): lịch sử cập nhật trong ngăn cắt ghi chú dài bằng dấu «…» ở 768 và 375, không thuộc ghi chú/mức đổi/nhãn của bảng Họp tuần mà E8 đo.
  network_observed: n-a (driver)
  output: |
    Ảnh gốc ghi 16:05–16:06 ngày 28/10 tại _acceptance/hop-tuan-tren-bang/evidence/: htb-bang-{1440,768,375}-{sang,toi}.png và htb-ngan-{1440,768,375}-{sang,toi}.png.
    Bản sao theo bước: E8-step1..E8-step12.png (1=bang-1440-sang, 2=ngan-1440-sang, 3=bang-1440-toi, 4=ngan-1440-toi, 5..8 cùng thứ tự cho 768, 9..12 cho 375). Nhật ký: E8-run.log.
    Network: driver là script, không đọc được network; không tạo E8-network.txt.

- eval: E9
  run_id: minted-hop-tuan-tren-bang-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_chu
  verified_at: 2026-10-28T09:03:54Z
  output: |
    cd apps/app && bun test ./test/hop-tuan-tren-bang.dom.tsx -t htb-chu && bun test ./test/messages-guard.spec.ts
    Ran 182 tests across 1 file. [1.53s]

- eval: E10
  run_id: minted-hop-tuan-tren-bang-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.httb_khong_doi_hinh
  verified_at: 2026-10-28T09:03:54Z
  output: |
    node _acceptance/hop-tuan-tren-bang/rang/khong-doi-hinh.mjs
    KET LUAN khong-doi-hinh: dat

- eval: E11
  run_id: minted-hop-tuan-tren-bang-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.httb_man_gui
  verified_at: 2026-10-28T09:03:54Z
  output: |
    bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-tuan-tren-bang/rang/man.mjs --phan gui"
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-28T09:03:54Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-28T09:03:54Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-28T09:03:54Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-28T09:03:54Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-tuan-tren-bang-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-28T09:03:54Z

- cmd: bun run lint:slop
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-28T09:03:54Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-tuan-tren-bang-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-28T09:03:54Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

none — danh sách eval không-phân-biệt không đo được ở round này (baseline BLOCKED hạ tầng, mọi baseline là n-a).

Baseline khong do:

- bun run test -- "cd apps/api && bun test test/hop-tuan-tren-bang.spec.ts -t htb-muc-doi": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-ghi-chu: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-muc-doi-chu: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-cap-nhat: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-sang: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-nguon && cd ../.. && bun _acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-sau-gui: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-chu && bun test ./test/messages-guard.spec.ts: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- node _acceptance/hop-tuan-tren-bang/rang/khong-doi-hinh.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-tuan-tren-bang/rang/man.mjs --phan gui": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E11 đều đạt, không eval nào đỏ; verdict PASS. Baseline không đo được (hạ tầng), xem Analyst.
