---
schema_version: 2
feature_slug: ke-hoach-sinh-viec
verdict: REJECT
failed_evals: [E3b]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9cb567b340c8e49ed8443f5520f89fcad83be99e
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
| E7b | AC-6 | script | PASS (carry-forward từ round 1) |
| E8 | AC-7 | test | PASS |
| E8b | AC-7 | test | PASS (carry-forward từ round 1) |
| E13 | AC-8 | test | PASS |
| E14 | AC-9 | judgment | PENDING-JUDGMENT (hội đồng đề xuất PASS, chờ người) |
| E15 | AC-10 | script | PASS |
| E16 | AC-4 | script | PASS |
| E17 | AC-3 | script | PASS |

Phán quyết tổng: REJECT. Một eval máy đỏ: E3b (màn tạo kế hoạch chạy thật, script kh_man thoát mã 1 vì lỗi console hydration, và hai frame không khớp Expected khi đối chiếu bằng mắt). Bảy lệnh suite hồi quy đều xanh. Lệnh fail không gắn eval: chỉ ui-check:E3b, gắn với E3b.

## Evidence

- eval: E1
  run_id: minted-ke-hoach-sinh-viec-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_tao
  verified_at: 2026-10-14T22:50:33Z
  output: |
    -t kh-tao của apps/api/test/ke-hoach-sinh-viec.spec.ts: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8pe93wnju6_test

- eval: E2
  run_id: minted-ke-hoach-sinh-viec-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_chon_nguoi
  verified_at: 2026-10-14T22:50:33Z
  output: |
    -t kh-chon-nguoi: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8pe7rxuclj_test

- eval: E3
  run_id: minted-ke-hoach-sinh-viec-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_man_tao
  verified_at: 2026-10-14T22:50:33Z
  output: |
    Ran 3 tests across 1 file. [1.61s]

