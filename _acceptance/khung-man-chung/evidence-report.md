---
schema_version: 2
feature_slug: khung-man-chung
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 79644af280acd9972dee0d3bef6b5b4d76ead62c
human_signoff:
---

# Evidence Report: khung-man-chung

Round 1. Mọi eval máy đạt; còn một mục judgment (E12j) chờ người quyết ở Cổng 2, nên verdict là PENDING-JUDGMENT.

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
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | ui-check | PASS |
| E12m | AC-12 | script | PASS |
| E12j | AC-12 | judgment | UNCERTAIN |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-man-chung-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_quet
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd apps/app && bun test ./test/khung-man-chung.spec.ts
    Ran 13 tests across 1 file. [475.00ms]

    __EXIT=0

- eval: E3
  run_id: minted-khung-man-chung-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_quet
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd apps/app && bun test ./test/khung-man-chung.spec.ts
    Ran 13 tests across 1 file. [475.00ms]

    __EXIT=0

- eval: E4
  run_id: minted-khung-man-chung-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_quet
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd apps/app && bun test ./test/khung-man-chung.spec.ts
    Ran 13 tests across 1 file. [475.00ms]

    __EXIT=0

- eval: E13
  run_id: minted-khung-man-chung-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_quet
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd apps/app && bun test ./test/khung-man-chung.spec.ts
    Ran 13 tests across 1 file. [475.00ms]

    __EXIT=0

- eval: E2
  run_id: minted-khung-man-chung-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_xuong
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx
    Ran 11 tests across 1 file. [729.00ms]

    __EXIT=0

- eval: E5
  run_id: minted-khung-man-chung-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_chi_tiet
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t chi-tiet && bun test ./test/khung-man-chung.spec.ts -t breadcrumb-chi-tiet

    __EXIT=0

- eval: E6
  run_id: minted-khung-man-chung-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_loi
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t loi && cd ../../packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx -t vung-tai-loi-ma
    Ran 1 test across 1 file. [573.00ms]

    __EXIT=0

- eval: E7
  run_id: minted-khung-man-chung-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_dau_trang
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t dau-trang
    Ran 1 test across 1 file. [857.00ms]

    __EXIT=0

- eval: E8
  run_id: minted-khung-man-chung-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_khoa
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t khoa
    Ran 8 tests across 1 file. [4.34s]

    __EXIT=0

- eval: E9
  run_id: minted-khung-man-chung-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_khoa
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t khoa
    Ran 8 tests across 1 file. [4.34s]

    __EXIT=0

- eval: E10
  run_id: minted-khung-man-chung-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_tai_lieu
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t tai-lieu
    Ran 3 tests across 1 file. [1105.00ms]

    __EXIT=0

- eval: E11
  run_id: minted-khung-man-chung-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_muc
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx -t tieu-de-muc && cd ../../apps/app && bun test ./test/khung-man-chung.spec.ts -t muc-nhac
    Ran 2 tests across 1 file. [127.00ms]

    __EXIT=0

- eval: E14
  run_id: minted-khung-man-chung-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmc_dem_loi
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: node _acceptance/khung-man-chung/rang/dem-khung-loi.mjs && node _acceptance/khung-man-chung/rang/dem-khung-loi.mjs --tu-kiem
    tu-kiem: goc 28 · HEAD 23 · pha-thu 24

    __EXIT=0

- eval: E12m
  run_id: minted-khung-man-chung-E12m-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kmc_man_do
  verified_at: 2026-10-13T03:29:07Z
  output: |
    cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/khung-man-chung/rang/chup-man.mjs --chi-do"
    phien-do: xong — mã 0

    __EXIT=0

