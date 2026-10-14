---
schema_version: 2
feature_slug: khung-man-chung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7eb58ff55581dd237397aa99549405ea4470993a
human_signoff: Phan Le Manh 2026-10-13
---

# Evidence Report: khung-man-chung

Round 3. Mọi eval máy đạt, bảy lệnh suite đạt, E12j được cả ba góc nhìn chấm PASS (cặp Cài đặt › Điều phối 30 ngày nay khung xương cũng hai cột; bước 4 của bàn đo đã ở trạng thái lưu tệp tắt).

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
| E12j | AC-12 | judgment | PASS |
| E12m | AC-12 | script | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | script | PASS |
| E15 | AC-15 | test | PASS |
| E16 | AC-16 | test | PASS |
| E17 | AC-17 | test | PASS |
| E18 | AC-18 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-man-chung-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_quet
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && bun test ./test/khung-man-chung.spec.ts
    Ran 18 tests across 1 file. [710.00ms]

- eval: E2
  run_id: minted-khung-man-chung-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_xuong
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx
    Ran 17 tests across 1 file. [683.00ms]

- eval: E3
  run_id: minted-khung-man-chung-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_quet
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && bun test ./test/khung-man-chung.spec.ts
    Ran 18 tests across 1 file. [710.00ms]

- eval: E4
  run_id: minted-khung-man-chung-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_quet
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && bun test ./test/khung-man-chung.spec.ts
    Ran 18 tests across 1 file. [710.00ms]

- eval: E5
  run_id: minted-khung-man-chung-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_chi_tiet
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t chi-tiet && bun test ./test/khung-man-chung.spec.ts -t breadcrumb-chi-tiet
    Ran 2 tests across 1 file. [121.00ms]

- eval: E6
  run_id: minted-khung-man-chung-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_loi
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t loi && cd ../../packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx -t vung-tai-loi-ma
    Ran 1 test across 1 file. [613.00ms]

- eval: E7
  run_id: minted-khung-man-chung-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_dau_trang
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t dau-trang
    Ran 1 test across 1 file. [806.00ms]

- eval: E8
  run_id: minted-khung-man-chung-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_khoa
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t khoa
    Ran 11 tests across 1 file. [2.47s]

- eval: E9
  run_id: minted-khung-man-chung-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_khoa
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t khoa
    Ran 11 tests across 1 file. [2.47s]

- eval: E10
  run_id: minted-khung-man-chung-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_tai_lieu
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t tai-lieu
    Ran 3 tests across 1 file. [896.00ms]

- eval: E11
  run_id: minted-khung-man-chung-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_muc
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx -t tieu-de-muc && cd ../../apps/app && bun test ./test/khung-man-chung.spec.ts -t muc-nhac
    Ran 2 tests across 1 file. [115.00ms]

