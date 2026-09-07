---
schema_version: 2
feature_slug: auto-pr-thoi-do-o-ban-re
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6dc14a87440fb662aff03525258a0bb217b2fa37
human_signoff: Manh Phan 2026-09-07 — ký Cổng 2 trên verdict PASS của vòng chấm 5 (14/14 eval, 4 lệnh chứng xanh), với MƯỜI MỘT giới hạn đã khai. Ký trên hiểu biết rằng năm eval chiều đỏ E10-E14 là trang trí đã khai chứ không phải bằng chứng, rằng năng lực phân biệt chỉ được xác nhận bằng tay, rằng `bun run build` — lệnh chứng thứ năm của kho — không nằm trong AC-3, và rằng nhánh còn sau `origin/onehub` 16 commit với merge sạch.
---

# Evidence Report: auto-pr-thoi-do-o-ban-re

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-3 | script | PASS |
| E7 | AC-3 | test | PASS |
| E8 | AC-1 | script | PASS |
| E9 | AC-1 | script | PASS |
| E10 | AC-1 | script | PASS |
| E11 | AC-2 | script | PASS |
| E12 | AC-2 | script | PASS |
| E13 | AC-1 | script | PASS |
| E14 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-auto-pr-thoi-do-o-ban-re-E1-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.apr_check_run
  verified_at: 2026-09-07T09:00:00Z
  output: |
    Open a pull request into main = skipped

- eval: E2
  run_id: minted-auto-pr-thoi-do-o-ban-re-E2-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_lech_so_dong
  verified_at: 2026-09-07T09:00:00Z
  output: |
    EXIT_CODE: 0

- eval: E3
  run_id: minted-auto-pr-thoi-do-o-ban-re-E3-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_lech_noi_dung
  verified_at: 2026-09-07T09:00:00Z
  output: |
    (no stdout — grep -qxF matched silently)

- eval: E4
  run_id: minted-auto-pr-thoi-do-o-ban-re-E4-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-07T09:00:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    5.605s

- eval: E5
  run_id: minted-auto-pr-thoi-do-o-ban-re-E5-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-07T09:00:00Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    348ms

- eval: E6
  run_id: minted-auto-pr-thoi-do-o-ban-re-E6-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-07T09:00:00Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 463ms on 909 files with 9 rules using 14 threads.

- eval: E7
  run_id: mtqs16at5x5q
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-07T09:00:00Z
  output: |
      Time:    23.698s

    test-run: dropped crm_mtqs16at5x5q_test

- eval: E8
  run_id: minted-auto-pr-thoi-do-o-ban-re-E8-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_moc_to_tien
  verified_at: 2026-09-07T09:00:00Z
  output: |
    (no output — git merge-base --is-ancestor exited 0)

- eval: E9
  run_id: minted-auto-pr-thoi-do-o-ban-re-E9-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_moc_khop_cay
  verified_at: 2026-09-07T09:00:00Z
  output: |
    EXIT_CODE=0

- eval: E10
  run_id: minted-auto-pr-thoi-do-o-ban-re-E10-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.apr_check_run_do
  verified_at: 2026-09-07T09:00:00Z
  output: |
    acceptance gate = success
    Open a pull request into main = failure

- eval: E11
  run_id: minted-auto-pr-thoi-do-o-ban-re-E11-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.apr_lech_so_dong_do
  verified_at: 2026-09-07T09:00:00Z
  output: |
    No output from command — test passed silently (no file changes detected)

- eval: E12
  run_id: minted-auto-pr-thoi-do-o-ban-re-E12-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.apr_lech_noi_dung_do
  verified_at: 2026-09-07T09:00:00Z
  output: |
    (no output — grep found no `if: github.repository` line in the diff)

- eval: E13
  run_id: minted-auto-pr-thoi-do-o-ban-re-E13-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.apr_moc_to_tien_do
  verified_at: 2026-09-07T09:00:00Z
  output: |
    (no output — merge-base is-ancestor returned non-zero as expected)

- eval: E14
  run_id: minted-auto-pr-thoi-do-o-ban-re-E14-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.apr_moc_khop_cay_do
  verified_at: 2026-09-07T09:00:00Z
  output: |
    Command completed with no output. Exit status 0 indicates git diff returned non-zero (changes exist in .github/workflows/auto-pr.yml between commits c042478 and 5ac85ef).

## Known limits

Mười một giới hạn. Ba mục đầu là **mới**, đo được trong vòng chấm 5 và trước khi ký.

### 1. Năm eval chiều đỏ (E10–E14) KHÔNG chứng minh được năng lực phân biệt

Chúng ghim `origin/release`, `c042478`, `5ac85ef` — **không cái nào đọc cây đang kiểm**.
Bốn phép thử chạy ngày 07/09, kết quả nguyên văn:

