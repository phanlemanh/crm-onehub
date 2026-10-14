---
schema_version: 2
feature_slug: tin-hieu-tu-ve-kho
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 848f986c233f36c8178c2bc6e5e86ad86ce59ce1
human_signoff:
---

# Evidence Report: tin-hieu-tu-ve-kho

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4c | AC-4 | script | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | script | PASS |
| E11 | AC-11 | script | PASS |
| E11b | AC-11 | judgment | PASS (de xuat, cho human_override) |
| E1c | AC-1 | script | PASS |
| E4b | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tin-hieu-tu-ve-kho-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_man
  verified_at: 2026-10-14T05:13:42Z
  output: |
    Ran 22 tests across 1 file. [2.88s]

- eval: E1b
  run_id: minted-tin-hieu-tu-ve-kho-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tvk_do_man
  verified_at: 2026-10-14T05:13:42Z
  screenshot: evidence/E1b-step1.png   # 6 frame: E1b-step1..6.png (1=quan-tri-1280, 2=quan-tri-375, 3=tao-khoa-keo, 4=danh-sach-nhan, 5=thanh-vien-1280, 6=nen-toi-1280)
  observed: |
    Da mo tung anh that. Step1 (owner, 1280): to "Khoá API mới" co nhom "Khoá dùng để" voi hai muc "Mọi việc bạn làm được" (radio duoc chon) va "Chỉ kéo tín hiệu về kho" kem mo ta. Step2 (375): mot cot, hai radio xuong dong, khong cuon ngang. Step3: hop khoa vua tao hien khoa va cau "Khoá này chỉ kéo được tín hiệu về kho. Đặt nó vào bí mật CRM_KHOA_KEO_TIN_HIEU của lịch chạy." Step4: bang Khoá API co dong khoa moi mang Badge "Chỉ kéo tín hiệu". Step5 (thanh vien thuong): to chi co Tên va Hết hạn, khong co nhom "Khoá dùng để". Step6 (nen toi): nhan va mo ta doc ro, radio thay duoc, tuong phan thap nhat 7.66. Ghi chu: o goc duoi phai cac anh 1280 co huy hieu dev che mot phan nut "Tạo khoá", la lop phu cua moi truong do, khong phai thanh phan cua to.
  network_observed: n-a (driver)
  output: |
    6 DUNG nen-toi-1280: tuong phan thap nhat cua nhan va mo ta 7.66
    Driver la script puppeteer tu chup, khong co cong cu doc network; E1b-network.txt ghi ro dieu nay.
    Ban chay moi chi ghi de tao-khoa-keo.png va danh-sach-nhan.png; 4 anh con lai khong doi byte.

- eval: E2
  run_id: minted-tin-hieu-tu-ve-kho-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_tao_khoa
  verified_at: 2026-10-14T05:13:42Z
  output: |
    test-run: dropped crm_mv7nn5rzryqp_test

- eval: E3
  run_id: minted-tin-hieu-tu-ve-kho-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_duong_lich
  verified_at: 2026-10-14T05:13:42Z
  output: |
    test-run: dropped crm_mv7nn6ufujq6_test

- eval: E4
  run_id: minted-tin-hieu-tu-ve-kho-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_duong_khac
  verified_at: 2026-10-14T05:13:42Z
  output: |
    test-run: dropped crm_mv7nn7ljv4y2_test

- eval: E4c
  run_id: minted-tin-hieu-tu-ve-kho-E4c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tvk_duong_doc_khoa
  verified_at: 2026-10-14T05:13:42Z
  output: |
    KET LUAN: moi cho doc khoa co o

- eval: E5
  run_id: minted-tin-hieu-tu-ve-kho-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_tu_choi
  verified_at: 2026-10-14T05:13:42Z
  output: |
    test-run: dropped crm_mv7nn7kqhbcs_test

- eval: E6
  run_id: minted-tin-hieu-tu-ve-kho-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_khoa_thuong
  verified_at: 2026-10-14T05:13:42Z
  output: |
    test-run: dropped crm_mv7nn7m71qak_test

- eval: E7
  run_id: minted-tin-hieu-tu-ve-kho-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_lenh
  verified_at: 2026-10-14T05:13:42Z
  output: |
    Ran 8 tests across 1 file. [74.00ms]

- eval: E8
  run_id: minted-tin-hieu-tu-ve-kho-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_lich
  verified_at: 2026-10-14T05:13:42Z
  output: |
    Ran 12 tests across 1 file. [9.59s]

