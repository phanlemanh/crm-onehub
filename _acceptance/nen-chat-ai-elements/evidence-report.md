---
schema_version: 2
feature_slug: nen-chat-ai-elements
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6d227b926f472d54b74cd61f7b8b348e933167bb
human_signoff:
---

# Evidence Report: nen-chat-ai-elements (round 6)

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-2 | script | PASS |
| E5 | AC-2 | script | PASS |
| E6 | AC-2 | test | PASS |
| E13 | AC-9 | script | PASS |
| E14 | AC-10 | script | PASS |
| E8 | AC-4 | test | PASS |
| E9 | AC-5 | script | PASS |
| E10 | AC-6 | script | PASS |
| E11 | AC-7 | script | PASS |
| E15 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nen-chat-ai-elements-E1-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_mo_coi
  verified_at: 2026-09-10T09:15:00Z
  output: |
    het han: Phase 1 của docs/plan/chat-ai-elements-rebuild.md nối Conversation vào màn thật thì bỏ mục này
    CHET (0):
    XANH: 4 tep trong packages/ui/src/components/ai-elements — 3 kha dat tu apps/**, 1 mien tru co ten, khong mo coi nao ngoai danh sach mien tru.

- eval: E3
  run_id: minted-nen-chat-ai-elements-E3-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-10T09:15:00Z
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    8.141s

- eval: E4
  run_id: minted-nen-chat-ai-elements-E4-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-10T09:15:00Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    197ms

- eval: E5
  run_id: minted-nen-chat-ai-elements-E5-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-10T09:15:00Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 417ms on 975 files with 9 rules using 18 threads.

- eval: E6
  run_id: minted-nen-chat-ai-elements-E6-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-10T09:15:00Z
  output: |
      Time:    26.573s 

    test-run: dropped crm_mtuwznv3501b_test

- eval: E13
  run_id: minted-nen-chat-ai-elements-E13-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nc_rang_qua_cong
  verified_at: 2026-09-10T09:15:00Z
  output: |
      Time:    26.573s 

    test-run: dropped crm_mtuwznv3501b_test

- eval: E14
  run_id: minted-nen-chat-ai-elements-E14-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nc_rang_qua_cong
  verified_at: 2026-09-10T09:15:00Z
  output: |
      Time:    26.573s 

    test-run: dropped crm_mtuwznv3501b_test

- eval: E8
  run_id: minted-nen-chat-ai-elements-E8-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nc_lop_chuyen
  verified_at: 2026-09-10T09:15:00Z
  output: |
     0 fail
     24 expect() calls
    Ran 15 tests across 1 file. [26.00ms]

- eval: E9
  run_id: minted-nen-chat-ai-elements-E9-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_chu_trong_component
  verified_at: 2026-09-10T09:15:00Z
  output: |
    Khoá thiếu trong bảng chuỗi: 0

    Răng xanh.

- eval: E10
  run_id: minted-nen-chat-ai-elements-E10-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_mau_ban_kinh
  verified_at: 2026-09-10T09:15:00Z
  output: |
    VE MAU — xet 20 lop mang o mau, ngoai bang: 0

    XANH: moi lop ban kinh nam trong thang bon gia tri, va moi lop mau goi dung mot ten co trong bang token.

- eval: E11
  run_id: minted-nen-chat-ai-elements-E11-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_so_do_cuon
  verified_at: 2026-09-10T09:15:00Z
  output: |
        MessageScroller 500 go nhin: 32.78 ms  (31.52x)

    so-do-cuon: dat — ti so sau va 0.9 <= 1.2; ban va do duoc hieu ung tren cay that va go no ra lam cham 35.55x; thuoc phan ung 31.52x

- eval: E15
  run_id: minted-nen-chat-ai-elements-E15-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nc_pham_vi_diff
  verified_at: 2026-09-10T09:15:00Z
  output: |
    Sáu tệp chat bị chạm: 0

    RĂNG PHẠM VI XANH: mọi đường nằm trong danh sách trắng AC-2, sáu tệp chat nguyên vẹn.

## Known limits

## Ngoài hợp đồng

10 mục dưới đây là lỗi THẬT nhưng ngoài phạm vi đã duyệt ở Cổng 1.

- **[high]** Hình dạng biên nuốt lỗi phân tích: input/output của lượt did không bao giờ đỏ được
  - chỗ: `packages/validation/src/agent-transcript.ts`:34

- **[high]** Kế hoạch chuyển của area chat không được cập nhật, nay mô tả sai cây
  - chỗ: `docs/plan/chat-ai-elements-rebuild.md`:25

- **[high]** Cổng check-types bị gỡ khỏi bộ suite của cả kho, không chỉ vòng này
  - chỗ: `_acceptance/config.yaml`:7

- **[medium]** Lớp chuyển ép sáu trạng thái công cụ xuống ba — lượt chờ duyệt đã trả lời hiện ra như đã xong
  - chỗ: `packages/ui/src/lib/eve-to-ai-sdk.ts`:41

- **[medium]** Răng mồ côi chỉ gieo hạt từ apps/**, bỏ qua chính packages/ui — báo đỏ đòi xoá code đang sống
  - chỗ: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`:91

- **[medium]** Miễn trừ hết hạn chỉ được in ra, không làm răng đỏ — có thể nuốt một mồ côi thật về sau
  - chỗ: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`:145

- **[medium]** Hình dạng 2 — E8 chỉ chạy vế ĐỌC, không chạy round-trip rút-từ-writer mà chính nó đòi
  - chỗ: `_acceptance/nen-chat-ai-elements/evals.yaml`:69

- **[medium]** Hình dạng 3 — assert `toolName` có mặt trong khi lời hứa của chính bài kiểm là quan hệ output-vào ≡ output-ra
  - chỗ: `packages/ui/test/eve-to-ai-sdk.spec.ts`:93

- **[medium]** Hình dạng 3 — `do_o` chỉ được assert là chuỗi khác rỗng, trong khi lời hứa là quan hệ tới một eval có thật (E7/E12 không tồn tại)
  - chỗ: `packages/ui/test/rang-chat.spec.ts`:91

- **[low]** ConversationDownload thu hồi blob URL ngay sau click và bỏ im mọi phần không phải text
  - chỗ: `packages/ui/src/components/ai-elements/conversation.tsx`:160

## Analyst

E3, E4, E5, E6, E13, E14 — xanh trên cả HEAD và diffBase (build, lint, lint:slop, và toàn bộ `bun run test` đều baseline-green). Cả sáu chứng minh toolchain/harness đang chạy được, không phải chứng minh riêng cho tính năng chat mới của vòng này; chúng là regression-guard bình thường của kho, không phải bằng chứng phân biệt cho AC-2 ở vòng này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 6 (vòng hiện tại): 12/12 eval PASS trên verified_commit 6d227b926f472d54b74cd61f7b8b348e933167bb, không còn eval đỏ, verdict PASS. Nội dung round này thay trọn nội dung round cũ theo yêu cầu tổng hợp; dữ liệu chi tiết của 5 round trước (round 1-5) không nằm trong ngữ cảnh truyền cho lượt tổng hợp này nên không được chép lại ở đây để tránh bịa.