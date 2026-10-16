---
schema_version: 2
feature_slug: thu-haiku-tro-ly-okr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6c3152b57cbeeaf6e1a86bdb572327979d0a3f75
human_signoff: Phan Le Manh 2026-10-15
---

# Evidence Report: thu-haiku-tro-ly-okr

Round 2. Nội dung này thay trọn báo cáo cũ; lịch sử các vòng nằm ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |

Tổng: PASS. Bảy lệnh eval máy và bảy lệnh suite đều chạy xong với mã thoát 0 trên cây f16bcb73c. Ba lỗ đo mà vòng 1 trả về (AC-7 một, AC-2 hai) đã được vá ở commit fb80a0aa2 và vòng 2 không còn phát hiện nào nằm trong hợp đồng. Eval E7 ra kết quả đo được: Haiku khong-dat ở cả hai vai (Trợ lý OKR trượt e22 và gop-y-thua; Tác nhân trượt tac-nhan). Đó là kết quả hợp lệ theo `expected` của AC-7 ("Haiku đạt hay trượt đều là kết quả"), không phải lỗi chạy. Các lỗi ngoài hợp đồng nằm ở `review-findings.md`, người quyết ở Cổng 2.

## Evidence

- eval: E1
  run_id: mv9rlnb0us99
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.thk_mac_dinh
  verified_at: 2026-10-15T16:40:08Z
  output: |
    test-run: dropped crm_mv9rlnb0us99_test

    __EXIT=0

- eval: E2
  run_id: mv9rlnpql204
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.thk_haiku
  verified_at: 2026-10-15T16:40:08Z
  output: |
    test-run: dropped crm_mv9rlnpql204_test

    __EXIT=0

- eval: E3
  run_id: mv9rln3uzhah
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.thk_gia_tri_la
  verified_at: 2026-10-15T16:40:08Z
  output: |
    test-run: dropped crm_mv9rln3uzhah_test

    __EXIT=0

- eval: E4
  run_id: mv9rlnh5rpna
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.thk_production
  verified_at: 2026-10-15T16:40:08Z
  output: |
    test-run: dropped crm_mv9rlnh5rpna_test

    __EXIT=0

- eval: E5
  run_id: mv9rlngczd00
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.thk_kho_do
  verified_at: 2026-10-15T16:40:08Z
  output: |
    test-run: dropped crm_mv9rlngczd00_test

    __EXIT=0

- eval: E6
  run_id: minted-thu-haiku-tro-ly-okr-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.thk_doc_so
  verified_at: 2026-10-15T16:40:08Z
  output: |
    Ran 8 tests across 1 file. [23.00ms]

    __EXIT=0

- eval: E7
  run_id: minted-thu-haiku-tro-ly-okr-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.thk_so_mo_hinh
  verified_at: 2026-10-15T16:40:08Z
  output: |
    anthropic/claude-haiku-5.5: tro ly OKR khong-dat (truot: e22, gop-y-thua) · tac nhan khong-dat (truot: tac-nhan)

    __EXIT=0