- eval: E3b
  run_id: minted-ke-hoach-sinh-viec-E3b-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.kh_man
  verified_at: 2026-10-14T22:50:33Z
  screenshot: evidence/E3b-step1.png
  observed: |
    Frame 1 (kh-o-tao-danh-muc-1280.png): Sheet "Tao ke hoach tu khuon" tren man 1280. Cong ty doi tac: "Chon cong ty"; Khuon "Khuon san k8pe8lx"; Nguoi cam trich "Pham Thu Ha"; muc "Nguoi lam buoc cua tung phong ban" co hai hang, moi phong ban mot hang: "Kinh doanh k8pe8lx" -> Le Quang Vinh (truong phong), "Ke toan k8pe8lx" -> Pham Thu Ha kem ghi chu "Phong chua co truong phong - mac dinh nguoi cam trich". Khop Expected (mot hang moi phong ban, dien san truong phong / nguoi cam trich).
    Frame 2 (kh-o-tao-cong-ty-1280.png): Trang Cong ty voi sheet "Cong ty An Phat k8pe8lx" o tab "30 ngay dau", hien trang rong "Chua co ke hoach 30 ngay" va nut "+ Tao ke hoach" bi cat o mep phai. KHONG thay o tao ke hoach / cac hang phong ban / o chon nguoi trong anh. Mau thuan Expected ("o tao ke hoach mo tu sheet cong ty co mot hang moi phong ban") — du script khai buoc 2 dat bang DOM, bang chung hinh khong cho thay.
    Frame 3 (kh-o-tao-375.png): Man 375, sheet tao ke hoach xep doc: Cong ty, Khuon, Ngay bat dau, Nguoi cam trich, roi hai hang phong ban xep doc (ten phong tren, o chon nguoi duoi: Le Quang Vinh va Pham Thu Ha, kem ghi chu), nut Luu/Huy o day. Khong thay thanh cuon ngang, noi dung nam gon trong 375. Khop Expected.
    Frame 4 (kh-the-buoc-viec-1280.png): The ke hoach "Cong ty An Phat k8pe8lx" tab Buoc 2, hai nhom phong ban "Kinh doanh k8pe8lx - da xong 0/1" voi buoc "Ky hop dong" + chip "Chua lam", va "Ke toan k8pe8lx - da xong 0/1" voi "Mo tai khoan" + chip "Chua lam". Chip trang thai Viec co hien. Nguoi lam o moi buoc KHONG thay duoc trong khung (phan phai cua sheet bi cat o 1280), nen ve "hien nguoi lam o moi buoc" khong doi chieu duoc bang mat; mot phan Expected chua duoc chung minh.
    Tong: lenh ma 1 + loi console hydration + frame 2 mau thuan Expected + frame 4 thieu nguoi lam -> eval FAIL.
  network_observed: n-a (driver)
  output: |
    Lenh kh_man chay o tien canh tu goc kho (timeout 600000), thoat voi ma 1 (khong phai ma 0, khong bi cong cu giet). Dong cuoi: "ke-hoach-sinh-viec man: hong 1". Bon buoc cua script deu in "dat" (buoc 1-4), nhung script them 1 loi console app: tren /companies?record=company:...&tab=plans co console.error "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties" (hydration mismatch) nen tong ket la hong 1.
    Assertion:
    - Lenh thoat ma 0 kem "ke-hoach-sinh-viec man: dat": FAIL (ma 1, "man: hong 1", nguyen nhan = loi console hydration o sheet cong ty).
    - Anh 1 danh-muc 1280: PASS (xem observed).
    - Anh 2 cong-ty 1280: FAIL doi chieu mat (o tao ke hoach khong hien trong anh du script khai buoc 2 dat).
    - Anh 3 375: PASS.
    - Anh 4 the buoc 1280: khong xac nhan duoc "nguoi lam o moi buoc" bang mat (cot nguoi lam nam ngoai vung chup, sheet bi cat o mep phai) -> khong chung minh duoc.
    Frame da luu (sao tu anh cua script): E3b-step1.png (= kh-o-tao-danh-muc-1280.png), E3b-step2.png (= kh-o-tao-cong-ty-1280.png), E3b-step3.png (= kh-o-tao-375.png), E3b-step4.png (= kh-the-buoc-viec-1280.png), tat ca trong _acceptance/ke-hoach-sinh-viec/evidence/. Network: driver la script bun, khong co read_network_requests; E3b-network.txt da ghi, networkObserved = n-a (driver). Server do script tu quan (phien-do tu don khoa gia va tat).

- eval: E4
  run_id: minted-ke-hoach-sinh-viec-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_ban_chieu
  verified_at: 2026-10-14T22:50:33Z
  output: |
    -t kh-ban-chieu: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8pe8wvqr52_test

- eval: E5
  run_id: minted-ke-hoach-sinh-viec-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_chan
  verified_at: 2026-10-14T22:50:33Z
  output: |
    -t kh-chan: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8pe94osyq3_test

- eval: E6
  run_id: minted-ke-hoach-sinh-viec-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_go_buoc
  verified_at: 2026-10-14T22:50:33Z
  output: |
    -t kh-go-buoc: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8pe8ht7ubr_test

- eval: E7
  run_id: minted-ke-hoach-sinh-viec-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_them_buoc
  verified_at: 2026-10-14T22:50:33Z
  output: |
    -t kh-them-buoc: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8pe99atliz_test

- eval: E7b
  run_id: minted-ke-hoach-sinh-viec-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kh_e6_xanh
  verified_at: 2026-10-14T16:50:25Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-ke-hoach-sinh-viec-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_ke_hoach_cu
  verified_at: 2026-10-14T22:50:33Z
  output: |
    -t kh-ke-hoach-cu: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8pe8z8vnkq_test

- eval: E8b
  run_id: mv8cjoho755z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_nhac_buoc
  verified_at: 2026-10-14T16:50:25Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: mv8pe8e4992f
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kh_thuoc
  verified_at: 2026-10-14T22:50:33Z
  output: |
    apps/api/test/ke-hoach-sinh-viec-do-nguong.spec.ts: 1 lần chạy, 1 qua
    test-run: dropped crm_mv8pe8e4992f_test

