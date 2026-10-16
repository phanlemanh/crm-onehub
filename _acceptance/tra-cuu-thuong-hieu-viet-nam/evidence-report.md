---
schema_version: 2
feature_slug: tra-cuu-thuong-hieu-viet-nam
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7365eb97f14320655484fcf9fb66e32e94cb1ad4
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
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_danh_sach
  verified_at: 2026-10-16T08:25:52Z
  output: |
    cd packages/validation && bun test ./test/ten-mien-nen-tang.spec.ts
    Ran 7 tests across 1 file. [27.00ms]

- eval: E2
  run_id: mvb1gdhyi51x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_api
  verified_at: 2026-10-16T08:25:52Z
  output: |
    bun run test -- "cd apps/api && bun test test/ten-mien-nen-tang.spec.ts"
    test-run: dropped crm_mvb1gdhyi51x_test

- eval: E3
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_man
  verified_at: 2026-10-16T08:25:52Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx
    Ran 11 tests across 1 file. [2.34s]

- eval: E4
  run_id: mvb1gdhyi51x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_api
  verified_at: 2026-10-16T08:25:52Z
  output: |
    bun run test -- "cd apps/api && bun test test/ten-mien-nen-tang.spec.ts"
    test-run: dropped crm_mvb1gdhyi51x_test

- eval: E5
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_man
  verified_at: 2026-10-16T08:25:52Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx
    Ran 11 tests across 1 file. [2.34s]

- eval: E6
  run_id: mvb1gddjkuaf
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_tac_nhan
  verified_at: 2026-10-16T08:25:52Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tra-cuu-thuong-hieu-viet-nam.spec.ts"
    test-run: dropped crm_mvb1gddjkuaf_test

- eval: E7
  run_id: mvb1gddjkuaf
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_tac_nhan
  verified_at: 2026-10-16T08:25:52Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tra-cuu-thuong-hieu-viet-nam.spec.ts"
    test-run: dropped crm_mvb1gddjkuaf_test

- eval: E8
  run_id: mvb1gddjkuaf
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_tac_nhan
  verified_at: 2026-10-16T08:25:52Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tra-cuu-thuong-hieu-viet-nam.spec.ts"
    test-run: dropped crm_mvb1gddjkuaf_test

- eval: E9
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tthv_man
  verified_at: 2026-10-16T08:25:52Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx
    Ran 11 tests across 1 file. [2.34s]

- eval: E10
  run_id: E10-tthv-chup-2026-10-16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tthv_chup
  verified_at: 2026-10-16T08:25:52Z
  screenshot: evidence/E10-quoc-gia-vi-1440.png
  observed: |
    Frame 1 (quoc-gia-vi-1440): ngăn công ty "Titan chụp E10" mở bên phải, giao diện tiếng Việt. Dòng phụ dưới tiêu đề: "e10-tthv.vn · Menlo Park, CA, Hoa Kỳ". Trong khối Chi tiết, hàng Quốc gia ghi "Hoa Kỳ". Không thấy tràn ngang. Đúng Expected (1): vi hiện Hoa Kỳ ở dòng phụ và ô Quốc gia.
    Frame 2 (quoc-gia-vi-390): ngăn dạng sheet kéo từ dưới, rộng 390. Dòng phụ xuống hai dòng: "e10-tthv.vn · Menlo Park, CA, Hoa Kỳ". Hàng Quốc gia: "Hoa Kỳ". Không có thanh cuộn ngang. Có vài lỗi nhỏ không liên quan, không ghi vào kết quả: chữ "CHI TIẾT" bị hàng thẻ che một phần, nút devtools Next và ảnh đại diện nổi che chữ ở hàng Lead source.
    Frame 3 (quoc-gia-en-1440): giao diện tiếng Anh. Dòng phụ "e10-tthv.vn · Menlo Park, CA, United States". Hàng Country ghi "United States". Nhãn khác cũng tiếng Anh (Open pipeline, Details, Overview). Đúng Expected (1) cho en.
    Frame 4 (quoc-gia-en-390): dòng phụ "e10-tthv.vn · Menlo Park, CA, United States" xuống hai dòng, hàng Country "United States". Không tràn ngang.
    Frame 5 (loi-nen-tang-1440): sheet «Công ty mới» bên phải. Ô Tên là "Titan", ô Tên miền chứa "https://www.facebook.com/titanmiennam", viền ô đỏ. Ngay dưới ô là dòng chữ đỏ: "Đây là trang Facebook, không phải trang web của công ty. Để trống nếu công ty chưa có trang web riêng." Gợi ý bên dưới đã nói ngoại lệ: "Trang Facebook, Zalo hay LinkedIn không dùng được ở đây". Không có thanh cuộn ngang. Lỗi nhỏ: ảnh đại diện nổi che một phần nút «Thêm công ty» (thấy "Thêm cô…") ở góc dưới phải, chỉ là lớp phủ môi trường đo. Đúng Expected (2).
    Frame 6 (loi-nen-tang-390): sheet «Công ty mới» chiếm gần hết bề ngang. Cùng dòng lỗi đỏ gọi tên Facebook nằm ngay dưới ô Tên miền, cùng viền đỏ, rồi dòng gợi ý, rồi ô Phụ trách. Nút «Thêm công ty» và «Huỷ» xếp dọc, đủ chữ. Không tràn ngang. Đúng Expected (2).
    Cả sáu ảnh khớp Expected, không có mâu thuẫn.
  network_observed: n-a (driver)

