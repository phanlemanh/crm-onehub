---
schema_version: 2
feature_slug: tin-hieu-tu-ve-kho
verdict: REJECT
failed_evals: [E11]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 905f05d0a1aa5bff7b20b49b3dd874bf7092da89
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
| E11 | AC-11 | script | FAIL |
| E11b | AC-11 | judgment | PASS (de xuat, cho human_override) |
| E1c | AC-1 | script | PASS |
| E4b | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tin-hieu-tu-ve-kho-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_man
  verified_at: 2026-10-14T04:43:22Z
  output: |
    Ran 22 tests across 1 file. [2.61s]

- eval: E1b
  run_id: minted-tin-hieu-tu-ve-kho-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tvk_do_man
  verified_at: 2026-10-14T04:43:22Z
  screenshot: evidence/E1b-step1.png   # 6 frame: E1b-step1..6.png (1=quan-tri-1280, 2=quan-tri-375, 3=tao-khoa-keo, 4=danh-sach-nhan, 5=thanh-vien-1280, 6=nen-toi-1280)
  observed: |
    Da mo bang Read ca 6 anh. Owner 1280 thay nhom "Khoá dùng để" voi hai radio, muc "Mọi việc bạn làm được" duoc chon; 375 la mot cot khong cuon ngang; hop khoa vua tao hien cau chi keo duoc tin hieu va dat bi mat CRM_KHOA_KEO_TIN_HIEU; danh sach co nhan "Chỉ kéo tín hiệu" canh ten khoa; thanh vien thuong khong co nhom loai khoa; nen toi doc ro nhan va mo ta (tuong phan thap nhat 7.66). Ghi chu nho: nut "Tạo khoá" o 1280 bi bieu tuong dev overlay che mot phan, day la cong cu dev, khong mau thuan Expected.
  network_observed: n-a (driver)
  output: |
    KET LUAN: 6 DUNG, 0 SAI.
    Driver la do-man.mjs, server do do script tu dung va tu don; raw network khong doc duoc nen chi ghi n-a trong evidence/E1b-network.txt.

- eval: E2
  run_id: minted-tin-hieu-tu-ve-kho-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_tao_khoa
  verified_at: 2026-10-14T04:43:22Z
  output: |
    test-run: dropped crm_mv7mkaxkyx7d_test

- eval: E3
  run_id: minted-tin-hieu-tu-ve-kho-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_duong_lich
  verified_at: 2026-10-14T04:43:22Z
  output: |
    test-run: dropped crm_mv7mkc72eqs0_test

- eval: E4
  run_id: minted-tin-hieu-tu-ve-kho-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_duong_khac
  verified_at: 2026-10-14T04:43:22Z
  output: |
    test-run: dropped crm_mv7mkb2iu8dj_test

- eval: E4c
  run_id: minted-tin-hieu-tu-ve-kho-E4c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tvk_duong_doc_khoa
  verified_at: 2026-10-14T04:43:22Z
  output: |
    KET LUAN: moi cho doc khoa co o

- eval: E5
  run_id: minted-tin-hieu-tu-ve-kho-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_tu_choi
  verified_at: 2026-10-14T04:43:22Z
  output: |
    test-run: dropped crm_mv7mkco8oguj_test

- eval: E6
  run_id: minted-tin-hieu-tu-ve-kho-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_khoa_thuong
  verified_at: 2026-10-14T04:43:22Z
  output: |
    test-run: dropped crm_mv7mkc4bwsq8_test

- eval: E7
  run_id: minted-tin-hieu-tu-ve-kho-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_lenh
  verified_at: 2026-10-14T04:43:22Z
  output: |
    Ran 8 tests across 1 file. [81.00ms]

- eval: E8
  run_id: minted-tin-hieu-tu-ve-kho-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_lich
  verified_at: 2026-10-14T04:43:22Z
  output: |
    Ran 11 tests across 1 file. [8.53s]   (mot lenh chung cho E8, E9, E10)

- eval: E9
  run_id: minted-tin-hieu-tu-ve-kho-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_lich
  verified_at: 2026-10-14T04:43:22Z
  output: |
    Ran 11 tests across 1 file. [8.53s]   (mot lenh chung cho E8, E9, E10)

- eval: E10
  run_id: minted-tin-hieu-tu-ve-kho-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tvk_lich
  verified_at: 2026-10-14T04:43:22Z
  output: |
    Ran 11 tests across 1 file. [8.53s]   (mot lenh chung cho E8, E9, E10)

- eval: E10b
  run_id: minted-tin-hieu-tu-ve-kho-E10b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tvk_tep_lich
  verified_at: 2026-10-14T04:43:22Z
  output: |
    KET LUAN: tep lich dung 6 dong

- eval: E11
  run_id: minted-tin-hieu-tu-ve-kho-E11-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tvk_t1
  verified_at: 2026-10-14T04:43:22Z
  output: |
    DUNG 1 PR chi cham thu muc tin hieu duoc xep T1 — {"nang":false,"lyDo":"chi-t1"}
    SAI 2 kiem truoc gop khong doi ho so — ma 1 pre-merge-check: rules ran=4 declared-off=0 expected=4 | pre-merge-check: 1 violation(s) — merge blocked
    DUNG 3 doi chung: tep ma khong duoc xep T1 — {"nang":true,"lyDo":"co-tep-nang"}
    KET LUAN: co dong SAI

