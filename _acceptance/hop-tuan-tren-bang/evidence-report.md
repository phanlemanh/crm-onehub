---
schema_version: 2
feature_slug: hop-tuan-tren-bang
verdict: REJECT
failed_evals: ["E10"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 881935b36099143cc4711d285fc5f6542dee9004
human_signoff:
---

# Evidence Report: hop-tuan-tren-bang

Round 1. Một eval không đạt: E10 (AC-10, thước quét lớp «không đổi hình»). Mười eval còn lại và bảy lệnh suite đều xanh.

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
| E10 | AC-10 | script | FAIL |
| E11 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hop-tuan-tren-bang-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_api
  verified_at: 2026-10-28T08:19:44Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/hop-tuan-tren-bang.spec.ts -t htb-muc-doi"
    test-run: dropped crm_mvruh8p43pke_test

- eval: E2
  run_id: minted-hop-tuan-tren-bang-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_ghi_chu
  verified_at: 2026-10-28T08:19:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-ghi-chu
    Ran 1 test across 1 file. [1.79s]

- eval: E3
  run_id: minted-hop-tuan-tren-bang-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_muc_doi_chu
  verified_at: 2026-10-28T08:19:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-muc-doi-chu
    Ran 1 test across 1 file. [1.70s]

- eval: E4
  run_id: minted-hop-tuan-tren-bang-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_cap_nhat
  verified_at: 2026-10-28T08:19:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-cap-nhat
    Ran 1 test across 1 file. [1.78s]

- eval: E5
  run_id: minted-hop-tuan-tren-bang-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_sang
  verified_at: 2026-10-28T08:19:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-sang
    Ran 1 test across 1 file. [2.95s]

- eval: E6
  run_id: minted-hop-tuan-tren-bang-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_nguon
  verified_at: 2026-10-28T08:19:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-nguon && cd ../.. && bun _acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs
    DUNG

- eval: E7
  run_id: minted-hop-tuan-tren-bang-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_sau_gui
  verified_at: 2026-10-28T08:19:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-sau-gui
    Ran 1 test across 1 file. [1436.00ms]

- eval: E8
  run_id: E8-ht2-hop-tuan-tren-bang
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.httb_man
  verified_at: 2026-10-28T08:19:44Z
  screenshot: evidence/htb-bang-1440-sang.png
  observed: |
    Đã mở cả 12 ảnh bằng Read. 1440 sáng/tối (bảng): hàng số đầu (Đã cập nhật 4/5, Đang bàn 2, Tự tin thấp 1, Ngày còn lại 54); Đang bàn 2 dòng và Còn lại 3 dòng, bảng NĂM cột (KR và vì sao đang bàn, Tiến độ, Ghi chú mới nhất, Mức đổi, nút Cập nhật); mỗi dòng có ghi chú «…» kèm ngày (28/10, 05/10) hoặc «Chưa có ghi chú», ô mức đổi hai dòng (vd «+0,3 điểm / 4,7 → 5 · so với 19/10»), nút «Cập nhật» đọc trọn, nằm trong khung. Ngăn 1440: đầu ngăn «Giữ điểm hài lòng trên 4,5», «2/5 · theo thứ tự bảng», hai nút ‹ ›, nút Cập nhật xanh, nút đóng.
    768 sáng/tối: tên KR + nút Cập nhật trên cùng, bên dưới tên KR là nhãn «Ghi chú mới nhất» với ghi chú và «Mức đổi» hai dòng; cột Tiến độ còn, ghi chú/mức đổi chuyển xuống dưới tên KR; không tràn. Ngăn 768: «2/5 · theo thứ tự bảng», ‹ ›, Cập nhật.
    375 sáng/tối: danh sách thẻ một cột, mỗi thẻ có tên KR, tiến độ, ghi chú (hoặc Chưa có ghi chú) kèm ngày, Mức đổi hai dòng, nút Cập nhật nằm trong thẻ, không tràn ngang (thanh điều hướng khu cuộn ngang trong chính nó). Ngăn 375 (dạng ngăn dưới): «2/5 · theo thứ tự bảng», hai nút ‹ ›, nút Cập nhật, nút đóng đều thấy rõ.
    Chế độ tối: tên KR, ghi chú, mức đổi, viền thẻ/bảng, đường biểu đồ đều đọc rõ, không chìm vào nền; chế độ sáng tương tự. Không có ảnh nào mâu thuẫn Expected.
  network_observed: n-a (driver)
  output: |
    Lệnh chạy nguyên văn (config httb_man): bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-tuan-tren-bang/rang/man.mjs --phan anh"
    phien-do: xong — mã 0. Dòng cuối: KET LUAN htb anh: 55 DUNG, 0 SAI.
    Phiên đo riêng: kho crm_ht2_hop_tuan_tren_bang_do, app localhost:4834, api localhost:4103 (không dùng 3000/3001); phiên tự dọn khi xong.
    Các mục DUNG ở cả ba khổ x sáng/tối: dòng, đếm dòng, đối chứng đếm, nút trong khung, không tràn, đối chứng tràn, không cắt chữ, đếm ngăn, ngăn kề.
    Mười hai ảnh lưu ở _acceptance/hop-tuan-tren-bang/evidence/ (htb-bang-{1440,768,375}-{sang,toi}.png và htb-ngan-{1440,768,375}-{sang,toi}.png); nhật ký chạy E8-run.log.
    Network: driver là script đo, không có đường đọc network/console, nên ghi n-a (driver).

- eval: E9
  run_id: minted-hop-tuan-tren-bang-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_chu
  verified_at: 2026-10-28T08:19:44Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-chu && bun test ./test/messages-guard.spec.ts
    Ran 182 tests across 1 file. [1.62s]

- eval: E10
  run_id: minted-hop-tuan-tren-bang-E10-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.httb_khong_doi_hinh
  verified_at: 2026-10-28T08:19:44Z
  output: |
    cmd: node _acceptance/hop-tuan-tren-bang/rang/khong-doi-hinh.mjs
    SAI AC-10: HO SO hop-thoai-giu-cho-dang-nhap#E11: cay 1 · nen 0
    THU LAI PHIEN_DO_CUA_CHAN=_acceptance/cap-nhat-tuan-okr/rang/cua-chan.mjs NGUOI=${NGUOI:-ada@trycomp.ai} EVAL=${EVAL:-} bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/toan-canh-okr/rang/man-toan-canh.mjs" EVAL=E15:
    HO SO ve-sinh-do-san-onehub#E15: cay 2 · nen 2
    DO SAN TREN NEN ve-sinh-do-san-onehub#E15
    KET LUAN khong-doi-hinh: 1 SAI
    Ghi chú: đuôi đầu ra chỉ còn dòng cuối của lớp quét; dòng «loi b: ...» và dòng «quet lop: ...» không nằm trong phần đã lưu của vòng này.

- eval: E11
  run_id: minted-hop-tuan-tren-bang-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.httb_man_gui
  verified_at: 2026-10-28T08:19:44Z
  output: |
    cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-tuan-tren-bang/rang/man.mjs --phan gui"
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-28T08:19:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-28T08:19:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-28T08:19:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-28T08:19:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-tuan-tren-bang-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-28T08:19:44Z

- cmd: bun run lint:slop
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-28T08:19:44Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-tuan-tren-bang-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-28T08:19:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»

Mọi field baseline ghi n-a; danh sách eval không-phân-biệt bên dưới KHÔNG đo được ở round này.

none — moi eval feature deu red tren baseline (co phan biet). Lưu ý: baseline BLOCKED hạ tầng nên câu này chưa được đo, chỉ là danh sách rỗng do máy không có dữ liệu.

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/hop-tuan-tren-bang.spec.ts -t htb-muc-doi": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-ghi-chu: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-muc-doi-chu: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-cap-nhat: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-sang: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-nguon && cd ../.. && bun _acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-sau-gui: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-chu && bun test ./test/messages-guard.spec.ts: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- node _acceptance/hop-tuan-tren-bang/rang/khong-doi-hinh.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-tuan-tren-bang/rang/man.mjs --phan gui": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»

### Lệnh fail không gắn eval

Không có lệnh nào fail mà không gắn eval. Lệnh fail duy nhất là `node _acceptance/hop-tuan-tren-bang/rang/khong-doi-hinh.mjs`, gắn với E10.

### Lệnh E10 fail

Thước quét lớp của AC-10 báo một mục «SAI AC-10» (hồ sơ hop-thoai-giu-cho-dang-nhap, eval E11: cây khác 0, nền 0) và một mục «DO SAN TREN NEN» (hồ sơ ve-sinh-do-san-onehub, eval E15: nền đỏ sẵn). KET LUAN của thước: 1 SAI.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10 failed — thước quét lớp AC-10 báo «SAI AC-10: HO SO hop-thoai-giu-cho-dang-nhap#E11: cây 1 · nền 0» (KET LUAN khong-doi-hinh: 1 SAI); mười eval còn lại và bảy lệnh suite xanh. Returned to implementation.
