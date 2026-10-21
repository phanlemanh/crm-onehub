---
schema_version: 2
feature_slug: gom-tin-hieu-tu-chay
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2cd7aa8ef7ea78060a30a0a267ae87f768ab6f3f
human_signoff: Manh Phan 2026-10-21 — ký Cổng Bằng chứng trên S4 vòng 2 (PASS, 10/10 eval, 0 mục trong hợp đồng). Ngoài-3 mở hợp đồng mới; Ngoài-1, 2, 4–12 ghi Known limits; cắt/hoãn đồng ý cắt.
---

# Evidence Report: gom-tin-hieu-tu-chay

Vòng 2. Mục trong hợp đồng của vòng 1 (câu báo thiếu khoá nhắc CLAUDE_CODE_OAUTH_TOKEN) đã được sửa ở commit pin phía trên; E1b–E7 chạy lại, E1 và E8 mang sang từ vòng 1.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | judgment | PASS |
| E8 | AC-8 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-gom-tin-hieu-tu-chay-E1-r1
  exit_code: 0
  verifier: config:executors.script.gtc_tep_lich
  verified_at: 2026-10-20T14:26:21Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-gom-tin-hieu-tu-chay-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtc_khong_moi
  verified_at: 2026-10-20T15:06:14Z
  output: |
    Ran 3 tests across 1 file. [14.69s]

- eval: E2
  run_id: minted-gom-tin-hieu-tu-chay-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtc_de_xuat
  verified_at: 2026-10-20T15:06:14Z
  output: |
    Ran 4 tests across 1 file. [18.12s]

- eval: E3
  run_id: minted-gom-tin-hieu-tu-chay-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtc_rang_do
  verified_at: 2026-10-20T15:06:14Z
  output: |
    Ran 8 tests across 1 file. [30.38s]

- eval: E4
  run_id: minted-gom-tin-hieu-tu-chay-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtc_cham_ngoai
  verified_at: 2026-10-20T15:06:14Z
  output: |
    Ran 6 tests across 1 file. [27.45s]

- eval: E5
  run_id: minted-gom-tin-hieu-tu-chay-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtc_nguoi_sua
  verified_at: 2026-10-20T15:06:14Z
  output: |
    Ran 6 tests across 1 file. [25.94s]

- eval: E6
  run_id: minted-gom-tin-hieu-tu-chay-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtc_phu_quyet
  verified_at: 2026-10-20T15:06:14Z
  output: |
    Ran 4 tests across 1 file. [22.37s]

- eval: E7
  run_id: minted-gom-tin-hieu-tu-chay-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gtc_hong
  verified_at: 2026-10-20T15:06:14Z
  output: |
    Ran 4 tests across 1 file. [22.29s]

- eval: E8
  run_id: minted-gom-tin-hieu-tu-chay-E8-r1
  exit_code: 0
  verifier: config:executors.test.gtc_do
  verified_at: 2026-10-20T14:26:21Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Judge panel (E7b)

Đề xuất panel: PASS. Ba lăng kính đều đạt; `human_override` để trống cho người quyết ở Cổng Bằng chứng.

- domain-correctness: PASS — Ba ý đều đúng với tệp lịch. (1) setup.md nói lịch chạy khi tín hiệu mới lên `onehub`, lúc 11:00 UTC mỗi ngày và chạy tay được. Khớp khối `on:` gồm push `onehub` với `paths: tin-hieu/crm/**`, `cron 0 11 * * *` và `workflow_dispatch`. (2) Tài liệu mô tả đủ ba việc: sửa trên nhánh PR (máy không đụng nhánh đã có commit của người), phủ quyết bằng đóng PR (máy không đề xuất lại đúng các tín hiệu đó, chỉ đề xuất lại khi có tín hiệu mới), và gộp bởi chủ nhóm tệp lộ trình. (3) Phần cài một lần nêu `ANTHROPIC_API_KEY` ở dạng bí mật kho kèm trần chi tiêu, và quyền đọc `phanlemanh/acceptance-gate-kit` cho `TIN_HIEU_TOKEN`. Cả hai tên khớp `secrets.*` trong tệp lịch, không còn `CLAUDE_CODE_OAUTH_TOKEN`.
- operational-feasibility: PASS — Mục «Lịch gom tín hiệu» của docs/setup.md nói đúng ba kích hoạt trong khối `on:` của tin-hieu-gom.yml: push `tin-hieu/crm/**` lên onehub, cron 11:00 UTC mỗi ngày, chạy tay ở tab Actions. Nó mô tả đủ ba việc với PR đề xuất: sửa trên nhánh (máy không đụng khi nhánh đã có commit của người), phủ quyết bằng đóng PR (không đề xuất lại đúng các tín hiệu đó khi chưa có tín hiệu mới), và chủ nhóm tệp lộ trình gộp. Bước cài một lần gọi tên `ANTHROPIC_API_KEY` và `TIN_HIEU_TOKEN`, đúng hai bí mật tệp lịch đọc; nó đặt chúng làm «bí mật kho» và cấp cho token quyền đọc `phanlemanh/acceptance-gate-kit`.
- spec-alignment: PASS — (1) docs/setup.md nói lịch chạy khi tín hiệu mới lên `onehub`, thêm lượt 11:00 UTC hằng ngày, và chạy tay được. Ba mốc này khớp khối `on:` của tệp lịch (push `onehub` với `tin-hieu/crm/**`, cron `0 11 * * *`, `workflow_dispatch`). (2) Tài liệu nêu đủ ba việc với PR đề xuất. Sửa trên nhánh, và khi nhánh đã có commit của người thì lượt máy sau không đụng tới. Đóng PR để phủ quyết, và máy chỉ đề xuất lại khi có tín hiệu mới, kèm lời dặn tránh cách gom đã bị phủ quyết. Chủ nhóm của tệp lộ trình gộp. (3) Việc cài một lần gồm hai bí mật kho `ANTHROPIC_API_KEY` và `TIN_HIEU_TOKEN`, đúng hai tên tệp lịch đọc. `TIN_HIEU_TOKEN` cần quyền đọc kho `phanlemanh/acceptance-gate-kit`. Bước thứ ba là chạy tay lịch một lần ở tab Actions. Tài liệu không còn nhắc `CLAUDE_CODE_OAUTH_TOKEN`.