- eval: E11b
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ba tep (CONTEXT.md, docs/api.md, .env.example) tra loi du bon y (a)-(d) va khong tep nao noi nguoc tep thiet ke. Day la de xuat cua hoi dong, khong phai chu ky; human_override de trong cho nguoi quyet o Cong 2.
  votes:
    - domain-correctness: PASS — Ba tep tra loi du va khop tep thiet ke ca bon y (a)-(d), khong cau nao noi nguoc. Hai cho mong, khong sai: lich chi ghi gio UTC chu khong ghi 04:00/16:00 gio Viet Nam, va ly do khong tu gop chi la «theo lo nhu moi PR», dung nhu tep thiet ke da viet.
    - operational-feasibility: PASS — Ba tep tra loi duoc ca bon y. (a) CONTEXT.md: khoa chi keo duoc tin hieu, khong dang nhap duoc o dau, khong doc ban ghi, khong tao hay sua khoa, va thoi keo duoc khi chu khoa thoi lam quan tri. (b) docs/api.md: lich 21:00Z va 09:00Z, day len nhanh tin-hieu/keo-ve roi mo PR «Tín hiệu kéo về» vao onehub, khong bao gio gop. (c) .env.example: bien chi do keo-ve.ts va lich.ts doc, lich lay tu Actions secrets. (d) Ba viec cai mot lan (tao khoa, dat hai bi mat CRM_API_URL va CRM_KHOA_KEO_TIN_HIEU, bat quyen tao PR) khop thiet ke; thieu quyen tao PR thi luot van keo va day nhanh roi do o buoc mo PR.
    - spec-alignment: PASS — Ba tep tra loi du va khop tep thiet ke ca bon y. Khoa khong mo phien o duong nao (tRPC, REST, web, cau tac nhan, duong khoa thu vien); lich 21:00Z va 09:00Z, nhanh tin-hieu/keo-ve, PR «Tín hiệu kéo về» vao onehub, gop theo lo; bien moi truong do keo-ve.ts va lich.ts doc, thang CRM_API_KEY khi co ca hai, API khong doc; ba viec chu kho khop thiet ke. Ly do khong tu gop mong (lối B nam trong muc Khong lam) nhung khong mau thuan.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

- eval: E1c
  run_id: design-gate-6b3252be51, design-gate-f8916923f4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.tvk_thiet_ke
  verified_at: 2026-10-14T04:43:22Z
  output: |
    design-gate --mode static chay tung tep .tsx duoi apps/app/app/(app)/[slug]/settings/api-keys, vong lap ket thuc khong dung som; hai ma design-gate o run_id.

- eval: E4b
  run_id: minted-tin-hieu-tu-ve-kho-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tvk_vai
  verified_at: 2026-10-14T04:43:22Z
  output: |
    test-run: dropped crm_mv7mkofj8g9n_test

### Lệnh suite (hồi quy)

Lenh fail khong gan eval: lenh `bun run test -- --filter=api` (khoi ngay duoi day, ma thoat 1) khong gan eval nao. Lenh `node _acceptance/tin-hieu-tu-ve-kho/rang/t1.mjs` cung fail nhung da gan eval E11 (khoi E11 o tren).

- cmd: bun run test -- --filter=api
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-14T04:43:22Z
  output: |
    api: 1795 pass, 5 skip, 5 fail; Ran 1805 tests across 207 files. [220.82s]
    (fail) go-la-cat-quyen > ma-tran-dang-nhap-lai
    (fail) go-la-cat-quyen > ngoai-le-dung-tap-khai
    (fail) go-la-cat-quyen > tab-dang-mo
    (fail) go-la-cat-quyen > khoa-con-bat
    (fail) ba-lop > quet-het

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-14T04:43:22Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-14T04:43:22Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-14T04:43:22Z

- cmd: bunx turbo run lint --force
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-14T04:43:22Z

- cmd: bun run lint:slop
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-14T04:43:22Z

- cmd: bunx turbo run build --force
  run_id: minted-tin-hieu-tu-ve-kho-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-14T04:43:22Z

## Known limits

## Ngoài hợp đồng

## Analyst

Non-discriminating (xanh ca tren nhanh lan baseline, chung minh harness chu khong phai tinh nang; viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):

- E1c: lenh `for f in "apps/app/app/(app)/[slug]/settings/api-keys/"*.tsx; do node ${CLAUDE_PLUGIN_ROOT:-...}/scripts/design-gate.mjs --target "$f" --mode static || exit 1; done`
- E4b: lenh `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts"`

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

none — every multi-run eval is uniform (moi eval chay mot lan, khong eval nao co runs > 1)

## Iterations

Round 1: E11 failed — dong 2 cua t1.mjs bao pre-merge-check co 1 violation va chan gop tren commit chi chua tin-hieu/crm/crm-9.json (dong 1 va dong 3 DUNG). Bo suite api cung do 5 ca (go-la-cat-quyen, ba-lop), khong gan eval nao. Returned to implementation.
