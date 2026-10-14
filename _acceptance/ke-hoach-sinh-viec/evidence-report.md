---
schema_version: 2
feature_slug: ke-hoach-sinh-viec
verdict: REJECT
failed_evals: [E3b]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c2550f4ee8ab1862c89d36dd4cc723efc2cb0909
human_signoff:
---

# Evidence Report: ke-hoach-sinh-viec

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | ui-check | FAIL |
| E4 | AC-4 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E7b | AC-6 | script | PASS |
| E8 | AC-7 | test | PASS |
| E8b | AC-7 | test | PASS |
| E13 | AC-8 | test | PASS |
| E14 | AC-9 | judgment | PENDING-JUDGMENT (hội đồng đề xuất PASS, chờ người) |
| E15 | AC-10 | script | PASS |
| E16 | AC-4 | script | PASS |
| E17 | AC-3 | script | PASS |

Phán quyết tổng: REJECT. Một eval máy đỏ (E3b, màn tạo kế hoạch chạy thật dừng ở bước 4). Ba lệnh suite hồi quy cũng đỏ và không gắn eval nào, xem mục Analyst.

## Evidence

- eval: E1
  run_id: minted-ke-hoach-sinh-viec-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_tao
  verified_at: 2026-10-14T16:50:25Z
  output: |
    -t kh-tao của apps/api/test/ke-hoach-sinh-viec.spec.ts: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8cjmhty1no_test

- eval: E2
  run_id: minted-ke-hoach-sinh-viec-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_chon_nguoi
  verified_at: 2026-10-14T16:50:25Z
  output: |
    -t kh-chon-nguoi: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8cjmh5x4ed_test

- eval: E3
  run_id: minted-ke-hoach-sinh-viec-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_man_tao
  verified_at: 2026-10-14T16:50:25Z
  output: |
    Ran 3 tests across 1 file. [1428.00ms]

- eval: E3b
  run_id: minted-ke-hoach-sinh-viec-E3b-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.kh_man
  verified_at: 2026-10-14T16:50:25Z
  screenshot: evidence/E3b-step1.png
  observed: |
    Đã mở từng frame bằng Read. Frame 1 (E3b-step1, 1280px): ô trượt "Tạo kế hoạch từ khuôn" có đúng hai hàng phòng ban, "Kinh doanh k8ckaqk" chọn sẵn "Lê Quang Vinh" (trưởng phòng) và "Kế toán k8ckaqk" chọn sẵn "Phạm Thu Hà" kèm ghi chú "Phòng chưa có trưởng phòng — mặc định người cầm trịch"; khớp Expected cho lối danh mục. Nút Lưu bị avatar nổi che một phần.
    Frame 2 (E3b-step2): sheet công ty "Công ty An Phát k8ckaqk" ở tab "30 ngày đầu", trạng thái rỗng "Chưa có kế hoạch 30 ngày" với nút "+ Tạo kế hoạch"; ô tạo KHÔNG mở nên không thấy hàng phòng ban của lối sheet công ty, frame chỉ chứng minh được một phần. Frame 3 (E3b-step3, 375px): ô toàn chiều rộng, không thanh cuộn ngang, hai hàng phòng ban xếp dọc, khớp vế 375.
    Frame thẻ Bước (người làm mỗi bước + chip trạng thái Việc) KHÔNG có: bước 4 của script lỗi PrismaClientValidationError tại tx.viec.create (packages/db/src/viec-ghi.ts:238, hàm taoViec) nên kế hoạch không được tạo. Vế cuối của Expected không đạt.
  network_observed: n-a (driver)
  output: |
    Script kh_man thoát mã khác 0 (đề bài đòi dòng "ke-hoach-sinh-viec man: dat"; thực tế dòng cuối là "ke-hoach-sinh-viec man: hong 1").
    Bước 1, 2, 3 đạt, sinh ba ảnh kh-o-tao-danh-muc-1280, kh-o-tao-cong-ty-1280, kh-o-tao-375. Bước 4 ném PrismaClientValidationError; ảnh kh-the-buoc-viec-1280.png không được sinh.
    Frame đã lưu: E3b-step1.png, E3b-step2.png, E3b-step3.png, kèm E3b-network.txt (driver không đọc được network). Máy không sửa mã.