| Phép thử | E10–E14 | E2 / E3 / E9 (chiều xanh) |
| --- | --- | --- |
| Thay mốc ghim bằng SHA không tồn tại | đạt hết — git thoát 128, `test $? -ne 0` nuốt | — |
| Chạy từ thư mục không phải kho git | đạt — git lỗi ra stderr, `test -z "$(…)"` thấy stdout rỗng | đỏ đúng |
| **Xoá dòng khoá khỏi cây làm việc** | **đạt hết cả năm** | **đỏ cả ba** |
| Đổi thụt 4→2 dấu cách (tầng sai, vẫn 1 dòng thêm) | không cái nào phản ứng | E3 đỏ; E2 lọt |

Hai khuyết tật: **hằng số với cây** (không phản ứng khi bản vá bị gỡ) và **fail-open**
(git hỏng cũng cho mã đạt). Khuôn đúng của kho — `rang_microsoft_do` — gọi một script
sống trong kho dựng ca âm **từ cây hiện tại**; năm ô này bỏ mất cơ chế ấy.

**Giữ chứ không xoá**, vì vòng chấm 5 đã chấm trên đúng bộ 14 eval này; xoá là đổi bộ đo
sau phán quyết, đúng lỗi «hồ sơ tả một bộ tiêu chí không còn tồn tại» mà vòng 3 và 5 đều
bắt. Chúng ở lại như **trang trí đã khai**, không phải bằng chứng.

Câu ở Coverage «10/10 ô chiều được ĐĂNG KÝ… không còn ô nào là lời khai» **đúng về hình
thức, sai về thực chất**: năm ô đỏ có mặt trong `evals.yaml` nhưng không đo gì về bản vá.

### 2. Năng lực phân biệt được xác nhận BẰNG TAY, không bằng eval đã đăng ký

Dòng thứ ba của bảng trên là bằng chứng mà năm ô đỏ định mang: **xoá dòng `if:` khỏi cây
làm việc thì E2, E3, E9 cùng đỏ.** Đo bằng tay ngày 07/09, cây đã khôi phục sạch ngay
sau. Đây là lời khai của một phiên làm việc, không tái lập được bằng `recheck: strict` —
khai đúng như thế thay vì dựng thêm một ô cắm rỗng nữa.

### 3. AC-3 khai BỐN lệnh chứng; kho nay chứng bằng NĂM — và lệnh thứ năm ĐANG ĐỎ TRÊN `onehub`

`CLAUDE.md` thêm `bun run build` làm lệnh chứng thứ năm ngày 07/09, với lý do ghi thẳng:
*một hồi quy làm `next build` đỏ đã đi qua bốn vòng đã ký mà không cổng nào thấy*. AC-3
và E4–E7 của hồ sơ này phủ bốn lệnh cũ. **`bun run build` không được đo ở đây.**

**Đo được ngày 07/09 trên cây đã merge `onehub`:** `bun run build` trả mã 1 —
`Export encountered an error on /(app)/[slug]/settings/page`. Bốn suite còn lại xanh.

Lỗi ấy **không phải của bản vá này**, và đây là chuỗi nhân quả đo được, không phải lời
bào chữa:

1. Bản vá chạm đúng một dòng trong `.github/workflows/auto-pr.yml`. `next build` không
   đọc `.github/`. Không có đường nhân quả.
2. Trang hỏng, `settings/page`, **không đổi** trong 16 commit merge vào
   (`git diff --name-only 5ac85ef origin/onehub -- 'apps/app/app/(app)/[slug]/settings/*'`
   trả về rỗng).
3. Bản vá cho chính lỗi này **đã tồn tại nhưng chưa vào `onehub`**: commit `6b45fc2`
   *«dựng vỏ tĩnh được trở lại — root layout và 15 màn đọc tiếng trong Suspense»*, nhắm
   `apps/app/app/layout.tsx` đọc thẳng `cookies()` + `headers()` nên *«chặn mọi route kể
   cả /_not-found»*. Nó nằm trên nhánh `feat/lenh-dung-do-khong-ai-thay`, cùng với commit
   `5324ff8` đưa `bun run build` thành lệnh chứng thứ năm. Cả hai chưa merge.

Nói thẳng: **`onehub` hôm nay đỏ ở `bun run build`.** Hồ sơ này không sửa việc đó và
không giả vờ đo nó. `feature_loop.suite_keys` trên cây đã merge vẫn khai bốn lệnh, nên
làn re-pin chạy đúng bốn lệnh ấy — xanh cả bốn.

### 4. Nhánh sau `origin/onehub` 16 commit

Đo trước khi ký: merge sạch, 0 xung đột, và `.github/workflows/auto-pr.yml` **không ai
đụng** giữa `5ac85ef` và `origin/onehub` — nên mốc ghim `c042478` còn đứng và bản vá còn
áp được. Hồ sơ chưa chấm lại trên cây đã merge.

### 5–11. Bảy giới hạn từ các vòng trước

