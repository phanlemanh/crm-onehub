---
schema_version: 2
feature_slug: go-tin-hieu-rac
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8d2b8a2f13d1266c4fda29ba01c8779664ec7833
human_signoff:
---

# Evidence Report: go-tin-hieu-rac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E5c | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8a | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | ui-check | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-6 | judgment | PASS |
| E12 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-go-tin-hieu-rac-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_luu_tru
  verified_at: 2026-10-19T15:45:20Z
  output: |
    test-run: dropped crm_mvffewap0ktz_test

- eval: E2
  run_id: minted-go-tin-hieu-rac-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_keo_ve
  verified_at: 2026-10-19T15:45:20Z
  output: |
    test-run: dropped crm_mvffew9n59e5_test

- eval: E3
  run_id: minted-go-tin-hieu-rac-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_da_lay_ve
  verified_at: 2026-10-19T15:45:20Z
  output: |
    test-run: dropped crm_mvffewffpleu_test

- eval: E4
  run_id: minted-go-tin-hieu-rac-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_quyen
  verified_at: 2026-10-19T15:45:20Z
  output: |
    test-run: dropped crm_mvffexexvapv_test

- eval: E4b
  run_id: minted-go-tin-hieu-rac-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.gth_vai
  verified_at: 2026-10-19T15:45:20Z
  output: |
    test-run: dropped crm_mvffevnudift_test

- eval: E5
  run_id: minted-go-tin-hieu-rac-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_khoi_phuc
  verified_at: 2026-10-19T15:45:20Z
  output: |
    test-run: dropped crm_mvffex7s32aj_test

- eval: E5b
  run_id: minted-go-tin-hieu-rac-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_hoan_tac
  verified_at: 2026-10-19T15:45:20Z
  output: |
    Ran 1 test across 1 file. [1187.00ms]

- eval: E5c
  run_id: minted-go-tin-hieu-rac-E5c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtr_do_man
  verified_at: 2026-10-19T15:45:20Z
  screenshot: evidence/E5c-vua-luu-tru-1280.png
  observed: |
    E5c-vua-luu-tru-1280.png (1280, dark): trang «Mọi tín hiệu» tab «Tất cả»; ô «Tín hiệu 30 ngày qua» = 3, «Phòng ban có tín hiệu» = 2, «Quá 7 ngày chưa có chỗ» = 0; bảng chỉ còn crm-4, crm-3, crm-1 (không có crm-2), chân bảng «3 tín hiệu»; toast xanh «Đã lưu trữ tín hiệu crm-2.» kèm nút «Hoàn tác». Khớp Expected bước 2 (X rời bảng, số 4 thành 3, toast và Hoàn tác).
    E5c-da-luu-tru-1280.png: nút «Đã lưu trữ» đang bật; ô 30 ngày vẫn = 3; bảng cột Mã | Điều đã kể | Người gửi | Phòng ban | Gửi lúc | Lưu trữ lúc | Người lưu trữ, một dòng crm-2 «Đo TH5: test test», Lưu trữ lúc 22:48 19-10, Người lưu trữ «Ada Okafor» (owner mẫu); chân bảng «1 tín hiệu đã lưu trữ». Khớp Expected bước 4.
  network_observed: n-a (driver)
  output: |
    Dong KET LUAN: "KET LUAN: 19 DUNG, 0 SAI — ma thoat 0". Moi assertion cua E5c DUNG: doi-chung-dong-hien (crm-2 hien 1 lan), ba-so-truoc (o 4, api 4), luu-tru-menu, luu-tru-roi-bang, luu-tru-toast (co nut Hoan tac), ba-so-sau-luu-tru (o 3, api 3), hoan-tac-ve, ba-so-sau-hoan-tac (4=api 4), da-luu-tru-cot (Người lưu trữ = Ada Okafor), khoi-phuc-roi, khoi-phuc-ve-dang-dung, ba-so-sau-khoi-phuc (4=api 4). Bon moc so 4 / 3 / 4 / 4 deu bang API.
    Chieu do (ban sao) khong chay trong luot nay; do-man.mjs chi dua cac thong diep ghim vao dong ba-so-sau-luu-tru; chi tinh la khong kiem rieng.
    Frame da luu va da mo bang Read: E5c-vua-luu-tru-1280.png, E5c-da-luu-tru-1280.png, E6b-da-lay-ve-1280.png, E8b-nguoi-gui-1280.png, E9b-da-luu-tru-375.png, E9b-dang-dung-375.png. Network: E5c-network.txt (n-a driver, puppeteer). Khong con server nao chay tren cac cong do.