- eval: E9
  run_id: minted-tin-hieu-tu-ve-kho-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_lich
  verified_at: 2026-10-14T05:13:42Z
  output: |
    Ran 12 tests across 1 file. [9.59s]

- eval: E10
  run_id: minted-tin-hieu-tu-ve-kho-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_lich
  verified_at: 2026-10-14T05:13:42Z
  output: |
    Ran 12 tests across 1 file. [9.59s]

- eval: E10b
  run_id: minted-tin-hieu-tu-ve-kho-E10b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tvk_tep_lich
  verified_at: 2026-10-14T05:13:42Z
  output: |
    KET LUAN: tep lich dung 6 dong

- eval: E11
  run_id: minted-tin-hieu-tu-ve-kho-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tvk_t1
  verified_at: 2026-10-14T05:13:42Z
  output: |
    KET LUAN: thu muc tin hieu la T1

- eval: E1c
  run_id: design-gate-8dd4c3230b, design-gate-af050764cd
  exit_code: 0
  baseline: green
  verifier: config:executors.script.tvk_thiet_ke
  verified_at: 2026-10-14T05:13:42Z
  output: |
    design-gate --mode static chay xong tren tung tep .tsx duoi settings/api-keys, khong tep nao bi chan.

- eval: E4b
  run_id: minted-tin-hieu-tu-ve-kho-E4b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tvk_vai
  verified_at: 2026-10-14T05:13:42Z
  output: |
    test-run: dropped crm_mv7nnje16xbj_test

### Judgment

- eval: E11b
  judged_by: judge panel (fresh context, 3 lens)
  verdict: PASS
  rationale: Ba tep (api.md, CONTEXT.md, .env.example) tra loi du bon y (a)-(d) va khop tep thiet ke, khong cau nao noi nguoc. De xuat cua hoi dong la PASS; can nguoi xac nhan o Cong 2.
  votes:
    - domain-correctness: PASS — Ba tệp trả lời đủ bốn ý và khớp tệp thiết kế, không chỗ nào nói ngược. (a) api.md và CONTEXT.md nói khoá chỉ gọi được `tinHieuLich.keoVe`, không mở phiên ở tRPC, REST, web, cầu tác nhân hay đường khoá của thư viện, và thôi kéo khi chủ khoá hết làm quản trị. (b) Lịch chạy 21:00Z và 09:00Z, đẩy nhánh `tin-hieu/keo-ve` và giữ một PR «Tín hiệu kéo về»; không gộp vì «PR đi vào `onehub` theo lô như mọi PR» (lý do có nhưng ngắn). (c) `.env.example` nói biến do `keo-ve.ts` và `lich.ts` đọc, không bao giờ do API đọc, workflow lấy từ bí mật kho, và thắng `CRM_API_KEY` khi có cả hai. (d) Ba việc cài một lần khớp từng chữ với phần «Cài một lần» của tệp thiết kế. Thiếu bí mật thì lượt đỏ. Thiếu quyền mở PR thì lượt vẫn kéo và đẩy nhánh nên người gửi vẫn thấy «Chờ gom», rồi đỏ ở bước mở PR.
    - operational-feasibility: PASS — Ba tệp trả lời đủ và khớp tệp thiết kế cả bốn ý, không câu nào nói ngược. (a) Khoá chỉ-kéo chỉ gọi được đường kéo theo lịch, không mở phiên ở đâu, không đọc bản ghi, không tạo hay sửa khoá, và thôi kéo được khi chủ khoá hết làm quản trị (CONTEXT.md «Khoá chỉ kéo tín hiệu»; api.md mục Tín hiệu). (b) Lịch chạy 21:00Z và 09:00Z, đẩy tệp `tin-hieu/crm/**` lên nhánh `tin-hieu/keo-ve` kèm PR «Tín hiệu kéo về», và không bao giờ gộp vì PR đi vào `onehub` theo lô như mọi PR. (c) `CRM_KHOA_KEO_TIN_HIEU` do `keo-ve.ts` và `lich.ts` đọc, lấy từ bí mật Actions của kho, không bao giờ do API đọc, và thắng `CRM_API_KEY` khi có cả hai (.env.example). (d) Ba việc cài một lần: tạo khoá chỉ-kéo, đặt hai bí mật kho, bật quyền cho Actions mở PR. Thiếu việc cuối thì lượt vẫn kéo và đẩy nhưng đỏ ở bước mở PR; thiếu URL hoặc khoá thì thoát mã 2 và không ghi gì.
    - spec-alignment: PASS — Cả bốn ý (a)-(d) đều trả lời được từ ba tệp và khớp tệp thiết kế, không có chỗ nói ngược. (a) CONTEXT.md nói khoá «không đăng nhập được ở đâu, không đọc bản ghi, không tạo hay sửa khoá», còn api.md nói nó không mở phiên ở đường nào. (b) api.md nêu lịch 21:00Z và 09:00Z, nhánh `tin-hieu/keo-ve` và «Không bao giờ gộp: PR đi vào `onehub` theo lô». (c) .env.example nói biến được `keo-ve.ts` và `lich.ts` đọc, lấy từ bí mật Actions, và thắng `CRM_API_KEY` khi có cả hai. (d) api.md nêu ba việc cài một lần và hậu quả khi thiếu việc cuối, giống mục «Cài một lần» của tệp thiết kế.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-14T05:13:42Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-14T05:13:42Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-14T05:13:42Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-14T05:13:42Z