- eval: E4
  run_id: minted-ke-hoach-sinh-viec-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_ban_chieu
  verified_at: 2026-10-14T16:50:25Z
  output: |
    -t kh-ban-chieu: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8cjngou8bo_test

- eval: E5
  run_id: minted-ke-hoach-sinh-viec-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_chan
  verified_at: 2026-10-14T16:50:25Z
  output: |
    -t kh-chan: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8cjmdscv4h_test

- eval: E6
  run_id: minted-ke-hoach-sinh-viec-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_go_buoc
  verified_at: 2026-10-14T16:50:25Z
  output: |
    -t kh-go-buoc: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8cjnzsrjpg_test

- eval: E7
  run_id: minted-ke-hoach-sinh-viec-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_them_buoc
  verified_at: 2026-10-14T16:50:25Z
  output: |
    -t kh-them-buoc: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8cjmo3vvn6_test

- eval: E7b
  run_id: minted-ke-hoach-sinh-viec-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kh_e6_xanh
  verified_at: 2026-10-14T16:50:25Z
  output: |
    dpv_bo_phan_hong · bo-phan-hong: 1 ca qua

- eval: E8
  run_id: minted-ke-hoach-sinh-viec-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_ke_hoach_cu
  verified_at: 2026-10-14T16:50:25Z
  output: |
    -t kh-ke-hoach-cu: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8cjnncdre1_test

- eval: E8b
  run_id: mv8cjoho755z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_nhac_buoc
  verified_at: 2026-10-14T16:50:25Z
  output: |
    -t kh-nhac-buoc của apps/agent/test/ke-hoach-sinh-viec.integration.spec.ts: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8cjoho755z_test

- eval: E13
  run_id: mv8cjnfqew3l
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_thuoc
  verified_at: 2026-10-14T16:50:25Z
  output: |
    apps/api/test/ke-hoach-sinh-viec-do-nguong.spec.ts: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8cjnfqew3l_test

- eval: E15
  run_id: minted-ke-hoach-sinh-viec-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kh_hoi_quy
  verified_at: 2026-10-14T16:50:25Z
  output: |
    khong-xoa-expect --tu-thu rồi --moc c1864a3a2 rồi check-types: cả ba bước qua

- eval: E16
  run_id: minted-ke-hoach-sinh-viec-E16-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kh_dot_bien
  verified_at: 2026-10-14T16:50:25Z
  output: |
    dot-bien: 9/9 cap dat

- eval: E17
  run_id: minted-ke-hoach-sinh-viec-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kh_san_thiet_ke
  verified_at: 2026-10-14T16:50:25Z
  output: |
    kh san: 3 tep, 0 vi pham

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ke-hoach-sinh-viec-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-14T16:50:25Z
  output: |
    api: 1827 qua, 5 bỏ qua, 7 đỏ, 214 tệp, 1839 ca. Bảy ca đỏ đều hiện tên "(unnamed)".

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ke-hoach-sinh-viec-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-14T16:50:25Z
  output: |
    app: 813 qua, 1 đỏ, 79 tệp, 814 ca.
    Ca đỏ: khoa chet > moi khoa da khai deu co cho goi, tru ban khai CHUA_NOI

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ke-hoach-sinh-viec-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-14T16:50:25Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ke-hoach-sinh-viec-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-14T16:50:25Z

- cmd: bunx turbo run lint --force
  run_id: minted-ke-hoach-sinh-viec-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-14T16:50:25Z

- cmd: bun run lint:slop
  run_id: minted-ke-hoach-sinh-viec-SUITE-bun_run_lint_slop-r1
  exit_code: 1
  verified_at: 2026-10-14T16:50:25Z
  output: |
    oxlint: 2 lỗi, 0 cảnh báo, cả hai nằm trong tệp kiểm của chính vòng này.
    anti-slop(no-conditional-empty-object-spread) tại apps/api/test/ke-hoach-sinh-viec.spec.ts:86
    anti-slop(no-unknown-parameters) tại apps/app/test/tao-ke-hoach-nguoi.dom.tsx:19 (tham số input kiểu unknown)