- eval: E6
  run_id: minted-go-tin-hieu-rac-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_thanh_cong_cu
  verified_at: 2026-10-19T15:45:20Z
  output: |
    Ran 5 tests across 1 file. [1227.00ms]

- eval: E6b
  run_id: minted-go-tin-hieu-rac-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtr_do_man
  verified_at: 2026-10-19T15:45:20Z
  screenshot: evidence/E6b-da-lay-ve-1280.png
  observed: |
    Đã mở bằng Read E6b-da-lay-ve-1280.png (1280x900, giao diện tối, trang «Mọi tín hiệu» tab «Tất cả», chế độ đang dùng, 4 dòng crm-4..crm-1, ô «Tín hiệu 30 ngày qua» = 4, «Phòng ban có tín hiệu» = 2). Menu thao tác của dòng crm-1 đang mở: mục «Lưu trữ» mờ (khoá) và ngay dưới là dòng «Đội sản phẩm đã lấy về — không lưu trữ được nữa.»; toast «Đã khôi phục tín hiệu crm-2.» ở góc dưới trái (từ bước khôi phục trước đó trong cùng lượt). Khớp Expected: mục Lưu trữ khoá và dòng lý do hiện. Dòng «tai-lai-giu» không có frame riêng, kiểm bằng assertion trong log: sau reload nút «Đã lưu trữ» aria-pressed=true và bảng có cột «Lưu trữ lúc».
  network_observed: n-a (driver)
  output: |
    Cac dong khac cung luot (E5c/E8b/E9b) deu DUNG: doi-chung-dong-hien, ba-so-truoc/sau, luu-tru-*, hoan-tac-ve, da-luu-tru-cot, khoi-phuc-*, nguoi-gui-nhan/doi-chung, 375-*.
    Frame luu: evidence/E6b-da-lay-ve-1280.png (anh goc do-man.mjs sinh), E6b-step1.png, E6b-step2.png (ban sao cung anh vi steps chi sinh mot anh E6b; khong co anh rieng cho tai-lai-giu — dong do chi kiem bang assertion trong log). E6b-network.txt ghi driver la puppeteer script, khong co duong doc network.
    Server do la phien do cua mot-luot.sh, tu dong don khi xong.

- eval: E7
  run_id: minted-go-tin-hieu-rac-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_ba_so
  verified_at: 2026-10-19T15:45:20Z
  output: |
    test-run: dropped crm_mvffevvq9zsk_test

- eval: E7b
  run_id: minted-go-tin-hieu-rac-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_ba_so_giu
  verified_at: 2026-10-19T15:45:20Z
  output: |
    Ran 1 test across 1 file. [1254.00ms]

- eval: E8
  run_id: minted-go-tin-hieu-rac-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_nguoi_gui
  verified_at: 2026-10-19T15:45:20Z
  output: |
    Ran 2 tests across 1 file. [704.00ms]

- eval: E8a
  run_id: minted-go-tin-hieu-rac-E8a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_cua_toi
  verified_at: 2026-10-19T15:45:20Z
  output: |
    test-run: dropped crm_mvfff3fcdfuf_test

- eval: E8b
  run_id: minted-go-tin-hieu-rac-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtr_do_man
  verified_at: 2026-10-19T15:45:20Z
  screenshot: evidence/E8b-step1.png
  observed: |
    Frame E8b-nguoi-gui-1280.png (1280x900, giao diện tối, đăng nhập là người gửi, trang «Tín hiệu đã gửi»): bảng có 2 dòng. Dòng 1 «Đo TH5: báo cáo tuần thiếu cột doanh số», crm-4, trạng thái «Đang xem xét» kèm «Đội sản phẩm chưa xếp nó vào nhóm nào.» (dòng chưa lưu trữ, nhãn khác — đúng đối chứng). Dòng 2 «Đo TH5: gửi nhầm», crm-3, nhãn «Đã lưu trữ» kèm câu «Quản trị đã lưu trữ tín hiệu này — đội sản phẩm sẽ không xem xét nó.» Khớp Expected. Không thấy lỗi trên màn hình.
  network_observed: n-a (driver)
  output: |
    Cac dong khac cung luot cung DUNG (doi-chung-dong-hien, ba-so-*, luu-tru-*, hoan-tac-ve, da-luu-tru-cot, khoi-phuc-*, da-lay-ve-khoa, tai-lai-giu, 375-*).
    Frame da luu (doc bang Read): evidence/E8b-nguoi-gui-1280.png va ban sao evidence/E8b-step1.png.
    Driver la script puppeteer (do-man.mjs), khong phai browser tool doc network, nen khong co E8b-network.txt. Server la phien do do chinh script tu khoi dong va tu don.