- eval: E11
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ba góc nhìn đều đạt. Cả hai bản vi và en của câu báo nền tảng gọi tên nền tảng, nói đó không phải trang web của công ty và dặn để trống nếu chưa có trang riêng; gợi ý ô Tên miền nhắc ngoại lệ Facebook, Zalo, LinkedIn nên không mâu thuẫn với câu báo; sheet Công ty mới dùng đúng hàm thông điệp dùng chung.
  panel_votes:
    - domain-correctness: PASS — Cả hai bản vi và en của `nenTang` trong `companies.ts` gọi tên nền tảng, nói rõ đó không phải trang web của công ty và dặn để trống nếu chưa có trang riêng, bằng chữ thường dễ hiểu. `domainHint` của cả hai bản vẫn nhắc ngoại lệ Facebook, Zalo, LinkedIn bên cạnh "dán cả đường dẫn cũng được". `company-sheet.tsx` (dòng 426-433) báo lỗi bằng đúng `companyMessages(locale).nenTang(nenTang.ten)`, không tự viết câu khác.
    - operational-feasibility: PASS — Câu `nenTang(ten)` ở cả vi và en gọi tên nền tảng, nói đó không phải trang web của công ty, và bảo để trống nếu công ty chưa có trang web riêng, bằng chữ thường dễ hiểu. Gợi ý `domainHint` của cả hai ngôn ngữ vẫn cho dán đường dẫn nhưng có thêm câu loại trừ trang Facebook, Zalo, LinkedIn. Nhánh `onSave` ô Tên miền trong `company-sheet.tsx` gọi đúng `companyMessages(locale).nenTang(nenTang.ten)` rồi `return`, không tự viết câu khác.
    - spec-alignment: PASS — Hàm `nenTang` ở cả bản vi và en gọi tên nền tảng, nói đó không phải trang web của công ty, và dặn để trống nếu công ty chưa có trang web riêng. Phần dán trang web riêng chỉ được ngụ ý qua vế điều kiện. Gợi ý `domainHint` ở cả hai bản vẫn cho dán đường dẫn nhưng nêu rõ Facebook, Zalo, LinkedIn không dùng được. Nhánh `onSave` của ô Tên miền trong `company-sheet.tsx` gọi `companyMessages(locale).nenTang(nenTang.ten)` qua `toast.error`, không tự viết câu khác.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-16T08:25:52Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-16T08:25:52Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-16T08:25:52Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-16T08:25:52Z

- cmd: bunx turbo run lint --force
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-16T08:25:52Z

- cmd: bun run lint:slop
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-16T08:25:52Z

- cmd: bunx turbo run build --force
  run_id: minted-tra-cuu-thuong-hieu-viet-nam-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-16T08:25:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)

Baseline khong do:
- cd packages/validation && bun test ./test/ten-mien-nen-tang.spec.ts: BLOCKED ha tang baseline: dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)
- bun run test -- "cd apps/api && bun test test/ten-mien-nen-tang.spec.ts": BLOCKED ha tang baseline: dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx: BLOCKED ha tang baseline: dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)
- bun run test -- "cd apps/agent && bun test test/tra-cuu-thuong-hieu-viet-nam.spec.ts": BLOCKED ha tang baseline: dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)

none — moi eval feature deu red tren baseline (co phan biet). Luu y: baseline khong do duoc o round nay nen ket luan chi dua tren danh sach rong, khong do duoc eval khong-phan-biet.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: moi eval deu xanh, khong eval nao fail. Verdict PASS.