- eval: E15
  run_id: minted-ke-hoach-sinh-viec-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kh_hoi_quy
  verified_at: 2026-10-14T22:50:33Z
  output: |
    khong-xoa-expect --tu-thu rồi --moc 3818ad4ec rồi check-types: cả ba bước qua

- eval: E16
  run_id: minted-ke-hoach-sinh-viec-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kh_dot_bien
  verified_at: 2026-10-14T22:50:33Z
  output: |
    dot-bien: 9/9 cap dat

- eval: E17
  run_id: minted-ke-hoach-sinh-viec-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kh_san_thiet_ke
  verified_at: 2026-10-14T22:50:33Z
  output: |
    kh san: 3 tep, 0 vi pham

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ke-hoach-sinh-viec-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-14T22:50:33Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ke-hoach-sinh-viec-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-14T22:50:33Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ke-hoach-sinh-viec-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-14T22:50:33Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ke-hoach-sinh-viec-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-14T22:50:33Z

- cmd: bunx turbo run lint --force
  run_id: minted-ke-hoach-sinh-viec-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-14T22:50:33Z

- cmd: bun run lint:slop
  run_id: minted-ke-hoach-sinh-viec-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-14T22:50:33Z
  output: |
    Finished in 1.4s on 3339 files with 9 rules using 18 threads.

- cmd: bunx turbo run build --force
  run_id: minted-ke-hoach-sinh-viec-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-14T22:50:33Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: mọi eval máy đều có baseline n-a (xem «Baseline khong do» dưới), nên dòng trên nghĩa là không eval nào được đo là xanh ở cả hai phía, KHÔNG phải mọi eval đã được đo là đỏ ở baseline.

Lệnh fail không gắn eval: không có lệnh suite nào đỏ ở round này. Lệnh fail duy nhất là ui-check:E3b, gắn với E3b (nguyên nhân ở mục Iterations).

Ghi chú về thời điểm: máy không cấp thời điểm riêng cho từng eval ở round 2, nên `verified_at` của các khối round 2 là ngày lập báo cáo, không phải giờ chạy. Hai khối carry-forward (E7b, E8b) giữ nguyên thời điểm của round 1.

### Baseline khong do

- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-tao": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-chon-nguoi": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tao-ke-hoach-nguoi.dom.tsx: bo qua baseline: tep apps/app/test/tao-ke-hoach-nguoi.dom.tsx co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-ban-chieu": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-chan": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-go-buoc": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-them-buoc": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts -t kh-ke-hoach-cu": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec.spec.ts co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/ke-hoach-sinh-viec-do-nguong.spec.ts": bo qua baseline: tep apps/api/test/ke-hoach-sinh-viec-do-nguong.spec.ts co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs --tu-thu && node _acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs --moc 3818ad4ec && bun run check-types: bo qua baseline: tep _acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ke-hoach-sinh-viec/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/ke-hoach-sinh-viec/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ke-hoach-sinh-viec/rang/san-thiet-ke.mjs: bo qua baseline: tep _acceptance/ke-hoach-sinh-viec/rang/san-thiet-ke.mjs co o cay dang kiem nhung chua co o merge-base 3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Judge

Panel E14 (AC-9) — đề xuất: PASS. Đây là đề xuất của hội đồng, human_override để TRỐNG cho người quyết ở Cổng 2. Ba lens đồng thuận, không có ý kiến bất đồng.