- eval: E9
  run_id: minted-go-tin-hieu-rac-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtr_ca_man
  verified_at: 2026-10-19T15:45:20Z
  output: |
    Ran 6 tests across 1 file. [1.98s]

- eval: E9b
  run_id: minted-go-tin-hieu-rac-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtr_do_man
  verified_at: 2026-10-19T15:45:20Z
  screenshot: evidence/E9b-dang-dung-375.png
  observed: |
    E9b-dang-dung-375.png (rộng 375): trang «Mọi tín hiệu», tab Tất cả, các ô số (30 ngày qua = 4), bộ lọc, bảng có các cột Điều đã kể / Người gửi / Trạng thái; mỗi dòng đang hiện có nút thao tác (dấu ba chấm dọc) nằm trọn ở mép phải trong khung, không có thanh cuộn ngang.
    E9b-da-luu-tru-375.png: cùng trang ở chế độ đã lưu trữ, ô 30 ngày = 3, 1 dòng (Ada Okafor là người lưu trữ), nút thao tác nằm trong khung, câu «1 tín hiệu đã lưu trữ» ở dưới; không tràn ngang. Khớp Expected (scrollWidth 375, right <= 375).
  network_observed: n-a (driver)
  output: |
    - DUNG 375-doi-chung: chen khoi 600px: rong 600/375 — phep do bao tran (dung chung duong)
    Cac dong khac cua cung luot (E5c/E6b/E8b) cung DUNG.
    Frame luu: evidence/E9b-dang-dung-375.png, evidence/E9b-da-luu-tru-375.png; ban sao E9b-step1.png (=dang-dung), E9b-step2.png (=da-luu-tru). Network: driver puppeteer, E9b-network.txt ghi chu ly do.

- eval: E10
  run_id: minted-go-tin-hieu-rac-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtr_migration
  verified_at: 2026-10-19T15:45:20Z
  output: |
    migration 20261019150000_go_tin_hieu_rac · so cau lenh: 6

- eval: E12
  run_id: minted-go-tin-hieu-rac-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtr_thiet_ke
  verified_at: 2026-10-19T15:45:20Z
  output: |
    so tep: 5/5

- eval: E11
  judged_by: judge panel (3 lens, fresh context) — đề xuất, T3 nên chờ người
  verdict: PASS
  rationale: Ba lens cùng đề xuất PASS; đây là đề xuất của máy, không phải chữ ký.
  votes:
    - domain-correctness: PASS — Các khoá được xét đều khớp bảng «Bộ chữ» của docs/vong-doi.md. Hành động cất và lấy lại dùng «Lưu trữ» và «Khôi phục» (en: Archive và Restore). Chỗ xem thứ đã cất (nut, nhan.daLuuTru) là «Đã lưu trữ» (en: Archived), không có «Lưu trữ» trần cho nút xem. Bản vi không có «ẩn», «xoá mềm» hay «archive». Bản en và bản vi cùng nghĩa ở từng khoá, kể cả trangThai.daLuuTru, các thông báo lỗi, cotLuc, cotNguoi, rongTieuDe, rongMoTa và meta.
    - operational-feasibility: PASS — Trong bản vi, các khoá hành động (luuTru, khoiPhuc, khongLuuTruDuoc, daLuuTru, daKhoiPhuc, luuTruHong, khoiPhucHong, vuaLayVe, cotLuc, cotNguoi, rongTieuDe, rongMoTa, meta) đều dùng «Lưu trữ · Khôi phục». Các khoá nhãn xem (luuTru.nut, nhan.daLuuTru, trangThai.daLuuTru) dùng «Đã lưu trữ», không có «Lưu trữ» trần ở nút xem, và không có «ẩn», «xoá mềm» hay «archive». Bản en khớp nghĩa từng khoá. Chỗ lệch duy nhất là rongMoTa: en nói «you archive», vi nói «quản trị lưu trữ». Trang này chỉ chủ và quản trị CRM thấy, nên hai bản vẫn cùng nghĩa.
    - spec-alignment: PASS — Cả 15 khoá con của tatCa.luuTru, nhan.daLuuTru và trangThai.daLuuTru đều theo bảng «Bộ chữ». Hành động cất và lấy lại dùng «Lưu trữ · Khôi phục» (en: Archive · Restore). Chỗ xem đồ đã cất dùng «Đã lưu trữ» (nut, nhan.daLuuTru), không có «Lưu trữ» trần cho nút xem. Bản vi không có «ẩn», «xoá mềm», «archive». Bản en khớp nghĩa từng khoá. Chỉ có một lệch nhỏ ở rongMoTa: vi ghi «Tín hiệu quản trị lưu trữ» còn en ghi «Signals you archive». Người đọc trang này vốn là chủ hoặc quản trị CRM, nên nghĩa không đổi.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-go-tin-hieu-rac-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-19T15:45:20Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-go-tin-hieu-rac-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-19T15:45:20Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-go-tin-hieu-rac-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-19T15:45:20Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-go-tin-hieu-rac-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-19T15:45:20Z

