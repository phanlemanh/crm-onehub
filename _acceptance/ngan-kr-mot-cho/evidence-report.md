---
schema_version: 2
feature_slug: ngan-kr-mot-cho
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 832ff2285bd65dedaefb043a1646527505be46b0
human_signoff:
---

# Evidence Report: ngan-kr-mot-cho

Round 1. Cả 13 eval của hợp đồng đều xanh, nhưng một lệnh suite hồi quy không gắn eval nào đỏ: `bun run test -- --filter=app --filter=@crm/ui` (xem mục «Lệnh suite (hồi quy)»). Vì vậy verdict là REJECT và `failed_evals` để trống.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | ui-check | PASS |
| E13 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ngan-kr-mot-cho-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_moi_loi
  verified_at: 2026-10-20T10:39:19Z
  output: |
    DUNG

- eval: E2
  run_id: minted-ngan-kr-mot-cho-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_dau_ngan
  verified_at: 2026-10-20T10:39:19Z
  output: |
    Ran 1 test across 1 file. [2.51s]

- eval: E3
  run_id: minted-ngan-kr-mot-cho-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_than_ngan
  verified_at: 2026-10-20T10:39:19Z
  output: |
    Ran 1 test across 1 file. [2.53s]

- eval: E4
  run_id: minted-ngan-kr-mot-cho-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_kr_ke
  verified_at: 2026-10-20T10:39:19Z
  output: |
    Ran 1 test across 1 file. [2.46s]

- eval: E5
  run_id: minted-ngan-kr-mot-cho-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_cap_nhat_ngan
  verified_at: 2026-10-20T10:39:19Z
  output: |
    Ran 2 tests across 1 file. [2.58s]

- eval: E6
  run_id: minted-ngan-kr-mot-cho-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_tren_dong
  verified_at: 2026-10-20T10:39:19Z
  output: |
    Ran 1 test across 1 file. [3.84s]

- eval: E7
  run_id: minted-ngan-kr-mot-cho-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_ghi_that
  verified_at: 2026-10-20T10:39:19Z
  output: |
    test-run: dropped crm_mvgjxrm0lic1_test

- eval: E8
  run_id: minted-ngan-kr-mot-cho-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_ba_bam
  verified_at: 2026-10-20T10:39:19Z
  output: |
    Ran 1 test across 1 file. [3.42s]

- eval: E9
  run_id: minted-ngan-kr-mot-cho-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_xem_truoc
  verified_at: 2026-10-20T10:39:19Z
  output: |
    Ran 4 tests across 1 file. [929.00ms]

- eval: E10
  run_id: minted-ngan-kr-mot-cho-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_hep
  verified_at: 2026-10-20T10:39:19Z
  output: |
    Ran 2 tests across 1 file. [2.33s]

- eval: E11
  run_id: minted-ngan-kr-mot-cho-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_trang_thai
  verified_at: 2026-10-20T10:39:19Z
  output: |
    Ran 167 tests across 1 file. [1015.00ms]