- cmd: bunx turbo run build --force
  run_id: minted-ke-hoach-sinh-viec-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-14T16:50:25Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: mọi eval máy đều có baseline n-a (xem «Baseline khong do» dưới), nên dòng trên nghĩa là không eval nào được đo là xanh ở cả hai phía, KHÔNG phải mọi eval đã được đo là đỏ ở baseline.

Lệnh fail không gắn eval (REJECT vì chúng chưa được người phân loại; máy không đoán là hồi quy hay đã đỏ sẵn từ trước):
- bun run test -- --filter=api: 7 ca đỏ không tên, 1827 ca qua.
- bun run test -- --filter=app --filter=@crm/ui: 1 ca đỏ «khoa chet > moi khoa da khai deu co cho goi, tru ban khai CHUA_NOI».
- bun run lint:slop: 2 lỗi, cả hai nằm trong tệp kiểm do vòng này thêm (apps/api/test/ke-hoach-sinh-viec.spec.ts:86 và apps/app/test/tao-ke-hoach-nguoi.dom.tsx:19).
- ui-check:E3b: gắn với E3b, nguyên nhân ở mục Iterations.

Ghi chú về thời điểm: máy không cấp thời điểm riêng cho từng eval, nên `verified_at` ở mọi khối là ngày lập báo cáo, không phải giờ chạy.

### Baseline khong do

- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-tao": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-chon-nguoi": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tao-ke-hoach-nguoi.dom.tsx: bo qua baseline: tep apps/app/test/tao-ke-hoach-nguoi.dom.tsx co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-ban-chieu": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-chan": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-go-buoc": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-them-buoc": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ke-hoach-sinh-viec/rang/e6-xanh.mjs: bo qua baseline: tep _acceptance/ke-hoach-sinh-viec/rang/e6-xanh.mjs co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-ke-hoach-cu": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.integration.spec.ts -t kh-nhac-buoc": bo qua baseline: tep apps/agent/test/ke-hoach-sinh-viec.integration.spec.ts co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/ke-hoach-sinh-viec-do-nguong.spec.ts": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec-do-nguong.spec.ts co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs --tu-thu && node _acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs --moc c1864a3a2 && bun run check-types: bo qua baseline: tep _acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ke-hoach-sinh-viec/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/ke-hoach-sinh-viec/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ke-hoach-sinh-viec/rang/san-thiet-ke.mjs: bo qua baseline: tep _acceptance/ke-hoach-sinh-viec/rang/san-thiet-ke.mjs co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Judge

Panel E14 (AC-9) — đề xuất: PASS. Đây là đề xuất của hội đồng, human_override để TRỐNG cho người quyết ở Cổng 2. Ba lens đồng thuận, không có ý kiến bất đồng.

