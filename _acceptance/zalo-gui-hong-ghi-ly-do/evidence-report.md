---
schema_version: 2
feature_slug: zalo-gui-hong-ghi-ly-do
verdict: REJECT
failed_evals: ["E8","E9","E10"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9103d5e934566d19a787d89b9076a0d8c49366aa
human_signoff:
---

# Evidence Report: zalo-gui-hong-ghi-ly-do

Round 1. Ba eval đỏ: E8 (đột biến), E9 và E10 (đổi bot). Mười bảy eval còn lại và bảy lệnh suite xanh.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-11 | script | PASS |
| E8 | AC-3 | script | FAIL |
| E9 | AC-7 | test | FAIL |
| E10 | AC-8 | test | FAIL |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-7 | ui-check | PASS |
| E14 | AC-8 | test | PASS |
| E15 | AC-7 | test | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-13 | test | PASS |
| E18 | AC-13 | test | PASS |
| E19 | AC-13 | test | PASS |
| E20 | AC-13 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-zalo-gui-hong-ghi-ly-do-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_mo_ta
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [333.00ms]

- eval: E2
  run_id: minted-zalo-gui-hong-ghi-ly-do-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_408
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [531.00ms]

- eval: E3
  run_id: minted-zalo-gui-hong-ghi-ly-do-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_bay_cho
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [660.00ms]

- eval: E4
  run_id: minted-zalo-gui-hong-ghi-ly-do-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_bo_qua
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [716.00ms]

- eval: E5
  run_id: minted-zalo-gui-hong-ghi-ly-do-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_webhook_thu
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [328.00ms]

- eval: E6
  run_id: minted-zalo-gui-hong-ghi-ly-do-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_rieng_tu
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [544.00ms]

- eval: E7
  run_id: minted-zalo-gui-hong-ghi-ly-do-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.zghl_pham_vi
  verified_at: 2026-10-08T20:29:28Z
  output: |
    PHAM VI: 48 tep, 0 ngoai ranh gioi

- eval: E8
  run_id: minted-zalo-gui-hong-ghi-ly-do-E8-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.zghl_dot_bien
  verified_at: 2026-10-08T20:29:28Z
  output: |
    (fail) can-noi-lai > người đã chọn Zalo mà mất liên kết được báo cần nối lại [62.80ms]
     0 pass, 2 filtered out, 1 fail (phần trước khi phá; stack Prisma, đầu stack bị cắt)
    --- sau
    error: A khong duoc bao noi lai (apps/api/test/zalo-doi-bot.spec.ts:177)
    (fail) can-noi-lai > người đã chọn Zalo mà mất liên kết được báo cần nối lại [121.63ms]
    DOT BIEN: 18/19 cap dat

- eval: E9
  run_id: minted-zalo-gui-hong-ghi-ly-do-E9-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.test.zghl_doi_bot
  verified_at: 2026-10-08T20:29:28Z
  output: |
    PrismaClientKnownRequestError: Invalid `db.zaloLink.create()` invocation in
    packages/db/src/zalo-lien-ket.ts:156:20
    Foreign key constraint violated on the constraint: `zaloLink_crmUserId_fkey`
    code: "P2003"
    (fail) doi-bot-hoi > đổi sang bot khác khi còn liên kết thì hỏi trước, không ghi gì [290.56ms]
     0 pass, 10 filtered out, 1 fail

- eval: E10
  run_id: minted-zalo-gui-hong-ghi-ly-do-E10-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.test.zghl_doi_bot_dong_y
  verified_at: 2026-10-08T20:29:28Z
  output: |
    PrismaClientKnownRequestError: Invalid `db.zaloLink.create()` invocation in
    packages/db/src/zalo-lien-ket.ts:156:20
    Foreign key constraint violated on the constraint: `zaloLink_crmUserId_fkey`
    code: "P2003"
    (fail) doi-bot-dong-y > đồng ý: đăng ký bot mới rồi gỡ liên kết trong một giao dịch [236.46ms]
     0 pass, 10 filtered out, 1 fail

- eval: E11
  run_id: minted-zalo-gui-hong-ghi-ly-do-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_cung_bot
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [465.00ms]

- eval: E12
  run_id: minted-zalo-gui-hong-ghi-ly-do-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_can_noi_lai
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [943.00ms]

- eval: E13
  run_id: minted-zalo-gui-hong-ghi-ly-do-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.zghl_chup
  verified_at: 2026-10-08T20:29:28Z
  screenshot: evidence/E13-doi-bot-1440.png
  observed: |
    E13-doi-bot-1440.png: nen toi, hop thoai giua man hinh tieu de «Đổi sang bot Zalo khác?», mo ta «Đổi sang bot «Bot Mới» sẽ gỡ 3 liên kết Zalo. Mọi người đã nối phải nối lại.», hai nut: «Huỷ» (vien focus) va «Gỡ liên kết và đổi bot» (nut do destructive). Khop Expected (ten bot moi, «3 liên kết», nut «Gỡ liên kết và đổi bot», Huỷ).
    E13-doi-bot-390.png: cung hop thoai o khung dien thoai, noi dung y het, hai nut xep doc ro rang (Gỡ liên kết và đổi bot tren, Huỷ duoi), khong tran, van nhin du ten bot moi va «3 liên kết».
    E13-can-noi-lai-1440.png: trang «Nhắc buổi sáng» muc «Zalo của bạn» voi dong bao «Bot Zalo của công ty đã đổi hoặc liên kết của bạn đã gỡ. Nối lại để nhận nhắc qua Zalo.», ben duoi la cac buoc 1 «Mở Zalo, tìm Bot Cũ», 2 «Lấy mã nối» voi nut xanh «Nối Zalo» ngay canh, 3 «Nhắn mã cho bot». Dong trang thai «Zalo: bạn chưa nối.» o phan Nhan nhac viec qua. Khop Expected (dong bao can noi lai canh «Nối Zalo»).
    E13-can-noi-lai-390.png: cung noi dung o 390, bo cuc doc gon, dong bao can noi lai va nut «Nối Zalo» hien du, khong cuon ngang.
  network_observed: n-a (driver)
  output: |
    Frame luu (da mo bang Read, doi chieu): evidence/E13-doi-bot-1440.png, E13-doi-bot-390.png, E13-can-noi-lai-1440.png, E13-can-noi-lai-390.png.
    Network: driver la script chup.mjs, khong co E13-network.txt.
    Tat ca assertion pass, anh khop Expected.

- eval: E14
  run_id: minted-zalo-gui-hong-ghi-ly-do-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_doi_bot_api
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [1016.00ms]

- eval: E15
  run_id: minted-zalo-gui-hong-ghi-ly-do-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_doi_bot_dom
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 2 tests across 1 file. [826.00ms]

- eval: E16
  run_id: minted-zalo-gui-hong-ghi-ly-do-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_webhook_403
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [530.00ms]

- eval: E17
  run_id: minted-zalo-gui-hong-ghi-ly-do-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_ly_do_ben
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [524.00ms]

- eval: E18
  run_id: minted-zalo-gui-hong-ghi-ly-do-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_canh_bao_khoa
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [855.00ms]

- eval: E19
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_canh_bao_dom
  verified_at: 2026-10-08T20:29:28Z
  output: |
    Ran 1 test across 1 file. [417.00ms]
    (run_id chép nguyên văn từ bản đồ mã của run-log; giá trị ở đó là chuỗi rỗng)

- eval: E20
  run_id: minted-zalo-gui-hong-ghi-ly-do-E20-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.zghl_chup
  verified_at: 2026-10-08T20:29:28Z
  screenshot: evidence/E20-khoa-lech-1440.png
  observed: |
    E20-khoa-lech-1440.png (1440 wide, dark theme): Settings › Kết nối › Zalo page, titled "Zalo", with the "Bot của xưởng" section. An orange-bordered warning card reads "Zalo đang gửi tin bằng khoá cũ". Its body text says "Tin nhắn tới bot đang bị từ chối — có thể một bot đã thay vẫn trò về đây. Đăng ký lại để nhận tin từ bot này." The card contains the "Đăng ký lại" button. Below it are the Bot Token field and the "Đổi token" button. The layout is not cut off and there is no horizontal overflow. This matches Expected: warning and "Đăng ký lại" button shown together.
    E20-khoa-lech-390.png (390 wide, mobile): the same page in a single column. The same orange warning "Zalo đang gửi tin bằng khoá cũ" is wrapped over several lines, and the "Đăng ký lại" button sits inside the card. Nothing is clipped on the right. The tab bar scrolls inside its own area, which does not widen the page. This matches Expected.
  network_observed: n-a (driver)
  output: |
    Both images were opened with Read and match Expected.
    The driver is a script (chup.mjs), not a browser tool with a network reader. No E20-network.txt was written.
    The 403 was sent by the script to the agent as the eval requires.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T20:29:28Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T20:29:28Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T20:29:28Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T20:29:28Z

- cmd: bunx turbo run lint --force
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T20:29:28Z

- cmd: bun run lint:slop
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T20:29:28Z

- cmd: bunx turbo run build --force
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T20:29:28Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E8, E9, E10 failed — E9 và E10 dừng ở dòng «Foreign key constraint violated on the constraint: `zaloLink_crmUserId_fkey`» (db.zaloLink.create tại packages/db/src/zalo-lien-ket.ts:156) khi bàn thử gieo zaloLink; E8 chỉ đạt 18/19 cặp (dòng «DOT BIEN: 18/19 cap dat»), cặp can-noi-lai lỗi Prisma ở phần trước khi phá. Nguyên nhân gốc của lỗi khoá ngoại: chưa rõ (E12 chạy cùng bài can-noi-lai trên cây gốc thì xanh). Returned to implementation.
