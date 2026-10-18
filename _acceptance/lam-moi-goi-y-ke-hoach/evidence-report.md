---
schema_version: 2
feature_slug: lam-moi-goi-y-ke-hoach
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 296ad1a2112a4859b48a80b6fd5d22b19f03f8cf
human_signoff: manh 2026-10-19
---

# Evidence Report: lam-moi-goi-y-ke-hoach

Round 4. Mười eval của feature đều xanh, bảy lệnh suite đều xanh, không eval nào đỏ. Chi tiết hai phát hiện trong hợp đồng và hai phát hiện ngoài hợp đồng nằm ở review-findings.md.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-1 | test | PASS |
| E9 | AC-3 | test | PASS |
| E10 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-lam-moi-goi-y-ke-hoach-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_stepper
  verified_at: 2026-10-18T15:59:32Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-stepper
    Ran 1 test across 1 file. [1095.00ms]

- eval: E2
  run_id: minted-lam-moi-goi-y-ke-hoach-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_menu
  verified_at: 2026-10-18T15:59:32Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-menu
    Ran 1 test across 1 file. [1334.00ms]

- eval: E3
  run_id: minted-lam-moi-goi-y-ke-hoach-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_roi
  verified_at: 2026-10-18T15:59:32Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-roi
    Ran 2 tests across 1 file. [1191.00ms]

- eval: E4
  run_id: minted-lam-moi-goi-y-ke-hoach-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_cache
  verified_at: 2026-10-18T15:59:32Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-cache
    Ran 2 tests across 1 file. [972.00ms]

- eval: E5
  run_id: minted-lam-moi-goi-y-ke-hoach-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_dot_bien
  verified_at: 2026-10-18T15:59:32Z
  output: |
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/dot-bien.mjs
    dot-bien: 6/6 cap dat

- eval: E6
  run_id: minted-lam-moi-goi-y-ke-hoach-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_man
  verified_at: 2026-10-18T15:59:32Z
  screenshot: evidence/E6-sau-thang-1280.png
  observed: |
    E6-sau-thang-1280.png (1280x900, đã mở bằng Read): sheet deal "Hợp đồng làm mới thật ke0h8zx" của "Công ty Làm Mới Gợi Ý thật ke0h8zx", huy hiệu "Closed won". Ngay dưới tiêu đề có thẻ gợi ý "Deal đã thắng — mở kế hoạch 30 ngày cho Công ty Làm Mới Gợi Ý thật ke0h8zx?" kèm nút "Mở kế hoạch" (primary xanh) và "Bỏ qua". Thanh GIAI ĐOẠN có chấm xanh ở cột cuối "Closed won"; toast "Đã đổi giai đoạn." ở góc trái dưới.
    E6-sau-roi-thang-1280.png (đã mở bằng Read): cùng sheet, cùng tên deal, huy hiệu "Demo booked", KHÔNG còn thẻ gợi ý (hàng Giá trị / Ngày dự kiến chốt / Ở giai đoạn / Phụ trách lên sát tiêu đề). Thanh GIAI ĐOẠN sáng cột "Demo booked", "Closed won" không còn chấm xanh. Sheet vẫn mở. Khớp Expected, và tên deal ke0h8zx khớp lần chạy này.
  network_observed: n-a (driver)
  output: |
    - buoc 1: dat; lam-moi-goi-y-ke-hoach man: dat; phien-do: xong
    Ca hai dong tu thu (hien va an) co mat truoc luot that; moi dong luot that DAT.
    Frames da luu: evidence/E6-sau-thang-1280.png, evidence/E6-sau-roi-thang-1280.png, chep thanh E6-step1.png, E6-step2.png; output day du o evidence/E6-output.txt.

- eval: E7
  run_id: minted-lam-moi-goi-y-ke-hoach-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_hoi_quy
  verified_at: 2026-10-18T15:59:32Z
  output: |
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs --tu-thu
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs --moc "$(git merge-base HEAD origin/onehub)"
    bun run check-types

- eval: E8
  run_id: minted-lam-moi-goi-y-ke-hoach-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_sinh
  verified_at: 2026-10-18T15:59:32Z
  output: |
    bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-sinh"
    test-run: dropped crm_mve0h1h0qorx_test

- eval: E9
  run_id: minted-lam-moi-goi-y-ke-hoach-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_xu_ly
  verified_at: 2026-10-18T15:59:32Z
  output: |
    bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-xu-ly"
    test-run: dropped crm_mve0h0utvoxf_test

- eval: E10
  run_id: minted-lam-moi-goi-y-ke-hoach-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_duong
  verified_at: 2026-10-18T15:59:32Z
  output: |
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs --tu-thu
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs
    duong-doi-giai-doan: da kiem 4/4 noi, 0 loi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-18T15:59:32Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 0
  verified_at: 2026-10-18T15:59:32Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-18T15:59:32Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-18T15:59:32Z

- cmd: bunx turbo run lint --force
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-18T15:59:32Z

- cmd: bun run lint:slop
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-18T15:59:32Z

- cmd: bunx turbo run build --force
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-18T15:59:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 3 — baseline khong do lai round nay. Mọi eval ghi baseline n-a vì evals.yaml không đổi từ lần đo baseline cuối (round 3).

