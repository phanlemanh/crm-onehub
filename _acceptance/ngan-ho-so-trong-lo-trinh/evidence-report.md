---
schema_version: 2
feature_slug: ngan-ho-so-trong-lo-trinh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dbe02024a6bfa2872ff5473f2f29815684fdaa51
human_signoff: Manh Phan 2026-10-12
---

# Evidence Report: ngan-ho-so-trong-lo-trinh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-10 | judgment | PASS |
| E11 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ngan-ho-so-trong-lo-trinh-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lhs_tom_tat
  verified_at: 2026-10-12T02:59:55Z
  output: |
    Ran 3 tests across 1 file. [3.82s]

- eval: E2
  run_id: minted-ngan-ho-so-trong-lo-trinh-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lhs_o_vang
  verified_at: 2026-10-12T02:59:55Z
  output: |
    Ran 2 tests across 1 file. [1263.00ms]

- eval: E3
  run_id: minted-ngan-ho-so-trong-lo-trinh-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lhs_chua_co
  verified_at: 2026-10-12T02:59:55Z
  output: |
    Ran 2 tests across 1 file. [1.89s]

- eval: E4
  run_id: minted-ngan-ho-so-trong-lo-trinh-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lhs_chu_kho
  verified_at: 2026-10-12T02:59:55Z
  output: |
    Ran 2 tests across 1 file. [4.15s]

- eval: E5
  run_id: minted-ngan-ho-so-trong-lo-trinh-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lhs_vai
  verified_at: 2026-10-12T02:59:55Z
  output: |
    Ran 4 tests across 1 file. [430.00ms]

- eval: E6
  run_id: minted-ngan-ho-so-trong-lo-trinh-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lhs_khoan_dung
  verified_at: 2026-10-12T02:59:55Z
  output: |
    Ran 5 tests across 1 file. [2.08s]

- eval: E7
  run_id: minted-ngan-ho-so-trong-lo-trinh-E7-r1
  exit_code: 2
  baseline: red
  verifier: config:executors.script.lhs_ban_chep
  verified_at: 2026-10-12T02:59:55Z
  output: |
    KET LUAN ma 2 — crm chua nhan kit co X2 — so tung ky tu va doc tep goc cho toi khi kit 2.27 vao kho

- eval: E8
  run_id: minted-ngan-ho-so-trong-lo-trinh-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lhs_mau
  verified_at: 2026-10-12T02:59:55Z
  output: |
    KET LUAN ma 0

- eval: E9
  run_id: minted-ngan-ho-so-trong-lo-trinh-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lhs_chup
  verified_at: 2026-10-12T02:59:55Z
  screenshot: evidence/ST-ngan-day-du--1280--sang.png
  observed: |
    Da mo tung anh bang Read. (1) day-du 1280 sang: ngan ho so ben phai; thanh the chi "Tổng quan"; khoi "TÓM TẮT HỒ SƠ" (Đã giao gì, Vì sao làm, Hồ sơ cập nhật, Lên production, Sẽ đo gì khi nào, Kết quả đo, Còn thiếu gì, Ai quyết) nam TREN khoi "CHI TIẾT" (Kế hoạch ghi, Coi là thành công) roi "VIỆC ĐANG CHỜ VIỆC NÀY"; khong co khoi so lieu — dung Expected, KHONG con loi "khong thay phan tom tat" (chieu do dinh cu bi lat). (2) day-du 375 sang: cung thu tu tom tat -> chi tiet -> viec cho, drawer duoi, khong cuon ngang thay duoc, chi the "Tổng quan". (3) chu-kho 1280 sang: thanh the "Tổng quan | Số liệu", the "Số liệu" dang chon sau khi bam; noi dung "SỐ LIỆU LÀM VIỆC" ("Chỉ chủ không gian làm việc thấy phần này"): Tiêu chí 14, Phép đo 17, Lượt chấm 3, Token đầu ra 140.353, Máy quyết 26, Người quyết 16, Commit đã chấm 8d5180f (mono, nut copy, link Tìm PR). (4) chu-kho 375 sang: cung the "Tổng quan | Số liệu", Số liệu dang mo, cac so lieu xep mot cot. (5) doan-dai 375 sang (R1g, ho so Zalo): doan "Vì sao làm" rat dai (nhieu dong) xuong dong gon trong cot, khong tran ngang, chi the "Tổng quan". (6) o-vang 1280 sang (ho so 4n): "Sẽ đo gì, khi nào" hien "—", cac o khac co gia tri, chi the "Tổng quan", khong co the Số liệu; marker data-o-vang do bang script. (7) day-du 1280 toi: nhu o sang cung state, nen toi, chu sang doc duoc, tom tat tren chi tiet, khong Số liệu. (8) chu-kho 375 toi: nhu o sang cung state, nen toi, the "Tổng quan | Số liệu", Số liệu dang mo voi cac so lieu y nhu o sang. Khong anh nao mau thuan Expected.
  network_observed: n-a (driver)

