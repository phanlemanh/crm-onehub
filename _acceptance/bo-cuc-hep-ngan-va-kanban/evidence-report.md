---
schema_version: 2
feature_slug: bo-cuc-hep-ngan-va-kanban
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1504625c8c600c7f4fdf63b28cdee397ad224708
human_signoff:
---

# Evidence Report: bo-cuc-hep-ngan-va-kanban

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-2 | script | PASS |
| E8 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:24:42Z
  screenshot: evidence/E1-step1.png
  observed: |
    Đã mở cả hai frame bằng Read. E1-step1.png (375, /deals?view=board): đầu trang "Thoả thuận", nút "Thoả thuận mới", ô tìm, lọc, "Bảng cột"; thẻ "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ — Comp AI" có tên và tên công ty xuống dòng nhiều hàng, hàng người phụ trách (avatar ML + "Marcus Lindqvist") nằm riêng, giai đoạn "Demo booked" ở hàng riêng bên dưới avatar, không thấy tràn viền. Thẻ DAI nằm ở cột thứ năm, ngoài khung nhìn của ảnh nên ảnh không cho thấy trực tiếp.
    E1-step2.png (1440): bảng cột có năm cột; cột thứ năm "Decision maker bought-in re…" chứa thẻ DAI với tên, công ty xuống dòng nhiều hàng, avatar "NG" và chip giai đoạn "Decision maker bought-in review bchngpf4" xuống dòng hai hàng, không bị cắt bằng dấu chấm lửng, nằm hàng riêng dưới người phụ trách. Mép phải thẻ bị vùng cuộn ngang của bảng cắt nên mắt thường không xác nhận được rect.right; phép đo DOM (23 phần tử, không tràn, nhãn không cắt, hàng riêng true) đã đạt ở cả hai khổ, không mâu thuẫn Expected.
  network_observed: n-a (driver)
  output: |
    Ghi chú: hai bản E1-step*.png nằm ở _acceptance/bo-cuc-hep-ngan-va-kanban/evidence (chưa theo dõi trong git); log ở .acceptance-runs/bo-cuc-hep-ngan-va-kanban/log-e1.log.
    Driver là script puppeteer của kho, không có E1-network.txt (n-a (driver)).
    Kết luận không tràn viền dựa vào phép đo rect.right/scrollWidth của script (23 phần tử), không dựa vào ảnh.

- eval: E2
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:24:42Z
  screenshot: evidence/E2-step1.png
  observed: |
    E2-step1.png (bản sao của bch-ngan-thoa-thuan-375.png, khung 375, ngăn thẻ DAI): tên thoả thuận 120+ ký tự và tên công ty dài xuống dòng nhiều dòng, không tràn ngang. Khối số liệu chia hai hàng: hàng 1 "Giá trị" và "Ngày dự kiến chốt"; hàng 2 "Ở giai đoạn" (vừa xong) và "Phụ trách". Ô Phụ trách hiện NguoiPhuTrachDaibchnf9bxxxx... xuống dòng nhiều dòng trong cột, không bị cắt, không tràn ra ngoài. Khớp Expected: bốn ô, hai hàng, chữ xuống dòng không cắt.
  network_observed: n-a (driver)
  output: |
    Lệnh chạy nguyên văn: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs" (log: .acceptance-runs/bo-cuc-hep-ngan-va-kanban/log-E2.log; phiên đo tự dựng server app 4207 / api 4107, tự dọn).
    "buoc 2: dat" có trong đầu ra; "do buoc 2: 4 o, 8 o chu, 16 phan tu chu, dinh 580,580,644,644" (ô 3 và 4 có offsetTop 644 lớn hơn ô 1 là 580, tức hai hàng).
    Không có dòng "bch-man:" báo vi phạm; "do-bo-cuc: dat" và "phien-do: xong — mã 0".

- eval: E3
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:24:42Z
  screenshot: evidence/E3-step1.png
  observed: |
    E3-step1.png (375px, ngăn thẻ DAI): thấy đầu ngăn, tiêu đề thoả thuận rất dài xuống dòng nhiều hàng, tên công ty dài xuống dòng, chip giai đoạn "D..." bên phải co lại, hàng Giá trị / Ngày dự kiến chốt / Ở giai đoạn / Phụ trách xuống dòng. Thanh giai đoạn nằm dưới mép khung chụp nên không hiện trong frame này; việc không cắt chữ của 7 bước dựa vào số đo DOM, không dựa vào ảnh.
    E3-step2.png (375px, ngăn thẻ CHOT): tiêu đề xuống dòng gọn, chip giai đoạn xanh "Cl..." ở đầu ngăn, mục GIAI ĐOẠN với thanh 7 bước: các nhãn Demo, Qualified to..., Decision..., Contrac..., Decision maker bought-... xuống nhiều dòng trong ô, bước cuối có chấm xanh (status-indicator) và chữ "Clos... proc..." xuống dòng, một phần bị widget nổi tròn ở góc phải che. Không thấy chữ bị cắt bằng dấu ba chấm ở thanh bước; khớp Expected.
  network_observed: n-a (driver)
  output: |
    Lệnh chạy nguyên văn qua mot-luot.sh: bun _acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs, log ở .acceptance-runs/bo-cuc-hep-ngan-va-kanban/log-e3.log; phiên đo riêng tự dựng và tự dọn.
    Ngăn thẻ DAI: "do buoc 3 (DAI): 7 buoc", không có dòng "bch-man: thanh giai doan cat chu".
    Ngăn thẻ CHOT: "do buoc 3 (CHOT): 7 buoc", bước chốt hiện bằng status-indicator mang tên giai đoạn chốt dài, không dòng cắt chữ. Dòng "buoc 3: dat" và "do-bo-cuc: dat".