- cmd: bunx turbo run lint --force
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-14T05:13:42Z

- cmd: bun run lint:slop
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-14T05:13:42Z

- cmd: bunx turbo run build --force
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-14T05:13:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline diffBase — chứng minh harness chứ không chứng minh feature; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E1c: `for f in "apps/app/app/(app)/[slug]/settings/api-keys/"*.tsx; do node ${CLAUDE_PLUGIN_ROOT:-...}/scripts/design-gate.mjs --target "$f" --mode static || exit 1; done` — baseline green.
- E4b: `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts"` — baseline green.

Baseline khong do:

- cd apps/app && bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khoa-api-loai.dom.tsx -t tvk-man: bo qua baseline: tep apps/app/test/khoa-api-loai.dom.tsx co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/khoa-keo-tin-hieu.spec.ts -t tvk-tao": bo qua baseline: tep apps/api/test/khoa-keo-tin-hieu.spec.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/khoa-keo-tin-hieu.spec.ts -t tvk-lich": bo qua baseline: tep apps/api/test/khoa-keo-tin-hieu.spec.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/khoa-keo-tin-hieu.spec.ts -t tvk-duong-khac": bo qua baseline: tep apps/api/test/khoa-keo-tin-hieu.spec.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tin-hieu-tu-ve-kho/rang/duong-doc-khoa.mjs: bo qua baseline: tep _acceptance/tin-hieu-tu-ve-kho/rang/duong-doc-khoa.mjs co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/khoa-keo-tin-hieu.spec.ts -t tvk-tu-choi": bo qua baseline: tep apps/api/test/khoa-keo-tin-hieu.spec.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tin-hieu.spec.ts -t gth-keo-ve && bun test test/khoa-keo-tin-hieu.spec.ts -t tvk-khoa-thuong && bun test test/khoa-api-ghi-thua.spec.ts": bo qua baseline: tep apps/api/test/khoa-keo-tin-hieu.spec.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/keo-ve-lich.test.ts -t tvk-lenh: bo qua baseline: tep scripts/tin-hieu/test/keo-ve-lich.test.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/lich.test.ts: bo qua baseline: tep scripts/tin-hieu/test/lich.test.ts co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tin-hieu-tu-ve-kho/rang/tep-lich.mjs: bo qua baseline: tep _acceptance/tin-hieu-tu-ve-kho/rang/tep-lich.mjs co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/tin-hieu-tu-ve-kho/rang/t1.mjs: bo qua baseline: tep _acceptance/tin-hieu-tu-ve-kho/rang/t1.mjs co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval nào có phương sai).

## Iterations

Round 1: E11 failed — dong 2 cua t1.mjs bao pre-merge-check co 1 violation va chan gop tren commit chi chua tin-hieu/crm/crm-9.json (dong 1 va dong 3 DUNG). Bo suite api cung do 5 ca (go-la-cat-quyen, ba-lop), khong gan eval nao. Returned to implementation.
Round 2: moi eval may xanh (E11 nay do quan he thay vi dem tuyet doi; hang cho bo hook bang CRM_SKIP_HOOKS; duong lich theo luat tu choi chung) va bay lenh suite xanh. Con cho nguoi: E11b (judgment, de xuat PASS, chua co human_override). Verdict PENDING-JUDGMENT.