- eval: E12
  run_id: minted-ngan-kr-mot-cho-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk7_man
  verified_at: 2026-10-20T10:39:19Z
  screenshot: evidence/hop-dong-1440.png
  observed: |
    hop-dong-1440.png: hộp thoại giữa màn tối "Cập nhật KR – Đối tác hàng lạnh mới đạt 10", Giá trị 12 đối tác, dòng "Hiện tại 11 đối tác · đích 10 · +1", biểu đồ có điểm mới rỗng ở 12, "Tiến độ mới 100%", Mức tự tin chọn "Thấp" (viền sáng), nút "Gửi cập nhật". Khớp bước 2 (hộp có điểm mới trước khi gửi, tự tin thấp). ngan-kr-1440.png: ngăn bên phải URL KR k1 "Đối tác hàng lạnh mới đạt 10", Hiện tại 12 đối tác, Tiến độ 100%, đầu ngăn có 1/4, ‹ ›, nút Cập nhật, ✕; lịch sử 6 dòng, dòng đầu 19 thg 10 "12 đối tác" tự tin thấp; toast "Đã gửi cập nhật". ngan-sau-cap-nhat-1440.png: cùng ngăn k1 vẫn mở, Hiện tại đổi thành 13 đối tác, dòng đầu 19 thg 10 "13 đối tác" tự tin cao, vẫn 6 dòng lịch sử (thay vì +1, do gom tuần). kr-ke-1440.png: ngăn chuyển sang "Thoả thuận mới hàng lạnh đạt 25", 2/4, Hiện tại 12,1, tooltip "KR kế" — khớp bấm KR kế. so-do-1440.png và cua-toi-1440.png: ảnh giống hệt nhau, ngăn KR k1 với Hiện tại 13, nút Cập nhật, 1/4; không thấy sơ đồ hay trang Của tôi (nền trái đen). hop-dong-390.png: hộp thoại khổ điện thoại, Giá trị 14, "Lần trước 13 · +1 so với lần trước", Mức tự tin chọn "Vừa", nút "Gửi cập nhật" và "Huỷ" xếp dọc, không tràn ngang. ngan-390.png: Drawer đáy có tay nắm, tiêu đề "Đối tác hàng lạnh mới đạt 10", 1/4, ‹ ›, nút Cập nhật, Hiện tại 14 đối tác, lịch sử dòng đầu "14 đối tác · Tự tin vừa", toast "Đã gửi cập nhật"; không có thanh cuộn ngang. Tất cả khớp Expected (8 ảnh, mọi kiểm DUNG, console 0 lỗi), kèm ba lưu ý ở output.
  network_observed: n-a (driver)
  output: |
    Network: driver là script bun (Playwright bên trong), không có công cụ đọc network trong lượt này, không ghi E12-network.txt; console do chính script kiểm (0 lỗi mới ở cả hai khổ).
    Lưu ý khi đối chiếu ảnh: (1) bước 3 ghi "số dòng lịch sử tăng 1" nhưng ảnh trước/sau đều 6 dòng; script gom theo tuần nên dòng 19/10 từ 12 thành 13 (đúng log "dong 6 -> 6, gom theo tuan"). Expected của eval chỉ đòi mỗi kiểm in DUNG nên tính xanh, nhưng lệch chữ so với bước. (2) so-do-1440.png và cua-toi-1440.png byte-giống nhau (cùng md5), cùng cảnh ngăn KR k1; việc phân biệt hai lối dựa vào assertion đường dẫn, không dựa vào ảnh. (3) Phần trang bên trái ngăn đen hoàn toàn ở mọi ảnh 1440 nên ảnh không cho thấy ngăn M «ở dưới» hay sơ đồ phía sau; đây chỉ do assertion của script xác nhận.

- eval: E13
  run_id: minted-ngan-kr-mot-cho-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk7_giu_ho_so
  verified_at: 2026-10-20T10:39:19Z
  output: |
    KET LUAN: 317 GIU, 0 DO, 48 DO-SAN-NEN, 0 CHAP-CHON, 0 HOAN, 3 BO RA, 0 loi nghi, 263 lenh

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-20T10:39:19Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-20T10:39:19Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-20T10:39:19Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-20T10:39:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-ngan-kr-mot-cho-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-20T10:39:19Z

- cmd: bun run lint:slop
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-20T10:39:19Z

- cmd: bunx turbo run build --force
  run_id: minted-ngan-kr-mot-cho-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-20T10:39:19Z