- eval: E8
  judged_by: hội đồng judge (fresh context), ba lăng kính
  verified_at: 2026-10-15T16:40:08Z
  verdict: PASS
  rationale: Cả ba lăng kính cùng đề xuất PASS. Năm ý (chỉ dùng cho phép đo; hai mã google/gemini-3.8-flash và anthropic/claude-haiku-5.5; NODE_ENV=production thì bỏ qua biến và chạy google/gemini-3.8-flash; giá trị lạ làm agent không khởi động với lỗi gọi tên TRO_LY_OKR_MO_HINH; kho đo mang sẵn google/gemini-3.8-flash thay cho GLM 5.2 Fast) đều có câu đúng trong .env.example, docs/environment.md, docs/agent.md, docs/setup.md.
  votes:
    - domain-correctness: PASS — Cả năm ý có câu đúng đáp án. Ý 1–4 có trong .env.example (dòng 115–121), docs/environment.md (dòng 134) và docs/agent.md (mục "Chỗ rẽ: Trợ lý OKR — model khi đo so", dòng 1466–1479). Ý 5 có trong docs/agent.md (dòng 1481–1484) và docs/setup.md (dòng 484–491): kho đo mang sẵn google/gemini-3.8-flash, không còn GLM 5.2 Fast, đổi ở MEASURE_DATABASE.agentModel trong packages/db/src/measure-database.ts. Không tệp nào nói khác. docs/agent.md dòng 14 nêu mặc định zai/glm-5.2-fast cho DEFAULT_AGENT_MODEL, đó là mặc định chung của ứng dụng chứ không phải kho đo, nên không mâu thuẫn.
    - operational-feasibility: PASS — Cả năm ý đều có câu đúng đáp án. Các ý 1 đến 4 nằm ở .env.example (dòng 115-121), docs/environment.md (dòng 134) và docs/agent.md (mục «Chỗ rẽ: Trợ lý OKR — model khi đo so», dòng 1468-1479). Ý 5 nằm ở docs/agent.md (dòng 1481-1484) và docs/setup.md (dòng 484-491): kho đo mang sẵn google/gemini-3.8-flash, không còn GLM 5.2 Fast, đổi ở MEASURE_DATABASE.agentModel trong packages/db/src/measure-database.ts. Tôi không thấy tệp nào nói khác đáp án. Dòng 14 của docs/agent.md ghi mặc định mã nguồn là zai/glm-5.2-fast, nhưng đó là mặc định của agent chính chứ không phải của kho đo, nên không mâu thuẫn.
    - spec-alignment: PASS — Cả năm ý đều có câu đúng trong bốn tệp. Ý 1 đến 4 nằm ở `.env.example` (dòng 115-121), `docs/environment.md` (dòng 134) và `docs/agent.md` (dòng 1468-1479). Ý 5 nằm ở `docs/agent.md` (dòng 1481-1484) và `docs/setup.md` (dòng 484-491). Hai chỗ nhắc GLM 5.2 Fast khác trong `docs/agent.md` (dòng 607 và 1156) là lịch sử số đo, không mâu thuẫn với đáp án.
  proposal: PASS (đề xuất; hội đồng chỉ khuyến nghị)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-thu-haiku-tro-ly-okr-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-15T16:40:08Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thu-haiku-tro-ly-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-15T16:40:08Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thu-haiku-tro-ly-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-15T16:40:08Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thu-haiku-tro-ly-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-15T16:40:08Z

- cmd: bunx turbo run lint --force
  run_id: minted-thu-haiku-tro-ly-okr-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-15T16:40:08Z

- cmd: bun run lint:slop
  run_id: minted-thu-haiku-tro-ly-okr-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-15T16:40:08Z

- cmd: bunx turbo run build --force
  run_id: minted-thu-haiku-tro-ly-okr-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-15T16:40:08Z

Ghi chú về verified_at: bộ đồng hồ riêng của từng lệnh không được chuyển xuống bước soạn báo cáo, nên mọi khối mang một mốc chung của ngày chạy vòng 2 (16/10/2026); giờ chính xác của từng lệnh nằm ở `run-log.jsonl`.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Field baseline cua tung eval ghi n-a.

none — khong eval nao duoc liet ke la khong-phan-biet; lenh suite xanh ca hai phia la regression-guard binh thuong.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval nào có runs lớn hơn 1, không eval nào chập chờn).

## Iterations

Round 1: bảy eval máy và bảy lệnh suite chạy xong; ba phát hiện trong hợp đồng từ bước review (AC-7: bước kiểm model của nhánh Trợ lý OKR chỉ xét lần chụp đầu; AC-2: trần Haiku trên đường nạp mô-đun thật chưa được đo; AC-2: cửa sổ ngữ cảnh của vai góp ý và tóm tắt so null với null). Trả về bên làm để sửa phép đo.
Round 2: bảy eval máy và bảy lệnh suite xanh trên cây f16bcb73c sau commit fb80a0aa2 (tiến trình con đo trần và cửa sổ trên đường nạp thật; E7 đọc model suốt nhánh). Không còn phát hiện nào trong hợp đồng; E7 đo xong hai model, Haiku khong-dat ở cả hai vai. Verdict PASS.

### Re-pin lần 1 — 2026-10-16, do gộp onehub e2ae94319 (#420 đổi .env.example, inputs của E8)
run_id: repin-20261016T033915Z-29599
sha: 6c3152b57cbeeaf6e1a86bdb572327979d0a3f75 · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E8 (E8 không khai paths) · AC không có chốt máy: AC-8 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