- eval: E4
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:24:42Z
  screenshot: evidence/E4-step1.png
  observed: |
    Đã mở E4-step1.png (bản chép của bch-ngan-cong-ty-375.png, khổ 375). Ngăn công ty mở dạng sheet; tiêu đề là tên công ty rất dài, một chuỗi liền ("CongTyDaibchndu3sxxxx…") xuống dòng nhiều hàng, không tràn ra ngoài, các nút làm mới / AI / ba chấm / đóng vẫn thấy đủ bên phải. Khối số liệu hai hàng hai cột: hàng 1 "Giá trị đang mở —" và "Thoả thuận đang mở 2"; hàng 2 "Lần chốt gần nhất —" và "Phụ trách —". Bốn nhãn và giá trị hiện đủ chữ, không bị cắt; khớp Expected.
  network_observed: n-a (driver)
  output: |
    "do-bo-cuc: dat" tổng; ảnh bch-ngan-cong-ty-375.png tồn tại, chụp lượt này.
    Log: .acceptance-runs/bo-cuc-hep-ngan-va-kanban/log-e4.log. Driver không đọc được network (n-a (driver)).

- eval: E5
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:24:42Z
  screenshot: evidence/E5-step1.png
  observed: |
    E5-step1.png (1440x900, chủ đề tối): bảng cột Thoả thuận phía sau lớp phủ, ngăn chi tiết "Ngắn bchnheyw" mở bên phải. Trong thẻ kanban NGAN avatar "LB Lan Bch" và chấm trạng thái xanh nằm cùng một hàng, khớp "the NGAN cung hang true". Trong ngăn: hàng ô số liệu Giá trị / Ngày dự kiến chốt / Ở giai đoạn cùng một hàng ngang; thanh GIAI ĐOẠN các bước Demo booked, Qualified to buy, Decision maker in, Contract sent, "Decision maker boug..." nằm trên một hàng, nhãn không xuống dòng. Khung chụp lúc ngăn còn đang trượt vào nên cột phải bị cắt ở mép viewport; các phép đo dựa trên DOM, khớp Expected.
  network_observed: n-a (driver)
  output: |
    Frame: _acceptance/bo-cuc-hep-ngan-va-kanban/evidence/E5-step1.png (bản chép từ bch-ngan-1440.png).
    Driver là script bun, không đọc được network (n-a (driver)).
    Ngăn rộng khoảng 979 px (68vw) lúc chụp; đây là thời điểm chụp, không phải lỗi bố cục.

- eval: E6
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:24:42Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (375 px, ngăn thẻ DAI mở ở Bảng cột): ngăn hiện từ đầu màn hình, nút đóng X, nút menu và chip giai đoạn "D..." nằm gọn trong khung 375 px; không thấy thanh cuộn ngang và không phần tử nào tràn ra mép phải. Tiêu đề "ThoaThuanDaibchnheywxxx..." và tên công ty (chuỗi dài không khoảng trắng) bị ngắt dòng, nằm trọn trong cột tiêu đề rộng khoảng 128 px (từ 120 px trở lên), không bị bóp thành khe hẹp. Các trường Giá trị, Ngày dự kiến chốt, Ở giai đoạn, Phụ trách nằm trong ngăn, xuống dòng, không tràn phải. E6-step2.png là bản sao cùng nội dung; khớp Expected.
  network_observed: n-a (driver)
  output: |
    Các bước 1-5 cũng "dat" và dòng cuối "do-bo-cuc: dat".
    Frame lưu từ ảnh script tự chụp (bước 6 không tự chụp nên dùng ảnh bước 3 cùng trạng thái 375 với ngăn thẻ DAI mở).
    Driver không đọc được network (n-a (driver)).

- eval: E7
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man_do
  verified_at: 2026-10-16T07:24:42Z
  output: |
    cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs --chi-do"
    phien-do: xong — mã 0

- eval: E8
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bch_nhan
  verified_at: 2026-10-16T07:24:42Z
  output: |
    cmd: cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/status-indicator-xuong-dong.dom.tsx
    Ran 2 tests across 1 file. [657.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-16T07:24:42Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-16T07:24:42Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-16T07:24:42Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-16T07:24:42Z

- cmd: bunx turbo run lint --force
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-16T07:24:42Z

- cmd: bun run lint:slop
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-16T07:24:42Z

- cmd: bunx turbo run build --force
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-16T07:24:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào được đo là xanh ở cả hai phía: baseline của E1-E8 đều là n-a (không đo được hoặc bỏ qua), nên chưa có eval nào được chứng minh là không phân biệt.

Baseline khong do

- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs --chi-do": baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu
- cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/status-indicator-xuong-dong.dom.tsx: bo qua baseline: tep packages/ui/test/status-indicator-xuong-dong.dom.tsx co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval chạy một lần (runs: 1), không eval nào có phương sai hay chập chờn.

## Iterations

Round 1: cả tám eval (E1-E8) đạt, các lệnh suite hồi quy đều xanh; verdict PASS.
