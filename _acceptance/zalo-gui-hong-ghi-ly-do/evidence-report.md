---
schema_version: 2
feature_slug: zalo-gui-hong-ghi-ly-do
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cfa18a79bdaedfac24353eb03d5443074ec91ff0
human_signoff:
---

# Evidence Report: zalo-gui-hong-ghi-ly-do

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-11 | script | PASS |
| E8 | AC-3 | script | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
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
  run_id: minted-zalo-gui-hong-ghi-ly-do-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_mo_ta
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01bub2i525_test

- eval: E2
  run_id: minted-zalo-gui-hong-ghi-ly-do-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_408
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01bt8pdd2e_test

- eval: E3
  run_id: mv01bt5mrte8
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_bay_cho
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01bt5mrte8_test

- eval: E4
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_bo_qua
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01bua0pvap_test

- eval: E5
  run_id: mv01bsur6a6e
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_webhook_thu
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01bsur6a6e_test

- eval: E6
  run_id: mv01bu8w3ho9
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_rieng_tu
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01bu8w3ho9_test

- eval: E7
  run_id: minted-zalo-gui-hong-ghi-ly-do-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.zghl_pham_vi
  verified_at: 2026-10-08T21:14:19Z
  output: |
    PHAM VI: 51 tep, 0 ngoai ranh gioi

- eval: E8
  run_id: minted-zalo-gui-hong-ghi-ly-do-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.zghl_dot_bien
  verified_at: 2026-10-08T21:14:19Z
  output: |
    DOT BIEN: 21/21 cap dat

- eval: E9
  run_id: mv01bt4k7bwe
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_doi_bot
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01bt4k7bwe_test

- eval: E10
  run_id: mv01bsu5jkpb
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_doi_bot_dong_y
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01bsu5jkpb_test

- eval: E11
  run_id: minted-zalo-gui-hong-ghi-ly-do-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_cung_bot
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01bywwuug7_test

- eval: E12
  run_id: minted-zalo-gui-hong-ghi-ly-do-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_can_noi_lai
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01c39hgrz8_test

- eval: E13
  run_id: minted-zalo-gui-hong-ghi-ly-do-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.zghl_chup
  verified_at: 2026-10-08T21:14:19Z
  screenshot: evidence/E13-doi-bot-1440.png
  observed: |
    E13-doi-bot-1440.png (dark theme): hop thoai o giua tren nen den kin (trang phia sau khong thay), tieu de «Đổi sang bot Zalo khác?», noi dung «Đổi sang bot «Bot Mới» sẽ gỡ 3 liên kết Zalo. Mọi người đã nối phải nối lại.», hai nut ngang hang: «Huỷ» (dang focus, vien xanh) va nut do «Gỡ liên kết và đổi bot». Khop Expected (ten bot moi, «3 liên kết», nut Gỡ liên kết và đổi bot, nut Huỷ). E13-doi-bot-390.png: cung hop thoai, vua khung 390, chu khong tran, hai nut xep doc: «Gỡ liên kết và đổi bot» (do, tren) roi «Huỷ» (duoi, dang focus); noi dung giong 1440, co «Bot Mới» va «3 liên kết». E13-can-noi-lai-1440.png: trang «Nhắc buổi sáng» muc «Zalo của bạn», dong bao «Bot Zalo của công ty đã đổi hoặc liên kết của bạn đã gỡ. Nối lại để nhận nhắc qua Zalo.», ben duoi la cac buoc 1 «Mở Zalo, tìm Bot Cũ», 2 «Lấy mã nối» voi nut xanh «Nối Zalo», 3 «Nhắn mã cho bot»; phan «Nhận nhắc việc qua» o duoi, «Zalo: bạn chưa nối.». Khop Expected (dong bao can noi lai canh «Nối Zalo»). E13-can-noi-lai-390.png: cung noi dung o khung dien thoai, xuong dong dung, khong tran ngang, dong bao va nut «Nối Zalo» hien du. Khong frame nao mau thuan Expected.
  network_observed: n-a (driver)
  output: |
    Phien do tu dung: kho crm_okr_cua_toi_tach_theo_doi_do, app :4406, api :4887, da don sau khi xong. Canh cay qua, ban do dung duoc.
    Ket luan chup.mjs: 16 DUNG, 0 SAI. Dong E13: 1440 va 390 deu DUNG hop neu ten bot moi va so lien ket; DUNG nut «Gỡ liên kết và đổi bot» va Huỷ; DUNG thong bao can noi lai; DUNG tran ngang 0px.
    Frame da luu: E13-doi-bot-1440.png, E13-doi-bot-390.png, E13-can-noi-lai-1440.png, E13-can-noi-lai-390.png (thu muc evidence/).