Lệnh suite đỏ, không gắn eval nào: `bun run test -- --filter=app --filter=@crm/ui`. Bài đỏ nguyên văn từ đầu ra: `(fail) dh4-mo-the > mở thẻ liệt kê mục tiêu, góp vào đâu, mức tin và lý do theo từng chỗ nối [193.24ms]` trong `apps/app/test/okr-so-do-don-vi.dom.tsx`, dòng 569: `expect(capNhat.at(-1)?.searchParams.get("moDonVi")).toBeNull();` nhận `Received: "pb:mau-okr-pb-sd-a3"`. Kèm dòng `chay-dom: test/okr-so-do-don-vi.dom.tsx đỏ (mã 1) sau 2.9 s` và `Failed:    app#test`. Tệp bài kiểm này không phải tệp của hợp đồng ngan-kr-mot-cho; lượt chấm chưa chạy nó trên nền merge-base nên chưa rõ đỏ sẵn trên nền hay do vòng này gây ra. Còn lại trong suite: 7 bài của tệp đó xanh, và Turbo báo `Tasks: 3 successful, 4 total`.

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào được đo xanh trên cả nền lẫn HEAD (baseline của cả 13 eval là n-a, không có cặp xanh-xanh để liệt kê). Lưu ý: vì baseline n-a, chưa có bằng chứng máy rằng eval nào đỏ trên nền; tính phân biệt của chúng dựa vào bài đối chứng đỏ ghim trong từng eval, không dựa vào A/B.

Ghi chú E13: 48 eval đỏ-sẵn-trên-nền được in DO-SAN-NEN (gồm cap-nhat-tuan-okr E18, thước màn gãy từ trước vòng này), 0 DO, 0 CHAP-CHON, 3 BO RA.

Không có judgment item nào được truyền xuống cho lượt này, nên không có phiếu của hội đồng chấm.

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-kr-mot-cho.dom.tsx -t vk7-moi-loi && cd ../.. && bun _acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs && test "$(bun _acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs --goc _acceptance/ngan-kr-mot-cho/rang/moi | grep -c "")" = 2: bo qua baseline: tep apps/app/test/ngan-kr-mot-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-kr-mot-cho.dom.tsx -t vk7-dau-ngan: bo qua baseline: tep apps/app/test/ngan-kr-mot-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-kr-mot-cho.dom.tsx -t vk7-than-ngan: bo qua baseline: tep apps/app/test/ngan-kr-mot-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-kr-mot-cho.dom.tsx -t vk7-kr-ke: bo qua baseline: tep apps/app/test/ngan-kr-mot-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-kr-mot-cho.dom.tsx -t vk7-cap-nhat-ngan: bo qua baseline: tep apps/app/test/ngan-kr-mot-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-kr-mot-cho.dom.tsx -t vk7-tren-dong: bo qua baseline: tep apps/app/test/ngan-kr-mot-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/ngan-kr-mot-cho.spec.ts -t vk7-ghi-that": bo qua baseline: tep apps/api/test/ngan-kr-mot-cho.spec.ts co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-kr-mot-cho.dom.tsx -t vk7-ba-bam: bo qua baseline: tep apps/app/test/ngan-kr-mot-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-kr-mot-cho.dom.tsx -t vk7-xem-truoc && cd ../../packages/ui && bun test --preload ./test/setup-dom.ts ./test/target-line-chart.dom.tsx: bo qua baseline: tep apps/app/test/ngan-kr-mot-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-kr-mot-cho.dom.tsx -t vk7-hep: bo qua baseline: tep apps/app/test/ngan-kr-mot-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-kr-mot-cho.dom.tsx -t vk7-trang-thai && bun test ./test/messages-guard.spec.ts: bo qua baseline: tep apps/app/test/ngan-kr-mot-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi
- bun test _acceptance/ngan-kr-mot-cho/rang/giu-ho-so.test.mjs && bun _acceptance/ngan-kr-mot-cho/rang/giu-ho-so.mjs: bo qua baseline: tep _acceptance/ngan-kr-mot-cho/rang/giu-ho-so.test.mjs co o cay dang kiem nhung chua co o merge-base e290fa4984376c6a1b2068a28727f942f00fb7f9 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval ngẫu nhiên nào có pass_rate lẫn)

## Iterations

Round 1: không eval hợp đồng nào đỏ; lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ở bài dh4-mo-the của okr-so-do-don-vi.dom.tsx (không gắn eval, nền chưa đối chiếu). Returned to implementation.