5. **Không đo được hành vi ở kho hãng.** Cần quyền đẩy lên `trycompai/crm`.
6. **AC-1 phụ thuộc `gh` đăng nhập và mạng.** Thất bại phải đọc là *không đo được*, và
   lệnh trần không phân biệt được bằng mã thoát.
7. **`pr-base.yml` còn mang bệnh** (`--base main`), đang ngủ, không phép đo nào canh.
8. **Độ lệch nội dung đầu tiên trong một tệp workflow của hãng.** Chủ kho quyết 07/09
   không gửi lên hãng; mỗi lượt hãng sửa tệp ấy từ nay phải xử tay.
9. **E9 khoá cả tệp workflow vào `c042478`.** Lượt đầu hãng sửa `auto-pr.yml` thì E9
   không xanh lại được và phải sửa mốc ghim.
10. **Chiều đỏ khai cho E2 đúng-theo-cấu-tạo** — xem mục 1.
11. **E2/E3 so với `origin/release` cục bộ, không `fetch` trước.**

## Ngoài hợp đồng

Toàn bộ ở `review-findings.md`. Định đoạt sau quyết định của chủ kho ngày 07/09:

| Finding | Định đoạt |
| --- | --- |
| Bốn eval đỏ nuốt lỗi git thành mã đạt (high) | **khai** — Known limits 1, giữ nguyên |
| Năm eval đỏ là hằng số với cây (high) | **khai** — Known limits 1, giữ nguyên |
| E12 không đảo được khẳng định mang tải của E3 (medium) | **khai** — Known limits 1, hàng thứ tư |
| Hồ sơ bằng chứng phủ E1–E9 trong khi evals có E1–E14 (medium) | **đã hết** — báo cáo này là của vòng 5, phủ đủ 14 |
| Ghim slug kho hãng thay vì hỏi `fork == false` (low) | **để nguyên** — hành vi hiện tại đúng; đổi sang lối fork-generic sẽ làm E3 đỏ vì nó khoá nguyên văn chuỗi |
| Không gửi lên hãng (medium, vòng 3) | **quyết định của chủ kho** — Out of scope + Known limits 8 |
| AC-2 khoá độ lệch ở `1 0` (medium, vòng 3) | **chủ ý** — bản rẽ cố tình giữ dòng khoá riêng |
| «E9 là eval DUY NHẤT» sai (medium, vòng 3) | **đã đính chính** |

## Analyst

- E1, E10 — trạng thái check-run của hai commit lịch sử cố định (`c042478` skipped, `5ac85ef` failure); không đọc cây đang xét. Regression-guard có chủ ý, không phải bug.
- E11, E12, E14 — chiều đỏ so hai commit cố định (`origin/release`, `5ac85ef`), không đọc cây làm việc hay HEAD; xanh trên cả HEAD lẫn baseline vì đầu vào bất biến. Xem review-findings.md — cần viết lại để đọc cây đang xét.
- E4, E5, E6, E7 — check-types/lint/lint:slop/test toàn kho xanh trên cả HEAD lẫn baseline vì bản vá chỉ sửa một file workflow, ngoài phạm vi các suite này quét. Regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: E7 (`bun run test`) thoát mã 1 một lần; chạy lại ngay cho 257 pass / 0 fail / 11 task — flake môi trường, không phải hồi quy.
Round 5: đăng ký đủ năm eval chiều đỏ E10–E14; toàn bộ 14 eval xanh; verdict PASS.

### Re-pin lần 1 — 07/09, do merge `onehub` vào nhánh trước khi mở PR

run_id: repin-20260907T075500Z-4182
sha: 6dc14a87440fb662aff03525258a0bb217b2fa37 · suites: 4 lệnh exit 0

Vì sao phải re-pin: merge `onehub` mang 16 commit mã mới vào cây, nên mốc ghim cũ
`4f8e36a` thành lệch và cổng trả *«evidence is stale — code changed after verify»*. Làn
đo tươi độc lập chạy tại `6dc14a87440fb662aff03525258a0bb217b2fa37`: bốn suite đã khai đều mã 0, `git rev-parse HEAD` và
`git status --porcelain` giống hệt trước và sau làn — cây không bị đổi.

Làn ấy chạy thêm `bun run build` (lệnh thứ năm, ngoài `suite_keys`) và nó **mã 1**. Xem
Known limits 3: lỗi đã có sẵn trên `onehub`, bản vá cho nó nằm trên một nhánh khác chưa
merge, và không có đường nhân quả nào từ một dòng YAML trong `.github/` tới `next build`.

Chữ ký người giữ nguyên, không đụng. Một chi tiết trong câu ký nay lỗi thời theo đúng
nghĩa tốt: nó viết *«nhánh còn sau `origin/onehub` 16 commit với merge sạch»* — merge ấy
đã thực hiện, sạch đúng như đo, và đây là dòng ghi lại điều đó.
