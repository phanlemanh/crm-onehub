---
schema_version: 2
feature_slug: bo-cau-hoi-mau
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f2afaf7578cf8de5b4f76ef02601153d5e384cb8
human_signoff:
---

# Evidence Report: bo-cau-hoi-mau

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-1 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-7 | test | PASS |
| E10 | AC-6 | test | PASS |
| E9j | AC-8 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |

## Evidence

- eval: E1
  run_id: minted-bo-cau-hoi-mau-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcm_khuon
  verified_at: 2026-10-13T06:46:29Z
  output: |
    bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts -t khuon
    Ran 8 tests across 1 file. [57.00ms]

- eval: E2
  run_id: minted-bo-cau-hoi-mau-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcm_thanh_phan
  verified_at: 2026-10-13T06:46:29Z
  output: |
    bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts -t thanh-phan
    Ran 3 tests across 1 file. [63.00ms]

- eval: E3
  run_id: minted-bo-cau-hoi-mau-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcm_trang_mong
  verified_at: 2026-10-13T06:46:29Z
  output: |
    bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts -t trang-mong
    Ran 6 tests across 1 file. [47.00ms]

- eval: E4
  run_id: minted-bo-cau-hoi-mau-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcm_y_trong_yeu
  verified_at: 2026-10-13T06:46:29Z
  output: |
    bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts -t y-trong-yeu
    Ran 6 tests across 1 file. [46.00ms]

- eval: E5
  run_id: minted-bo-cau-hoi-mau-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcm_rieng_tu
  verified_at: 2026-10-13T06:46:29Z
  output: |
    bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts -t rieng-tu
    Ran 6 tests across 1 file. [70.00ms]

- eval: E6
  run_id: minted-bo-cau-hoi-mau-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bcm_kiem
  verified_at: 2026-10-13T06:46:29Z
  output: |
    bun _acceptance/bo-cau-hoi-mau/rang/kiem-bo.ts
    luat rieng-tu: 0

- eval: E7
  run_id: minted-bo-cau-hoi-mau-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bcm_kiem_do
  verified_at: 2026-10-13T06:46:29Z
  output: |
    bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts
    (đoạn cuối của lệnh không in dòng nào; lệnh kết thúc bình thường)

- eval: E8
  run_id: minted-bo-cau-hoi-mau-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcm_bang_do
  verified_at: 2026-10-13T06:46:29Z
  output: |
    bun test ./_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.test.ts -t bang-do
    Ran 10 tests across 1 file. [185.00ms]

- eval: E10
  run_id: minted-bo-cau-hoi-mau-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcm_ma_thoat
  verified_at: 2026-10-13T06:46:29Z
  output: |
    bun test ./_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.test.ts -t ma-thoat
    Ran 6 tests across 1 file. [1276.00ms]

### Judgment

