---
schema_version: 2
feature_slug: tro-ly-okr-bo-final-output
verdict: REJECT
failed_evals: ["E6","E7","E8"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 74afb793ee291d0f2b88fdbe88faa551cadc1510
human_signoff:
---

# Evidence Report: tro-ly-okr-bo-final-output

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | script | FAIL |
| E7 | AC-6 | script | FAIL |
| E8 | AC-7 | script | FAIL |
| E9 | AC-8 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |

## Evidence

- eval: E1
  run_id: minted-tro-ly-okr-bo-final-output-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tbf_khong_khuon_ra
  verified_at: 2026-10-06T23:43:08Z
  output: |
    cd apps/agent && bun test test/tro-ly-okr-khong-khuon-ra.spec.ts
    Ran 3 tests across 1 file. [87.00ms]

- eval: E3
  run_id: muxbvdugfvl3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tbf_dong_gop_y
  verified_at: 2026-10-06T23:43:08Z
  output: |
    bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-dong-viec.integration.spec.ts -t gop-y"
    test-run: dropped crm_muxbvdugfvl3_test

- eval: E4
  run_id: minted-tro-ly-okr-bo-final-output-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tbf_dong_tom_tat
  verified_at: 2026-10-06T23:43:08Z
  output: |
    bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-nop-tom-tat.integration.spec.ts -t dong-viec-tom-tat"
    test-run: dropped crm_muxbve1dahwu_test

- eval: E5
  run_id: muxbvdftwjqn
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tbf_luoi
  verified_at: 2026-10-06T23:43:08Z
  output: |
    bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-dong-viec.integration.spec.ts -t luoi"
    test-run: dropped crm_muxbvdftwjqn_test

- eval: E6
  run_id: minted-tro-ly-okr-bo-final-output-E6-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tbf_do_mo_hinh
  verified_at: 2026-10-06T23:43:08Z
  output: |
    Lệnh chung của E6, E7, E8: bun _acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs
    Đoạn đuôi bắt được chỉ cho thấy phần [e24] đỏ; nó không cho thấy giá trị của [tu-kiem] và [e22].
    E6 bị tính đỏ theo mã thoát chung của lệnh (mã thoát chỉ bằng 0 khi cả bốn phần đạt).
    SAI p90 20702 > 15000
    KHONG DAT
    [e24] ma 1 · luot hong 0 → DO do-tre thoat 1

- eval: E7
  run_id: minted-tro-ly-okr-bo-final-output-E7-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tbf_do_mo_hinh
  verified_at: 2026-10-06T23:43:08Z
  output: |
    Lệnh chung của E6, E7, E8: bun _acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs
    Đoạn đuôi bắt được không in dòng [e17] nào; E7 bị tính đỏ theo mã thoát chung của lệnh.
    SAI p90 20702 > 15000
    KHONG DAT
    [e24] ma 1 · luot hong 0 → DO do-tre thoat 1

- eval: E8
  run_id: minted-tro-ly-okr-bo-final-output-E8-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tbf_do_mo_hinh
  verified_at: 2026-10-06T23:43:08Z
  output: |
    do-tre.sql okr.thang=2026-10: [{"nac":"bat","so_luot_do":20,"p50_ms":6928,"p90_ms":20702},{"nac":"an","so_luot_do":0,"p50_ms":null,"p90_ms":null}]
    20 so: 5744, 7202, 4621, 9826, 14687, 13438, 6280, 9754, 5125, 25015, 21343, 6326, 14721, 6765, 6816, 5318, 20631, 5781, 5285, 7039
    p50 6928 ms (nguong 8000) · p90 20702 ms (nguong 15000) · 0 luot hong tinh 30000
    SAI do-tre.sql p90 20702 > 15000
    SAI p90 20702 > 15000
    KHONG DAT
    phien-do: kho crm_wizardly_dewdney_69d0fd_tro_ly_do · app http://localhost:4495 · api http://localhost:4145
    [e24] ma 1 · luot hong 0 → DO do-tre thoat 1

- eval: E2
  judged_by: judge-subagent (fresh context), panel đề xuất ba lens: domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  rationale: Cả hai chỉ dẫn (instructions.md và chi-dan-tom-tat.ts) không còn câu đòi khuôn kết quả hay tool thứ hai; nộp xong trả lời «done».
  votes:
    - domain-correctness: PASS — Không câu nào bảo kết bằng khối JSON hay khuôn kết quả. instructions.md ghi «your first reply is the `nop_de_xuat` call», chi-dan-tom-tat.ts ghi tương tự cho `nop_tom_tat`; câu cuối mỗi chỉ dẫn là «reply `done` and stop. Call no other tool.».
    - operational-feasibility: PASS — Cả hai chỉ dẫn nói lời gọi nộp là việc đầu tiên và kết bằng «done»; không có câu nào bảo gọi thêm tool, nên phiên con làm được đúng như chỉ dẫn.
    - spec-alignment: PASS — Trong cả hai tệp không có câu nào bảo kết bằng khối JSON, khuôn kết quả hay tool khác; tool nộp là việc đầu và đúng một chữ «done» là việc cuối.
  human_override:  # chi nguoi ghi

- eval: E9
  judged_by: judge-subagent (fresh context), panel đề xuất ba lens: domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  rationale: Đoạn «Phiên con không khai khuôn kết quả (07/10)» trong docs/agent.md nêu đủ gốc, số đo và phủ nhận câu «Act at once…».
  votes:
    - domain-correctness: PASS — Đoạn nêu gốc là tool `final_output` do eve thêm khi `tro_ly_okr` khai `outputSchema`, đá với lệnh «câu đầu là `nop_de_xuat`», và Gemini 3.8 Flash hết trần 2.000 token rồi trả rỗng (`finishReason: length`). Có số đo 07/10 (17/88 lời gọi đầu rỗng; 7/47 từ 27–30/09; chỉ `nop_de_xuat` 0/22 hết trần, thêm `final_output` 5/8). Câu «Act at once…» được nêu là không chữa được, số 0/24 cũ là mẫu nhỏ.
    - operational-feasibility: PASS — Đoạn (docs/agent.md dòng 1247–1259) nêu đúng gốc, có số đo 07/10 và không còn khẳng định câu «Act at once…» đưa lỗi về 0.
    - spec-alignment: PASS — Đoạn nêu đúng gốc, có số đo 07/10, và phủ nhận câu «Act at once…»: không chữa được, số 0/24 cũ là mẫu nhỏ.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

Ba lệnh dưới đây có mã thoát khác 0 mà không gắn eval nào: lệnh do-mo-hinh.mjs (gắn E6, E7, E8, ghi ở trên), bun run test với bộ lọc api, và bun run test với bộ lọc agent-okr. Hai lệnh sau là lỗi suite hồi quy, chưa được xếp vào AC nào.

- cmd: bun run test -- --filter=api
  run_id: minted-tro-ly-okr-bo-final-output-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-06T23:43:08Z
  output: |
    1536 pass, 3 skip, 11 fail; Ran 1550 tests across 169 files. [226.55s]
    (fail) tach-giao-dich > Hoàn tác sau Nhận ghi lại truoc qua okr.updateObjective; hoan-tac.sql đếm trong 7 ngày, ngày thứ 8 không đếm
    (fail) vai-chi-okr > duong-ngoai-router: tap duong HTTP ngoai tRPC/REST tra 2xx cho okr bang dung tap khai (quá 60000ms)
    (fail) che-do-an > nop_de_xuat thật cho hàng ẩn ghi dòng nấc an, kể cả dòng bị loại
    (fail) che-do-an > quản trị okr.troLyAn thấy lượt và dòng của nó; thành viên và vai okr → 403
    (fail) lech-phien-ban > tac tu doi truoc khong co guiDuoc van la da gui; guiDuoc sai kieu -> sai-khuon (quá 5000ms)
    (fail) dung-lai-tran > (b) bấm lại khi hàng trước đã đóng 'da-nop' với 0 dòng → cùng taskId, không thêm hàng
    (fail) bốn ca (unnamed), trong đó một ca hết 5000ms ở hook beforeEach/afterEach
    Failed: api#test
    test-run: dropped crm_muxbvcd2slnw_test

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tro-ly-okr-bo-final-output-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-06T23:43:08Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tro-ly-okr-bo-final-output-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-06T23:43:08Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tro-ly-okr-bo-final-output-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 1
  verified_at: 2026-10-06T23:43:08Z
  output: |
    132 pass, 1 fail; Ran 133 tests across 15 files. [9.99s]
    (fail) (unnamed) trong test/app-rieng.integration.spec.ts [3280.56ms]
    error: goc apps/agent dang co eve dev khong phai cua bai thu (pid 91121, http://127.0.0.1:49478/); dung no bang: kill 91121 — roi chay lai.
    Failed: agent-okr#test
    test-run: dropped crm_muxc9r8xuuwg_test

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-okr-bo-final-output-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-06T23:43:08Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-okr-bo-final-output-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-06T23:43:08Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-okr-bo-final-output-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-06T23:43:08Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6, E7, E8 failed — thước đo mô hình do-mo-hinh.mjs thoát khác 0 vì phần [e24] đo p90 là 20702 ms, vượt ngưỡng 15000 ms (p50 là 6928 ms, đạt ngưỡng 8000 ms; 0 lượt hỏng). Hai lệnh suite hồi quy cũng đỏ và chưa gắn eval nào: bộ api (11 ca đỏ) và bộ agent-okr (1 ca đỏ, nêu một tiến trình eve dev khác đang chiếm gốc apps/agent). Returned to implementation.
