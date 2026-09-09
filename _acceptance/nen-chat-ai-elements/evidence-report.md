---
schema_version: 2
feature_slug: nen-chat-ai-elements
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9e3888291f26e94aba339879aab1ab568c4b983b
human_signoff:
---

# Evidence Report: nen-chat-ai-elements

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-2 | script | PASS |
| E5 | AC-2 | script | PASS |
| E6 | AC-2 | test | PASS |
| E7 | AC-3 | script | PASS |
| E8 | AC-4 | test | PASS |
| E9 | AC-5 | script | PASS |
| E10 | AC-6 | script | PASS |
| E11 | AC-7 | script | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-9 | script | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nen-chat-ai-elements-E1-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_mo_coi
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
    MIEN TRU (1):
       conversation.tsx — miễn trừ: AC-1 và AC-3 của contract.md cố ý giữ bản kéo tươi bằng CLI làm mốc cho phép đo cuộn AC-7 và cho sổ lệch chuẩn AC-8; vòng này không nối nó vào màn nào, nên không khả đạt là đúng hợp đồng chứ không phải rác
    XANH: 4 tep trong packages/ui/src/components/ai-elements — 3 kha dat tu apps/**, 1 mien tru co ten, khong mo coi nao ngoai danh sach mien tru.

- eval: E3
  run_id: minted-nen-chat-ai-elements-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    8.864s

- eval: E4
  run_id: minted-nen-chat-ai-elements-E4-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    199ms

- eval: E5
  run_id: minted-nen-chat-ai-elements-E5-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 469ms on 957 files with 9 rules using 18 threads.

- eval: E6
  run_id: mtu7rdjxxgm3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
      Time:    24.726s

    test-run: dropped crm_mtu7rdjxxgm3_test

- eval: E13
  run_id: mtu7rdjxxgm3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nc_rang_qua_cong
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
      Time:    24.726s

    test-run: dropped crm_mtu7rdjxxgm3_test

- eval: E14
  run_id: mtu7rdjxxgm3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nc_rang_qua_cong
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
      Time:    24.726s

    test-run: dropped crm_mtu7rdjxxgm3_test

- eval: E7
  run_id: minted-nen-chat-ai-elements-E7-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_conversation_tuoi
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
    Mục trong sổ (1): conversation.tsx

    XANH: 1 tệp lệch, 1 mục trong sổ, hai tập trùng nhau; mỗi mục đủ ba phần và khai đúng số dòng lẫn vân tay lệch.

- eval: E8
  run_id: minted-nen-chat-ai-elements-E8-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nc_lop_chuyen
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
     0 fail
     21 expect() calls
    Ran 14 tests across 1 file. [24.00ms]

- eval: E9
  run_id: minted-nen-chat-ai-elements-E9-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_chu_trong_component
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
    Khoá thiếu trong bảng chuỗi: 0

    Răng xanh.

- eval: E10
  run_id: minted-nen-chat-ai-elements-E10-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_mau_ban_kinh
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
    XANH: moi lop ban kinh nam trong thang bon gia tri, va moi lop mau goi dung mot ten co trong bang token.

- eval: E11
  run_id: minted-nen-chat-ai-elements-E11-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_so_do_cuon
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
        MessageScroller 500 go nhin: 32.64 ms  (32.64x)

    so-do-cuon: dat — ti so sau va 0.94 <= 1.2; ban va do duoc hieu ung tren cay that va go no ra lam cham 35.3x; thuoc phan ung 32.64x

- eval: E12
  run_id: minted-nen-chat-ai-elements-E12-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_so_lech_chuan
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
    Mục trong sổ (4): conversation.tsx, message.tsx, reasoning.tsx, shimmer.tsx

    XANH: 4 tệp lệch, 4 mục trong sổ, hai tập trùng nhau; mỗi mục đủ ba phần và khai đúng số dòng lẫn vân tay lệch.

- eval: E15
  run_id: minted-nen-chat-ai-elements-E15-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_pham_vi_diff
  verified_at: 2026-09-09T22:50:00+07:00
  output: |
    Sáu tệp chat bị chạm: 0

    RĂNG PHẠM VI XANH: mọi đường nằm trong danh sách trắng AC-2, sáu tệp chat nguyên vẹn.

## Known limits

## Ngoài hợp đồng

Bảy mục dưới đây là lỗi THẬT nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1.
Máy không tự sửa chúng — người quyết ở Cổng 2. Xếp theo mức nặng.

- **[high]** Hồ sơ bằng chứng đã ký của một vòng khác bị ghi đè trong diff của vòng này
  - chỗ: `_acceptance/chan-lai-component-ra-man/evidence/ve-that.json`:78

- **[high]** toToolPart biến kết quả "chạy xong nhưng không ghi" thành lỗi giả và nuốt mất output
  - chỗ: `packages/ui/src/lib/eve-to-ai-sdk.ts`:49

- **[medium]** Nhãn vai trong bản tải về là chuỗi cứng tiếng Anh, nằm ngoài bảng chuỗi và ngoài tầm răng chu-cung
  - chỗ: `packages/ui/src/components/ai-elements/conversation.tsx`:128

- **[medium]** source.url khai lỏng hơn schema đang thật sự sinh ra nó, trong khi giá trị chảy thẳng vào href
  - chỗ: `packages/validation/src/agent-transcript.ts`:9

- **[medium]** Hình dạng 5 — tuyên quét cả lớp component nhưng chỉ assert một điểm: 6 tệp không nạp được vẫn xanh
  - chỗ: `packages/ui/test/lai-ra-man.spec.tsx`:233

- **[low]** so-lech-chuan.mjs rò thư mục tạm ở mọi đường thoát lỗi — process.exit bỏ qua finally
  - chỗ: `_acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs`:257

- **[low]** Hình dạng 3 — assert tên công cụ có mặt trong khi lời hứa của chính bài kiểm là quan hệ output-vào ≡ output-ra
  - chỗ: `packages/ui/test/eve-to-ai-sdk.spec.ts`:89

## Analyst

E4, E5, E6, E13, E14

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E2 failed — `bunx turbo run check-types --force` đỏ ở `@crm/telemetry#check-types` (exit 2), mười bốn eval còn lại xanh. Trả về implementation.
Round 2: E2 failed — `bunx turbo run check-types --force` vẫn đỏ, nay ở `@crm/auth#check-types`: `../db/src/index.ts` không giải được `./generated/prisma/enums` và `./generated/prisma/models`, cộng `slack-inventory.ts:19` tham số `tx` ngầm định kiểu `any`; mười bốn eval còn lại xanh. Trả về implementation.
Round 3: E2 đã bị bỏ khỏi hợp đồng từ round 2 (lỗi race của `@crm/db#build`, không phải hồi quy sản phẩm) — cả 14 eval còn lại đều xanh. Nhưng review tìm thấy lỗi thật trong hợp đồng ở AC-4: `toToolPart` chỉ gán state `output-error` khi CẢ `tone === "warning"` VÀ `errorText !== null`; một tool-call lỗi thật với `errorText` rỗng bị hiển thị nhầm thành `output-available`, và không răng nào trong bộ đo bắt được ca này. Đã chạm giới hạn 3 vòng verify — escalate cho người dùng, verdict REJECT.
Round 4: bug AC-4 từ round 3 đã sửa bằng cf9109f — nới nhánh lỗi trong `toToolPart` xuống còn `tone === "warning"` một mình, nên warning không kèm chuỗi lỗi giờ cũng lên đúng `output-error`; cả 14 eval xanh, không còn eval nào đỏ. Review vòng này lật ra một lỗi mới nằm ngay ở chỗ vừa sửa (nhánh lỗi giờ nuốt luôn ca `stored:false`/`written:false` hợp lệ, làm mất `output`) — đã phân loại ngoài hợp đồng trong review-findings.md (đề xuất new-contract), không chặn PASS của vòng này.