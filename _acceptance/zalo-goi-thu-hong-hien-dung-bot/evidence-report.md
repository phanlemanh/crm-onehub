---
schema_version: 2
feature_slug: zalo-goi-thu-hong-hien-dung-bot
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 787d66525c93e022bee430e6450c361c2fbd5a49
human_signoff: Phan Le Manh 2026-09-24
---

# Evidence Report: zalo-goi-thu-hong-hien-dung-bot

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-6 | script | PASS |
| E12 | AC-8 | test | PASS |

## Evidence

- eval: E1
  run_id: mufdkgse9ujw
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zgh_luu_bot_moi
  verified_at: 2026-09-24T09:44:12Z
  output: |
    4 expect() calls
    Ran 2 tests across 1 file. [159.00ms]
    test-run: dropped crm_mufdkgse9ujw_test

- eval: E2
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zgh_ma_tran_goi
  verified_at: 2026-09-24T09:44:12Z
  output: |
    14 expect() calls
    Ran 1 test across 1 file. [541.00ms]
    test-run: dropped crm_mufdkh26b3iu_test

- eval: E3
  run_id: mufdkgufmufo
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zgh_api_cau_noi_that
  verified_at: 2026-09-24T09:44:12Z
  output: |
    4 expect() calls
    Ran 2 tests across 1 file. [1421.00ms]
    test-run: dropped crm_mufdkgufmufo_test

- eval: E4
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zgh_nhip_giu_co
  verified_at: 2026-09-24T09:44:12Z
  output: |
    4 expect() calls
    Ran 2 tests across 1 file. [330.00ms]
    test-run: dropped crm_mufdkgdc8m4g_test

- eval: E5
  run_id: mufdkgo0vatn
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zgh_go_co
  verified_at: 2026-09-24T09:44:12Z
  output: |
    6 expect() calls
    Ran 2 tests across 1 file. [172.00ms]
    test-run: dropped crm_mufdkgo0vatn_test

- eval: E6
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zgh_o_token_man
  verified_at: 2026-09-24T09:44:12Z
  output: |
    0 fail
    7 expect() calls
    Ran 3 tests across 1 file. [871.00ms]

- eval: E7
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zgh_dang_ky_lai_man
  verified_at: 2026-09-24T09:44:12Z
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [383.00ms]

- eval: E8
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-24T09:44:12Z
  screenshot: _acceptance/zalo-goi-thu-hong-hien-dung-bot/evidence/E8-truoc-1440.png
  observed: |
    Đã mở bằng Read từng frame đã lưu, đối chiếu Expected:
    - E8-truoc-1440.png: tiêu đề trên cùng "Bot Cũ · trả lời lần cuối lúc 17:27 24-09"; khối "Bot của xưởng" hiện StatusIndicator xanh "Nhận tin qua webhook"; ô Bot Token có placeholder "••••t-cu". Khớp đối chứng (có Bot Cũ + Nhận tin qua webhook).
    - E8-thong-bao-1440.png / E8-thong-bao-375.png: toast góc dưới trái "Đã lưu Bot Mới, nhưng Zalo chưa gọi thử được địa chỉ nhận tin. Bấm "Đăng ký lại" sau ít phút." (toast cảnh báo, nền vàng/icon warning), chụp ngay lúc toast xuất hiện (~260-436ms sau click).
    - E8-sau-luu-1440.png / E8-sau-luu-375.png: tiêu đề đổi thành "Bot Mới · trả lời lần cuối lúc <giờ>"; khối cảnh báo viền cam "Zalo chưa giao tin nhắn về CRM" + mô tả "Người nhắn mã sẽ không được nối cho tới khi đăng ký lại." + nút "Đăng ký lại"; KHÔNG còn "Nhận tin qua webhook" ở đâu trên trang; KHÔNG còn "Bot Cũ" hiển thị (chữ "Bot Cũ" chỉ còn sót trong script RSC ẩn — đã loại khỏi phép kiểm bằng bộ lọc chỉ-đếm-node-hiển-thị). 375px xếp lại một cột, không tràn ngang.
    - E8-sau-nhip-1440.png / E8-sau-nhip-375.png (sau khi reload trang, sau khi chạy nhịp): vẫn "Bot Mới" ở tiêu đề, vẫn khối "Zalo chưa giao tin nhắn về CRM" + nút "Đăng ký lại", không quay lại "Nhận tin qua webhook".
    - E8-nhip.txt: hai dòng, cả hai đều "getWebhookInfo=1 url=null lyDo=zalo-tu-choi kiemBot=song" — đúng "getWebhookInfo=1" và "url=null" theo yêu cầu trước khi tin ảnh sau-nhịp.
    - E8-network.txt: điều hướng lại màn Zalo sau khi đo xong, 0 request thất bại (không failed/4xx/5xx), 0 console error.
  network_observed: clean