- eval: E12
  run_id: minted-khung-man-chung-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmc_man
  verified_at: 2026-10-13T03:29:07Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/blissful-jepsen-65fb89/.acceptance-runs/khung-man-chung/evidence/E12-step1.png
  observed: |
    Đã mở từng ảnh bằng Read. Liên hệ 1280 đang tải: tiêu đề 'Cá nhân', mô tả, nút 'Cá nhân mới' cùng hàng tiêu đề góc phải; khung xương gồm thanh tìm kiếm, 2 chip và bảng 9 hàng; bản xong cùng tiêu đề/mô tả/nút ở cùng toạ độ, vùng nội dung bắt đầu y~160 ở cả hai. Liên hệ 375 và 767: mô tả nằm trên, nút 'Cá nhân mới' rơi xuống hàng dưới; 768: tiêu đề và nút cùng hàng, nút ở góc phải. Chiến dịch lỗi 1280/375: breadcrumb 'Chiến dịch' + khung 'Không tải được chiến dịch' + một câu + nút 'Thử lại'; Onboarding lỗi 1280/375: tiêu đề '30 ngày đầu', mô tả, nút 'Kế hoạch mới', vùng bảng chứa 'Không tải được danh mục' + câu + nút 'Thử lại'. Onboarding khoá: dòng lý do ngay dưới mô tả, nút 'Kế hoạch mới' mờ đi (disabled); Tài liệu 1280 đầu trang có 'Tìm nhanh', 'Tải nguồn lên', 'Trang mới' cùng hàng tiêu đề, 375 nút rơi xuống dưới mô tả. Điều phối 30 ngày: khung xương là 2 thẻ xếp dọc, còn bản xong là 2 cột (Khuôn kế hoạch | Phòng ban) nên hình không giống hệt dù tiêu đề/mô tả và y nội dung (160) khớp; chiến dịch khung xương là các đoạn chữ, bản xong là ô số và bảng. Các ngưỡng đo (lệch y, quan hệ đầu trang) khớp Expected; hai cặp lệch hình được chuyển cho E12j.
  network_observed: n-a (driver)
  output: |
    cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/khung-man-chung/rang/chup-man.mjs" > .acceptance-runs/khung-man-chung/log-e12.log 2>&1
    In đủ 'buoc 1: dat' ... 'buoc 5: dat', 'chup-man: dat', 'phien-do: xong — ma 0'. Phiên đo riêng kho crm_blissful_jepsen_65fb89_do (app :4656, api :4205); cổng được giải phóng sau khi xong.
    35 ảnh lưu ở .acceptance-runs/khung-man-chung/evidence/; bản sao theo bước E12-step1.png đến E12-step5.png. Không chép sang _acceptance/khung-man-chung/evidence/ (vòng S4 chép).
    Lệch cặp đang tải/xong: tiêu đề và breadcrumb trong ngưỡng 4 px, vùng nội dung trong ngưỡng 8 px (chiến dịch 116/32 -> 116/36 và nội dung 200 -> 204).

