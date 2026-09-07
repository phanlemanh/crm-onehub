---
schema_version: 2
feature_slug: auto-pr-thoi-do-o-ban-re
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 00a5762bcc4e8dae82d2c8fd9bc635fe8db295d4
human_signoff: Manh Phan 2026-09-07 — ký Cổng 2 trên phán quyết REJECT của vòng chấm 3, với tám giới hạn đã khai trong mục Known limits và bảng định đoạt mười finding trong mục Ngoài hợp đồng. Bản vá đo lại xanh 9/9 bằng làn tươi độc lập tại 00a5762, cây không đổi trước/sau làn.
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

## Evidence

- eval: E1
  run_id: minted-auto-pr-thoi-do-o-ban-re-E1-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.apr_check_run
  verified_at: 2026-09-07T05:30:00Z
  output: |
    (no output — grep -qx matched silently, exit 0)

- eval: E2
  run_id: minted-auto-pr-thoi-do-o-ban-re-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_lech_so_dong
  verified_at: 2026-09-07T05:30:00Z
  output: |
    EXIT_CODE: 0

- eval: E3
  run_id: minted-auto-pr-thoi-do-o-ban-re-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_lech_noi_dung
  verified_at: 2026-09-07T05:30:00Z
  output: |
    (no output — grep -qxF found match and exited silently)

- eval: E4
  run_id: minted-auto-pr-thoi-do-o-ban-re-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-07T05:30:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    7.715s

- eval: E5
  run_id: minted-auto-pr-thoi-do-o-ban-re-E5-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-07T05:30:00Z
  output: |
      Time:    474ms

    Lint summary: @crm/auth (1), @crm/telemetry (1), @crm/ui (2), @crm/db (5), agent (1), app (3), api (3) warnings total. No errors.

- eval: E6
  run_id: minted-auto-pr-thoi-do-o-ban-re-E6-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-07T05:30:00Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 2.0s on 909 files with 9 rules using 14 threads.

- eval: E7
  run_id: minted-auto-pr-thoi-do-o-ban-re-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-07T05:30:00Z
  output: |
    test-run: dropped crm_mtqnt0a25bqa_test
    257 pass / 0 fail across 22 files in 27.351s

- eval: E8
  run_id: minted-auto-pr-thoi-do-o-ban-re-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_moc_to_tien
  verified_at: 2026-09-07T05:30:00Z
  output: |
    (no output — git merge-base --is-ancestor exited silently, exit 0)

- eval: E9
  run_id: minted-auto-pr-thoi-do-o-ban-re-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_moc_khop_cay
  verified_at: 2026-09-07T05:30:00Z
  output: |
    (no output — git diff --quiet exited silently, exit 0)

## Known limits

Tám giới hạn, chép từ `contract.md` mục Known limits để CỔNG đọc được — vòng trước khai
chúng vào `contract.md`, tệp mà `xanh_sach_check()` không đọc, nên cổng tự kết
«xanh-sạch, KHÔNG mời ký» cho một hồ sơ có ba finding mức high. Đó là lỗi ghi sai chỗ,
và nó làm mất chữ ký của người.

1. **Không đo được hành vi ở kho hãng.** «Job vẫn chạy bình thường ở `trycompai/crm`» là
   suy luận từ ngữ nghĩa `if`, không phải số đo. Cần quyền đẩy lên kho hãng.
2. **AC-1 phụ thuộc `gh` đăng nhập và mạng.** Thiếu một trong hai thì lệnh thất bại, và
   thất bại ấy phải đọc là *không đo được*, không phải *bản vá sai*. Lệnh trần không
   phân biệt hai loại ấy bằng mã thoát.
3. **`pr-base.yml` còn mang bệnh.** Cùng `--base main`. Đang ngủ vì bản rẽ không PR vào
   `release`. Không phép đo nào canh nó.
4. **Độ lệch nội dung đầu tiên trong một tệp workflow của hãng.** Trước vòng này
   `git diff origin/release -- .github/` chỉ có `acceptance.yml`, tệp thêm mới nên không
   bao giờ xung đột. Từ nay mỗi lượt hãng sửa `auto-pr.yml` đều phải xử tay. Chủ kho
   quyết 07/09: không gửi lên hãng, chỉ làm trong kho này và `crm-onehub`.
5. **E9 khoá cả tệp workflow vào commit `c042478`.** Lượt đầu hãng sửa `auto-pr.yml` thì
   E9 không xanh lại được, còn E1 vẫn trả `skipped` từ check-run đóng băng. Khi ấy AC-1
   có một chân luôn đỏ và một chân không đo gì.
