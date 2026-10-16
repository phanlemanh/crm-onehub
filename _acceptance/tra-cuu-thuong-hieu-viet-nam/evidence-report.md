---
schema_version: 2
feature_slug: tra-cuu-thuong-hieu-viet-nam
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 151afe63a845f221d2acc94e9237087a7ff639d9
human_signoff:
---

# Evidence Report: tra-cuu-thuong-hieu-viet-nam

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-4 | test | PASS |
| E2 | AC-3 | test | PASS |
| E3 | AC-1 | test | PASS |
| E4 | AC-1 | test | PASS |
| E5 | AC-2 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-1 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_danh_sach
  verified_at: 2026-10-16T14:28:56Z
  output: |
    cd packages/validation && bun test ./test/ten-mien-nen-tang.spec.ts
    Ran 8 tests across 1 file. [21.00ms]

- eval: E2
  run_id: mvb1gdhyi51x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_api
  verified_at: 2026-10-16T08:25:52Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_man
  verified_at: 2026-10-16T08:25:52Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: mvb1gdhyi51x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_api
  verified_at: 2026-10-16T08:25:52Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_man
  verified_at: 2026-10-16T14:28:56Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx
    Ran 11 tests across 1 file. [2.10s]

- eval: E6
  run_id: mvb1gddjkuaf
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_tac_nhan
  verified_at: 2026-10-16T08:25:52Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: mvb1gddjkuaf
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_tac_nhan
  verified_at: 2026-10-16T08:25:52Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: mvb1gddjkuaf
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_tac_nhan
  verified_at: 2026-10-16T08:25:52Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_man
  verified_at: 2026-10-16T14:28:56Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx
    Ran 11 tests across 1 file. [2.10s]

- eval: E10
  run_id: E10-tthv-mot-luot-2026-10-16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tthv_chup
  verified_at: 2026-10-16T14:28:56Z
  screenshot: evidence/E10-quoc-gia-vi-1440.png
  observed: |
    Đã mở từng ảnh vừa lưu.

    E10-quoc-gia-vi-1440: ngăn công ty «Titan chụp E10» mở bên phải, giao diện tiếng Việt. Dòng phụ ở đầu ngăn ghi «e10-tthv.vn · Menlo Park, CA, Hoa Kỳ». Mục Chi tiết có hàng «Quốc gia» = «Hoa Kỳ». Không tràn ngang. Góc dưới trái có huy hiệu «1 Issue» đỏ của Next dev overlay, chỉ có ở khung này. Nó không mâu thuẫn Expected nhưng đáng ghi nhận.

    E10-quoc-gia-vi-390: ngăn dạng drawer đáy. Dòng phụ «e10-tthv.vn · Menlo Park, CA, Hoa Kỳ» xuống hai dòng. Hàng «Quốc gia» = «Hoa Kỳ». Không có thanh cuộn ngang.

    E10-quoc-gia-en-1440: giao diện tiếng Anh. Dòng phụ «Menlo Park, CA, United States». Hàng «Country» = «United States». Không tràn.

    E10-quoc-gia-en-390: dòng phụ «Menlo Park, CA, United States» xuống hai dòng. Hàng «Country» = «United States». Không tràn.

    E10-loi-nen-tang-1440: sheet «Công ty mới». Ô Tên miền chứa «https://www.facebook.com/titanmiennam», viền đỏ. Ngay dưới ô có dòng lỗi đỏ «Đây là trang Facebook, không phải trang web của công ty. Để trống nếu công ty chưa có trang web riêng.» Dưới dòng lỗi là gợi ý xám nói cả đường dẫn cũng được và nêu ngoại lệ «Trang Facebook, Zalo hay LinkedIn không dùng được ở đây». Gợi ý này không mâu thuẫn câu lỗi. Không tràn ngang. Avatar nổi che một phần nút «Thêm công ty» ở góc dưới phải. Đây là lớp phủ của bàn đo, không phải lỗi bố cục của sheet.

    E10-loi-nen-tang-390: cùng nội dung, sheet chiếm gần hết chiều rộng. Dòng lỗi Facebook đỏ ngay dưới ô Tên miền, ngắt dòng gọn, không tràn. Nút «Thêm công ty» hiện đầy đủ ở đáy.

    Đối chiếu Expected: (1) vi hiện «Hoa Kỳ» ở dòng phụ và ô Quốc gia, en hiện «United States», ở cả 1440 và 390; (2) sheet có dòng lỗi gọi tên Facebook ngay dưới ô Tên miền ở cả 1440 và 390; không tràn ngang ở khung nào. Tất cả khớp.
  network_observed: n-a (driver)
  output: |
    Cả 6 ảnh đã mở bằng Read và khớp Expected.
    Mạng: driver là script puppeteer của chup.mjs, không có đường đọc network. Không ghi E10-network.txt, networkObserved = n-a (driver).