- eval: E12j
  judged_by: judge panel (3 lens, fresh context)
  verdict: UNCERTAIN
  panel_proposal: FAIL
  rationale: Hội đồng chia: hai lens (operational-feasibility, spec-alignment) đề xuất FAIL, một lens (domain-correctness) UNCERTAIN. Các ý (1), (3), (4), (5) đạt; ý (2) lệch hình ở cặp chiến dịch và cặp Điều phối 30 ngày (cặp Trường khớp lỏng). Người quyết ở Cổng 2.
  votes:
    - domain-correctness: UNCERTAIN — Các ý (1), (3), (4), (5) đạt rõ trên ảnh. Ý (2) có hai cặp lệch hình. Cặp Điều phối 30 ngày: khung xương xếp hai thẻ chồng dọc, mỗi thẻ 3 hàng nhãn/ô, còn ảnh xong là hai cột cạnh nhau, một khung trống và một thẻ ngắn. Cặp chiến dịch: khung xương là 3 đoạn chữ, còn ảnh xong là 4 ô số cộng một bảng. Design doc chỉ đòi khung chi-tiet khớp hàng tiêu đề, nên tiêu chí của câu hỏi đọc được theo hai cách; không PASS và cũng không FAIL dứt khoát.
    - operational-feasibility: FAIL — Các ý (1), (3), (4), (5) đạt: cả năm ảnh đang tải đều có tiêu đề hoặc breadcrumb "Chiến dịch"; hai ảnh lỗi cùng một hình (tiêu đề, một câu, "Thử lại"); ảnh Onboarding 375 có dòng lý do kèm liên kết nằm dưới mô tả và sát nút; ở cả hai ảnh 375 mô tả đứng trên nút. Ý (2) không đạt ở cặp chiến dịch: khung xương là ba cụm đoạn chữ (cao khoảng 440 px), còn ảnh xong là bốn ô số, hai tiêu đề mục và một bảng phân trang kéo xuống hết khung. Cặp Điều phối 30 ngày cũng lệch: khung xương xếp hai thẻ chồng dọc, mỗi thẻ ba cặp nhãn/ô; ảnh xong xếp hai cột cạnh nhau, một thẻ trạng thái rỗng và một thẻ nhỏ có nút.
    - spec-alignment: FAIL — Các ý (1), (3), (4), (5) đạt. Ý (2) hỏng ở hai trong năm cặp. Chiến dịch: khung xương là hàng tiêu đề cộng 3 đoạn chữ, còn ảnh xong là 4 ô số, tiêu đề mục và bảng 6 cột, không có đoạn nào để khớp. Điều phối 30 ngày: khung xương là 2 thẻ nhãn/ô xếp dọc toàn bề rộng (cao tới y≈748), ảnh xong là 2 thẻ cạnh nhau với khung trống (cao tới y≈430). Cặp Trường chỉ khớp lỏng: khung xương thiếu thanh Công ty/Cá nhân/Thoả thuận, hai hàng gập và tiêu đề «Trường tự tạo».
  required_evidence:
    - (domain-correctness) Quyết định của người duyệt (Cổng Bằng chứng) ghi trong design doc /Users/manh-macmini/dev/crm/.claude/worktrees/blissful-jepsen-65fb89/docs/superpowers/specs/2026-10-13-khung-man-chung-design.md, mục Hành vi hoặc Hình theo màn: với khung chi-tiet chỉ hàng tiêu đề phải khớp, vùng thân không cần cùng hình với nội dung xong. Có dòng này thì cặp chiến dịch PASS.
    - (domain-correctness) Ảnh kmc-caidat-xong-1280.png chụp lại ở trạng thái đã có ít nhất một khuôn kế hoạch (bàn đo do:man, seed khuôn), cho thấy bố cục xong là hai thẻ chồng dọc với hàng nhãn/ô như khung xương the. Hoặc người duyệt xác nhận rằng cột cạnh nhau và khung trống của ảnh hiện tại chấp nhận được. Có một trong hai thì cặp Điều phối 30 ngày PASS.
    - (domain-correctness) Ảnh kmc-chiendich-xong-1280.png chụp lại ở trạng thái bản ghi chiến dịch mà thân màn chỉ là các đoạn chữ, nếu người duyệt đòi khớp cả thân. Có ảnh đó thì ý (2) kết luận được theo chiều còn lại.
    - (operational-feasibility) Ảnh kmc-chiendich-xong-1280.png khi nội dung chiến dịch gồm đoạn chữ (không phải ô số và bảng), hoặc ảnh kmc-chiendich-dangtai-1280.png có khung xương gồm hàng ô số và bảng, để khung xương và nội dung cùng hình. Chụp lại cặp này bằng bàn đo do:man ở 1280 (chạy lại từ _acceptance/khung-man-chung/evidence/)
    - (operational-feasibility) Ảnh kmc-caidat-dangtai-1280.png (Điều phối 30 ngày) có khung xương xếp hai cột cạnh nhau với thẻ trạng thái rỗng, hoặc ảnh kmc-caidat-xong-1280.png chụp ở trạng thái đã có khuôn với hai thẻ chồng dọc mỗi thẻ có hàng nhãn/ô, để hai ảnh cùng bố cục
    - (operational-feasibility) Mục «Hành vi» hoặc bảng «Hình theo màn» của docs/superpowers/specs/2026-10-13-khung-man-chung-design.md ghi rõ ngưỡng 'cùng hình' chỉ tính hàng tiêu đề và hộp bao vùng nội dung, không tính cấu trúc bên trong (hiện tại chỉ có câu 'cùng bề rộng vùng, hàng tiêu đề cùng cao'). Nếu có câu đó, tiêu chí đổi và phán xét có thể đổi
    - (spec-alignment) Ảnh kmc-chiendich-dangtai-1280.png chụp lại với khung xương vẽ theo nội dung thật (4 ô số cộng khối bảng thay cho 3 đoạn), đặt cạnh kmc-chiendich-xong-1280.png trong _acceptance/khung-man-chung/evidence/. Hoặc design doc docs/superpowers/specs/2026-10-13-khung-man-chung-design.md sửa để nói khung chi-tiet chỉ cần khớp hàng tiêu đề, và câu hỏi E12j (2) bỏ «đoạn ra đoạn» cho chiến dịch.
    - (spec-alignment) Ảnh kmc-caidat-dangtai-1280.png (Điều phối 30 ngày) chụp lại với khung xương cùng bố cục hai cột như kmc-caidat-xong-1280.png. Hoặc một ảnh «xong» có dữ liệu khuôn thật (thẻ nhãn/ô xếp dọc) cho thấy khung xương hiện tại khớp, kèm ghi chú rằng ảnh xong cũ là trạng thái dữ liệu rỗng.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-man-chung-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T03:29:07Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-man-chung-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T03:29:07Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-man-chung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T03:29:07Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-man-chung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T03:29:07Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-man-chung-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T03:29:07Z