- eval: E14
  run_id: minted-zalo-gui-hong-ghi-ly-do-E14-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_doi_bot_api
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01c440rkvl_test

- eval: E15
  run_id: minted-zalo-gui-hong-ghi-ly-do-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_doi_bot_dom
  verified_at: 2026-10-08T21:14:19Z
  output: |
    Ran 2 tests across 1 file. [642.00ms]

- eval: E16
  run_id: minted-zalo-gui-hong-ghi-ly-do-E16-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_webhook_403
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01c5lp3ysk_test

- eval: E17
  run_id: mv01c5kthufm
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_ly_do_ben
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01c5kthufm_test

- eval: E18
  run_id: minted-zalo-gui-hong-ghi-ly-do-E18-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_canh_bao_khoa
  verified_at: 2026-10-08T21:14:19Z
  output: |
    test-run: dropped crm_mv01c6etuunc_test

- eval: E19
  run_id: minted-zalo-gui-hong-ghi-ly-do-E19-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zghl_canh_bao_dom
  verified_at: 2026-10-08T21:14:19Z
  output: |
    Ran 1 test across 1 file. [423.00ms]

- eval: E20
  run_id: minted-zalo-gui-hong-ghi-ly-do-E20-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.zghl_chup
  verified_at: 2026-10-08T21:14:19Z
  screenshot: evidence/E20-khoa-lech-1440.png
  observed: |
    E20-khoa-lech-1440.png: trang Ket noi > Zalo, vung "Bot cua xuong" co hop canh bao vien cam "Zalo dang gui tin bang khoa cu" kem mo ta "Tin nhan toi bot dang bi tu choi — co the mot bot da thay van tro ve day. Dang ky lai de nhan tin tu bot nay." va nut "Dang ky lai" ngay trong hop; duoi la o Bot Token va nut "Doi token"; khong tran ngang. E20-khoa-lech-390.png: cung canh bao khoa lech vien cam va nut "Dang ky lai" xep dung cot tren man hep, chu xuong dong gon, Bot Token va "Doi token" ben duoi, khong tran ngang (thanh tab ngang cua menu cuon trong vung rieng, la hanh vi thiet ke). Khop Expected.
  network_observed: n-a (driver)
  output: |
    Phien do tu dung (cho khoa 36s, kho crm_okr_cua_toi_tach_theo_doi_do, app :4893, api :4411), KET LUAN: 16 DUNG, 0 SAI.
    Assertion E20 deu DUNG: webhook khoa lech bi tu choi; log "[zalo] webhook 403 ly_do=khoa-lech"; 1440 va 390 deu co canh bao khoa lech, co nut Dang ky lai, tran ngang 0px.
    Frame da luu: evidence/E20-khoa-lech-1440.png, evidence/E20-khoa-lech-390.png. Phien do tu don khi xong.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-08T21:14:19Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-08T21:14:19Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-08T21:14:19Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-08T21:14:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-08T21:14:19Z

- cmd: bun run lint:slop
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-08T21:14:19Z

- cmd: bunx turbo run build --force
  run_id: minted-zalo-gui-hong-ghi-ly-do-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-08T21:14:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — E8, E9, E10 do; AC-8 ghi token va ten bot moi ngoai giao dich truoc setWebhook. Returned to implementation.
Round 2: PASS — doi bot chi ghi khoa truoc setWebhook, token va ten bot vao giao dich, go webhook bot moi khi giao dich hong; rieng-tu chay lai ca hai ma tran; tat ca 20 eval va 7 lenh suite xanh.