Eval không phân biệt (xanh cả trên HEAD lẫn baseline): E8 (`-t gy-sinh`) và E9 (`-t gy-xu-ly`). Cả hai chạy lại nguyên trạng bài kiểm đã ký của goi-y-mo-ke-hoach làm tiền đề máy chủ cho AC-1 và AC-3, nên xanh trên cả hai phía là regression-guard có chủ ý, không phải bằng chứng cho hành vi mới của feature này.

Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: S4 lượt 1 trả về phát hiện về quan hệ thứ tự của settle record; hồ sơ thêm cặp đột biến (e) ở E5 và ca thứ hai ở E4. Returned to implementation.
Round 2: S4 lượt 2 REJECT — E6 bập bênh, hai phát hiện trong hợp đồng (AC-5, AC-6); sửa thước: E6 chụp theo khung, tự thử chiều mất, mỏ neo dương ở E3 và cặp (f) ở E5. Returned to implementation.
Round 3: mười eval của feature xanh, sáu lệnh suite xanh; verdict BLOCKED vì lệnh `bunx turbo run build --force` không có kết quả (agent bị skip hoặc chết). Một phát hiện trong hợp đồng (AC-6, E6) chuyển người xem ở review-findings.md.
Round 4: mười eval của feature xanh, bảy lệnh suite xanh gồm cả `bunx turbo run build --force`; verdict PASS. Hai phát hiện trong hợp đồng (AC-6, lượt tự thử chiều ẩn của E6) và hai phát hiện ngoài hợp đồng chuyển người xem ở review-findings.md.

## Đo tay ngoài S4

Luật tạm của chủ kho (16/10): eval đổi định nghĩa giữa hai lượt thì đo tay, kèm chiều đỏ và đối chứng dương. Đo trong làn M5 của lượt 3, sau khi workflow trả về, trên cây 5a749d41a (vật và thước giống f6df5200f, chỉ thêm sổ lượt 3). Lượt 4 chấm cùng thước ấy: từ f6df5200f tới 296ad1a21 không tệp thước hay vật nào của vòng đổi, chỉ thêm gộp onehub và thu phạm vi ở hợp đồng; vì thế lượt 4 không có eval nào đổi định nghĩa và mục này giữ nguyên số đo của lượt 3. Bản sao dựng bằng `ban-sao.mjs` của `ca-chap-chon-cach-ly`, gỡ ngay sau mỗi lượt. Nhật ký trọn ở `.acceptance-runs/lam-moi-goi-y-ke-hoach/do-tay-r3/ket-qua.txt`. Mục này là phép đo tay, không thay lượt chấm và không đổi verdict.

Eval đổi định nghĩa: E4, E5 (lượt 1 → 2, ca thứ tự settle record và cặp e); E3, E5, E6 (lượt 2 → 3, mỏ neo dương khi rời thắng, cặp f, thước màn).

| Eval | Đối chứng dương | Chiều đỏ | Kết |
|---|---|---|---|
| E3 | cây đang xét: 2/2 ca xanh; bản sao lành: thoát 0 | vật (gỡ khoá gợi ý khỏi `cache.deal`): thoát 1, «the con sau khi roi thang stepper» và «… menu»; thước (đóng sheet ngay sau khi rời, thẻ vắng mà không do làm mới): thoát 1, «sheet dung lai khi roi stepper», «sheet dung lai khi roi menu» | đạt |
| E4 | cây đang xét: 2/2 ca xanh; bản sao lành: thoát 0 | (c) gỡ khoá: «cache.deal khong lam moi goi y d-1», «settle record khong doc lai goi y»; (d) khoá chung: «lam moi goi y deal khac»; (e) dời khoá sang phần chạy nền: «settle record khong cho goi y» | đạt |
| E5 | cây đang xét: thoát 0, `dot-bien: 6/6 cap dat` | hạ thước (bỏ chốt thứ tự settle record, về kiểu lượt 1): thoát 1, `5/6`, cặp (e) `ghim=thieu`; hạ thước (bỏ chốt thẻ mất của ca menu): thoát 1, `5/6`, cặp (f) `ghim=thieu` | đạt |
| E6 | `man.mjs` mới trên cây đang xét: thoát 0, hai lượt tự thử báo KHONG DAT đúng hướng, «hien sau thang» 170 ms, «an sau roi thang» 103 ms, «sheet khong dung lai» đạt cả hai lần (trước đó 3/3 lần chạy tay đều xanh) | thước cũ (`man.mjs` của 9858a5d70, chụp cả trang) trên cùng cây: 4/4 lần thoát 1, «E6 sheet khong dung lai: KHONG DAT — sau roi thang»; răng dò `do-e6/probe.mjs`: lượt có chụp ghi `resize 1x1` → `go dialog`/`them dialog` → `resize 1280x900`, lượt không chụp không lần nào gỡ sheet; vật (gỡ khoá trong bản sao): KHÔNG ĐO ĐƯỢC — máy chủ app của bản sao thoát trước khi sẵn sàng (mã 2) | đạt một phần: chiều đỏ trên vật của E6 chỉ có hai lượt tự thử trong chính lượt chấm |

Lệnh bị chặn ở lượt 3, chạy tay để lấy thông tin (không phải bằng chứng, không gỡ BLOCKED): `bunx turbo run build --force` thoát 0, 5/5 task, 0 cache, 14 giây.
