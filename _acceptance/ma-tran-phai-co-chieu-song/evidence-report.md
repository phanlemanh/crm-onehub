---
schema_version: 2
feature_slug: ma-tran-phai-co-chieu-song
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ac9402dd94016886a50257eda74d2023bc82ff40
human_signoff:
---

# Evidence Report: ma-tran-phai-co-chieu-song

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ma-tran-phai-co-chieu-song-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mt_bat_bien
  verified_at: 2026-09-12T22:10:00Z
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [55.00ms]

- eval: E2
  run_id: minted-ma-tran-phai-co-chieu-song-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mt_cong_hai_bien_the
  verified_at: 2026-09-12T22:10:00Z
  output: |
    0 fail
    10 expect() calls
    Ran 2 tests across 1 file. [58.00ms]

- eval: E3
  run_id: minted-ma-tran-phai-co-chieu-song-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mt_dot_bien_hai_tep
  verified_at: 2026-09-12T22:10:00Z
  output: |
    san 1 -> ma 2
    san 2 -> ma 2
    dot-bien-hai-tep: bon dieu deu dung — bai hanh vi bat duoc khoa moi, hai san AST thi khong, va hai san van doc dung cay

- eval: E4
  run_id: minted-ma-tran-phai-co-chieu-song-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mt_khong_moc_lai
  verified_at: 2026-09-12T22:10:00Z
  output: |
    hinh dang ghim so luong ma khong ghim khac biet
      apps/agent/test/quyen-luot.spec.ts:133 — ghim so luong cua "BIEN_THE" roi duyet chinh no trong than describe, ma khong so cheo hai luot
    khong-moc-lai: 3 vecto deu do dung nhu khai — cay-lai-for-of, cay-lai-foreach, cay-lai-it-each

- eval: E5
  run_id: minted-ma-tran-phai-co-chieu-song-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mt_ho_so_cu_con_chay
  verified_at: 2026-09-12T22:10:00Z
  output: |
    7 expect() calls
    Ran 2 tests across 1 file. [16.00ms]
    ho-so-cu-con-chay: chin lenh may cua hai ho so da ky deu thoat 0

- eval: E6
  run_id: minted-ma-tran-phai-co-chieu-song-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mt_neo_bien_the
  verified_at: 2026-09-12T22:10:00Z
  output: |
    da ghim trong chan do: 2
    them mot nhanh la viec phai sua ca bai do lan so ghim, khong phai viec de thuoc do oan
    neo-bien-the: 1 vecto deu do dung nhu khai — them-nhanh-thu-ba

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-ma-tran-phai-co-chieu-song-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-12T22:10:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-ma-tran-phai-co-chieu-song-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-12T22:10:00Z

- cmd: bun run lint:slop
  run_id: minted-ma-tran-phai-co-chieu-song-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-12T22:10:00Z

- cmd: bunx turbo run build --force
  run_id: minted-ma-tran-phai-co-chieu-song-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-12T22:10:00Z

## Known limits

Một finding TRONG hợp đồng còn mở: sàn của AC-4 dò phép so chéo ở phạm vi cả bài chứ không phải thân vòng, nên hình dạng cũ cấy vào BÊN TRONG một bài đã có so chéo thì lọt. Ba vectơ hiện có đều cấy một bài MỚI nên không chạm chỗ này — ba điểm-case cùng một vị trí. Người ký quyết ở Cổng 2.

## Ngoài hợp đồng

6 finding ngoài hợp đồng; chi tiết và đề xuất ở `review-findings.md`.

- low · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs` — Cửa hậu env KHAI_SINH cho phép đổi bản khai đã ghim, không ai dùng và không khai ở đâu
- medium · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs` — khai-sinh.mjs: vector dispatch gives exit 2 for "caught", "survived", and "no such vector" alike
- medium · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs` — chung.mjs: failed `git worktree remove` is swallowed, leaving a stale registration in the shared git dir
- low · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs` — tu-kiem-khung.mjs: restore-on-signal handler is removed before the window it is meant to protect
- medium · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/bo-do-grep.mjs` — Assertion âm-tính-một-mình: điều 2 của bo-do-grep không có đối chứng dương riêng
- low · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/cong-quyen-do.mjs` — Không ghim được thông điệp: chuỗi ghim của E1/E5 trong khai-sinh.json là chính banner của răng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — khong co eval nao co runs > 1

## Iterations

Round 1: khong eval nao do — sau eval may deu PASS. Verdict REJECT vi mot lenh suite: `bun run test` thoat 1 voi `@crm/db` 2 fail + 2 errors, **94 bai tren 9 tep**, trong khi chay tay NAM luot deu 125 bai / 0 fail / exit 0 (ba luot tran, mot luot cung `turbo build --force` + `lint --force`, mot luot duoi tai 24 cay sao). Delta 31 bai khong chay nghia la vai tep test khong nap duoc, khong phai assert sai; `@crm/db` la goi vong nay khong cham. Agent cham chi chup so dem, khong chup ten bai do — nen nguyen nhan CHUA truy duoc, va khong duoc doc thanh mot chan doan. Tam finding xac nhan, HAI trong hop dong (deu da va truoc vong 2): lenh cong goi script tran nen bon vecto khai trong `expected` khong lenh nao chay chung (HIGH); va dot bien song sot bao bang ma 3 trong khi E6 khai ma 2 — chot ca hai ve ma 2, thuoc do thung la vi pham. Sau finding con lai ngoai hop dong, phan lon thuoc khung rang cua ho so truoc. Hop dong ve draft de sua `expected` da ky, qua Cong 1 lan hai (13/09), roi mo vong 2.

Round 2: sau eval may (E1-E6) va bon lenh suite (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) deu thoat 0 trong cung mot lan chay — `bun run test` khong con lech 94/125 bai cua vong 1. Ba vecto doi chung cua E4 (cay-lai-for-of, cay-lai-foreach, cay-lai-it-each) va vecto them-nhanh-thu-ba cua E6 deu do dung nhu khai; hai san AST cua E3 van doc dung cay tren ban sao dot bien. Khong eval nao UNCERTAIN, khong eval nao runs > 1. Verdict PASS.