- eval: E9
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.zgh_giu_da_ky
  verified_at: 2026-09-24T09:44:12Z
  output: |
    test-run: dropped crm_mufdl3k2fbw0_test
    giu-da-ky: hai spec da ky nguyen, spec vong 2 chi doi goi-nguoc b/c, 5 tep xanh
    EXIT_CODE=0

- eval: E10
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.zgh_tai_lieu
  verified_at: 2026-09-24T09:44:12Z
  output: |
    tai-lieu: 3 moc dat, ban goc va ban pha deu do

- eval: E11
  run_id: design-gate-3b46e4729b
  exit_code: 0
  baseline: green
  verifier: config:executors.script.zgh_san_thiet_ke
  verified_at: 2026-09-24T09:44:12Z
  output: |
    design-gate-3b46e4729b | apps/app/app/(app)/[slug]/settings/connections/zalo/page.tsx | PASS | p0_count: 0 | no blocking issues | no findings

- eval: E12
  run_id: mufdkgufmufo
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zgh_api_cau_noi_that
  verified_at: 2026-09-24T09:44:12Z
  output: |
    4 expect() calls
    Ran 2 tests across 1 file. [1421.00ms]
    test-run: dropped crm_mufdkgufmufo_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-24T09:44:12Z

- cmd: bunx turbo run lint --force
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-24T09:44:12Z

- cmd: bun run lint:slop
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-24T09:44:12Z

- cmd: bunx turbo run build --force
  run_id: minted-zalo-goi-thu-hong-hien-dung-bot-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-24T09:44:12Z

## Known limits

## Ngoài hợp đồng

## Analyst

E11 (AC-6, design-gate static trên trang Kết nối › Zalo) — pass trên cả nhánh HEAD lẫn baseline diffBase. Đây là regression-guard có chủ ý cho sàn thiết kế (P0 floor) của trang, không đổi theo tính năng gọi-thử-hỏng đang xét, nên không phải bằng chứng phân biệt riêng cho AC-6 — bằng chứng phân biệt thật của AC-6 nằm ở E6 (đỏ trên baseline).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E12 và bốn lệnh suite (bun run test, turbo lint, lint:slop, turbo build) đều xanh ngay từ lượt chạy đầu tiên; không có vòng sửa nào phải quay lại implementation.

### Re-pin lần 1 — 2026-09-24, do hoá cũ do gộp onehub 090bd517 (#120 cây tổ chức, #121)
run_id: repin-20260924T112315Z-99165
sha: 3bc0d769451e7ff38dd92f368f194847e41b6a1d · suites: 4 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E8

### Re-pin lần 2 — 2026-09-24, do E10 neo ban goc vao 090bd517: merge-base dong da chua ca ba moc sau khi #122 len onehub
run_id: repin-20260924T151335Z-48982
sha: f8f5cf916142628e2450d9cf7f46411b36b9c906 · suites: 4 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E8

### Re-pin lần 3 — 2026-09-24, do thuoc «vong nay» neo cap sha cua merge (merge-base(M^1,M^2)..M^2) thay merge-base dong; env GOOGLE_CLIENT_* nhu CI
run_id: repin-20260924T155831Z-87643
sha: f7a31a583af36e847d87df37ffd44f12b1d45a85 · suites: 4 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E8

### Re-pin lần 4 — 2026-09-24, do ghim lai tren cay hop nhat sau khi gop onehub 973f1b01 (#125)
run_id: repin-20260924T160407Z-81970
sha: 787d66525c93e022bee430e6450c361c2fbd5a49 · suites: 4 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E8 · diff chạm vật đo ngoài làn máy: E8 — chưa chứng lại, đi vòng S4 delta