- eval: E9j
  judged_by: hội đồng judge (fresh context) — ba lens: domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: Đề xuất của hội đồng là PASS; hai lens PASS, một lens còn dè dặt (xem phiếu bên dưới). Phiếu bầu đầy đủ, không bỏ ý kiến trái.
  human_override:  # chi nguoi ghi

  Phiếu của từng lens:
  - domain-correctness: UNCERTAIN — Hầu hết các câu khớp trang mẫu. Các ý của S1, S2, S3 và S7 đúng nguyên văn trang. m29, m30, m31 đúng là trang không nói. m33 đến m36 và m47 đến m50 không trang nào trả lời được. m45 và m46 giống người gõ thật. Ba câu còn hai nghĩa: m32 (suy ra được mức tối đa 7 ngày từ luật chuyển Giám đốc vận hành), m43 ("full-time" không đồng nghĩa "chính thức") và m23 (250 km chỉ suy ra từ phần trang không nói). Có chấm sai trợ lý làm đúng hay không còn tuỳ cách chấm, mà cách chấm nằm ngoài danh sách input.
    - bằng chứng còn thiếu 1: m32 (S6, ganTrang khieu-nai): trang khieu-nai.md nói "Khiếu nại quá 7 ngày làm việc chưa giải quyết được chuyển lên Giám đốc vận hành", nên người đọc kỹ suy ra được mức tối đa 7 ngày cho cả khiếu nại ưu tiên. Nếu chủ kho ghi một quyết định hoặc sửa câu này sang một điểm trang không chặn trên (ví dụ hỏi khiếu nại doanh nghiệp lớn do ai duyệt hoàn tiền) thì kết luận đổi. Lấy ở _acceptance/bo-cau-hoi-mau/bo-mau.json, mục m32.
    - bằng chứng còn thiếu 2: m43 (S7, tron-anh, bienTheCua m12): "full-time" không đồng nghĩa "chính thức", vì nhân viên thử việc cũng có thể full-time mà nghi-phep.md nói họ không có ngày phép. Nếu câu được đổi thành "nhân viên chính thức" kèm từ tiếng Anh (annual leave), hoặc có ghi chú chủ kho chấp nhận full-time là chính thức trong bộ mẫu, thì kết luận đổi. Lấy ở bo-mau.json, mục m43.
    - bằng chứng còn thiếu 3: m23 (S3): nghi-phep, cong-tac-phi.md chỉ có "Chuyến đi trên 300 km được đi máy bay hạng phổ thông" và không nói chuyến ngắn hơn bị cấm. Nếu câu ý được ghi rõ chấp nhận cả cách trả lời "trang chỉ cho phép trên 300 km, 250 km không thuộc diện đó" thì kết luận đổi. Lấy ở bo-mau.json, mục m23, cùng quy tắc chấm của script chấm S3.
  - operational-feasibility: PASS — Tôi đã đọc bo-mau.json cạnh tám trang mẫu. Câu có trang (m01-m28, S7) đều có trang trong `mong` trả lời được đúng ý trong `y`. Bốn câu S6 có ganTrang (m29-m32) và bốn câu ngoài kho (m33-m36) không có trang nào nói điều câu hỏi cần. Kiểu chữ của m37-m46 khớp nhãn kieuChu và giống người gõ thật. Không câu nào hai nghĩa tới mức một trợ lý làm đúng vẫn bị chấm sai. Còn vài rủi ro nhẹ: m05 và m25 có `y` kèm ý ngoài câu hỏi (24 giờ; hạn 31/3), m43 coi full-time là chính thức, m23 phải suy ra từ «trên 300 km».
  - spec-alignment: PASS — (1) Mọi câu S1/S2/S3/S7 (m01–m28, m37–m46) đều có trang trong `mong` trả lời được, và `y` khớp gần nguyên văn câu trong trang; các ca ngưỡng (m21 18 triệu, m22 350.000, m24 40 ngày, m26 6 ngày) suy ra đúng từ ngưỡng nêu rõ. (2)(3) m29–m32 có `ganTrang` mà trang không nêu tầng 4, nước ngoài, kỹ thuật hay ưu tiên doanh nghiệp lớn, nên không suy ra được đáp án; m33–m36 và m47–m50 không trang nào trả lời được. (4) m45 và m46 giống tin Zalo thật, m39–m42 đúng nhãn viết tắt hoặc sai chính tả, m37–m38 đúng không dấu, m43–m44 đúng trộn Anh. (5) Không có câu nào gây chấm sai một trợ lý làm đúng; rủi ro nhỏ nhất là m23 (trang chỉ nêu ngưỡng trên 300 km, không cấm dưới ngưỡng, nhưng `y` chép đúng quy tắc trang), m43 (full-time không hẳn là chính thức) và m39 (5 ngày so với mốc 30 ngày), đều chưa tới mức làm hỏng phép chấm.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-bo-cau-hoi-mau-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T06:46:29Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-bo-cau-hoi-mau-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T06:46:29Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-bo-cau-hoi-mau-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T06:46:29Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-bo-cau-hoi-mau-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T06:46:29Z

- cmd: bunx turbo run lint --force
  run_id: minted-bo-cau-hoi-mau-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T06:46:29Z

- cmd: bun run lint:slop
  run_id: minted-bo-cau-hoi-mau-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T06:46:29Z

- cmd: bunx turbo run build --force
  run_id: minted-bo-cau-hoi-mau-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T06:46:29Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh ở cả HEAD lẫn baseline): không có eval nào đo được trên baseline, nên không eval nào bị xếp loại này.

Baseline không đo:
- bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts -t khuon: bo qua baseline: tep _acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts -t thanh-phan: bo qua baseline: tep _acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts -t trang-mong: bo qua baseline: tep _acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts -t y-trong-yeu: bo qua baseline: tep _acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- bun test ./_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts -t rieng-tu: bo qua baseline: tep _acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/bo-cau-hoi-mau/rang/kiem-bo.ts: bo qua baseline: tep _acceptance/bo-cau-hoi-mau/rang/kiem-bo.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts: bo qua baseline: tep _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- bun test ./_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.test.ts -t bang-do: bo qua baseline: tep _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.test.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi
- bun test ./_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.test.ts -t ma-thoat: bo qua baseline: tep _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.test.ts co o cay dang kiem nhung chua co o merge-base a972dc9c4977b676eb872be42f0d5794847fd329 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy xanh (E1–E8, E10) và bảy lệnh suite xanh; E9j chờ người chốt ở Cổng 2 với đề xuất PASS.
