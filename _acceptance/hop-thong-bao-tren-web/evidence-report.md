---
schema_version: 2
feature_slug: hop-thong-bao-tren-web
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 495c6129b8326ecc84fe4dff71590ceabefe2877
human_signoff: Manh Phan 2026-10-14 — ký Cổng Bằng chứng trên S4 vòng 2 (17/17 phép kiểm máy đạt, 7/7 lệnh suite xanh, 0 phát hiện trong hợp đồng; E13 Đạt). Ngoài-1 đến 3, 5 đến 15, 17 đến 20 ghi Known limits; Ngoài-4, 16, 21 đến 24 chấp nhận, không sửa; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: hop-thong-bao-tren-web

Vòng 2. Các eval đụng đường dẫn đã sửa ở S4-r1 chạy lại; các eval còn lại mang nguyên từ vòng 1. Mục E13 là judgment: hội đồng đề xuất PASS nhưng người chưa chốt nên verdict tổng là PENDING-JUDGMENT.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | judgment | PASS (hội đồng đề xuất, chờ người chốt) |
| E14 | AC-4 | ui-check | PASS |
| E15 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hop-thong-bao-tren-web-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_ghi
  verified_at: 2026-10-14T07:02:55Z
  output: |
    htb-ghi: ba người (Z, S, K) x bốn ô, chạy lenLichNhac rồi chayNhac
    test-run: dropped crm_mv7rjm3qcysj_test

- eval: E2
  run_id: mv7rjlodgyia
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_gop
  verified_at: 2026-10-14T07:02:55Z
  output: |
    htb-gop: ma trận a đến g, gộp theo mục và theo loại
    test-run: dropped crm_mv7rjlodgyia_test

- eval: E3
  run_id: minted-hop-thong-bao-tren-web-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_kenh
  verified_at: 2026-10-14T07:02:55Z
  output: |
    htb-kenh cùng nhac-qua-zalo.integration.spec.ts và nhac-viec.integration.spec.ts chạy xanh

- eval: E4
  run_id: minted-hop-thong-bao-tren-web-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_chuong
  verified_at: 2026-10-14T07:02:55Z
  output: |
    Ran 19 tests across 1 file. [2.64s]

- eval: E5
  run_id: minted-hop-thong-bao-tren-web-E5-r1
  exit_code: 0
  verifier: config:executors.test.htb_chuong
  verified_at: 2026-10-14T06:38:52Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E6
  run_id: minted-hop-thong-bao-tren-web-E6-r1
  exit_code: 0
  verifier: config:executors.test.htb_api
  verified_at: 2026-10-14T06:38:52Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E6b
  run_id: minted-hop-thong-bao-tren-web-E6b-r1
  exit_code: 0
  verifier: config:executors.test.htb_chuong
  verified_at: 2026-10-14T06:38:52Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E7
  run_id: minted-hop-thong-bao-tren-web-E7-r1
  exit_code: 0
  verifier: config:executors.test.htb_api
  verified_at: 2026-10-14T06:38:52Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E7b
  run_id: minted-hop-thong-bao-tren-web-E7b-r1
  exit_code: 0
  verifier: config:executors.test.htb_chuong
  verified_at: 2026-10-14T06:38:52Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E8
  run_id: minted-hop-thong-bao-tren-web-E8-r1
  exit_code: 0
  verifier: config:executors.test.htb_trang
  verified_at: 2026-10-14T06:38:52Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E9
  run_id: minted-hop-thong-bao-tren-web-E9-r1
  exit_code: 0
  verifier: config:executors.test.htb_api
  verified_at: 2026-10-14T06:38:52Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E10
  run_id: mv7rjo32y86q
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_duong
  verified_at: 2026-10-14T07:02:55Z
  output: |
    Ran 1 test across 1 file. [34.00ms]

- eval: E10b
  run_id: minted-hop-thong-bao-tren-web-E10b-r1
  exit_code: 0
  verifier: config:executors.test.htb_mat_dich
  verified_at: 2026-10-14T06:38:52Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E11
  run_id: mv7rjm8u1tng
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_don
  verified_at: 2026-10-14T07:02:55Z
  output: |
    htb-don: dọn qua đúng lối vào của nhịp mỗi phút, kể cả ca mục còn nhắc liên tục
    test-run: dropped crm_mv7rjm8u1tng_test