- eval: E12
  run_id: minted-khung-man-chung-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmc_man
  verified_at: 2026-10-13T11:27:40Z
  screenshot: evidence/E12-step1.png
  observed: |
    Đã mở và đọc các ảnh: lienhe (đang tải/xong, 1280 và 375), truong, caidat, toancanh, chiendich (đang tải/xong/lỗi), tailieu (đang tải/xong/đầu trang), onboarding (lỗi, khoá), lienhe-bien-767 và 768.
    - kmc-lienhe-dangtai-1280: tiêu đề 'Cá nhân', mô tả 'Mọi cá nhân trong mạng lưới.' ở dưới tiêu đề, nút 'Cá nhân mới' cùng hàng tiêu đề ở bên phải; vùng nội dung là khung xương gồm ba ô lọc và bảng chín hàng. kmc-lienhe-xong-1280: cùng tiêu đề, mô tả, nút, vị trí không đổi; thanh tìm kiếm và bảng 25 hàng. Khớp Expected (tiêu đề có chữ lúc tải, [data-khung-xuong] hiện, tâm y tiêu đề với tâm y nút, mô tả dưới tiêu đề).
    - kmc-lienhe-dangtai/xong-375: 'Cá nhân', mô tả, rồi nút 'Cá nhân mới' nằm dưới mô tả (nút không cùng hàng tiêu đề). Khung xương ba ô rồi bảng; xong là ô tìm kiếm, Lọc và bảng hai cột. Khớp.
    - kmc-truong-dangtai/xong-1280: thanh Cài đặt bên trái, tiêu đề 'Trường' và mô tả rõ lúc tải; xương sáu thẻ dòng, xong là thanh ba thẻ 'Công ty/Cá nhân/Thoả thuận' rồi danh sách trường. Hộp tiêu đề cùng toạ độ (72/36).
    - kmc-caidat-dangtai-1280: 'Điều phối 30 ngày' và mô tả; xương hai cột, mỗi cột một đầu mục và một thẻ ba dòng. kmc-caidat-xong-1280: hai cột 'Khuôn kế hoạch' và 'Phòng ban' với thẻ rỗng và thẻ liên kết; khung hai cột khớp.
    - kmc-toancanh-dangtai-1280: 'Toàn cảnh OKR' và mô tả; xương một hàng điều khiển, bốn ô số và khối bảng. kmc-toancanh-xong-1280: thanh thẻ con và chọn quý, bốn ô số '47%, 12/13, 43/49, 8', bảng Theo đơn vị; nội dung bắt đầu ở cùng y=208.
    - kmc-chiendich-dangtai-1280: breadcrumb 'Chiến dịch' rõ ở trên cùng; xương tiêu đề, dòng mô tả, bốn ô số, một khối năm hàng. kmc-chiendich-xong-1280: breadcrumb 'Chiến dịch', tiêu đề 'Gọi lại tháng 10 (mẫu kmc)', mô tả, huy hiệu Nháp, chọn danh sách và nút 'Bắt đầu', rồi bốn ô số và bảng. Chỉ có một khối đầu trang ở cả hai ảnh.
    - kmc-chiendich-dangtai-375: breadcrumb rõ, xương tiêu đề và mô tả, lưới ô số 2x2 và khối bảng; thẻ bên phải và dòng mô tả xương chạm hoặc vượt mép phải 375 (cắt). kmc-chiendich-xong-375: nội dung vừa khung, tiêu đề, mô tả, hàng huy hiệu, nút, lưới số 2x2.
    - kmc-chiendich-loi-1280 và -375: chỉ breadcrumb 'Chiến dịch' và một khung có tiêu đề 'Không tải được chiến dịch', một câu 'Máy chủ không trả lời...', nút 'Thử lại'. kmc-onboarding-loi-1280 và -375: giữ đầu trang '30 ngày đầu' và mô tả, nút 'Kế hoạch mới', thanh lọc và đầu bảng; trong thân bảng có khung 'Không tải được danh mục', câu giải thích, nút 'Thử lại'. Hai ảnh lỗi cùng khuôn (tiêu đề, một câu, nút).
    - kmc-onboarding-khoa-1280: tiêu đề '30 ngày đầu', mô tả, dòng lý do 'Chưa có khuôn kế hoạch nào nên chưa tạo được kế hoạch. Đi tới Cài đặt › Khuôn' ngay dưới mô tả, nút 'Kế hoạch mới' bị tắt (mờ) ở bên phải tiêu đề. kmc-onboarding-khoa-375: mô tả, rồi dòng lý do có liên kết, rồi nút bị tắt bên dưới; mô tả đứng trên nút.
    - kmc-tailieu-dangtai/xong-1280: 'Tài liệu', mô tả, dòng 'Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình.', ba nút bên phải (Tìm nhanh, Tải nguồn lên bị tắt mờ, Trang mới xanh duy nhất); xương ra bảng bốn hàng. kmc-tailieu-dautrang-375: mô tả và dòng lý do đứng trên cụm nút (Tìm nhanh, Tải nguồn lên mờ, Trang mới).
    - kmc-lienhe-bien-767: bố cục di động có biểu tượng menu, tiêu đề, mô tả, nút 'Cá nhân mới' bên dưới mô tả (không cùng hàng tiêu đề). kmc-lienhe-bien-768: có thanh biểu tượng bên trái, tiêu đề 'Cá nhân' và nút 'Cá nhân mới' cùng hàng (tâm y xấp xỉ 89), mô tả nằm dưới tiêu đề.
    Kết luận: các ảnh khớp Expected; điểm lưu ý duy nhất là phần xương chiến dịch 375 bị cắt ở mép phải (không mâu thuẫn ngưỡng E12).
  network_observed: n-a (driver)