- cmd: bun run lint:slop
  run_id: minted-khung-man-chung-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T03:29:07Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-man-chung-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T03:29:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:

- cd apps/app && bun test ./test/khung-man-chung.spec.ts: bo qua baseline: tep apps/app/test/khung-man-chung.spec.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx: bo qua baseline: tep packages/ui/test/khung-xuong.dom.tsx co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t chi-tiet && bun test ./test/khung-man-chung.spec.ts -t breadcrumb-chi-tiet: bo qua baseline: tep apps/app/test/khung-man-chung.dom.tsx co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t loi && cd ../../packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx -t vung-tai-loi-ma: bo qua baseline: tep apps/app/test/khung-man-chung.dom.tsx co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t dau-trang: bo qua baseline: tep apps/app/test/khung-man-chung.dom.tsx co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t khoa: bo qua baseline: tep apps/app/test/khung-man-chung.dom.tsx co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t tai-lieu: bo qua baseline: tep apps/app/test/khung-man-chung.dom.tsx co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx -t tieu-de-muc && cd ../../apps/app && bun test ./test/khung-man-chung.spec.ts -t muc-nhac: bo qua baseline: tep packages/ui/test/khung-xuong.dom.tsx co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khung-man-chung/rang/dem-khung-loi.mjs && node _acceptance/khung-man-chung/rang/dem-khung-loi.mjs --tu-kiem: bo qua baseline: tep _acceptance/khung-man-chung/rang/dem-khung-loi.mjs co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy đạt (E1-E11, E12, E12m, E13, E14 và bảy lệnh suite); E12j do hội đồng judgment đề xuất FAIL (hai lens FAIL, một lens UNCERTAIN) vì khung xương lệch hình với nội dung xong ở cặp chiến dịch và Điều phối 30 ngày, nên verdict là PENDING-JUDGMENT, chờ người quyết ở Cổng 2.