6. **Bốn finding ngoài hợp đồng của vòng chấm 1 chưa xử.** Ba mục nằm trong bộ đo đã xoá
   nên tự hết; còn lại việc vẽ lại bản đồ, đã làm và khai lệch luật trong sổ quyết định.
7. **Chiều đỏ khai cho E2 đúng-theo-cấu-tạo.** `git diff --numstat HEAD` rỗng với mọi
   cây, có vá hay không. E3 là vế mang tải của AC-2.
8. **E2/E3 so với `origin/release` cục bộ, không `fetch`.** Sau một lượt kéo bản hãng
   làm ref ấy đổi, cả hai vẫn xanh trong khi lệch thật đã khác.

## Ngoài hợp đồng

Mười finding của vòng chấm 3, tám mục ngoài hợp đồng, cộng chín mục của vòng 2 — đầy đủ
ở `review-findings.md`. Trạng thái sau quyết định của chủ kho ngày 07/09:

| Finding | Định đoạt |
| --- | --- |
| Hai mục khai rỗng khiến cổng tự kết xanh-sạch (high ×2) | **đã sửa** — chính hai mục này |
| Vá riêng không có đường lên hãng (medium) | **chủ kho quyết không gửi** — ghi Out of scope + Known limits 4 |
| AC-2 khoá độ lệch ở `1 0` vĩnh viễn (medium) | **chủ ý**, không phải lỗi — bản rẽ cố tình giữ dòng khoá riêng |
| «E9 là eval DUY NHẤT» sai (medium) | **đã đính chính** — đo lại: E3 cũng bắt được |
| E9 giòn khi hãng sửa workflow (medium) | ghi Known limits 5 |
| Chiều đỏ E2 đúng-theo-cấu-tạo (high) | ghi Known limits 7 |
| Chiều đỏ E3 đổi khuôn thay vì đổi cây (medium) | ghi Known limits 7 |
| E8/E9 chưa chạy trong làn có sổ (high ×2, TRONG hợp đồng) | **đã sửa** — làn đo lại 07/09, xem Iterations |

## Vòng chấm 3 bị nhiễm — và đã đo lại

Một agent phản biện của vòng 3 đã **commit vào chính nhánh đang kiểm**:
`93ed39d test: simulate broken tree without patch`, một commit gỡ dòng bản vá, rồi không
dọn. `HEAD` thành commit không có bản vá, và bản đầu của báo cáo này bị ghim vào đúng nó.

Đã gỡ commit ấy, nhánh về nguyên trạng, và **chạy lại toàn bộ 9 eval bằng một làn tươi
độc lập** tại `00a5762`: 9/9 mã 0, `git rev-parse HEAD` và `git status --porcelain`
giống hệt nhau trước và sau làn — cây không bị đổi. Mốc ghim của báo cáo này là kết quả
làn ấy, không phải kết quả đo trên cây đã bẩn.

Lỗi của bộ kit, đã mở chip riêng sang `~/dev/acceptance-gate-kit`; không sửa tại chỗ.

## Analyst

- E1 (`gh api ... check-runs | grep -qx 'Open a pull request into main = skipped'`) — green trên cả baseline lẫn feature: eval này không tự phân biệt được cây có vá hay không (nó đọc check-run bất biến của commit đã ghim). Sức phân biệt của AC-1 nằm ở E8 + E9, không ở E1 một mình.
- E5 (`bunx turbo run lint --force`) — green trên cả hai phía: lint không đổi do bản vá workflow này, đây là regression-guard.
- E6 (`bun run lint:slop`) — green trên cả hai phía: cùng lý do, regression-guard cho code slop, không phải phép đo của tính năng.

## Variance

none — không eval nào trong vòng này có `runs` > 1; mọi lệnh là deterministic, chạy một lần.

## Iterations

Round 1: bộ eval ban đầu (script `khoa-auto-pr.mjs`, hình dạng đặc tả cũ) — 8/8 lệnh chạy, verdict REJECT. Quay lại implementation, đổi bộ đo sang đối chiếu GitHub check-run + diff `origin/release`.
Round 2: E1–E7 (bộ đo mới) — 7/7 pass, verdict PASS tại `e035792`. Sau đó AC-1 được viết lại và thêm E8 + E9 vào evals.yaml; bằng chứng round 2 không phủ hai eval mới, nên PASS đó thành lỗi thời.
Round 3 (vòng này): E1, E2, E3, E4, E5, E6, E7, E8, E9 — 9/9 lệnh máy pass tại `verified_commit` đã ghim. Verdict tổng vẫn REJECT: nguyên nhân nằm ở review-findings (bằng chứng cho AC-1 mới hoàn thiện đúng vòng này, cộng các lỗ hổng đối chứng và quy trình phát hiện trong scope-triage), không phải do lệnh máy thất bại — xem review-findings.md.
