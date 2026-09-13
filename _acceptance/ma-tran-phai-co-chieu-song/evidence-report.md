---
schema_version: 2
feature_slug: ma-tran-phai-co-chieu-song
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 314cf0ecdf2c199390f716decd0507f84151c50d
human_signoff: Mạnh 2026-09-13
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
  run_id: minted-ma-tran-phai-co-chieu-song-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mt_bat_bien
  verified_at: 2026-09-13T10:00:00Z
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [56.00ms]

- eval: E2
  run_id: minted-ma-tran-phai-co-chieu-song-E2-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.mt_cong_hai_bien_the
  verified_at: 2026-09-13T10:00:00Z
  output: |
    0 fail
    10 expect() calls
    Ran 2 tests across 1 file. [74.00ms]

- eval: E3
  run_id: minted-ma-tran-phai-co-chieu-song-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mt_dot_bien_hai_tep
  verified_at: 2026-09-13T10:00:00Z
  output: |
    san 1 -> ma 2
    san 2 -> ma 2
    dot-bien-hai-tep: bon dieu deu dung — bai hanh vi bat duoc khoa moi, hai san AST thi khong, va hai san van doc dung cay

- eval: E4
  run_id: minted-ma-tran-phai-co-chieu-song-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mt_khong_moc_lai
  verified_at: 2026-09-13T10:00:00Z
  output: |
    cay sao: /var/folders/bp/cf66dm9n18x8q1rcjsylk6ph0000gq/T/dq-sao-20334-aqmtm6
    vecto: cay-vao-bai-co-san
    khong-moc-lai: 4 vecto deu do dung nhu khai — cay-lai-for-of, cay-lai-foreach, cay-vao-bai-co-san, cay-lai-it-each

- eval: E5
  run_id: minted-ma-tran-phai-co-chieu-song-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mt_ho_so_cu_con_chay
  verified_at: 2026-09-13T10:00:00Z
  output: |
    7 expect() calls
    Ran 2 tests across 1 file. [17.00ms]
    ho-so-cu-con-chay: chin lenh may cua hai ho so da ky deu thoat 0

- eval: E6
  run_id: minted-ma-tran-phai-co-chieu-song-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mt_neo_bien_the
  verified_at: 2026-09-13T10:00:00Z
  output: |
    da ghim trong chan do: 2
    them mot nhanh la viec phai sua ca bai do lan so ghim, khong phai viec de thuoc do oan
    neo-bien-the: 1 vecto deu do dung nhu khai — them-nhanh-thu-ba

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mtz81crn1eta
  exit_code: 0
  verified_at: 2026-09-13T10:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-ma-tran-phai-co-chieu-song-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-13T10:00:00Z

- cmd: bun run lint:slop
  run_id: minted-ma-tran-phai-co-chieu-song-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-13T10:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-ma-tran-phai-co-chieu-song-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-13T10:00:00Z

## Known limits

## Ngoài hợp đồng

7 finding ngoài hợp đồng; chi tiết và đề xuất ở `review-findings.md`.

- medium · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs` — Hằng đường dẫn và helper doiTrongSao nhân bản khắp các module răng thay vì sống ở chung.mjs
- low · `_acceptance/ma-tran-phai-co-chieu-song/rang/khong-moc-lai.mjs` — Răng của ma-tran suy đường dẫn của CHÍNH NÓ bằng cách đi ngược ra khỏi thư mục hồ sơ khác
- medium · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs` — Lỗi dọn cây sao bị nuốt: worktree registration rác ở .git/worktrees dùng chung
- medium · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs` — Đối chứng "khai-thieu-vecto" tự vô hiệu khi dòng được ghim biến mất
- low · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs` — Throw trong finally của voiCaySao nuốt mất lỗi thật đang bay
- low · `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs` — coCo() trả undefined khi cờ đứng cuối argv, mọi script lặng lẽ đổi chế độ
- medium · `_acceptance/ma-tran-phai-co-chieu-song/rang/neo-bien-the.mjs` — Fixture viết tay đúng khuôn bên đọc — neo chỉ round-trip SỐ LƯỢNG nhánh, không round-trip HÌNH DẠNG giá trị

## Analyst

E2 — pass trên cả HEAD lẫn baseline (baseline: green): eval không phân biệt giữa code cũ và code mới, nên hoặc viết lại để assert đúng hành vi mới của round này, hoặc xác nhận đây là regression-guard có chủ ý và ghi rõ trong hợp đồng.

## Variance

none — khong co eval nao co runs > 1

## Iterations

Round 1: khong eval nao do — sau eval may deu PASS. Verdict REJECT vi mot lenh suite: `bun run test` thoat 1 voi `@crm/db` 2 fail + 2 errors, **94 bai tren 9 tep**, trong khi chay tay NAM luot deu 125 bai / 0 fail / exit 0 (ba luot tran, mot luot cung `turbo build --force` + `lint --force`, mot luot duoi tai 24 cay sao). Delta 31 bai khong chay nghia la vai tep test khong nap duoc, khong phai assert sai; `@crm/db` la goi vong nay khong cham. Agent cham chi chup so dem, khong chup ten bai do — nen nguyen nhan CHUA truy duoc, va khong duoc doc thanh mot chan doan. Tam finding xac nhan, HAI trong hop dong (deu da va truoc vong 2): lenh cong goi script tran nen bon vecto khai trong `expected` khong lenh nao chay chung (HIGH); va dot bien song sot bao bang ma 3 trong khi E6 khai ma 2 — chot ca hai ve ma 2, thuoc do thung la vi pham. Sau finding con lai ngoai hop dong, phan lon thuoc khung rang cua ho so truoc. Hop dong ve draft de sua `expected` da ky, qua Cong 1 lan hai (13/09), roi mo vong 2.

Round 2: sau eval may (E1-E6) va bon lenh suite (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) deu thoat 0 trong cung mot lan chay — `bun run test` khong con lech 94/125 bai cua vong 1. Ba vecto doi chung cua E4 (cay-lai-for-of, cay-lai-foreach, cay-lai-it-each) va vecto them-nhanh-thu-ba cua E6 deu do dung nhu khai; hai san AST cua E3 van doc dung cay tren ban sao dot bien. Khong eval nao UNCERTAIN, khong eval nao runs > 1. Verdict PASS.

Round 3: E1-E6 va bon lenh suite (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) deu thoat 0 trong cung mot lan chay tren `314cf0e`. E4 them mot vecto doi chung moi (cay-vao-bai-co-san, diem-case rieng chung minh pham vi do la than vong chu khong phai ca bai) — ca bon vecto cua E4 deu do dung nhu khai. Khong eval nao UNCERTAIN, khong eval nao runs > 1, E2 van khong phan biet tren baseline (ghi o Analyst). Scope-triage xac nhan 7 finding that nhung ngoai hop dong (khong AC nao cua hop dong hien tai phu) — 5/7 nam trong file thuoc ho so `do-quyen-luot-bang-hanh-vi` da ky truoc; nguoi quyet mo rong hop dong hay rut pham vi o Cong 2. Verdict PASS.