- domain-correctness: PASS — Đủ năm điều trong ba tệp. (1)–(2) nằm ở mục «Bước» của CONTEXT.md và đoạn DA3 của docs/api.md (dòng 293–309, lỗi `VIEC.thongDiep.goBuocOKeHoach`). (3)–(4) nằm ở api.md (`nguoiTheoPhongBan`, `vaiChiOkrPhong`, `closePlan.huyViecMo`). (5) nằm ở lo-trinh-viec-du-an.json: DA3 là «đang dựng», có hàng DA3b, và `chay_khi` của DA4 ghi điều kiện ngày bắt đầu đã thoả, chủ kho mở 14/10. Không chỗ nào dùng «dự án» cho kế hoạch 30 ngày. Lưu ý: CONTEXT.md không có mục riêng «Gợi ý mở kế hoạch», nhưng đó không thuộc năm điều cần kiểm, và ý tương ứng đã nằm ở hàng DA3b.
- operational-feasibility: PASS — Đủ năm điều. (1) và (2) nằm ở mục «Bước» của CONTEXT.md và api.md dòng 293-309. (3) và (4) nằm ở api.md dòng 293-309 (nguoiTheoPhongBan, vaiChiOkrPhong, huyViecMo). (5) nằm ở JSON: DA3 là «đang dựng», có DA3b «Gợi ý mở kế hoạch khi deal thắng», và DA4 có chay_khi nêu điều kiện ngày bắt đầu đã thoả do chủ kho mở 14/10. Mọi chỗ chữ «dự án» đứng cạnh kế hoạch 30 ngày đều là phủ định hoặc nằm trong mục «Dự án». CONTEXT.md chưa có mục riêng «Gợi ý mở kế hoạch», nhưng đó không thuộc năm điều cần kiểm và khớp với DA3b còn «chưa mở».
- spec-alignment: PASS — Đủ năm điều có chữ rõ trong ba tệp. (1) và (2) nằm ở mục Bước của CONTEXT.md và api.md dòng 293–309. (3) và (4) nằm ở api.md: `nguoiTheoPhongBan`, mặc định trưởng phòng rồi người cầm trịch, `vaiChiOkrPhong`, `huyViecMo`. (5) nằm ở lo-trinh-viec-du-an.json: DA3 "đang dựng", có hàng DA3b, và `chay_khi` của DA4 ghi điều kiện ngày bắt đầu đã thoả do chủ kho mở 14/10. Các tệp không dùng chữ «dự án» cho kế hoạch 30 ngày. Một điểm lệch nhỏ: CONTEXT.md chưa có mục riêng «Gợi ý mở kế hoạch» như câu hỏi nhắc; mục "Gợi ý" hiện có là mục cũ, nói về nhắc kế hoạch im. Điều này không làm hụt điều nào trong năm điều, vì DA3b đã được nêu ở JSON.

- eval: E14
  judged_by: judge panel (3 lens, fresh context)
  proposal: PASS
  rationale: Ba lens cùng thấy đủ năm điều trong CONTEXT.md, docs/api.md và lo-trinh-viec-du-an.json; lưu ý chung là CONTEXT.md chưa có mục riêng «Gợi ý mở kế hoạch», nằm ngoài năm điều cần chấm.
  human_override:  # chi nguoi ghi

## Iterations

Round 1: E3b không đạt. Script kh_man đạt ba bước đầu rồi lỗi ở bước 4 với PrismaClientValidationError tại `tx.viec.create` (packages/db/src/viec-ghi.ts:238, hàm taoViec), nên kế hoạch không được dựng và không có thẻ Bước; ba lệnh suite (api, app và @crm/ui, lint:slop) cũng đỏ. Trả về cho khâu cài đặt.
Round 2: E3b vẫn không đạt, nhưng nguyên nhân đã đổi. Lỗi tạo Việc ở round 1 đã hết (cả bốn bước của script in «đạt», cả bảy lệnh suite xanh). Còn lại: script thoát mã 1 vì một lỗi console hydration mismatch ở sheet công ty (/companies?record=company:...&tab=plans); đối chiếu mắt thì frame 2 (lối sheet công ty) không có ô tạo kế hoạch, frame 4 (thẻ Bước) không thấy người làm ở mỗi bước vì sheet bị cắt ở mép phải khi 1280. Frame 1 và frame 3 (375) khớp Expected. Trả về cho khâu cài đặt.