- domain-correctness: PASS — Đủ năm điều. (1) CONTEXT.md mục Bước và api.md nói bước là bản chiếu của đúng một Việc, Việc là nguồn sự thật (người làm, hạn, tên, xong), và kế hoạch tạo trước DA3 không mang Việc. (2) Cả hai tài liệu nêu Huỷ, xoá, gỡ gắn bị chặn (400 `VIEC.thongDiep.goBuocOKeHoach`) và đường đúng là «Bỏ bước»/`removeStep`. (3) và (4) `nguoiTheoPhongBan`, mặc định trưởng phòng rồi người cầm trịch, từ chối vai «chỉ OKR» (`vaiChiOkrPhong`) và `closePlan.huyViecMo` đều có. (5) Hàng DA3 là «đang dựng», có hàng DA3b «Gợi ý mở kế hoạch khi deal thắng», và `chay_khi` của DA4 ghi điều kiện ngày bắt đầu đã thoả, chủ kho mở 14/10. Các tài liệu không dùng «dự án» cho kế hoạch 30 ngày; mục «Dự án» còn nói rõ kế hoạch 30 ngày không phải dự án. Lưu ý: CONTEXT.md chưa có mục riêng «Gợi ý mở kế hoạch» (DA3b còn «chưa mở»), nhưng năm điều cần kiểm không đòi mục đó.
- operational-feasibility: PASS — Cả năm điều đều có trong các tệp đầu vào. (1) và (3): CONTEXT.md mục Bước nói bước là bản chiếu của Việc, người làm/hạn/tên/xong lấy từ Việc, mặc định trưởng phòng rồi người cầm trịch, vai «chỉ OKR» bị từ chối, và kế hoạch tạo trước DA3 không mang Việc. (2) và (4): docs/api.md dòng 293-309 nêu Huỷ/xoá/gỡ gắn trả 400 `goBuocOKeHoach`, đường đúng là `removeStep`/«Bỏ bước», `nguoiTheoPhongBan` của `createFromTemplate`, và `closePlan` có `huyViecMo`. (5): lo-trinh-viec-du-an.json có DA3 ở trạng thái «đang dựng», có hàng DA3b, và `chay_khi` của DA4 ghi điều kiện ngày bắt đầu đã thoả do chủ kho mở 14/10. Mục kế hoạch 30 ngày không dùng chữ «dự án». Lưu ý ngoài năm điều: CONTEXT.md không có mục riêng tên «Gợi ý mở kế hoạch» (grep không khớp). Ý đó nằm ở hàng DA3b của JSON và không thuộc năm điều cần chấm.
- spec-alignment: PASS — Cả năm điều đều có trong ba tệp. (1) CONTEXT.md mục Bước và Việc: bước là bản chiếu của đúng một Việc, kế hoạch tạo trước DA3 vẫn có bước không Việc. (2) CONTEXT.md và api.md: Huỷ, xoá và gỡ gắn kế hoạch bị chặn bằng 400 `goBuocOKeHoach`, đường đúng là «Bỏ bước». (3) và (4) api.md: `nguoiTheoPhongBan`, mặc định trưởng phòng rồi người cầm trịch, vai «chỉ OKR» bị từ chối `vaiChiOkrPhong`, `closePlan` có `huyViecMo`. (5) JSON: DA3 đang dựng, có hàng DA3b (chưa mở, bám DA3), `chay_khi` của DA4 ghi điều kiện ngày bắt đầu đã thoả, chủ kho mở 14/10. Chữ «dự án» chỉ dùng để loại trừ kế hoạch 30 ngày. Một điểm cần biết: CONTEXT.md chưa có mục «Gợi ý mở kế hoạch» (grep không thấy). Mục đó không nằm trong năm điều cần kiểm, vì ý (5) chỉ đòi hàng DA3b ở JSON.

- eval: E14
  judged_by: judge panel (3 lens, fresh context)
  proposal: PASS
  rationale: Ba lens cùng thấy đủ năm điều trong CONTEXT.md, docs/api.md và lo-trinh-viec-du-an.json; lưu ý chung là CONTEXT.md chưa có mục riêng «Gợi ý mở kế hoạch», nằm ngoài năm điều cần chấm.
  human_override:  # chi nguoi ghi

## Iterations

Round 1: E3b không đạt, nên phán quyết REJECT. Script kh_man đạt ba bước đầu (ô tạo từ danh mục, từ sheet công ty, ở 375) rồi lỗi ở bước 4 với PrismaClientValidationError tại `tx.viec.create` (packages/db/src/viec-ghi.ts:238, hàm taoViec), nên kế hoạch không được dựng, không có thẻ Bước và không sinh ảnh kh-the-buoc-viec-1280.png. Frame 2 cũng chưa chứng minh được lối sheet công ty vì ô tạo chưa mở trong ảnh. Ngoài ra bốn lệnh không gắn eval đỏ (suite api, suite app và @crm/ui, lint:slop, cùng ui-check:E3b) cần người xem. Trả về cho khâu cài đặt.