- eval: E10
  judged_by: judge panel de xuat (3 lens, fresh context)
  verdict: PASS
  rationale: Ba judge cung cho PASS; panel de xuat PASS. Nhan cua ngan tra loi du nam cau, la chu thuong, khong lo ten tep hay ten lenh.
  votes:
    - domain-correctness: PASS — Ngăn có đủ tám nhãn trả lời năm câu: Vì sao làm, Đã giao gì cùng Lên production, Sẽ đo gì khi nào cùng Kết quả đo, Còn thiếu gì, Ai quyết. Tất cả đều là chữ thường, không có tên tệp, tên lệnh hay chữ nội bộ của bộ kit (phần Commit và Token chỉ chủ kho thấy, vai khác không thấy). Mỗi nhãn có đủ bản vi và en trong tệp lời, ép bằng kiểu LoTrinhMessages, và có câu riêng khi chưa có tóm tắt. Lỗi nhỏ còn lại là nhãn bị cắt ở ảnh (Coi là thành côn…, Trạng th…), nhưng vẫn đoán được nghĩa. Chữ production tuy là từ mượn nhưng không phải chữ nội bộ của bộ kit.
    - operational-feasibility: PASS — Ngăn có đủ năm nhãn đúng câu người cần hỏi, bằng chữ thường: «Vì sao làm», «Đã giao gì» cùng «Trạng thái» và «Lên production», «Sẽ đo gì, khi nào» cùng «Kết quả đo», «Còn thiếu gì», «Ai quyết». Cả ba ảnh LT1, R1g, 4n đều hiện đủ các hàng này ở thẻ đầu, và khi chưa có tóm tắt thì có câu «Chưa có tóm tắt hồ sơ cho việc này». Nhãn khớp từng chữ ở bản vi và en trong lo-trinh.ts. Không nhãn nào là tên tệp hay tên lệnh; các nhãn như commit, token, PR chỉ nằm trong thẻ «Số liệu», chỉ chủ kho thấy. Lưu ý nhỏ, không đủ để hạ: «Lên production» là chữ kỹ thuật giữ nguyên, và nhãn bị cắt ở «Trạng th…» (375) và «Coi là thành côn…» (1280).
    - spec-alignment: PASS — Ngăn của LT1, R1g và 4n có đủ tám hàng nhãn trả lời đúng năm câu: «Vì sao làm», «Lên production» cùng chip «Đã giao», «Sẽ đo gì, khi nào», «Còn thiếu gì», «Ai quyết». Mọi nhãn đều nằm trong tệp lời `lo-trinh.ts` ở cả hai ngôn ngữ, là chữ thường, không có tên tệp, tên lệnh hay chữ nội bộ của bộ công cụ. Phần chữ trong ô (gồm «Cổng…», «ngoài hợp đồng») do bộ kit viết nên không chấm. Ảnh 375 hiện đủ các hàng, còn tab «Số liệu» chỉ chủ kho thấy nên không lộ ra với trưởng phòng.
  human_override:  # chi nguoi ghi

- eval: E11
  run_id: minted-ngan-ho-so-trong-lo-trinh-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lhs_chu_thang
  verified_at: 2026-10-12T02:59:55Z
  output: |
    KET LUAN ma 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ngan-ho-so-trong-lo-trinh-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-12T02:59:55Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ngan-ho-so-trong-lo-trinh-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-12T02:59:55Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ngan-ho-so-trong-lo-trinh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-12T02:59:55Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ngan-ho-so-trong-lo-trinh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-12T02:59:55Z

- cmd: bunx turbo run lint --force
  run_id: minted-ngan-ho-so-trong-lo-trinh-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-12T02:59:55Z

- cmd: bun run lint:slop
  run_id: minted-ngan-ho-so-trong-lo-trinh-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-12T02:59:55Z

- cmd: bunx turbo run build --force
  run_id: minted-ngan-ho-so-trong-lo-trinh-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-12T02:59:55Z

## Known limits

- E7 (AC-7) dat-co-gioi-han: ma thoat 2 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: node _acceptance/ngan-ho-so-trong-lo-trinh/rang/ban-chep.mjs --pha-thu

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: moi eval may va eval ui-check deu dat, E7 dung ma da khai truoc, hoi dong E10 cho PASS. Khong co vong tra ve cai tien.

### Re-pin lần 1 — 2026-10-12, do gộp onehub 4c440ab17 (#369 CI) sau chữ ký
run_id: repin-20261012T041057Z-83772
sha: c4b3f7594349e3d4d80e33782ae52046337b5056 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · đạt-có-giới-hạn: E7=2 · ngoài làn máy: E9, E10 (E10 không khai paths) · AC không có chốt máy: AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-13, do gộp onehub 6791dc049 — crm nhận kit 2.28.0 (#377)
run_id: repin-20261013T112748Z-97298
sha: 091faf0a721059133f9d9c62255e092716e89908 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · giới hạn đã khai không còn: E7 (khai 2) · ngoài làn máy: E9, E10 (E10 không khai paths) · AC không có chốt máy: AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-15, do #407 gộp onehub eb5ab4269 (vá đua act TanStack, mẫu b1); khung-man-chung không ghim — E12m đỏ do #419
run_id: repin-20261015T120029Z-49021
sha: dbe02024a6bfa2872ff5473f2f29815684fdaa51 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · giới hạn đã khai không còn: E7 (khai 2) · ngoài làn máy: E9, E10 (E10 không khai paths) · AC không có chốt máy: AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