- eval: E12m
  run_id: minted-khung-man-chung-E12m-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmc_man_do
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: KHO_TAI_LIEU_BLOB_TOKEN= bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/khung-man-chung/rang/chup-man.mjs --chi-do"
    phien-do: xong — mã 0

- eval: E13
  run_id: minted-khung-man-chung-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_quet
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && bun test ./test/khung-man-chung.spec.ts
    Ran 18 tests across 1 file. [710.00ms]

- eval: E14
  run_id: minted-khung-man-chung-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmc_dem_loi
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: node _acceptance/khung-man-chung/rang/dem-khung-loi.mjs && node _acceptance/khung-man-chung/rang/dem-khung-loi.mjs --tu-kiem
    tu-kiem: goc 28 · da doi 5 · HEAD 23 · pha-thu 24

- eval: E15
  run_id: minted-khung-man-chung-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_lam_moi
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t lam-moi
    Ran 2 tests across 1 file. [1113.00ms]

- eval: E16
  run_id: minted-khung-man-chung-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_mot_dau_trang
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && bun test ./test/khung-man-chung.spec.ts -t mot-dau-trang
    Ran 2 tests across 1 file. [126.00ms]

- eval: E17
  run_id: minted-khung-man-chung-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_quet
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: cd apps/app && bun test ./test/khung-man-chung.spec.ts
    Ran 18 tests across 1 file. [710.00ms]

- eval: E18
  run_id: minted-khung-man-chung-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmc_man_thieu_hop
  verified_at: 2026-10-13T11:27:40Z
  output: |
    cmd: bun _acceptance/khung-man-chung/rang/chup-man.mjs --chieu-do=3
    chieu do: DO DUNG GHIM: ma 1, in «lienhe 767: thieu hop mo ta»

### Judgment (E12j)

Panel đề xuất: domain-correctness, operational-feasibility, spec-alignment. Đề xuất tổng: PASS. human_override để trống cho người quyết ở Cổng 2.

- eval: E12j
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ba góc nhìn cùng chấm PASS; cả năm ý của tiêu chí AC-12 đều thấy trên ảnh.
  human_override:  # chi nguoi ghi