- cmd: bunx turbo run lint --force
  run_id: minted-go-tin-hieu-rac-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-19T15:45:20Z

- cmd: bun run lint:slop
  run_id: minted-go-tin-hieu-rac-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-19T15:45:20Z

- cmd: bunx turbo run build --force
  run_id: minted-go-tin-hieu-rac-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-19T15:45:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả nhánh lẫn baseline):
- bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts" (E4b): baseline green. Spec này tự quét mọi thủ tục của các router trong danh sách phạm vi chung, nên xanh trên cây cũ là điều có thể đoán; người quyết ở Cổng 2 xác nhận đây là regression-guard có chủ ý hay cần viết lại để khẳng định riêng luuTru và khoiPhuc.

Baseline khong do:
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu-luu-tru.spec.ts -t gtr-luu-tru": bo qua baseline: tep apps/api/test/tin-hieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu-luu-tru.spec.ts -t gtr-keo-ve": bo qua baseline: tep apps/api/test/tin-hieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu-luu-tru.spec.ts -t gtr-da-lay-ve": bo qua baseline: tep apps/api/test/tin-hieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu-luu-tru.spec.ts -t gtr-quyen": bo qua baseline: tep apps/api/test/tin-hieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu-luu-tru.spec.ts -t gtr-khoi-phuc": bo qua baseline: tep apps/api/test/tin-hieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tin-hieu-luu-tru.dom.tsx -t hoan-tac: bo qua baseline: tep apps/app/test/tin-hieu-luu-tru.dom.tsx co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tin-hieu-luu-tru.dom.tsx -t thanh-cong-cu: bo qua baseline: tep apps/app/test/tin-hieu-luu-tru.dom.tsx co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu-luu-tru.spec.ts -t gtr-ba-so": bo qua baseline: tep apps/api/test/tin-hieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tin-hieu-luu-tru.dom.tsx -t ba-so-giu: bo qua baseline: tep apps/app/test/tin-hieu-luu-tru.dom.tsx co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tin-hieu-luu-tru.dom.tsx -t nguoi-gui: bo qua baseline: tep apps/app/test/tin-hieu-luu-tru.dom.tsx co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu-luu-tru.spec.ts -t gtr-cua-toi": bo qua baseline: tep apps/api/test/tin-hieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tin-hieu-luu-tru.dom.tsx -t ca-man: bo qua baseline: tep apps/app/test/tin-hieu-luu-tru.dom.tsx co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/go-tin-hieu-rac/rang/migration-chi-them.mjs: bo qua baseline: tep _acceptance/go-tin-hieu-rac/rang/migration-chi-them.mjs co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/go-tin-hieu-rac/rang/khong-ghi-de.mjs: bo qua baseline: tep _acceptance/go-tin-hieu-rac/rang/khong-ghi-de.mjs co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy xanh; verdict PENDING-JUDGMENT vì còn một mục trong hợp đồng cần người xem (xem review-findings.md) và E11 là judgment chờ người ký ở Cổng 2.