- eval: E12
  run_id: mv7rjnwpjqt2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htb_doi_chieu
  verified_at: 2026-10-14T07:02:55Z
  output: |
    thong-bao-doi-chieu.integration.spec.ts: tám ca, kể cả ca đọc bảng ThongBao một lần
    test-run: dropped crm_mv7rjnwpjqt2_test

- eval: E14
  run_id: minted-hop-thong-bao-tren-web-E14-r1
  exit_code: 0
  verifier: config:executors.script.htb_do_man
  verified_at: 2026-10-14T06:38:52Z
  carried_from_round: 1
  screenshot: evidence/E14-step1.png
  observed: |
    chuong-tong-quan-1280: man Chao ban 1280px, o dau trang co chuong voi so "2" canh nut Dang tra cuu / Gui tin hieu; bang "Viec qua han - 2 viec" liet ke hai viec Do man (gui bao gia Hoa Phat, chot lich ky Vinamilk) khop so 2.
    chuong-okr-1280: man "OKR cua toi" (trang thai rong, quan tri chua mo chu ky), chuong van hien o dau trang voi so "2".
    chuong-viec-1280: man "Viec cua toi", tab "Giao cho toi 2", bang hai viec Do man qua han, chuong hien so "2".
    mo-1280: o bat ra "Thong bao" duoi chuong, nut "Danh dau tat ca da doc", nhom "Hom nay", hai dong "Viec «Do man: gui bao gia Hoa Phat» da qua han 2 ngay" va "Viec «Do man: chot lich ky Vinamilk» da qua han 3 ngay", moi dong co gio 13:39, cuoi o co "Xem tat ca"; o nam tron trong khung nhin.
    bam-1280: sau khi bam dong Viec, ngan ben phai mo "Do man: gui bao gia Hoa Phat" (Viec rieng, nguoi giao Ada Okafor), chuong o dau trang da nhin thay (so giam theo assertion 2->1; script xac nhan record=viec:<id da gieo>).
    doc-het-1280: chuong o dau trang khong con so sau khi danh dau tat ca da doc va tai lai; danh sach Viec cua toi van 2 dong.
    chuong-375: khung 375x812, o bat ra "Thong bao" voi nhom "Hom nay" va hai dong viec, nam tron tu mep trai den ~360px, khong tran ngang, khong thanh cuon ngang.
    trang-375: /thong-bao o 375px, hai chip "Tat ca" / "Chua doc" voi "Chua doc" dang chon, hien trang thai rong "Ban da doc het" (dung vi da doc het truoc do), khong cuon ngang.
    trang-1280: /thong-bao 1280px, tieu de Thong bao, chip Tat ca dang chon, nhom "Hom nay" voi hai dong viec qua han va gio 13:39. Tat ca khop Expected; khong co anh nao mau thuan.
  network_observed: n-a (driver)
  note: carry-forward từ round 1 — delta không chạm paths của eval; khung ảnh là của lượt gốc