- domain-correctness: PASS — Cả năm ý đều có trên ảnh. (1) Mọi ảnh đang tải đều có chữ nói màn nào: "Cá nhân", "Trường", "Điều phối 30 ngày", "Toàn cảnh OKR", và breadcrumb "Chiến dịch" ở chi tiết chiến dịch. (2) Năm cặp đang tải/xong cùng hình: bảng ra bảng, danh sách ra dòng, hai cột ra hai cột, bốn ô số cộng thẻ bảng ra bốn ô số cộng bảng. Chỗ lệch chỉ là vị trí chip ở Liên hệ, hàng tab của Trường và khoảng cách dọc ở chiến dịch, không đổi hình. (3) Hai ảnh lỗi cùng dạng tiêu đề, mô tả, nút "Thử lại", đúng bảng trạng thái. (4) Onboarding khoá có dòng lý do ngay dưới mô tả, sát nút "Kế hoạch mới" đang tắt. (5) Ở hai ảnh 375, câu mô tả đứng trên các nút.
- operational-feasibility: PASS — Cả năm ý đều có trong ảnh. (1) Năm ảnh đang tải đều có chữ nói rõ đang ở màn nào: tiêu đề «Cá nhân», «Trường», «Điều phối 30 ngày», «Toàn cảnh OKR», và breadcrumb «Chiến dịch». (2) Năm cặp cùng hình: bảng ra bảng (Liên hệ), dòng ra dòng (Trường), hai cột ra hai cột (Điều phối 30 ngày), ô số + khối hàng ra ô số + bảng (Toàn cảnh, chiến dịch). (3) Hai ảnh lỗi cùng một hình gồm tiêu đề, một đoạn mô tả và nút «Thử lại». (4) và (5) Onboarding khoá có dòng lý do ngay trên nút tắt, và ở cả hai ảnh 375 câu mô tả đứng trên các nút.
- spec-alignment: PASS — Cả năm ý đều có trên ảnh. (1) Năm ảnh đang tải đều có chữ nói đang ở đâu: tiêu đề Cá nhân, Trường, Điều phối 30 ngày, Toàn cảnh OKR, và breadcrumb «Chiến dịch» ở chi tiết chiến dịch. (2) Năm cặp cùng hình: bảng ra bảng, 6 dòng ra dòng, hai cột ra hai cột, 4 ô số + thẻ ra 4 ô số + bảng, 4 ô số + thẻ ra 4 ô số + bảng thành viên. Chiều cao hai ô số lệch, và cặp Trường thiếu thanh thẻ trong khung xương, nhưng đều nằm trong hình design doc khai. (3) Hai ảnh lỗi cùng dạng tiêu đề, một câu, nút «Thử lại». (4) và (5) Ở 375, Onboarding có thứ tự tiêu đề, mô tả, dòng lý do kèm liên kết «Đi tới Cài đặt › Khuôn», rồi nút tắt. Tài liệu có mô tả, dòng «Chưa bật lưu tệp nguồn», rồi các nút. Cả hai khớp mục «Hành vi» và bảng trạng thái ST-dautrang-khoa, ST-tailieu-nguontat.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-man-chung-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-13T11:27:40Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-man-chung-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-13T11:27:40Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-man-chung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-13T11:27:40Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-man-chung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-13T11:27:40Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-man-chung-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-13T11:27:40Z

- cmd: bun run lint:slop
  run_id: minted-khung-man-chung-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-13T11:27:40Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-man-chung-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-13T11:27:40Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

Baseline khong do: evals.yaml khong doi tu lan baseline cuoi (round 2), nen moi block eval ghi baseline n-a. Lenh suite xanh ca hai phia la regression-guard binh thuong, khong liet ke.

Eval khong-phan-biet: none (khong co eval nao duoc liet ke).

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, khong co eval ngau nhien)

## Iterations

Round 1: 18 eval trả về, tổng kết PENDING-JUDGMENT; trả về triển khai (thêm AC-15…AC-18, chỉnh AC-2, 3, 5, 9, 12).
Round 2: mọi eval máy xanh, 7 lệnh suite xanh; E12j bị cả ba góc nhìn chấm không đạt ở cặp Cài đặt › Điều phối 30 ngày (khung xương hai thẻ xếp dọc, nội dung xong hai cột) — REJECT, trả về triển khai.
Round 3: Điều phối 30 ngày khung xương hai cột, bàn đo đo Tài liệu ở trạng thái lưu tệp tắt; mọi eval máy đạt, 7 lệnh suite đạt, E12j được ba góc nhìn chấm PASS — PASS.

### Re-pin lần 1 — 2026-10-13, do gộp onehub 206096fc2 sau verify, làn trước chữ ký
run_id: repin-20261013T141643Z-16434
sha: c6c9659e6499f624fba2e2ee5ab31002d3c0567d · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12, E12j (E12j không khai paths) · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-13, do gộp onehub b7b922b78 trước lô 20:00Z
run_id: repin-20261013T194305Z-34344
sha: e5f4e115b391a492637a4d4c77f4ec02b5fc1fa9 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12, E12j (E12j không khai paths) · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-14, do sửa params ngoài Suspense ở năm trang bản ghi (hồi quy #388)
run_id: repin-20261014T013410Z-32500
sha: f92354b32c8d43587d275e1e87cfc734a42e6c00 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12, E12j (E12j không khai paths) · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 4 — 2026-10-14, do gộp onehub 966eeb78e (V2e) vào bản sửa params
run_id: repin-20261014T025435Z-56897
sha: 7eb58ff55581dd237397aa99549405ea4470993a · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12, E12j (E12j không khai paths) · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
