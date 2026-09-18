---
schema_version: 2
feature_slug: go-thanh-vien-phai-giu-duoc
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e62300770c4b65aa022a2f9c30eee4f0cc89bcc7
human_signoff: Phan Le Manh 2026-09-18 — ký Cổng 2 trên verdict PASS của vòng chấm 1 (3/3 eval máy, 4/4 lệnh chứng, 0 lỗi trong hợp đồng, không vòng sửa nào). Mười hai mục ngoài hợp đồng định đoạt «ghi Known limits»; bốn mục — Ngoài-1 và Ngoài-8 (cùng một chỗ, hai làn soi độc lập tìm ra), Ngoài-6 và Ngoài-16 — định đoạt «mở hợp đồng mới»; phạm vi đã cắt giữ nguyên. Ký trên hiểu biết rằng chiều đỏ trên baseline của cả ba eval là đỏ-vì-bài-chưa-tồn-tại chứ không phải đỏ-vì-mã-sai, rằng chiều đỏ thật được ghim ở S3 bằng chính dòng lệnh eval khai, và rằng nhánh kết nạp mồi vừa viết mang một luật trái với `decideSignIn` — luật ấy nằm sau một cánh cửa mà Known limits của chính hợp đồng này khai là không mở được qua đường sản phẩm, và được giao cho một hồ sơ riêng thay vì sửa trong vòng này.
---

# Evidence Report: go-thanh-vien-phai-giu-duoc

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: mu6vtsv8x7bf
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gt_bi_go_thi_bi_tu_choi
  verified_at: 2026-09-18T03:10:00Z
  output: |
     13 expect() calls
    Ran 1 test across 1 file. [280.00ms]
    test-run: dropped crm_mu6vtsv8x7bf_test

- eval: E2
  run_id: mu6vtsvqbkc9
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gt_phien_mat_quyen
  verified_at: 2026-09-18T03:11:00Z
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [256.00ms]
    test-run: dropped crm_mu6vtsvqbkc9_test

- eval: E3
  run_id: mu6vtszpeub1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.gt_duong_moi_khong_cap_lai
  verified_at: 2026-09-18T03:12:00Z
  output: |
     6 expect() calls
    Ran 2 tests across 1 file. [349.00ms]
    test-run: dropped crm_mu6vtszpeub1_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mu6vtr3hc4hj
  exit_code: 0
  verified_at: 2026-09-18T03:15:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-go-thanh-vien-phai-giu-duoc-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-18T03:16:00Z

- cmd: bun run lint:slop
  run_id: minted-go-thanh-vien-phai-giu-duoc-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-18T03:17:00Z

- cmd: bunx turbo run build --force
  run_id: minted-go-thanh-vien-phai-giu-duoc-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-18T03:18:00Z

## Known limits

- **`baseline: red` của cả ba eval là đỏ-vì-bài-chưa-tồn-tại, không phải đỏ-vì-mã-sai.** Trên `fb38472b`, `apps/api/test/go-thanh-vien.spec.ts` chưa có, nên lệnh eval hỏng và làn baseline ghi đỏ. Nó chứng rằng eval phân biệt được hai cây, KHÔNG chứng rằng mã sản phẩm từng sai. Chiều đỏ THẬT nằm ở S3: mỗi task ghim một thông điệp gọi tên ô bị phá, chạy bằng chính dòng lệnh eval khai.

- **Ma trận AC-1 liệt thủ tục viết trước.** Một thủ tục quản trị thêm sau này không tự vào ma trận; phép đo canh tập hiện có, không canh tập tương lai.

- **Đường kết nạp mồi không tới được qua giao diện sản phẩm.** `removeMember` từ chối gỡ owner cuối cùng, nên bảng thành viên không về 0 bằng đường sản phẩm. AC-3 canh một cánh cửa không khoá, không phải một lỗ đang chảy.

- **Cụm ngoài vùng phủ: 6/16 phát hiện rơi vào file không eval nào trỏ tới** — `_acceptance/config.yaml`, `card.html`, `card-plain.json`, `apps/api/scripts/dev-grant-needed.ts`. Ba file đầu là vật hồ sơ; file thứ tư là mã thật và là sinh đôi của lỗi `dev-session.ts` đã vá trong vòng này.

## Ngoài hợp đồng

16 phát hiện, cả 16 đều `inContract: false` nên không lượt nào thành REJECT. Nội dung đầy đủ ở `review-findings.md`; thẻ Cổng 2 đánh số và trình cho người quyết.

Nặng nhất là ba mục `high`, trong đó hai làn độc lập (`conventions` t1 · `bugs` t8) cùng chỉ MỘT chỗ: nhánh mồi mới viết trong vòng này loại người theo luật «có dòng lời mời đã kết thúc», trong khi luật chính thức của kho — `decideSignIn` — hỏi «có dòng nào CÒN HIỆU LỰC không». Bảng `invitation` không có ràng buộc duy nhất trên `(organizationId, email)` và `allowEmail` tạo dòng mới thay vì sửa dòng cũ, nên chuỗi «gỡ → mời lại» để lại hai dòng cho cùng một email và hai nhánh trong CÙNG một hàm trả lời ngược nhau.

## Analyst

none — every feature eval is red on baseline (discriminates)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3 all passed on first run (red on baseline, green on head). `bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force` all green. No fix loop needed.