- eval: E11
  judged_by: judge panel (fresh context, 3 lens)
  verdict: PASS
  rationale: Đề xuất của hội đồng là PASS (hai lens PASS, một lens chưa chắc). Chữ người dùng thấy gọi tên nền tảng, nói đó không phải trang web của công ty, kèm gợi ý ô không mâu thuẫn câu báo. Ý bất đồng của lens operational-feasibility ghi đầy đủ bên dưới; người quyết ở Cổng 2.
  panel:
    - domain-correctness: PASS — Câu `nenTang(ten)` ở cả bản en và vi gọi tên nền tảng qua tham số `ten`. Câu nói đó không phải trang web của công ty, rồi bảo để trống nếu công ty chưa có trang web riêng, bằng chữ thường. `domainHint` ở cả hai bản vẫn nói «dán cả đường dẫn cũng được» nhưng liền sau đó nêu ngoại lệ Facebook, Zalo, LinkedIn. Nhánh `onSave` của ô Tên miền trong `company-sheet.tsx` gọi `companyMessages(locale).nenTang(nenTang.ten)` qua `toast.error`, không tự viết câu khác. Một điểm hơi hẹp: câu chỉ nói rõ «để trống» và chỉ ngầm hiểu «dán trang web riêng». Tôi coi vậy là đủ cho ý (3).
    - operational-feasibility: UNCERTAIN — Hầu hết các ý đều đạt. Hàm `nenTang` (vi và en) gọi tên nền tảng và nói rõ đó không phải trang web của công ty, bằng chữ thường. `domainHint` ở cả hai bản vẫn kèm ngoại lệ Facebook, Zalo, LinkedIn. Nhánh `onSave` của ô Tên miền trong `company-sheet.tsx` gọi đúng `companyMessages(locale).nenTang(nenTang.ten)`. Ý (3) thì chỉ nói rõ nhánh "Để trống nếu công ty chưa có trang web riêng". Nhánh "dán trang web riêng" chỉ được suy ra, không có chữ nào bảo rep dán, nên tôi không chắc câu này đã đủ.
      required_evidence:
        - Chữ chính xác của AC-1 trong contract.md (thư mục hồ sơ `_acceptance/tra-cuu-thuong-hieu-viet-nam/`). Cần biết AC-1 đòi câu báo nói rõ cả hai việc để trống và dán trang web riêng, hay chỉ cần một câu chỉ dẫn. Nếu đòi rõ cả hai thì kết luận đổi thành FAIL. Nếu chấp nhận 'Để trống nếu chưa có trang web riêng' thì kết luận là PASS.
        - Hoặc bản sửa `nenTang` trong `apps/app/lib/messages/companies.ts` (cả `en` và `vi`) thêm một vế nói rõ nếu công ty có trang web riêng thì dán trang đó vào. Ví dụ: 'Nếu công ty có trang web riêng, hãy dán trang đó; nếu chưa có thì để trống.' Có vế này thì ý (3) đạt rõ ràng và kết luận đổi thành PASS.
    - spec-alignment: PASS — Hàm `nenTang(ten)` trong `companies.ts` (cả `en` lẫn `vi`) gọi tên nền tảng, nói đó không phải trang web của công ty, và bảo để trống nếu công ty chưa có trang web riêng, bằng chữ thường. Lời khuyên "dùng trang web riêng nếu có" chỉ hàm ý qua câu "chưa có trang web riêng", không nói thẳng. `domainHint` ở hai bản đều nêu ngoại lệ "Trang Facebook, Zalo hay LinkedIn không dùng được ở đây". Nhánh `onSave` của ô Tên miền trong `company-sheet.tsx` gọi `companyMessages(locale).nenTang(nenTang.ten)` qua `toast.error`, không tự viết câu khác.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-16T14:28:56Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-16T14:28:56Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-16T14:28:56Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-16T14:28:56Z

- cmd: bunx turbo run lint --force
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-16T14:28:56Z

- cmd: bun run lint:slop
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-16T14:28:56Z

- cmd: bunx turbo run build --force
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-16T14:28:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)

Baseline khong do:

- cd packages/validation && bun test ./test/ten-mien-nen-tang.spec.ts: BLOCKED ha tang baseline: dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx: BLOCKED ha tang baseline: dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)

Eval khong-phan-biet: khong co eval nao duoc liet ke, nhung baseline khong do duoc o round nay nen danh sach nay KHONG chung minh duoc eval nao co phan biet.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, deterministic)

## Iterations

Round 1: moi eval xanh; mot muc trong hop dong (AC-4, ma tran ten mien con moi phu 4 tren 14 nen tang) can va. Returned to implementation (commit 04244033a).
Round 2: E1, E5, E9, E10 chay lai tren cay 151afe63a; E2, E3, E4, E6, E7, E8 carry-forward tu round 1 (delta khong cham paths cua eval). Tat ca PASS.