- eval: E15
  run_id: design-gate-6f686b415c, design-gate-3692c341b4
  exit_code: 0
  verifier: config:executors.script.htb_thiet_ke
  verified_at: 2026-10-14T06:38:52Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E13
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment), fresh context
  verdict: PASS
  rationale: Cả ba góc nhìn cùng thấy CONTEXT.md có mục «Thông báo» riêng, khớp tệp thiết kế; mục «Nhắc buổi sáng» không còn câu nói ngược; hai mục phân biệt được chuông trong CRM với tin gom qua Zalo hoặc Slack.
  human_override: Manh Phan 2026-10-14 — Đạt
  panel: đề xuất PASS. Phiếu từng góc nhìn:
  - domain-correctness: PASS — (a) CONTEXT.md có mục «Thông báo» riêng: một dòng CRM ghi cho một người, nằm ở chuông và trang Thông báo, ghi cho mọi người kể cả người chưa nối Zalo hay Slack, và khác nhắc ở chỗ nhắc là một tin gom gửi qua kênh ngoài CRM còn thông báo là từng mục lưu trong CRM; khớp tệp thiết kế. (b) Mục «Nhắc buổi sáng» không còn câu «kho không có bảng thông báo» hay câu nào nói ngược, và trỏ sang mục Thông báo. (c) Hai mục dùng chữ thường, người dùng phòng ban phân biệt được cái nhận ở chuông với cái nhận qua Zalo.
  - operational-feasibility: PASS — mục «Thông báo» (dòng 310-314) phân biệt rõ với «Nhắc buổi sáng» (dòng 300-308), khớp tệp thiết kế về chuông, trang thông báo, mọi vai, ghi trước khi chọn kênh, Zalo và Slack không đổi. Mục «Nhắc buổi sáng» không còn câu nói ngược. Người dùng phòng ban đọc hai mục sẽ phân biệt được.
  - spec-alignment: PASS — (a) có mục «Thông báo» riêng, mỗi mục của nhắc buổi sáng thành một thông báo cho mọi người, khớp tệp thiết kế. (b) Không còn câu nói ngược ở mục «Nhắc buổi sáng», mục này còn chỉ sang chuông. (c) Dòng «Vì sao» nói rõ lẫn hai thì người dùng đi tìm tin Zalo trong chuông hay tìm chuông trong Zalo, nên phân biệt được.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hop-thong-bao-tren-web-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-14T07:02:55Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-thong-bao-tren-web-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-14T07:02:55Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-thong-bao-tren-web-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-14T07:02:55Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-thong-bao-tren-web-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-14T07:02:55Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-thong-bao-tren-web-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-14T07:02:55Z

- cmd: bun run lint:slop
  run_id: minted-hop-thong-bao-tren-web-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-14T07:02:55Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-thong-bao-tren-web-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-14T07:02:55Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh trên cả baseline lẫn HEAD. Baseline không đo được cho các lệnh của vòng này (xem dưới), nên cột baseline là n-a chứ không phải red.

Baseline khong do
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-ghi.integration.spec.ts -t htb-ghi": bo qua baseline: tep apps/agent/test/thong-bao-ghi.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-ghi.integration.spec.ts -t htb-gop": bo qua baseline: tep apps/agent/test/thong-bao-ghi.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-ghi.integration.spec.ts -t htb-kenh && TZ=Asia/Ho_Chi_Minh bun test test/nhac-qua-zalo.integration.spec.ts test/nhac-viec.integration.spec.ts": bo qua baseline: tep apps/agent/test/thong-bao-ghi.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/thong-bao.dom.tsx -t chuong: bo qua baseline: tep apps/app/test/thong-bao.dom.tsx co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-duong.spec.ts" && cd apps/app && bun test ./test/thong-bao-cau.spec.ts: bo qua baseline: tep apps/agent/test/thong-bao-duong.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-ghi.integration.spec.ts -t htb-don": bo qua baseline: tep apps/agent/test/thong-bao-ghi.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-doi-chieu.integration.spec.ts": bo qua baseline: tep apps/agent/test/thong-bao-doi-chieu.integration.spec.ts co o cay dang kiem nhung chua co o merge-base aac0975b5e8358f51f6a3d3b84a80e1d736bfce2 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định).

## Iterations

Round 1: lệnh suite `bun run test -- --filter=api` đỏ, tổng vòng REJECT; finder ghi các mục ngoài hợp đồng. Quay lại implementation (S4-r1: đối chiếu đọc một lần trong giao dịch có trần riêng; dọn chừa mục còn nhắc liên tục).
Round 2: các eval đụng đường dẫn đã sửa (E1, E2, E3, E4, E10, E11, E12) và cả bảy lệnh suite chạy lại, đều xanh; các eval còn lại mang nguyên từ vòng 1. Verdict PENDING-JUDGMENT vì E13 chờ người chốt ở Cổng Bằng chứng.

### Re-pin lần 1 — 2026-10-15, do gộp onehub 3818ad4ec; lần 3 đỏ vì quá tải máy (test timeout 5–10 phút, máy ảo Docker chạy thêm cụm supabase của dự án khác)
run_id: repin-20261015T014709Z-10822
sha: 495c6129b8326ecc84fe4dff71590ceabefe2877 · suites: 7 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E13 (E13 không khai paths), E14 · AC không có chốt máy: AC-13 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