- eval: E7b
  judged_by: judge panel (3 lăng kính, fresh context)
  verdict: PASS
  rationale: Ba lăng kính khớp nhau — docs/setup.md mô tả đúng ba kích hoạt, ba việc với PR đề xuất và hai bí mật kho mà tệp lịch đọc; không còn nhắc phương án token OAuth.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-gom-tin-hieu-tu-chay-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-20T15:06:14Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-gom-tin-hieu-tu-chay-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-20T15:06:14Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-gom-tin-hieu-tu-chay-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-20T15:06:14Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-gom-tin-hieu-tu-chay-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-20T15:06:14Z

- cmd: bunx turbo run lint --force
  run_id: minted-gom-tin-hieu-tu-chay-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-20T15:06:14Z

- cmd: bun run lint:slop
  run_id: minted-gom-tin-hieu-tu-chay-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-20T15:06:14Z

- cmd: bunx turbo run build --force
  run_id: minted-gom-tin-hieu-tu-chay-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-20T15:06:14Z

## Known limits

- Phiên gom được phép chạy node tuỳ ý, mà biến môi trường của nó đang chứa token ghi kho và khoá mô hình
- Đọc tệp lộ trình hỏng thì nuốt thành mảng rỗng, và khuôn hàng lộ trình lỏng hơn dữ liệu thật
- Biến môi trường mới của lịch gom chưa được khai trong .env.example
- Đẩy ép không có lease: sửa của người làm trong lúc phiên gom chạy (tới 25 phút) bị ghi đè mà không báo
- Kiểm sửa của người nuốt lỗi: lệnh fetch nhánh đề xuất và lệnh log không được soát mã thoát
- Hình dạng 5 (tuyên cả lớp mà chỉ có điểm-case): E6 ca 2 hứa «chứa tên MỌI nhóm bị phủ quyết» nhưng chỉ kiểm G1
- Hình dạng 2 (dữ liệu giả viết tay đúng khuôn bên đọc): bộ vẽ trang lộ trình trong kho tạm là bản giả, dựng sẵn để in đúng cau_giao mà bài kiểm đi tìm
- Hình dạng 3 (kiểm «chuỗi có mặt» trong khi lời hứa là quan hệ): E2 dòng 6 không buộc cau_giao vào đúng nhóm của nó
- Hình dạng 5 (tuyên ma trận mà thiếu ô): «ma trận ngưỡng 4 ô giờ × tỉ lệ» chỉ kiểm từng chiều riêng, ô (>48 giờ, ≥1/5) không có
- Hình dạng 4 (kiểm âm tính một mình): đối chứng của E6 (PR đã gộp) chỉ kiểm «không phải thông điệp phủ quyết»
- Hình dạng 3 và 4 (vòng 2): kiemKhoaLich chỉ đọc một chiều, không bắt được câu báo nêu thêm khoá mà tệp lịch không truyền
- Hình dạng 3 (vòng 2): bài so tên biến env của bước lịch, không so tên bí mật mà câu báo bảo chủ kho đặt

## Ngoài hợp đồng

## Analyst

none — không eval nào được ghi là xanh ở cả hai phía: mọi lệnh feature đều có baseline n-a (eval mới, tệp bài kiểm chưa có ở merge-base), nên chưa có căn cứ kết luận eval nào không phân biệt.

### Baseline khong do

- bun test scripts/tin-hieu/test/gom-lich.test.ts -t gtc-khong-moi: bo qua baseline: tep scripts/tin-hieu/test/gom-lich.test.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-lich.test.ts -t gtc-de-xuat: bo qua baseline: tep scripts/tin-hieu/test/gom-lich.test.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-lich.test.ts -t gtc-rang-do: bo qua baseline: tep scripts/tin-hieu/test/gom-lich.test.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-lich.test.ts -t gtc-cham-ngoai: bo qua baseline: tep scripts/tin-hieu/test/gom-lich.test.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-lich.test.ts -t gtc-nguoi-sua: bo qua baseline: tep scripts/tin-hieu/test/gom-lich.test.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-lich.test.ts -t gtc-phu-quyet: bo qua baseline: tep scripts/tin-hieu/test/gom-lich.test.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-lich.test.ts -t gtc-hong: bo qua baseline: tep scripts/tin-hieu/test/gom-lich.test.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS với một mục trong hợp đồng mức vừa (AC-7): câu báo thiếu khoá và danh sách khoá còn nhắc phương án CLAUDE_CODE_OAUTH_TOKEN mà tệp lịch không truyền. Trả về implementation; mười mục ngoài hợp đồng chờ người quyết.
Round 2: sửa câu báo và danh sách khoá cho khớp Hỏi-1 (chỉ ANTHROPIC_API_KEY); chạy lại E1b–E7 và bảy lệnh suite, E1 và E8 mang sang từ vòng 1; Ngoài-2 đến Ngoài-10 ghi Known limits, Ngoài-1 mở hợp đồng mới.
